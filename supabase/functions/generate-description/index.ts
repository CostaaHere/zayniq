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
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { title, summary, keyPoints, links, includeTimestamps, channelDNA } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating description for user:", user.id, "title:", title, "with DNA:", !!channelDNA);

    // Build DNA-aware system prompt
    let dnaContext = "";
    if (channelDNA) {
      dnaContext = `
IMPORTANT - CHANNEL DNA (Personalization Context):
${channelDNA}

You MUST write this description in the channel's unique voice and style.
Match their tone, vocabulary, and communication patterns exactly.
Do NOT generate a generic description - it should feel authentically "theirs".
`;
    }

    const systemPrompt = `You are a YouTube description expert specializing in personalized, channel-specific content.
${dnaContext}
Generate an optimized video description that maximizes engagement and SEO.

Rules:
- Start with a compelling 2-3 sentence hook (this shows in preview)
- Keep total length between 200-500 characters for the main content
- Structure the description with clear sections
- ${includeTimestamps ? "Include realistic timestamp sections (e.g., 0:00 Intro, 1:23 Topic, etc.)" : "Do NOT include timestamps"}
- End with a call-to-action for subscribing
- Be conversational but professional
${channelDNA ? `- CRITICAL: Write in the channel's authentic voice and style` : ""}

Return a JSON object with this exact structure:
{
  "description": "The full description text with proper line breaks using \\n",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "callToAction": "A subscribe reminder text",
  "characterCount": 350
}

Do not include any explanation or markdown, just the JSON object.`;

    const userPrompt = `Generate a YouTube description for:

Title: ${title}
Summary: ${summary}
${keyPoints?.length ? `Key points to cover:\n${keyPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join("\n")}` : ""}
${links?.length ? `Links to include:\n${links.join("\n")}` : ""}
${includeTimestamps ? "Include timestamps for sections" : "No timestamps needed"}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI service temporarily unavailable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON response
    let result;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON object found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse description");
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ ...result, personalizedWithDNA: !!channelDNA }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-description");
    const errorMessage = error instanceof Error ? error.message : "Failed to generate description";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
