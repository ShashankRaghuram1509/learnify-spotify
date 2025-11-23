import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

async function getAccessToken(): Promise<string> {
  const clientId = Deno.env.get('GOOGLE_DRIVE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET');
  const refreshToken = Deno.env.get('GOOGLE_DRIVE_REFRESH_TOKEN');

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId!,
      client_secret: clientSecret!,
      refresh_token: refreshToken!,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Failed to get access token: ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Extract JWT token
    const token = authHeader.replace('Bearer ', '');
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
        auth: {
          persistSession: false,
        }
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !user) {
      console.error('Auth error:', userError);
      throw new Error('Authentication failed');
    }

    const { session_id, summary, start_time, duration_minutes } = await req.json();

    if (!session_id || !summary || !start_time) {
      throw new Error('Missing required fields');
    }

    // Get access token for Google Calendar API
    const accessToken = await getAccessToken();

    // Calculate end time
    const startDate = new Date(start_time);
    const endDate = new Date(startDate.getTime() + (duration_minutes || 60) * 60000);

    // Create Calendar event with Google Meet
    const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        summary,
        description: `Video call session - ${summary}`,
        start: {
          dateTime: startDate.toISOString(),
          timeZone: 'UTC',
        },
        end: {
          dateTime: endDate.toISOString(),
          timeZone: 'UTC',
        },
        conferenceData: {
          createRequest: {
            requestId: session_id,
            conferenceSolutionKey: {
              type: 'hangoutsMeet'
            }
          }
        },
      }),
    });

    const eventData = await calendarResponse.json();
    
    if (!calendarResponse.ok) {
      console.error('Calendar API error:', eventData);
      throw new Error(`Failed to create Meet link: ${eventData.error?.message || 'Unknown error'}`);
    }

    const meetLink = eventData.conferenceData?.entryPoints?.find(
      (ep: any) => ep.entryPointType === 'video'
    )?.uri || eventData.hangoutLink;

    if (!meetLink) {
      throw new Error('Failed to generate Meet link');
    }

    // Update the video call schedule with the Meet link
    const { error: updateError } = await supabaseClient
      .from('video_call_schedules')
      .update({ meeting_url: meetLink })
      .eq('id', session_id);

    if (updateError) {
      console.error('Failed to update schedule:', updateError);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        meeting_url: meetLink,
        event_id: eventData.id 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Meet link creation error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to create Meet link' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});