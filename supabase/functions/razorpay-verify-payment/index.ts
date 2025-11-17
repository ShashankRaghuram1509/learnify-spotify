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
      console.error('No authorization header');
      throw new Error('No authorization header');
    }

    // SECURITY: Create client with user's token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // SECURITY: Verify token signature and get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error('Auth verification failed:', authError);
      throw new Error('Unauthorized');
    }

    // Now we can TRUST this user ID (token signature has been verified)
    const userId = user.id;
    console.log('User authenticated and verified:', userId);

    const requestData = await req.json();
    console.log('Request data:', JSON.stringify(requestData, null, 2));
    
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      amount,
      planName,
      course_id // Optional: for course-specific purchases
    } = requestData;

    // Input validation - planName is optional for course purchases
    if (planName && !course_id) {
      const validPlans = ['Lite', 'Premium', 'Premium Pro'];
      if (!validPlans.includes(planName)) {
        throw new Error('Invalid plan');
      }
    }

    if (!razorpay_order_id || typeof razorpay_order_id !== 'string' || razorpay_order_id.length > 100) {
      throw new Error('Invalid order ID');
    }

    if (!razorpay_payment_id || typeof razorpay_payment_id !== 'string' || razorpay_payment_id.length > 100) {
      throw new Error('Invalid payment ID');
    }

    if (!razorpay_signature || typeof razorpay_signature !== 'string' || razorpay_signature.length > 200) {
      throw new Error('Invalid signature');
    }

    if (typeof amount !== 'number' || amount <= 0 || amount > 10000000) {
      throw new Error('Invalid amount');
    }

    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');
    if (!RAZORPAY_KEY_SECRET) {
      throw new Error('Configuration error');
    }

    // Verify signature using Deno's native Web Crypto API
    console.log('Verifying payment signature...');
    const encoder = new TextEncoder();
    const keyData = encoder.encode(RAZORPAY_KEY_SECRET);
    const messageData = encoder.encode(`${razorpay_order_id}|${razorpay_payment_id}`);
    
    // Import the secret key for HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    // Generate HMAC signature
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, messageData);
    
    // Convert to hex string
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const generatedSignature = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');

    if (generatedSignature !== razorpay_signature) {
      console.error('Signature mismatch:', { generatedSignature, razorpay_signature });
      throw new Error('Invalid payment signature');
    }

    console.log('Payment verified successfully for user:', userId);

    // Store payment in database
    console.log('Storing payment record...');
    const paymentData: any = {
      user_id: userId,
      amount: amount / 100, // Convert from paise to rupees
      currency: 'INR',
      status: 'completed',
      payment_method: 'razorpay',
      transaction_id: razorpay_payment_id,
    };

    // If this is a course purchase, add course_id
    if (course_id) {
      paymentData.course_id = course_id;
      console.log('Recording course purchase for course:', course_id);
    }

    // If this is a subscription, add plan name
    if (planName) {
      paymentData.plan_name = planName;
      console.log('Recording subscription purchase for plan:', planName);
    }

    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert(paymentData);

    if (paymentError) {
      console.error('Payment storage error:', paymentError);
      throw new Error('Payment storage failed');
    }
    console.log('Payment record stored successfully');

    // If this is a subscription payment (not a course purchase), update subscription
    if (planName && !course_id) {
      console.log('Upgrading subscription tier to:', planName);
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1); // 1 year from now

      const { error: profileError } = await supabaseClient
        .from('profiles')
        .update({ 
          subscription_tier: planName,
          subscription_expires_at: expiryDate.toISOString()
        })
        .eq('id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw new Error('Failed to upgrade subscription');
      }
      console.log('Subscription upgraded successfully');
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: course_id 
          ? 'Course purchase verified successfully' 
          : 'Payment verified and recorded',
        planName: planName || null
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    // Return user-friendly error messages without exposing internals
    const err = error as Error;
    
    // --- Enhanced error logging for debugging ---
    console.error('--- RAZORPAY VERIFY ERROR ---');
    console.error('Actual Error Message:', err.message);
    console.error('Full Error:', err);
    console.error('Error Stack:', err.stack);
    console.error('--- END ERROR ---');
    // --- End enhanced logging ---
    
    let userMessage = 'Payment verification failed. Please contact support.';
    let statusCode = 500;
    
    if (err.message === 'Invalid payment signature') {
      userMessage = 'Payment verification failed. Please try again.';
      statusCode = 400;
    } else if (err.message === 'Unauthorized' || err.message === 'No authorization header') {
      userMessage = 'Authentication required.';
      statusCode = 401;
    } else if (err.message.includes('Invalid')) {
      userMessage = 'Invalid payment data provided.';
      statusCode = 400;
    }
    
    return new Response(
      JSON.stringify({ 
        error: userMessage,
        debug_error: err.message // Include actual error for debugging
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode 
      }
    );
  }
});
