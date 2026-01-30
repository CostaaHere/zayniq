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
    // Verify authentication using getClaims() for efficient JWT validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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

    // Use getClaims() for efficient JWT validation - verifies signature and expiration locally
    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;

    const { topic, niche } = await req.json();
    
    if (!topic || topic.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: "Topic is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("LOVABLE_API_KEY is not configured");
      throw new Error("AI service not configured");
    }

    const systemPrompt = `You are a YouTube SEO keyword research expert. Generate keyword suggestions for YouTube content creators.

Your response must be valid JSON with this exact structure:
{
  "primary_keywords": [
    {"keyword": "string", "difficulty": "low" | "medium" | "high"}
  ],
  "longtail_keywords": [
    {"keyword": "string", "difficulty": "low" | "medium" | "high"}
  ],
  "question_keywords": [
    {"keyword": "string", "difficulty": "low" | "medium" | "high"}
  ],
  "trending_topics": [
    {"keyword": "string", "difficulty": "low" | "medium" | "high"}
  ]
}

Guidelines:
- primary_keywords: 3-5 high-intent keywords that are broad but relevant
- longtail_keywords: 5-10 specific, longer phrases with lower competition
- question_keywords: 5-10 questions starting with "how to", "what is", "why", "when", etc.
- trending_topics: 3-5 currently trending related topics
- Difficulty should reflect YouTube search competition (low = easy to rank, high = very competitive)
- Make keywords specific to the topic and niche provided
- Focus on searchable, YouTube-friendly phrases`;

    const userPrompt = `Generate YouTube keyword suggestions for the following:

Topic: ${topic}
${niche ? `Niche/Category: ${niche}` : ""}

Provide diverse, actionable keywords that a YouTube creator could use for video titles, descriptions, and tags.`;

    console.log("Calling Lovable AI Gateway for user:", userId);

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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      console.error("AI Gateway error:", response.status);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("Failed to generate keywords");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error("No content in AI response");
      throw new Error("No response from AI");
    }

    // Parse JSON from response (handle markdown code blocks)
    let keywords;
    try {
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                        content.match(/```\s*([\s\S]*?)\s*```/) ||
                        [null, content];
      const jsonStr = jsonMatch[1] || content;
      keywords = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response");
      throw new Error("Failed to parse keyword suggestions");
    }

    // Save to database using service role
    try {
      const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminSupabase = createClient(supabaseUrl, serviceRoleKey);
      
      const { error: insertError } = await adminSupabase
        .from("ai_generations")
        .insert({
          user_id: userId,
          generation_type: "keywords",
          input_topic: topic,
          input_niche: niche,
          primary_keywords: keywords.primary_keywords || [],
          longtail_keywords: keywords.longtail_keywords || [],
          question_keywords: keywords.question_keywords || [],
          trending_topics: keywords.trending_topics || [],
        });
      
      if (insertError) {
        console.error("Failed to save generation");
      } else {
        console.log("Generation saved successfully");
      }
    } catch (dbError) {
      console.error("Database error");
      // Continue anyway - don't fail the request
    }

    return new Response(JSON.stringify(keywords), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in generate-keywords");
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
