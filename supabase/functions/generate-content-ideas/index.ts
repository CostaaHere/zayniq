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

=== CONTENT IDEA INTELLIGENCE ===

You are a YouTube Content Strategist with predictive intelligence.

YOUR ROLE:
Generate content ideas that are SPECIFICALLY designed for THIS channel.
Every idea must align with their DNA, avoid their kill zones, and leverage their proven formats.
Don't suggest generic video ideas - suggest ideas this specific creator should make.

IDEA GENERATION FRAMEWORK:

1. DNA ALIGNMENT CHECK
   - Does this idea fit the channel's core archetype?
   - Does it match their tone and complexity level?
   - Is it in their format sweet spots?
   - Does it AVOID their kill zones?

2. PERFORMANCE SIMULATION
   - Based on their historical data, how would this perform?
   - Is this similar to their top performers or bottom performers?
   - What's the realistic viral potential for THIS channel?

3. AUDIENCE PSYCHOLOGY
   - What would make their specific audience click?
   - What emotional trigger works for this niche?
   - How does this serve their viewing intent?

FOR EACH IDEA, PROVIDE:
- Compelling title (optimized for CTR with their power words)
- Brief description (2-3 sentences)
- Viral potential score (0-100, REALISTIC for this channel)
- Difficulty level (Easy/Medium/Hard based on their typical production)
- Content type (aligned with their format sweet spots)
- Key points to cover (3-5 bullets)
- Thumbnail concept (brief visual description matching their style)
- Best posting time/day
- PREDICTION INSIGHT: Why this idea should work for THIS channel

${SELF_CRITIQUE_DIRECTIVE}

Return ONLY valid JSON:
{
  "ideas": [
    {
      "title": "Video Title Here",
      "description": "Brief description of the video concept",
      "viralScore": 75,
      "difficulty": "Medium",
      "contentType": "Tutorial",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "thumbnailConcept": "Description of thumbnail visual",
      "bestPostingTime": "Tuesday 2-4 PM",
      "predictionInsight": "This leverages your proven [format] while tapping into [trend]. Based on your DNA, this should outperform average by [X].",
      "dnaAlignment": "high/medium/low"
    }
  ],
  "topIdeasWithPredictions": [
    {
      "ideaIndex": 0,
      "prediction": {
        "ctrPrediction": "+18-25% above your channel average",
        "algorithmLikelihood": "high",
        "trendAlignment": "rising",
        "competitionLevel": "medium",
        "confidenceLevel": "high",
        "whatIfScenario": {
          "alternative": "Alternative angle description",
          "predictedImpact": "Impact description"
        },
        "humanSummary": "Natural language summary of why this should work"
      }
    }
  ],
  "trendingTopics": [
    {"topic": "Topic 1", "relevance": "High", "predictionNote": "Timing insight"}
  ],
  "strategyInsight": "Overall insight about the content strategy for this batch"
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
        model: 'google/gemini-2.5-flash',
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

    // Save predictions for top ideas
    if (result.topIdeasWithPredictions && result.topIdeasWithPredictions.length > 0) {
      try {
        for (const topIdea of result.topIdeasWithPredictions) {
          const idea = result.ideas[topIdea.ideaIndex];
          if (idea && topIdea.prediction) {
            await serviceSupabase.from('performance_predictions').insert({
              user_id: userId,
              feature_type: 'content_idea',
              content_reference: idea.title,
              ctr_confidence: topIdea.prediction.confidenceLevel || 'medium',
              promotion_likelihood: topIdea.prediction.algorithmLikelihood || 'medium',
              trend_alignment: topIdea.prediction.trendAlignment || 'neutral',
              competition_saturation: topIdea.prediction.competitionLevel || 'medium',
              simulations: topIdea.prediction.whatIfScenario ? [topIdea.prediction.whatIfScenario] : [],
              overall_confidence: topIdea.prediction.confidenceLevel || 'medium',
              recommendation_summary: topIdea.prediction.humanSummary || '',
            });
          }
        }
        console.log('[generate-content-ideas] Saved predictions for top ideas');
      } catch (e) {
        console.error('[generate-content-ideas] Failed to save predictions:', e);
      }
    }

    return new Response(JSON.stringify({
      ...result,
      personalizedWithDNA: !!dnaData,
      hasPredictions: !!(result.topIdeasWithPredictions && result.topIdeasWithPredictions.length > 0),
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
