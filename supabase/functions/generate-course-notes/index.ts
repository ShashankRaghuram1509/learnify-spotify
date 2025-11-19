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
    const { courseTitle, courseDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating notes for course:', courseTitle);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert educational content creator. Generate comprehensive course notes with code examples. Structure your response as JSON with the following format:
{
  "overview": "Detailed course overview (2-3 paragraphs)",
  "keyPoints": [
    "Key learning point 1",
    "Key learning point 2",
    "Key learning point 3",
    "Key learning point 4",
    "Key learning point 5"
  ],
  "codeExamples": [
    {
      "title": "Example title",
      "description": "What this example demonstrates",
      "code": "The actual code snippet",
      "language": "programming language"
    }
  ],
  "resources": [
    "Resource or reference 1",
    "Resource or reference 2",
    "Resource or reference 3"
  ],
  "practiceExercises": [
    "Exercise 1 description",
    "Exercise 2 description",
    "Exercise 3 description"
  ]
}`
          },
          {
            role: 'user',
            content: `Generate comprehensive educational notes for a course titled "${courseTitle}". ${courseDescription ? `Course description: ${courseDescription}` : ''} Include practical code examples relevant to the topic, key learning points, additional resources, and practice exercises.`
          }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_course_notes",
              description: "Generate structured course notes with code examples",
              parameters: {
                type: "object",
                properties: {
                  overview: {
                    type: "string",
                    description: "Detailed course overview"
                  },
                  keyPoints: {
                    type: "array",
                    items: { type: "string" },
                    description: "Array of key learning points"
                  },
                  codeExamples: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        code: { type: "string" },
                        language: { type: "string" }
                      },
                      required: ["title", "description", "code", "language"]
                    }
                  },
                  resources: {
                    type: "array",
                    items: { type: "string" }
                  },
                  practiceExercises: {
                    type: "array",
                    items: { type: "string" }
                  }
                },
                required: ["overview", "keyPoints", "codeExamples", "resources", "practiceExercises"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "generate_course_notes" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Failed to generate notes');
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract the structured data from the tool call
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      throw new Error('No tool call data in response');
    }

    const notes = JSON.parse(toolCall.function.arguments);

    return new Response(
      JSON.stringify({ notes }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating notes:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to generate notes' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
