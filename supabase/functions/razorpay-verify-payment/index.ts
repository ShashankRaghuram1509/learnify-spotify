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
      throw new Error('No authorization header');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const requestData = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      amount,
      planName 
    } = requestData;

    // Input validation
    const validPlans = ['Lite', 'Premium', 'Premium Pro'];
    if (!planName || !validPlans.includes(planName)) {
      throw new Error('Invalid plan');
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

    // Verify signature
    const crypto = await import("https://deno.land/std@0.160.0/node/crypto.ts");
    const hmac = crypto.createHmac('sha256', RAZORPAY_KEY_SECRET);
    hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
    const generatedSignature = hmac.digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new Error('Invalid payment signature');
    }

    console.log('Payment verified successfully for user:', user.id);

    // Store payment in database
    const { error: paymentError } = await supabaseClient
      .from('payments')
      .insert({
        user_id: user.id,
        amount: amount / 100, // Convert from paise to rupees
        currency: 'INR',
        status: 'completed',
        payment_method: 'razorpay',
        transaction_id: razorpay_payment_id,
      });

    if (paymentError) {
      console.error('Error storing payment:', paymentError);
      throw new Error('Payment storage failed');
    }

    // Upgrade user role based on plan
    const { error: roleError } = await supabaseClient
      .from('user_roles')
      .upsert({
        user_id: user.id,
        role: 'pro'
      }, {
        onConflict: 'user_id'
      });

    if (roleError) {
      console.error('Error upgrading user role:', roleError);
      // Decide if this should be a critical failure.
      // For now, we'll log it but not fail the entire transaction.
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified and recorded',
        planName 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error('Error in razorpay-verify-payment:', error);
    
    // Return user-friendly error messages without exposing internals
    let userMessage = 'Payment verification failed. Please contact support.';
    let statusCode = 500;
    
    if (error.message === 'Invalid payment signature') {
      userMessage = 'Payment verification failed. Please try again.';
      statusCode = 400;
    } else if (error.message === 'Unauthorized' || error.message === 'No authorization header') {
      userMessage = 'Authentication required.';
      statusCode = 401;
    } else if (error.message.includes('Invalid')) {
      userMessage = 'Invalid payment data provided.';
      statusCode = 400;
    }
    
    return new Response(
      JSON.stringify({ error: userMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: statusCode 
      }
    );
  }
});
