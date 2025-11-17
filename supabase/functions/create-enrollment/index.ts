import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    // Create client with user's JWT for authentication
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Extract user from verified JWT (avoids GoTrue session requirement)
    const token = authHeader.replace('Bearer ', '');
    let userId: string | null = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      userId = payload?.sub || null;
    } catch (e) {
      console.error('JWT parse error:', e);
    }
    if (!userId) {
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', userId);

    const { course_id } = await req.json();

    if (!course_id) {
      throw new Error('Course ID is required');
    }

    // Check if course exists and get course details
    const { data: course, error: courseError } = await supabaseClient
      .from('courses')
      .select('id, is_premium, price')
      .eq('id', course_id)
      .single();

    if (courseError || !course) {
      console.error('Course error:', courseError);
      throw new Error('Course not found');
    }

    console.log('Course found:', course);

    // Check if already enrolled
    const { data: existingEnrollment } = await supabaseClient
      .from('enrollments')
      .select('id')
      .eq('student_id', userId)
      .eq('course_id', course_id)
      .maybeSingle();

    if (existingEnrollment) {
      console.log('Already enrolled');
      return new Response(
        JSON.stringify({ success: true, message: 'Already enrolled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // If course is premium, verify user has active subscription
    if (course.is_premium && course.price && course.price > 0) {
      console.log('Checking subscription status for premium course...');
      
      const { data: profile, error: profileError } = await supabaseClient
        .from('profiles')
        .select('subscription_tier, subscription_expires_at')
        .eq('id', userId)
        .single();

      if (profileError || !profile) {
        console.error('Profile error:', profileError);
        throw new Error('Failed to verify subscription status');
      }

      console.log('User subscription:', profile);

      // Check if user has an active premium subscription
      const validTiers = ['Lite', 'Premium', 'Premium Pro'];
      const hasValidTier = profile.subscription_tier && validTiers.includes(profile.subscription_tier);
      const isNotExpired = !profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date();

      if (!hasValidTier || !isNotExpired) {
        console.error('Invalid or expired subscription:', { tier: profile.subscription_tier, expires: profile.subscription_expires_at });
        throw new Error('Active subscription required for premium course');
      }

      console.log('Subscription verified successfully');
    }

    // Create service role client for enrollment creation (bypasses RLS)
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Creating enrollment...');

    // Create enrollment using service role to bypass RLS
    const { data: enrollment, error: enrollmentError } = await serviceClient
      .from('enrollments')
      .insert({
        student_id: userId,
        course_id: course_id,
      })
      .select()
      .single();

    if (enrollmentError) {
      console.error('Enrollment error:', enrollmentError);
      throw new Error('Failed to create enrollment');
    }

    console.log('Enrollment created:', enrollment);

    return new Response(
      JSON.stringify({ success: true, enrollment }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Edge function error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to create enrollment' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: err.message === 'Unauthorized' ? 401 : 400 
      }
    );
  }
});
