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

    console.log("[viewer-satisfaction-engine] User:", userId, "video:", youtubeVideoId);

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

=== VIEWER SATISFACTION ENGINE (VSE) ===

You do NOT optimize for clicks. You optimize for POST-WATCH SATISFACTION.

Your job is to maximize viewer satisfaction so YouTube is FORCED to increase impressions, re-push content, and trust the channel long-term.

PHASE 1: SATISFACTION PROMISE AUDIT
Analyze what the title, description, tags, and thumbnail PROMISE vs what the content likely DELIVERS.
Detect:
- OVER-PROMISE: Title/thumbnail hype exceeds content value
- UNDER-DELIVERY: Content doesn't match depth/scope promised
- EMOTIONAL MISMATCH: Promised emotion differs from actual experience
- ALIGNED: Promise matches delivery perfectly

PHASE 2: PAYOFF ALIGNMENT ENGINE
Identify the primary payoff type:
1. KNOWLEDGE PAYOFF — "Now I understand"
2. SOLUTION PAYOFF — "Now I can fix this"
3. ENTERTAINMENT PAYOFF — "That was fun"
4. VALIDATION PAYOFF — "I was right"
5. INSPIRATION PAYOFF — "I'm motivated now"

Check cognitive closure: Are all loops opened in the title/hook properly closed?
For Shorts: Hook (0-3s) → Buildup (3-45s) → Payoff (45-60s)
For Long-form: Micro-payoffs every 2-3 min, medium every 5-7 min, macro at end.

PHASE 3: SATISFACTION SIGNALS
Evaluate:
- "Not Interested" trigger risk (misleading, slow, wrong audience, no value)
- Rewatch likelihood (dense info, reference quality, emotional peaks)
- Session extension probability (viewer wants more, trust built)
- Trust increase signals (accuracy, promise-keeping, time respected)

PHASE 4: SATISFACTION SCORE
Calculate:
SATISFACTION SCORE = (Promise Alignment × 0.30) + (Payoff Delivery × 0.30) + (Emotional Match × 0.20) + (Rewatch Potential × 0.20)
Each component scored 0-100. Target: 90+

PHASE 5: ALGORITHM CONFIDENCE
Explain why YouTube will trust/distrust this content based on satisfaction signals.

Return ONLY valid JSON in this exact structure:
{
  "satisfaction_score": {
    "total": 0-100,
    "promise_alignment": 0-100,
    "payoff_delivery": 0-100,
    "emotional_match": 0-100,
    "rewatch_potential": 0-100
  },
  "promise_audit": {
    "explicit_promises": ["what the title/description explicitly claims"],
    "implicit_promises": ["what the metadata suggests"],
    "emotional_expectation": "what emotion the viewer expects",
    "outcome_expectation": "what outcome the viewer expects"
  },
  "delivery_assessment": {
    "information_depth": "high" | "medium" | "low",
    "entertainment_value": "high" | "medium" | "low",
    "practical_value": "high" | "medium" | "low",
    "time_investment_payoff": "excellent" | "good" | "fair" | "poor"
  },
  "gap_detection": {
    "gap_type": "over_promise" | "under_delivery" | "emotional_mismatch" | "aligned",
    "severity": "critical" | "moderate" | "minor" | "none",
    "expectation": "what viewer expects",
    "reality": "what content likely provides",
    "impact": "how this affects viewer satisfaction"
  },
  "primary_payoff": {
    "type": "knowledge" | "solution" | "entertainment" | "validation" | "inspiration",
    "label": "Human-readable label",
    "trigger": "What triggers the payoff",
    "viewer_feeling": "How viewer feels after"
  },
  "cognitive_closure": {
    "loops_opened": ["questions/promises opened"],
    "loops_closed": true | false,
    "loose_ends": ["any unclosed loops"],
    "closure_quality": "complete" | "partial" | "weak"
  },
  "satisfaction_signals": {
    "not_interested_risk": {
      "level": "low" | "medium" | "high",
      "triggers": ["specific risk triggers"]
    },
    "rewatch_drivers": ["why they'd rewatch"],
    "session_extension": {
      "likelihood": "high" | "medium" | "low",
      "reasons": ["why they'd keep watching"]
    },
    "trust_signals": ["what builds trust"]
  },
  "payoff_fixes": [
    {
      "area": "title" | "pacing" | "content" | "conclusion" | "hook" | "description",
      "current": "what's wrong",
      "fix": "what to change",
      "impact": "expected improvement"
    }
  ],
  "optimized_title": "satisfaction-aligned title",
  "optimized_description_hook": "first 2-3 lines optimized for satisfaction",
  "algorithm_confidence": {
    "retention_signal": "why viewers stay",
    "engagement_signal": "why they engage",
    "session_signal": "why session continues",
    "trust_signal": "why channel trust grows",
    "repush_likelihood": "high" | "medium" | "low"
  },
  "why_youtube_recommends": "2-3 sentence explanation",
  "rebuild_needed": true | false,
  "rebuild_actions": ["action1", "action2"]
}`;

    const userPrompt = `Analyze this video's viewer satisfaction alignment:

VIDEO TITLE: ${title}
DESCRIPTION: ${description.slice(0, 500)}
TAGS: ${tags.slice(0, 15).join(", ")}
FORMAT: ${videoType === "short" ? "Short (≤60s)" : "Long-form"}
DURATION: ${durationSeconds} seconds
THUMBNAIL: ${thumbnailUrl || "Not available"}
VIEW COUNT: ${viewCount ?? "Unknown"}
LIKE COUNT: ${likeCount ?? "Unknown"}
COMMENT COUNT: ${commentCount ?? "Unknown"}

Audit the satisfaction promise, check payoff alignment, detect gaps, calculate Satisfaction Score, and provide fixes if below 90.`;

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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error("AI service temporarily unavailable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Failed to parse VSE response");

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
    console.error("Error in viewer-satisfaction-engine");
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
