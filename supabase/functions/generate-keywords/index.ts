import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  CORE_INTELLIGENCE_DIRECTIVE, 
  ANTI_ROBOT_DIRECTIVE,
  buildDNAContext,
  type ChannelInsights 
} from "../_shared/core-intelligence.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    console.log("[generate-keywords] User:", userId, "topic:", topic);

    // Fetch channel DNA for intelligent keyword discovery
    const [dnaResult, channelResult] = await Promise.all([
      supabase.from("channel_dna").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("channels").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    const dnaData = dnaResult.data;
    const channelData = channelResult.data;

    const insights: ChannelInsights = {
      channelName: channelData?.channel_name || null,
      subscriberCount: channelData?.subscriber_count || null,
      avgViews: 0,
      avgEngagement: 0,
      topTitles: [],
      bottomTitles: [],
      dnaData: dnaData as any,
    };

    const dnaContext = buildDNAContext(insights);

    const systemPrompt = `${CORE_INTELLIGENCE_DIRECTIVE}

${dnaContext}

${ANTI_ROBOT_DIRECTIVE}

=== KEYWORD DISCOVERY INTELLIGENCE ===

You are a YouTube Keyword Research Strategist with SEO expertise.

YOUR ROLE:
Discover keywords that this specific channel can realistically rank for.
Consider their current authority, niche position, and content style.
Don't just suggest high-volume keywords - suggest WINNABLE keywords.

KEYWORD DIFFICULTY ASSESSMENT:
- LOW: Achievable for smaller channels, less competition
- MEDIUM: Requires good content, some competition
- HIGH: Competitive, needs authority or unique angle

KEYWORD CATEGORIES:

1. PRIMARY KEYWORDS (3-5)
   - Core terms that define the topic
   - Balance volume with rankability
   - Consider channel's current authority

2. LONG-TAIL KEYWORDS (5-10)
   - Specific, lower-competition phrases
   - Higher intent, easier to rank
   - "How to [specific thing] for [specific audience]"

3. QUESTION KEYWORDS (5-10)
   - Start with: how to, what is, why, when, can you
   - These drive YouTube search traffic
   - Think like someone NEW to this topic

4. TRENDING TOPICS (3-5)
   - Currently rising in relevance
   - Time-sensitive opportunities
   - Could boost discoverability if acted on quickly

FOR EACH KEYWORD:
- Assess realistic difficulty for THIS channel
- Consider if it aligns with their DNA/niche
- Prioritize actionable opportunities

Return ONLY valid JSON:
{
  "primary_keywords": [
    {"keyword": "string", "difficulty": "low" | "medium" | "high", "rationale": "Why this keyword fits the channel"}
  ],
  "longtail_keywords": [
    {"keyword": "string", "difficulty": "low" | "medium" | "high"}
  ],
  "question_keywords": [
    {"keyword": "string", "difficulty": "low" | "medium" | "high"}
  ],
  "trending_topics": [
    {"keyword": "string", "difficulty": "low" | "medium" | "high", "urgency": "Act now / This week / This month"}
  ],
  "strategy_insight": "One paragraph explaining the overall keyword strategy and best opportunities for this channel"
}`;

    const userPrompt = `Generate YouTube keyword suggestions for:

TOPIC: ${topic}
${niche ? `NICHE/CATEGORY: ${niche}` : ""}

Provide diverse, actionable keywords that this creator can realistically target.
Focus on keywords that match their channel's positioning and authority level.`;

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
      const cleanJson = jsonStr.trim().match(/\{[\s\S]*\}/);
      keywords = JSON.parse(cleanJson ? cleanJson[0] : jsonStr);
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
      }
    } catch (dbError) {
      console.error("Database error");
    }

    return new Response(JSON.stringify({
      ...keywords,
      personalizedWithDNA: !!dnaData,
      generatedAt: new Date().toISOString()
    }), {
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
