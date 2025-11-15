import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import { createHmac } from "https://deno.land/std@0.168.0/node/crypto.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ZegoCloud token generation
async function generateToken(appId: number, serverSecret: string, userId: string, roomId: string): Promise<string> {
  const time = Math.floor(Date.now() / 1000) + 3600; // 1 hour expiry
  const nonce = Math.floor(Math.random() * 2147483647);
  const body = { app_id: appId, user_id: userId, room_id: roomId, privilege: { 1: 1, 2: 1 }, stream_id_list: null };
  const payload = JSON.stringify(body);
  
  // Create signature using HMAC-SHA256
  const hmac = createHmac('sha256', serverSecret);
  hmac.update(`${appId}${roomId}${userId}${time}${nonce}`);
  const signature = hmac.digest('hex');
  
  const tokenData = {
    app_id: appId,
    user_id: userId,
    nonce: nonce,
    ctime: time,
    signature: signature,
    version: 1,
    payload: payload
  };
  
  return btoa(JSON.stringify(tokenData));
}

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
      Deno.env.get('SUPABASE_PUBLISHABLE_KEY') ?? '',
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

    const { session_id, room_id } = await req.json();

    if (!session_id || !room_id) {
      throw new Error('Session ID and room ID are required');
    }

    // Verify user has access to this video call session
    const { data: session, error: sessionError } = await supabaseClient
      .from('video_call_schedules')
      .select('id, teacher_id, student_id')
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

    // Get ZegoCloud credentials from secrets
    const appId = parseInt(Deno.env.get('ZEGOCLOUD_APP_ID') ?? '0');
    const serverSecret = Deno.env.get('ZEGOCLOUD_SERVER_SECRET') ?? '';

    if (!appId || !serverSecret) {
      throw new Error('Video call service not configured');
    }

    // Generate token
    const token = await generateToken(appId, serverSecret, user.id, room_id);

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
