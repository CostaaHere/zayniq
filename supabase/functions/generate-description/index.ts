import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  CORE_INTELLIGENCE_DIRECTIVE, 
  ANTI_ROBOT_DIRECTIVE,
  SELF_CRITIQUE_DIRECTIVE,
  buildDNAContext,
  buildPerformanceContext,
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
    const { title, summary, keyPoints, links, includeTimestamps, channelDNA } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("[generate-description] User:", userId, "title:", title);

    // Fetch channel data for DNA-aligned intelligence
    const [channelResult, dnaResult, videosResult] = await Promise.all([
      supabase.from("channels").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("channel_dna").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("youtube_videos").select("*").eq("user_id", userId).order("view_count", { ascending: false }).limit(10),
    ]);

    const channelData = channelResult.data;
    const dnaData = dnaResult.data;
    const videosData = videosResult.data || [];

    const avgViews = videosData.length > 0 
      ? videosData.reduce((sum: number, v: any) => sum + (v.view_count || 0), 0) / videosData.length 
      : 1000;
    const avgLikes = videosData.length > 0
      ? videosData.reduce((sum: number, v: any) => sum + (v.like_count || 0), 0) / videosData.length
      : 50;
    const avgEngagement = avgViews > 0 ? (avgLikes / avgViews) * 100 : 3;
    
    const topTitles = videosData.slice(0, 5).map((v: any) => v.title);
    const bottomTitles = [...videosData].sort((a: any, b: any) => (a.view_count || 0) - (b.view_count || 0)).slice(0, 3).map((v: any) => v.title);

    const insights: ChannelInsights = {
      channelName: channelData?.channel_name || null,
      subscriberCount: channelData?.subscriber_count || null,
      avgViews,
      avgEngagement,
      topTitles,
      bottomTitles,
      dnaData: dnaData as any,
    };

    const dnaContext = buildDNAContext(insights);

    const systemPrompt = `${CORE_INTELLIGENCE_DIRECTIVE}

${dnaContext}

${ANTI_ROBOT_DIRECTIVE}

=== DESCRIPTION INTELLIGENCE TASK ===

You are a YouTube Description Strategist operating at elite intelligence.

YOUR ROLE:
Write a description that FEELS like the creator wrote it themselves.
Match their voice, vocabulary, and communication style exactly.
Every description must be channel-specific, not generic.

DESCRIPTION STRUCTURE:
1. HOOK (First 2-3 sentences) - This shows in preview. Must grab attention immediately.
2. BODY - Value proposition, key takeaways, what viewers will learn/experience
3. ${includeTimestamps ? "TIMESTAMPS - Include realistic, helpful chapter markers" : "NO TIMESTAMPS - User preference"}
4. CALL-TO-ACTION - Natural, not pushy. Matches channel tone.

QUALITY STANDARDS:
- Character count: 200-500 for main content (not including timestamps)
- Voice: Match the channel's DNA exactly
- NO generic phrases like "In this video, I..." or "Don't forget to subscribe!"
- Write as if you ARE the creator

${SELF_CRITIQUE_DIRECTIVE}

Return a JSON object with this exact structure:
{
  "description": "The full description text with proper line breaks using \\n",
  "hashtags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "callToAction": "A natural, channel-voice CTA",
  "characterCount": 350,
  "voiceMatch": "Brief explanation of how this matches the channel's voice"
}

Return ONLY valid JSON. No markdown or explanation.`;

    const userPrompt = `Generate a DNA-aligned YouTube description for:

VIDEO TITLE: ${title}
SUMMARY: ${summary}
${keyPoints?.length ? `KEY POINTS:\n${keyPoints.map((p: string, i: number) => `${i + 1}. ${p}`).join("\n")}` : ""}
${links?.length ? `LINKS TO INCLUDE:\n${links.join("\n")}` : ""}
${includeTimestamps ? "Include timestamps for sections" : "No timestamps needed"}

Remember: Write as if you ARE the creator. Match their DNA exactly.`;

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

    return new Response(JSON.stringify({ 
      ...result, 
      personalizedWithDNA: !!dnaData,
      generatedAt: new Date().toISOString()
    }), {
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
