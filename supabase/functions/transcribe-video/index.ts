import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { videoUrl, enrollmentId } = await req.json();

    if (!videoUrl || !enrollmentId) {
      return new Response(
        JSON.stringify({ error: "videoUrl and enrollmentId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GROQ_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Step 1: Fetch video file
    console.log("Fetching video file from:", videoUrl);
    const videoResponse = await fetch(videoUrl);
    if (!videoResponse.ok) {
      throw new Error(`Failed to fetch video: ${videoResponse.statusText}`);
    }
    const videoBlob = await videoResponse.blob();

    // Step 2: Transcribe using Groq Whisper
    console.log("Transcribing with Groq Whisper...");
    const formData = new FormData();
    formData.append("file", videoBlob, "video.mp4");
    formData.append("model", "whisper-large-v3-turbo");

    const transcriptionResponse = await fetch(
      "https://api.groq.com/openai/v1/audio/transcriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
        },
        body: formData,
      }
    );

    if (!transcriptionResponse.ok) {
      const errorText = await transcriptionResponse.text();
      console.error("Groq transcription error:", errorText);
      throw new Error(`Transcription failed: ${errorText}`);
    }

    const transcriptionData = await transcriptionResponse.json();
    const transcript = transcriptionData.text;

    // Step 3: Summarize using Groq Llama
    console.log("Summarizing with Groq Llama...");
    const summaryResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that summarizes educational video call transcripts. Focus on key topics, action items, important concepts, and definitions.",
            },
            {
              role: "user",
              content: `Summarize this video call transcript for a student:\n\n${transcript}`,
            },
          ],
          temperature: 0.3,
          max_tokens: 1000,
        }),
      }
    );

    if (!summaryResponse.ok) {
      const errorText = await summaryResponse.text();
      console.error("Groq summary error:", errorText);
      throw new Error(`Summarization failed: ${errorText}`);
    }

    const summaryData = await summaryResponse.json();
    const summary = summaryData.choices[0].message.content;

    // Step 4: Save to database
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("transcripts")
      .insert({
        enrollment_id: enrollmentId,
        video_url: videoUrl,
        transcript,
        summary,
      })
      .select()
      .single();

    if (error) {
      console.error("Database error:", error);
      throw new Error(`Failed to save transcript: ${error.message}`);
    }

    console.log("Transcript saved successfully");
    return new Response(
      JSON.stringify({
        success: true,
        transcriptId: data.id,
        transcript,
        summary,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in transcribe-video function:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
