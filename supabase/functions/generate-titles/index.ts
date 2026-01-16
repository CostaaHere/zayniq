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

    const { topic, keyword, tone, includeEmoji, channelDNA } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating titles for user:", user.id, "topic:", topic, "with DNA:", !!channelDNA);

    // Build DNA-aware system prompt
    let dnaContext = "";
    if (channelDNA) {
      dnaContext = `
IMPORTANT - CHANNEL DNA (Personalization Context):
${channelDNA}

You MUST adapt your title suggestions to match this channel's unique voice, style, and patterns. 
Do NOT generate generic titles. Every title should feel like it belongs on THIS specific channel.
`;
    }

    const systemPrompt = `You are a YouTube title expert specializing in personalized, channel-specific titles.
${dnaContext}
Generate exactly 10 engaging, click-worthy video titles.

Rules:
- Each title should be under 60 characters for optimal display
- Use proven title formulas: numbers, how-to, questions, power words
- Match the requested tone exactly
- ${includeEmoji ? "Include 1-2 relevant emojis in each title" : "Do NOT include any emojis"}
- ${keyword ? `Naturally incorporate the keyword "${keyword}" in at least 7 titles` : ""}
- Vary the title structures for diversity
${channelDNA ? `- CRITICAL: Match the channel's voice, use their preferred power words, and follow their successful title patterns` : ""}

Power words to consider: Ultimate, Essential, Secret, Proven, Amazing, Incredible, Simple, Easy, Fast, Complete, Free, Best, Top, New

Return ONLY a JSON array of 10 title objects in this exact format:
[{"title": "Your Title Here", "powerWords": ["word1", "word2"]}]

Do not include any explanation or markdown, just the JSON array.`;

    const userPrompt = `Generate 10 YouTube titles for this video:

Topic: ${topic}
${keyword ? `Target keyword: ${keyword}` : ""}
Tone: ${tone}
${includeEmoji ? "Include emojis" : "No emojis"}`;

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
      const errorText = await response.text();
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
    let titles;
    try {
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        titles = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON array found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse titles");
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ titles, personalizedWithDNA: !!channelDNA }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-titles");
    const errorMessage = error instanceof Error ? error.message : "Failed to generate titles";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
