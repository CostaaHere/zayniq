import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import {
  CORE_INTELLIGENCE_DIRECTIVE,
  ANTI_ROBOT_DIRECTIVE,
  buildDNAContext,
  type ChannelInsights,
} from "../_shared/core-intelligence.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
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
      global: { headers: { Authorization: authHeader } },
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
    const body = await req.json();
    const {
      youtubeVideoId,
      title,
      description = "",
      tags = [],
      videoType = "long",
      durationSeconds = 0,
      viewCount,
      likeCount,
      commentCount,
      thumbnailUrl,
    } = body;

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("[viewer-intent-engine] User:", userId, "video:", youtubeVideoId);

    // Fetch channel DNA and videos for context
    const [dnaResult, videosResult, channelResult] = await Promise.all([
      supabase.from("channel_dna").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("youtube_videos").select("title, view_count, like_count, tags, description").eq("user_id", userId).order("view_count", { ascending: false }).limit(10),
      supabase.from("channels").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    const dnaData = dnaResult.data;
    const videosData = videosResult.data || [];
    const channelData = channelResult.data;

    const avgViews = videosData.length > 0
      ? videosData.reduce((sum: number, v: any) => sum + (v.view_count || 0), 0) / videosData.length
      : 1000;
    const avgLikes = videosData.length > 0
      ? videosData.reduce((sum: number, v: any) => sum + (v.like_count || 0), 0) / videosData.length
      : 50;

    const insights: ChannelInsights = {
      channelName: channelData?.channel_name || null,
      subscriberCount: channelData?.subscriber_count || null,
      avgViews,
      avgEngagement: avgViews > 0 ? (avgLikes / avgViews) * 100 : 3,
      topTitles: videosData.slice(0, 5).map((v: any) => v.title),
      bottomTitles: [...videosData].sort((a: any, b: any) => (a.view_count || 0) - (b.view_count || 0)).slice(0, 3).map((v: any) => v.title),
      dnaData: dnaData as any,
    };

    const dnaContext = buildDNAContext(insights);

    const systemPrompt = `${CORE_INTELLIGENCE_DIRECTIVE}

${dnaContext}

${ANTI_ROBOT_DIRECTIVE}

=== VIEWER INTENT ENGINE (VIE) ===

You are a Viewer Intent Classification System. You do NOT optimize for search. You align content with viewer intent clusters used by YouTube's recommendation system.

Your job is to create an INTENT GRAVITY FIELD around the video so YouTube naturally pulls the RIGHT viewers toward it.

PHASE 1: VIEWER INTENT DECOMPOSITION
Break the audience into 5 intent layers and identify which ONE is the primary intent:
1. PASSIVE SCROLLERS — Easy consumption, high stimulation
2. CURIOUS EXPLORERS — Learn something new, be surprised
3. PROBLEM-SOLVERS — Solve my problem now
4. ENTERTAINMENT SEEKERS — Entertain me, make me feel
5. HIGH-RETENTION REPEAT VIEWERS — This is worth my full attention

For each relevant layer, analyze: what they expect, what makes them stay, what makes them rewatch.

PHASE 2: INTENT SIGNAL TRANSLATION
Generate intent-aligned versions of:
- Title (matching the primary intent's language patterns)
- Description core (first 2-3 lines that lock in expectation)
- Supportive tag set (for intent classification, NOT search SEO)

PHASE 3: INTENT CONSISTENCY LOCK
Check alignment across all metadata:
- Title promise = Video delivery?
- Description reinforces satisfaction?
- Tags prevent misclassification?
Detect and correct any intent mismatches, clickbait risks, or retention-killing signals.

PHASE 4: INTENT GRAVITY SCORE
Calculate:
INTENT GRAVITY SCORE = (Intent Clarity × 0.25) + (Consistency × 0.25) + (Satisfaction Probability × 0.30) + (Recommendation Compatibility × 0.20)

Each component scored 0-100.

Return ONLY valid JSON in this exact structure:
{
  "primary_intent": {
    "type": "passive_scroller" | "curious_explorer" | "problem_solver" | "entertainment_seeker" | "high_retention_repeat",
    "label": "Human-readable label",
    "expectation": "What they want from this video",
    "satisfaction_trigger": "What makes them happy",
    "intent_signal": "Core signal phrase"
  },
  "secondary_intent": {
    "type": "string",
    "label": "string",
    "why": "Why this is secondary"
  },
  "intent_layers": [
    {
      "type": "string",
      "label": "string",
      "relevance": "high" | "medium" | "low",
      "what_they_expect": ["string"],
      "what_makes_them_stay": ["string"],
      "what_makes_them_rewatch": ["string"]
    }
  ],
  "intent_aligned_title": "Optimized title for primary intent",
  "intent_aligned_description": "First 2-3 lines that lock in expectation",
  "supportive_tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "consistency_check": {
    "title_delivery_match": { "aligned": true|false, "explanation": "string" },
    "description_reinforcement": { "aligned": true|false, "explanation": "string" },
    "tags_classification": { "aligned": true|false, "explanation": "string" }
  },
  "detected_issues": [
    {
      "type": "intent_mismatch" | "clickbait_risk" | "retention_killer",
      "detected": "What was found",
      "correction": "How to fix it"
    }
  ],
  "gravity_score": {
    "total": 0-100,
    "intent_clarity": 0-100,
    "consistency": 0-100,
    "satisfaction_probability": 0-100,
    "recommendation_compatibility": 0-100
  },
  "why_youtube_recommends": "2-3 sentence explanation of algorithmic match",
  "rebuild_needed": true|false,
  "rebuild_actions": ["action1", "action2"]
}`;

    const userPrompt = `Analyze this video's viewer intent alignment:

VIDEO TITLE: ${title}
DESCRIPTION: ${description.slice(0, 500)}
TAGS: ${tags.slice(0, 15).join(", ")}
FORMAT: ${videoType === "short" ? "Short (≤60s)" : "Long-form"}
DURATION: ${durationSeconds} seconds
THUMBNAIL: ${thumbnailUrl || "Not available"}
VIEW COUNT: ${viewCount ?? "Unknown"}
LIKE COUNT: ${likeCount ?? "Unknown"}
COMMENT COUNT: ${commentCount ?? "Unknown"}

Decompose viewer intent, check consistency, calculate Intent Gravity Score, and provide intent-aligned metadata recommendations.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
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

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse VIE response");

    const result = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify({
        ...result,
        personalizedWithDNA: !!dnaData,
        generatedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in viewer-intent-engine");
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
