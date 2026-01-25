import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

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

    console.log("[generate-titles] Generating with prediction engine for:", user.id, "topic:", topic);

    // Fetch channel metrics for prediction engine
    const [channelResult, dnaResult, videosResult] = await Promise.all([
      supabase.from("channels").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("channel_dna").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("youtube_videos").select("*").eq("user_id", user.id).order("view_count", { ascending: false }).limit(20),
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

    const systemPrompt = `You are an elite YouTube growth strategist with deep expertise in:
- Click-Through Rate optimization psychology
- YouTube algorithm mechanics
- Viewer behavior patterns
- Emotional engagement triggers
- PREDICTIVE ANALYTICS AND SIMULATION

${dnaContext}
${predictionContext}

You are generating an INTENT-BASED TITLE INTELLIGENCE report with PREDICTIVE SIMULATION.

GENERATE TITLES IN 5 PSYCHOLOGICAL CATEGORIES:

1. CURIOSITY-DRIVEN TITLES (3 titles)
   - Create powerful open loops that demand closure
   - Trigger unanswered questions in the viewer's mind
   - Use curiosity tension without clickbait lies
   - Make viewers feel they're missing something important

2. AUTHORITY TITLES (3 titles)
   - Position the creator as the definitive expert
   - Signal insider knowledge and credibility
   - Use authority language: "The Truth About", "What [Experts] Won't Tell You", "After [X] Years"
   - Best for educational and niche channels

3. EMOTIONAL TITLES (3 titles)
   - Trigger specific emotions: fear, excitement, relief, urgency, or aspiration
   - Emotion must align with the topic and audience psychology
   - Use visceral language that creates immediate reaction
   - Connect to viewer's pain points or desires

4. SHORT-FORM OPTIMIZED TITLES (3 titles)
   - Maximum 40 characters for mobile discovery
   - High impact in minimal words
   - Optimized for Shorts, suggested feeds, and mobile browse
   - Front-load the hook

5. A/B TEST CLUSTERS (2 clusters of 2 titles each)
   - Each cluster targets a different psychological trigger
   - Provide variation sets for testing
   - Explain which audience segment each cluster targets

FOR EVERY TITLE, PROVIDE:
- psychologyExplanation: Why this works psychologically (what mental triggers it activates)
- algorithmExplanation: How YouTube's algorithm will favor this (CTR signals, watch time correlation, suggested video potential)
- dnaAlignment: ${dnaPersonalization}
- powerWords: Array of power words used
- ctrPotential: "high", "medium", or "low" based on expected CTR

TITLE RULES:
- ${includeEmoji ? "Include 1-2 strategic emojis that add meaning" : "Do NOT include any emojis"}
- ${keyword ? `Naturally incorporate "${keyword}" - preferably early in the title` : ""}
- Match the ${tone} tone
- Character limit: 60 for standard, 40 for short-form
- NO generic titles - every title must feel crafted for this specific creator

Return a JSON object with this exact structure:
{
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
    "title": "...",
    "reason": "Why this is the strategically best title for this specific video and channel"
  },
  "prediction": {
    "ctr": {
      "predictedRange": { "min": 4.5, "max": 6.2, "baseline": 5.0 },
      "confidence": "high",
      "vsChannelAverage": "+15-22% above your typical performance",
      "factors": [
        { "factor": "Strong curiosity trigger", "impact": "positive", "weight": 0.9 },
        { "factor": "Proven power word pattern", "impact": "positive", "weight": 0.7 }
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
    "humanInsight": "Based on your channel's DNA and historical performance, this title should outperform your typical videos. The combination of curiosity and authority triggers aligns perfectly with what's worked for you before."
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
          user_id: user.id,
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
