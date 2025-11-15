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

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

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
      throw new Error('Course not found');
    }

    // Check if already enrolled
    const { data: existingEnrollment } = await supabaseClient
      .from('enrollments')
      .select('id')
      .eq('student_id', user.id)
      .eq('course_id', course_id)
      .single();

    if (existingEnrollment) {
      return new Response(
        JSON.stringify({ success: true, message: 'Already enrolled' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
      );
    }

    // If course is premium, verify payment
    if (course.is_premium && course.price && course.price > 0) {
      const { data: payment, error: paymentError } = await supabaseClient
        .from('payments')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('course_id', course_id)
        .eq('status', 'success')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (paymentError || !payment) {
        throw new Error('Payment required for premium course');
      }
    }

    // Create enrollment using service role to bypass RLS
    const { data: enrollment, error: enrollmentError } = await supabaseClient
      .from('enrollments')
      .insert({
        student_id: user.id,
        course_id: course_id,
      })
      .select()
      .single();

    if (enrollmentError) {
      throw new Error('Failed to create enrollment');
    }

    return new Response(
      JSON.stringify({ success: true, enrollment }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to create enrollment' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: err.message === 'Unauthorized' ? 401 : 400 
      }
    );
  }
});
