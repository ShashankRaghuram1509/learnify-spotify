import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ZegoCloud Token04 generation
async function generateToken04(
  appId: number,
  userId: string,
  serverSecret: string,
  effectiveTimeInSeconds: number,
  payload: string
): Promise<string> {
  if (!appId || !userId || !serverSecret) {
    throw new Error('Invalid parameters for token generation');
  }

  const createTime = Math.floor(Date.now() / 1000);
  const expireTime = createTime + effectiveTimeInSeconds;
  // Random nonce (32-bit integer)
  const nonce = Math.floor(Math.random() * 2147483647);

  const tokenInfo = {
    app_id: appId,
    user_id: userId,
    nonce: nonce,
    ctime: createTime,
    expire: expireTime,
    payload: payload || ''
  };

  // Convert token info to JSON string
  const plainText = JSON.stringify(tokenInfo);

  // Prepare AES Key (32 bytes from serverSecret)
  // If serverSecret is 32 chars, these are the bytes.
  // If it's hex, we might need to parse it, but standard Zego samples treat it as a string.
  // We'll assume it is a 32-byte string.
  let keyBytes: Uint8Array;
  if (serverSecret.length === 32) {
      keyBytes = new TextEncoder().encode(serverSecret);
  } else {
      // Adjust key length to 32 bytes if necessary (pad or truncate)
      // This is a fallback, normally secret is 32 chars.
       const temp = new Uint8Array(32);
       const secretBytes = new TextEncoder().encode(serverSecret);
       temp.set(secretBytes.subarray(0, 32));
       keyBytes = temp;
  }
  
  // Generate IV (16 bytes)
  const iv = crypto.getRandomValues(new Uint8Array(16));

  // Encrypt using AES-CBC
  const key = await crypto.subtle.importKey(
    "raw",
    keyBytes,
    { name: "AES-CBC" },
    false,
    ["encrypt"]
  );

  const encodedPlainText = new TextEncoder().encode(plainText);
  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv: iv },
    key,
    encodedPlainText
  );
  
  const encryptedBytes = new Uint8Array(encryptedBuffer);

  // Pack data
  // Format: [Expire(8)] [IV Length(2)] [IV(var)] [Content Length(2)] [Content(var)]
  // All integers are Big Endian.

  const packSize = 8 + 2 + iv.length + 2 + encryptedBytes.length;
  const packed = new Uint8Array(packSize);
  const dataView = new DataView(packed.buffer);

  let offset = 0;

  // 1. Expire (8 bytes, int64). JS uses double for numbers.
  // We only use the lower 32 bits for the timestamp as it fits.
  // Set high 32 bits to 0.
  dataView.setBigInt64(offset, BigInt(expireTime), false); // false for Big Endian? No, DataView defaults to Big Endian?
  // Wait, DataView.setBigInt64(byteOffset, value, littleEndian)
  // We want Big Endian, so littleEndian = false (default is false actually? No, must specify or check docs. MDN says littleEndian is optional, default false which is Big Endian).
  // Correct: default is Big Endian.
  offset += 8;

  // 2. IV Length (2 bytes, int16)
  dataView.setInt16(offset, iv.length, false); // Big Endian
  offset += 2;

  // 3. IV (bytes)
  packed.set(iv, offset);
  offset += iv.length;

  // 4. Content Length (2 bytes, int16)
  dataView.setInt16(offset, encryptedBytes.length, false); // Big Endian
  offset += 2;

  // 5. Content (bytes)
  packed.set(encryptedBytes, offset);
  
  // Encode to Base64
  // btoa accepts binary string.
  // Convert Uint8Array to binary string.
  let binaryString = "";
  for (let i = 0; i < packed.length; i++) {
    binaryString += String.fromCharCode(packed[i]);
  }
  const base64Token = btoa(binaryString);

  return `04${base64Token}`;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('generate-video-token - Request received');
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('generate-video-token - No auth header');
      throw new Error('Unauthorized');
    }

    // Extract raw access token ("Bearer <token>" -> "<token>")
    const accessToken = authHeader.replace('Bearer', '').trim();

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '';

    if (!supabaseUrl || !supabaseKey) {
      console.error('generate-video-token - Supabase not configured');
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

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(accessToken);
    if (userError || !user) {
      console.error('generate-video-token - User auth failed:', userError);
      throw new Error('Unauthorized');
    }

    const { session_id, room_id } = await req.json();
    if (!session_id || !room_id) {
      console.error('generate-video-token - Missing session_id or room_id');
      throw new Error('Session ID and room ID are required');
    }

    // Verify user has access to this video call session
    const { data: session, error: sessionError } = await supabaseClient
      .from('video_call_schedules')
      .select('id, teacher_id, student_id, course_id')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      console.error('generate-video-token - Session not found:', sessionError);
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
      console.error('generate-video-token - Missing Zego credentials');
      throw new Error('Video call service not configured');
    }

    // Generate Token04 with 24 hour validity
    const token = await generateToken04(appId, user.id, serverSecret, 86400, '');

    const response = { 
      success: true, 
      token,
      appId,
      roomId: room_id,
      userId: user.id 
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('generate-video-token - Error:', err.message);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to generate video token' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: err.message === 'Unauthorized' || err.message === 'Not authorized to join this video call' ? 401 : 400 
      }
    );
  }
});
