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

async function uploadFileToDrive(
  accessToken: string,
  fileName: string,
  fileData: Uint8Array,
  mimeType: string,
  folderId: string
): Promise<{ id: string; webViewLink: string }> {
  const metadata = {
    name: fileName,
    parents: [folderId],
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([fileData], { type: mimeType }));

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink',
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
      body: form,
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Drive upload failed: ${JSON.stringify(data)}`);
  }

  return data;
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
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

    // Check if user is a teacher
    const { data: roleData } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (roleData?.role !== 'teacher') {
      throw new Error('Only teachers can upload materials');
    }

    const { 
      course_id, 
      title, 
      description, 
      resource_type, 
      file_data, 
      file_name, 
      mime_type,
      url 
    } = await req.json();

    if (!course_id || !title || !resource_type) {
      throw new Error('Missing required fields');
    }

    // Verify teacher owns the course
    const { data: course } = await supabaseClient
      .from('courses')
      .select('teacher_id')
      .eq('id', course_id)
      .single();

    if (!course || course.teacher_id !== user.id) {
      throw new Error('Not authorized to upload materials for this course');
    }

    let resourceUrl = url;

    // If it's a file upload, upload to Google Drive
    if (file_data && file_name) {
      const accessToken = await getAccessToken();
      const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID') ?? '';
      
      const fileBytes = Uint8Array.from(atob(file_data), c => c.charCodeAt(0));
      const driveFile = await uploadFileToDrive(
        accessToken,
        file_name,
        fileBytes,
        mime_type || 'application/octet-stream',
        folderId
      );

      resourceUrl = driveFile.webViewLink;
    }

    // Get the highest position for this course
    const { data: maxPosition } = await supabaseClient
      .from('course_resources')
      .select('position')
      .eq('course_id', course_id)
      .order('position', { ascending: false })
      .limit(1)
      .maybeSingle();

    const position = (maxPosition?.position ?? -1) + 1;

    // Insert into course_resources
    const { data: resource, error: insertError } = await supabaseClient
      .from('course_resources')
      .insert({
        course_id,
        title,
        description,
        resource_type,
        url: resourceUrl,
        position,
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ 
        success: true, 
        resource 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    const err = error as Error;
    console.error('Upload error:', err);
    return new Response(
      JSON.stringify({ error: err.message || 'Failed to upload material' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    );
  }
});