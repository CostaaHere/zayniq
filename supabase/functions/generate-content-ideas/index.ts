import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });
    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    
    if (claimsError || !claimsData?.claims?.sub) {
      return new Response(
        JSON.stringify({ error: "Invalid or expired authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    const { topic, niche, targetAudience, contentStyles, includeTrending, numberOfIdeas } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const mainTopic = topic?.trim() || niche || 'General';
    console.log('[generate-content-ideas] User:', userId, 'topic:', mainTopic);

    // Fetch comprehensive channel data
    const [channelResult, dnaResult, videosResult] = await Promise.all([
      supabase.from("channels").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("channel_dna").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("youtube_videos").select("*").eq("user_id", userId).order("view_count", { ascending: false }).limit(20),
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
    const bottomTitles = [...videosData].sort((a: any, b: any) => (a.view_count || 0) - (b.view_count || 0)).slice(0, 5).map((v: any) => v.title);

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
    const performanceContext = buildPerformanceContext(insights);

    const stylesText = contentStyles?.length > 0 ? contentStyles.join(', ') : 'Any style';
    const trendingText = includeTrending ? 'Include current trending topics and viral formats relevant to this topic.' : '';

    const systemPrompt = `${CORE_INTELLIGENCE_DIRECTIVE}

${dnaContext}

${performanceContext}

${ANTI_ROBOT_DIRECTIVE}

=== IDEA INTELLIGENCE ENGINE ===

You are ZainIQ Idea Intelligence — a probability-based content strategist.

CORE PHILOSOPHY:
- Generate ideas based on PROBABILITY, not guesswork
- Every idea must be REALISTIC and EXECUTABLE for THIS creator
- Avoid generic content ideas that could apply to any channel
- Goal: Reduce wasted uploads, increase success probability

MANDATORY EVALUATION CRITERIA (For Each Idea):

1. TREND ALIGNMENT
   - Is this topic rising, peaking, declining, or evergreen?
   - What's the timing window for maximum impact?
   - Current search/social momentum

2. COMPETITION LEVEL
   - How saturated is this topic in their niche?
   - Can this channel realistically compete?
   - What's the differentiation angle?

3. CHANNEL DNA FIT
   - Does this match their core archetype?
   - Is it in their format sweet spots?
   - Does it AVOID their kill zones?
   - Will their existing audience want this?

4. AUDIENCE DEMAND
   - Is there proven search intent?
   - Are viewers actively seeking this content?
   - What's the comment/engagement signal?

FOR EACH IDEA, YOU MUST EXPLAIN:

WHY IT CAN WORK:
- Specific reasons this idea has success potential for THIS channel
- What patterns from their top performers does this leverage?

WHAT MAKES IT RISKY OR SAFE:
- Risk factors: Competition, timing, production difficulty, audience mismatch
- Safety factors: Proven format, DNA alignment, low competition

ESTIMATED PERFORMANCE DIRECTION:
- Compared to their average video, will this likely perform: Above Average, Average, or Below Average?
- Confidence level in this estimate

${SELF_CRITIQUE_DIRECTIVE}

Return ONLY valid JSON:
{
  "ideas": [
    {
      "title": "Video Title Here",
      "description": "Brief description (2-3 sentences)",
      "viralScore": 75,
      "difficulty": "Medium",
      "contentType": "Tutorial",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "thumbnailConcept": "Description of thumbnail visual",
      "bestPostingTime": "Tuesday 2-4 PM",
      "probabilityAnalysis": {
        "trendAlignment": "rising/peaking/declining/evergreen",
        "competitionLevel": "low/medium/high/saturated",
        "dnaFit": "strong/moderate/weak",
        "audienceDemand": "proven/emerging/speculative"
      },
      "whyItCanWork": "Specific reasons this should succeed for THIS channel",
      "riskFactors": ["Risk 1", "Risk 2"],
      "safetyFactors": ["Safety 1", "Safety 2"],
      "performanceEstimate": {
        "direction": "above_average/average/below_average",
        "confidence": "high/medium/low",
        "reasoning": "Brief explanation of the estimate"
      }
    }
  ],
  "topPicks": [
    {
      "ideaIndex": 0,
      "reason": "Why this is a top pick based on probability analysis",
      "prediction": {
        "expectedPerformance": "+15-25% above channel average",
        "algorithmLikelihood": "high",
        "bestCaseScenario": "What happens if this works",
        "worstCaseScenario": "What happens if this underperforms",
        "humanSummary": "Natural language summary of the opportunity"
      }
    }
  ],
  "trendingTopics": [
    {"topic": "Topic 1", "relevance": "High", "timing": "Act now/This week/This month"}
  ],
  "batchInsight": "Overall strategy insight: What makes this batch valuable and how to prioritize"
}`;

    const userPrompt = `Generate ${numberOfIdeas || 10} content ideas for:

TOPIC/NICHE: ${mainTopic}
TARGET AUDIENCE: ${targetAudience || 'General audience'}
CONTENT STYLES: ${stylesText}
${trendingText}

Create ideas specifically designed for THIS channel's DNA and audience.
Every idea must feel like something this creator would naturally make.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error:', response.status);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI service temporarily unavailable');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse ideas from response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    // Save predictions for top picks
    if (result.topPicks && result.topPicks.length > 0) {
      try {
        for (const topPick of result.topPicks) {
          const idea = result.ideas[topPick.ideaIndex];
          if (idea && topPick.prediction) {
            await serviceSupabase.from('performance_predictions').insert({
              user_id: userId,
              feature_type: 'content_idea',
              content_reference: idea.title,
              ctr_confidence: idea.performanceEstimate?.confidence || 'medium',
              promotion_likelihood: topPick.prediction.algorithmLikelihood || 'medium',
              trend_alignment: idea.probabilityAnalysis?.trendAlignment || 'neutral',
              competition_saturation: idea.probabilityAnalysis?.competitionLevel || 'medium',
              simulations: [{
                bestCase: topPick.prediction.bestCaseScenario,
                worstCase: topPick.prediction.worstCaseScenario
              }],
              overall_confidence: idea.performanceEstimate?.confidence || 'medium',
              recommendation_summary: topPick.prediction.humanSummary || topPick.reason || '',
            });
          }
        }
        console.log('[generate-content-ideas] Saved predictions for top picks');
      } catch (e) {
        console.error('[generate-content-ideas] Failed to save predictions:', e);
      }
    }

    return new Response(JSON.stringify({
      ...result,
      personalizedWithDNA: !!dnaData,
      hasPredictions: !!(result.topPicks && result.topPicks.length > 0),
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content-ideas function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
