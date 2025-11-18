import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ZegoCloud Token04 generation following official specification
function generateToken04(
  appId: number,
  userId: string,
  serverSecret: string,
  effectiveTimeInSeconds: number,
  payload: string
): string {
  if (!appId || !userId || !serverSecret) {
    throw new Error('Invalid parameters for token generation');
  }

  const time = Math.floor(Date.now() / 1000) + effectiveTimeInSeconds;
  const nonce = Math.floor(Math.random() * 2147483647);
  
  // Build the token content
  const body = {
    app_id: appId,
    user_id: userId,
    nonce: nonce,
    ctime: time,
    expire: time,
    payload: payload || ''
  };

  // Create signature: HMAC-SHA256(serverSecret, "${appId}${userId}${time}${nonce}")
  const encoder = new TextEncoder();
  const data = encoder.encode(`${appId}${userId}${time}${nonce}`);
  const key = encoder.encode(serverSecret);
  
  // Use Web Crypto API for HMAC
  return crypto.subtle.importKey(
    'raw',
    key,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(cryptoKey => {
    return crypto.subtle.sign('HMAC', cryptoKey, data);
  }).then(signature => {
    // Convert signature to hex
    const signatureArray = Array.from(new Uint8Array(signature));
    const signatureHex = signatureArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Build final token object
    const tokenObject = {
      ...body,
      signature: signatureHex,
      ver: 1
    };
    
    // Encode to base64
    const jsonString = JSON.stringify(tokenObject);
    const tokenBytes = encoder.encode(jsonString);
    return btoa(String.fromCharCode(...tokenBytes));
  });
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Unauthorized');
    }

    // Extract raw access token ("Bearer <token>" -> "<token>")
    const accessToken = authHeader.replace('Bearer', '').trim();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Backend not configured');
    }

    const supabaseClient = createClient(
      supabaseUrl,
      supabaseKey,
      {
        global: {
          headers: { Authorization: `Bearer ${accessToken}` },
        },
      }
    );

    // IMPORTANT: pass the access token explicitly for reliability in edge envs
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(accessToken);
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { session_id, room_id } = await req.json();

    if (!session_id || !room_id) {
      throw new Error('Session ID and room ID are required');
    }

    // Verify user has access to this video call session
    const { data: session, error: sessionError } = await supabaseClient
      .from('video_call_schedules')
      .select('id, teacher_id, student_id, course_id')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      throw new Error('Video call session not found');
    }

    // Check if user is either the teacher or the student
    const isAuthorized = session.teacher_id === user.id || session.student_id === user.id;

    if (!isAuthorized) {
      throw new Error('Not authorized to join this video call');
    }

    // If student, verify payment for the course OR check subscription
    if (session.student_id === user.id && session.course_id) {
      // Check for course payment
      const { data: payment } = await supabaseClient
        .from('payments')
        .select('id')
        .eq('user_id', user.id)
        .eq('course_id', session.course_id)
        .eq('status', 'completed')
        .maybeSingle();

      // Check subscription
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('subscription_tier, subscription_expires_at')
        .eq('id', user.id)
        .single();

      const hasSubscription = profile?.subscription_tier && 
        ['Lite', 'Premium', 'Premium Pro'].includes(profile.subscription_tier) &&
        (!profile.subscription_expires_at || new Date(profile.subscription_expires_at) > new Date());

      if (!payment && !hasSubscription) {
        throw new Error('Payment required');
      }
    }

    // Get ZegoCloud credentials from secrets
    const appId = parseInt(Deno.env.get('ZEGOCLOUD_APP_ID') ?? '0');
    const serverSecret = Deno.env.get('ZEGOCLOUD_SERVER_SECRET') ?? '';

    if (!appId || !serverSecret) {
      throw new Error('Video call service not configured');
    }

    // Generate Standard Token04 using the official specification
    const token = await generateToken04(appId, user.id, serverSecret, 3600, '');

    return new Response(
      JSON.stringify({ 
        success: true, 
        token,
        appId,
        roomId: room_id,
        userId: user.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Video token generation error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to generate video token' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: err.message === 'Unauthorized' || err.message === 'Not authorized to join this video call' ? 401 : 400 
      }
    );
  }
});
