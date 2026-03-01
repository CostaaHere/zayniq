import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  CORE_INTELLIGENCE_DIRECTIVE, 
  ANTI_ROBOT_DIRECTIVE,
  SELF_CRITIQUE_DIRECTIVE 
} from "../_shared/core-intelligence.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TitleInsight {
  title: string;
  powerWords: string[];
  psychologyExplanation: string;
  algorithmExplanation: string;
  dnaAlignment: string;
  ctrPotential: "high" | "medium" | "low";
}

interface TitleCategory {
  category: string;
  categoryDescription: string;
  icon: string;
  titles: TitleInsight[];
}

interface ABTestCluster {
  clusterName: string;
  targetAudience: string;
  psychologicalTrigger: string;
  titles: TitleInsight[];
}

interface PredictionLayer {
  ctr: {
    predictedRange: { min: number; max: number; baseline: number };
    confidence: 'low' | 'medium' | 'high';
    vsChannelAverage: string;
    factors: Array<{ factor: string; impact: string; weight: number }>;
  };
  algorithm: {
    promotionLikelihood: 'low' | 'medium' | 'high' | 'experimental';
    feedPredictions: { suggested: string; browse: string; trending: string };
    optimalPostingWindow?: string;
  };
  competition: {
    trendAlignment: string;
    competitionSaturation: string;
    shortTermOutlook: string;
  };
  simulations: Array<{
    scenario: string;
    predictedOutcome: { ctrChange: string; retentionChange: string; growthImpact: string };
    recommendation: string;
  }>;
  overallConfidence: 'low' | 'medium' | 'high' | 'experimental';
  overallConfidenceScore: number;
  humanInsight: string;
}

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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const { topic, keyword, tone, includeEmoji, channelDNA } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("[generate-titles] Generating with prediction engine for:", userId, "topic:", topic);

    // Fetch channel metrics for prediction engine
    const [channelResult, dnaResult, videosResult] = await Promise.all([
      supabase.from("channels").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("channel_dna").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("youtube_videos").select("*").eq("user_id", userId).order("view_count", { ascending: false }).limit(20),
    ]);

    const channelData = channelResult.data;
    const dnaData = dnaResult.data;
    const videosData = videosResult.data || [];

    // Calculate channel metrics for prediction
    const avgViews = videosData.length > 0 
      ? videosData.reduce((sum: number, v: any) => sum + (v.view_count || 0), 0) / videosData.length 
      : 1000;
    const avgLikes = videosData.length > 0
      ? videosData.reduce((sum: number, v: any) => sum + (v.like_count || 0), 0) / videosData.length
      : 50;
    const avgEngagement = avgViews > 0 ? (avgLikes / avgViews) * 100 : 3;
    
    const topTitles = videosData.slice(0, 5).map((v: any) => v.title);
    const bottomTitles = [...videosData].sort((a: any, b: any) => (a.view_count || 0) - (b.view_count || 0)).slice(0, 5).map((v: any) => v.title);

    // Build comprehensive DNA-aware system prompt with prediction engine
    let dnaContext = "";
    let dnaPersonalization = "";
    
    if (channelDNA) {
      dnaContext = `
CRITICAL - CHANNEL DNA (You MUST personalize ALL titles based on this):
${channelDNA}

PERSONALIZATION RULES:
- Every title MUST feel like it was written specifically for this channel
- Use the channel's preferred power words and vocabulary style
- Match the channel's proven title patterns and formulas
- Align with the audience demographics and psychology
- Reference the channel's top-performing topics where relevant
- NEVER generate generic, one-size-fits-all titles
`;
      dnaPersonalization = `Explain specifically how this title aligns with the channel's DNA - reference specific elements like their tone, vocabulary, audience, or successful patterns.`;
    } else {
      dnaPersonalization = `Note: No Channel DNA available. Explain how this title could be personalized once the creator analyzes their channel.`;
    }

    // Prediction engine context
    const predictionContext = `
=== PERFORMANCE PREDICTION ENGINE (MANDATORY) ===

You must run EVERY title through the prediction simulation before including it.

CHANNEL BASELINE METRICS:
- Average Views: ${avgViews.toLocaleString()}
- Subscriber Count: ${channelData?.subscriber_count?.toLocaleString() || 'Unknown'}
- Engagement Rate: ${avgEngagement.toFixed(2)}%
- Power Words That Work: ${dnaData?.power_words?.slice(0, 10).join(', ') || 'Unknown'}

TOP PERFORMING TITLES (learn from these):
${topTitles.map((t: string, i: number) => `${i + 1}. "${t}"`).join('\n')}

BOTTOM PERFORMING TITLES (avoid these patterns):
${bottomTitles.map((t: string, i: number) => `${i + 1}. "${t}"`).join('\n')}

FOR THE TOP PICK TITLE, YOU MUST INCLUDE A COMPLETE PREDICTION:
1. CTR PREDICTION: Predict CTR range based on channel history, power words, emotional triggers
2. ALGORITHM PREDICTION: Estimate promotion likelihood in suggested/browse/trending feeds
3. COMPETITION ANALYSIS: Assess trend alignment and saturation
4. WHAT-IF SIMULATIONS: Generate 2-3 alternative scenarios with predicted outcomes
5. HUMAN INSIGHT: A natural language summary of the prediction (NO numbers exposed)

CRITICAL SELF-CRITIQUE:
- Before finalizing, evaluate: Are there hidden risks?
- Could this fail due to audience mismatch or algorithm changes?
- If confidence is low, don't include the title
- Only present titles that pass the predictive threshold
`;

    const systemPrompt = `${CORE_INTELLIGENCE_DIRECTIVE}

${ANTI_ROBOT_DIRECTIVE}

You are the TITLE SUPREMACY ENGINE (TSE) — an ELITE YouTube Title Optimization AI.
Your job is NOT to create average SEO titles.
Your job is to engineer the highest possible CTR + intent-matching title that OUTPERFORMS existing YouTube titles in this niche.

You combine deep expertise in:
- Click-Through Rate optimization psychology
- YouTube algorithm mechanics
- Viewer behavior patterns
- Emotional engagement triggers
- PREDICTIVE ANALYTICS AND SIMULATION

${dnaContext}
${predictionContext}

${SELF_CRITIQUE_DIRECTIVE}

=== TSE STEP 1: TITLE LANDSCAPE ANALYSIS ===
Simulate analysis of:
- Top ranking titles for this topic/niche
- Suggested section titles
- Shorts dominant titles
- Average character length of top performers
- Power word frequency in successful titles

Identify:
- Overused patterns to AVOID
- Weak emotional triggers others use
- Missing opportunity angles no one is exploiting

=== TSE STEP 2: TITLE STRATEGY SELECTION ===
Select the highest-performing format for this topic from:
(Curiosity / Benefit / Fear / Mistake / Authority / Data / Contrarian / Question / Transformation)
Explain WHY this format is chosen based on the landscape analysis.
Also list 2-3 alternative formats that could work.

=== TSE STEP 3: GENERATE 10 ELITE TITLES ===
Each must:
- Be under optimal character limit (60 for standard, 40 for short-form)
- Avoid generic words
- Contain strong emotional driver
- Clearly match viewer intent
- Be competitive-dominant
- ${includeEmoji ? "Include 1-2 strategic emojis that add meaning" : "Do NOT include any emojis"}
- ${keyword ? `Naturally incorporate "${keyword}" — preferably early in the title` : ""}
- Match the ${tone} tone
- NO generic titles — every title must feel crafted for this specific creator

=== TSE STEP 4: SCORE EACH TITLE ===
Score every title on these 5 dimensions (0-10 each):
- Curiosity Strength: How much information gap / open loop does it create?
- Clarity: How immediately understandable is the value proposition?
- Emotional Pull: How strong is the emotional reaction it triggers?
- Competitive Advantage: How different/better is it vs existing titles in this niche?
- Intent Match: How well does it match what the searcher/browser actually wants?
Total = sum of all 5 scores (max 50).

=== TSE STEP 5: FINAL SELECTION ===
Pick the strongest title from the 10.
Improve it once more (the "optimized" version).
Explain WHY this one will likely outperform others.

=== ALSO GENERATE CATEGORIES & A/B TESTS ===

Generate titles in 5 PSYCHOLOGICAL CATEGORIES:

1. CURIOSITY-DRIVEN TITLES (3 titles) — open loops demanding closure
2. AUTHORITY TITLES (3 titles) — position creator as expert
3. EMOTIONAL TITLES (3 titles) — trigger specific emotions
4. SHORT-FORM OPTIMIZED (3 titles) — max 40 chars for mobile
5. A/B TEST CLUSTERS (2 clusters of 2 titles each)

FOR EVERY CATEGORY TITLE, PROVIDE:
- psychologyExplanation: Why this works psychologically
- algorithmExplanation: How YouTube's algorithm will favor this
- dnaAlignment: ${dnaPersonalization}
- powerWords: Array of power words used
- ctrPotential: "high", "medium", or "low"

Return a JSON object with this exact structure:
{
  "tse": {
    "landscape": {
      "topPatterns": ["Pattern 1", "Pattern 2", ...],
      "averageCharLength": 52,
      "powerWordFrequency": ["word1", "word2", ...],
      "overusedPatterns": ["Pattern to avoid 1", ...],
      "weakTriggers": ["Weak trigger 1", ...],
      "missingOpportunities": ["Untapped angle 1", ...],
      "competitiveSummary": "Brief summary of the competitive landscape"
    },
    "strategy": {
      "chosenFormat": "Curiosity",
      "reasoning": "Why this format was chosen...",
      "alternativeFormats": ["Benefit", "Contrarian"]
    },
    "scoredTitles": [
      {
        "title": "...",
        "scores": {
          "curiosityStrength": 9,
          "clarity": 8,
          "emotionalPull": 7,
          "competitiveAdvantage": 9,
          "intentMatch": 8,
          "total": 41
        },
        "powerWords": ["word1"],
        "emotionalDriver": "Fear of missing out",
        "characterCount": 48
      }
    ],
    "finalPick": {
      "originalTitle": "Best scoring title before optimization",
      "optimizedTitle": "The improved final version",
      "whyItWins": "Detailed explanation of why this outperforms...",
      "scores": { "curiosityStrength": 10, "clarity": 9, "emotionalPull": 9, "competitiveAdvantage": 10, "intentMatch": 9, "total": 47 }
    }
  },
  "categories": [
    {
      "category": "Curiosity-Driven",
      "categoryDescription": "Titles that create open loops and trigger viewer curiosity",
      "icon": "help-circle",
      "titles": [
        {
          "title": "...",
          "powerWords": ["word1", "word2"],
          "psychologyExplanation": "...",
          "algorithmExplanation": "...",
          "dnaAlignment": "...",
          "ctrPotential": "high"
        }
      ]
    }
  ],
  "abTestClusters": [
    {
      "clusterName": "Fear of Missing Out",
      "targetAudience": "Competitive creators worried about falling behind",
      "psychologicalTrigger": "Loss aversion and social proof",
      "titles": [...]
    }
  ],
  "topPick": {
    "title": "Same as tse.finalPick.optimizedTitle",
    "reason": "Why this is the strategically best title"
  },
  "prediction": {
    "ctr": {
      "predictedRange": { "min": 4.5, "max": 6.2, "baseline": 5.0 },
      "confidence": "high",
      "vsChannelAverage": "+15-22% above your typical performance",
      "factors": [
        { "factor": "Strong curiosity trigger", "impact": "positive", "weight": 0.9 }
      ]
    },
    "algorithm": {
      "promotionLikelihood": "high",
      "feedPredictions": { "suggested": "high", "browse": "medium", "trending": "low" },
      "optimalPostingWindow": "Weekday evenings 6-9 PM"
    },
    "competition": {
      "trendAlignment": "rising",
      "competitionSaturation": "medium",
      "shortTermOutlook": "Strong potential in next 2 weeks"
    },
    "simulations": [
      {
        "scenario": "Add specific number to title",
        "predictedOutcome": { "ctrChange": "+8-12%", "retentionChange": "neutral", "growthImpact": "moderate positive" },
        "recommendation": "recommended"
      }
    ],
    "overallConfidence": "high",
    "overallConfidenceScore": 85,
    "humanInsight": "Natural language summary of the prediction"
  }
}

Return ONLY valid JSON. No markdown, no explanation outside the JSON.`;

    const userPrompt = `Generate an Intent-Based Title Intelligence report with PERFORMANCE PREDICTIONS for:

VIDEO TOPIC: ${topic}
${keyword ? `TARGET KEYWORD: ${keyword}` : ""}
TONE: ${tone}
${includeEmoji ? "EMOJIS: Yes" : "EMOJIS: No"}

Remember: 
1. This creator needs titles that feel personally crafted for their channel
2. Every title must pass through the prediction engine before being included
3. The topPick must include a full predictive analysis`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
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
    let intelligence;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        intelligence = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse intelligence response:", parseError);
      throw new Error("Failed to parse AI response");
    }

    // Save prediction to database if available
    if (intelligence.prediction) {
      try {
        await serviceSupabase.from('performance_predictions').insert({
          user_id: userId,
          feature_type: 'title',
          content_reference: intelligence.topPick?.title || topic,
          predicted_ctr_range: intelligence.prediction.ctr?.predictedRange || {},
          ctr_confidence: intelligence.prediction.ctr?.confidence || 'medium',
          ctr_factors: intelligence.prediction.ctr?.factors || [],
          promotion_likelihood: intelligence.prediction.algorithm?.promotionLikelihood || 'medium',
          algorithm_factors: [],
          feed_predictions: intelligence.prediction.algorithm?.feedPredictions || {},
          trend_alignment: intelligence.prediction.competition?.trendAlignment || 'neutral',
          competition_saturation: intelligence.prediction.competition?.competitionSaturation || 'medium',
          simulations: intelligence.prediction.simulations || [],
          overall_confidence: intelligence.prediction.overallConfidence || 'medium',
          overall_confidence_score: intelligence.prediction.overallConfidenceScore || 70,
          recommendation_summary: intelligence.prediction.humanInsight || '',
        });
        console.log("[generate-titles] Saved prediction to database");
      } catch (e) {
        console.error("[generate-titles] Failed to save prediction:", e);
      }
    }

    return new Response(JSON.stringify({ 
      intelligence, 
      personalizedWithDNA: !!channelDNA,
      hasPrediction: !!intelligence.prediction,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-titles:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate titles";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
