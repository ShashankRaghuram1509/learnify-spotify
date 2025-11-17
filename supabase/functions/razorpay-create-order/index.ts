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
    // Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('Missing authorization header');
      throw new Error('Unauthorized');
    }

    // Extract user from JWT token
    const token = authHeader.replace('Bearer ', '');
    let userId: string | null = null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1] || ''));
      userId = payload?.sub || null;
    } catch (e) {
      console.error('JWT parse error:', e);
      throw new Error('Unauthorized');
    }
    
    if (!userId) {
      console.error('No user ID in token');
      throw new Error('Unauthorized');
    }

    console.log('User authenticated:', userId);

    const requestBody = await req.json();
    const { amount, currency = 'INR', planName, courseId } = requestBody;
    console.log('Request body:', { amount, currency, planName, courseId });
    
    // Input validation
    const validPlans = ['Lite', 'Premium', 'Premium Pro'];
    // Allow course purchases or subscription plans
    if (planName && !planName.startsWith('Course:') && !validPlans.includes(planName)) {
      throw new Error('Invalid plan name');
    }
    
    if (typeof amount !== 'number' || amount <= 0 || amount > 100000) {
      throw new Error('Invalid amount');
    }
    
    if (currency !== 'INR' && currency !== 'USD') {
      throw new Error('Invalid currency');
    }
    
    const RAZORPAY_KEY_ID = Deno.env.get('RAZORPAY_KEY_ID');
    const RAZORPAY_KEY_SECRET = Deno.env.get('RAZORPAY_KEY_SECRET');

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      console.error('Missing Razorpay credentials');
      throw new Error('Razorpay credentials not configured');
    }

    console.log('Razorpay credentials loaded');

    // Create Razorpay order
    const basicAuth = btoa(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`);
    
    const razorpayBody = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      notes: {
        plan: planName,
        user_id: userId,
        course_id: courseId || null,
      },
    };
    
    console.log('Creating Razorpay order:', razorpayBody);
    
    const orderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${basicAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(razorpayBody),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('Razorpay API error:', orderResponse.status, errorText);
      throw new Error(`Razorpay API error: ${orderResponse.status}`);
    }

    const order = await orderResponse.json();
    console.log('Razorpay order created:', order.id);

    return new Response(
      JSON.stringify({ 
        orderId: order.id, 
        amount: order.amount,
        currency: order.currency,
        keyId: RAZORPAY_KEY_ID 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Error in razorpay-create-order:', err.message);
    console.error('Stack trace:', err.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to create payment order. Please try again.',
        details: err.message // Include details in development
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: err.message === 'Unauthorized' || err.message === 'Authentication required' ? 401 : 500 
      }
    );
  }
});
