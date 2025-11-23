import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

    // Extract token from Authorization header
    const token = authHeader.replace('Bearer ', '');
    
    // Create service role client to verify the JWT token
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the JWT token
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      throw new Error('Unauthorized');
    }

    // Now we can TRUST this user ID (token signature has been verified)
    const userId = user.id;
    console.log('User authenticated and verified:', userId);

    const { course_id } = await req.json();

    if (!course_id) {
      throw new Error('Course ID is required');
    }

    // Check if course exists and get course details
    const { data: course, error: courseError } = await supabaseAdmin
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
    const { data: existingEnrollment } = await supabaseAdmin
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

    // For premium courses, verify access through subscription OR course purchase
    if (course.is_premium && course.price && course.price > 0) {
      console.log('Checking access for premium course...');
      
      let hasAccess = false;

      // Check 1: Active subscription
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('subscription_tier, subscription_expires_at')
        .eq('id', userId)
        .single();

      if (profile && !profileError) {
        console.log('User subscription:', profile);
        const validTiers = ['Lite', 'Premium', 'Premium Pro'];
        const hasValidTier = profile.subscription_tier && validTiers.includes(profile.subscription_tier);
        const isNotExpired = !profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date();
        
        if (hasValidTier && isNotExpired) {
          hasAccess = true;
          console.log('Access granted via subscription');
        }
      }

      // Check 2: Course-specific purchase
      if (!hasAccess) {
        const { data: payment, error: paymentError } = await supabaseAdmin
          .from('payments')
          .select('id')
          .eq('user_id', userId)
          .eq('course_id', course_id)
          .eq('status', 'completed')
          .maybeSingle();

        if (payment && !paymentError) {
          hasAccess = true;
          console.log('Access granted via course purchase');
        }
      }

      if (!hasAccess) {
        console.error('No valid access method found');
        throw new Error('Active subscription required for premium course');
      }

      console.log('Access verified successfully');
    }

    console.log('Creating enrollment...');

    // Create enrollment using service role to bypass RLS
    const { data: enrollment, error: enrollmentError } = await supabaseAdmin
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
