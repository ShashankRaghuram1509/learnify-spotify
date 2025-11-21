import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const fileName = formData.get('fileName') as string;

    if (!file || !fileName) {
      throw new Error('File and fileName are required');
    }

    console.log('Uploading file to Google Drive:', fileName);

    // Get Google Drive credentials from environment
    const clientId = Deno.env.get('GOOGLE_DRIVE_CLIENT_ID');
    const clientSecret = Deno.env.get('GOOGLE_DRIVE_CLIENT_SECRET');
    const refreshToken = Deno.env.get('GOOGLE_DRIVE_REFRESH_TOKEN');
    const folderId = Deno.env.get('GOOGLE_DRIVE_FOLDER_ID');

    if (!clientId || !clientSecret || !refreshToken || !folderId) {
      throw new Error('Google Drive credentials not configured');
    }

    // Get access token
    console.log('Getting access token...');
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token error:', errorText);
      throw new Error('Failed to get access token');
    }

    const { access_token } = await tokenResponse.json();

    // Upload file to Google Drive
    console.log('Uploading to Google Drive...');
    const metadata = {
      name: fileName,
      parents: [folderId],
    };

    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const uploadResponse = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink,webContentLink',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
        },
        body: form,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      console.error('Upload error:', errorText);
      throw new Error('Failed to upload file to Google Drive');
    }

    const uploadResult = await uploadResponse.json();
    console.log('Upload successful:', uploadResult.id);

    // Make the file publicly accessible
    console.log('Setting file permissions...');
    const permissionResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${uploadResult.id}/permissions`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      }
    );

    if (!permissionResponse.ok) {
      console.error('Permission error:', await permissionResponse.text());
    }

    return new Response(
      JSON.stringify({
        fileId: uploadResult.id,
        webViewLink: uploadResult.webViewLink,
        webContentLink: uploadResult.webContentLink,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in upload-to-drive function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
