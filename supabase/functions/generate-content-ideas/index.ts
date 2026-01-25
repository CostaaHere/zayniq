import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    const { topic, niche, targetAudience, contentStyles, includeTrending, numberOfIdeas } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use custom topic if provided, otherwise fallback to niche
    const mainTopic = topic?.trim() || niche || 'General';
    
    console.log('[generate-content-ideas] User:', user.id, 'topic:', mainTopic, 'count:', numberOfIdeas);

    // Fetch channel data for prediction engine
    const [channelResult, dnaResult, videosResult] = await Promise.all([
      supabase.from("channels").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("channel_dna").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("youtube_videos").select("*").eq("user_id", user.id).order("view_count", { ascending: false }).limit(20),
    ]);

    const channelData = channelResult.data;
    const dnaData = dnaResult.data;
    const videosData = videosResult.data || [];

    // Calculate metrics for prediction
    const avgViews = videosData.length > 0 
      ? videosData.reduce((sum: number, v: any) => sum + (v.view_count || 0), 0) / videosData.length 
      : 1000;
    const avgLikes = videosData.length > 0
      ? videosData.reduce((sum: number, v: any) => sum + (v.like_count || 0), 0) / videosData.length
      : 50;
    const avgEngagement = avgViews > 0 ? (avgLikes / avgViews) * 100 : 3;
    
    const topTitles = videosData.slice(0, 5).map((v: any) => v.title);
    const topCategories = dnaData?.content_categories || [];

    const stylesText = contentStyles?.length > 0 ? contentStyles.join(', ') : 'Any style';
    const trendingText = includeTrending ? 'Include current trending topics and viral formats relevant to this topic.' : '';

    // Prediction engine context
    const predictionContext = `
=== PERFORMANCE PREDICTION ENGINE ===

CHANNEL BASELINE:
- Average Views: ${avgViews.toLocaleString()}
- Subscribers: ${channelData?.subscriber_count?.toLocaleString() || 'Unknown'}
- Engagement Rate: ${avgEngagement.toFixed(2)}%
- Successful Categories: ${topCategories.join(', ') || 'Unknown'}
- Power Words: ${dnaData?.power_words?.slice(0, 8).join(', ') || 'Unknown'}

TOP PERFORMING CONTENT:
${topTitles.map((t: string, i: number) => `${i + 1}. "${t}"`).join('\n')}

FOR EACH IDEA, RUN PREDICTION SIMULATION:
1. CTR PREDICTION: Estimate click potential based on title, topic, and channel patterns
2. RETENTION PREDICTION: Predict watch time and session impact
3. ALGORITHM PREDICTION: Estimate promotion likelihood in feeds
4. COMPETITION ANALYSIS: Assess saturation and trend alignment
5. WHAT-IF SCENARIOS: Consider alternative angles

ONLY INCLUDE IDEAS THAT PASS PREDICTIVE THRESHOLD
Ideas with low predicted performance should be replaced with better alternatives.
`;

    const prompt = `You are a YouTube content strategist with PREDICTIVE INTELLIGENCE capabilities.

${predictionContext}

Generate ${numberOfIdeas || 10} unique viral video content ideas that have been SIMULATED and VALIDATED.

Topic/Niche: ${mainTopic}
Target Audience: ${targetAudience || 'General audience'}
Content Styles: ${stylesText}
${trendingText}

IMPORTANT: Focus specifically on "${mainTopic}" - create ideas that are highly relevant, catchy, and creator-ready for this exact topic. Ideas should be clickable and optimized for YouTube/Shorts.

FOR EACH IDEA, PROVIDE:
1. A compelling video title (optimized for CTR)
2. Brief description (2-3 sentences explaining the concept)
3. Viral potential score (0-100, be realistic based on niche, trend potential, AND prediction simulation)
4. Difficulty level (Easy, Medium, or Hard based on production requirements)
5. Content type (Tutorial, Review, Vlog, List, Challenge, Story, etc.)
6. Key points to cover (3-5 bullet points)
7. Thumbnail concept (brief visual description)
8. Best posting time/day
9. **PREDICTION INSIGHT**: A human-readable insight about why this idea should perform well (no raw numbers or metrics)

ALSO INCLUDE TOP 3 IDEAS WITH FULL PREDICTIONS:
For the top 3 highest potential ideas, include complete prediction data:
- ctrPrediction: Expected performance vs channel average
- algorithmLikelihood: Promotion potential (low/medium/high)
- trendAlignment: Topic momentum (declining/neutral/rising/viral_potential)
- competitionLevel: Market saturation (low/medium/high/saturated)
- confidenceLevel: Overall prediction confidence (low/medium/high/experimental)
- whatIfScenario: One alternative approach with predicted impact

Respond in this exact JSON format:
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
      "predictionInsight": "This idea leverages your channel's proven expertise in [topic] while tapping into a rising trend. The combination should outperform your typical content."
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
          "alternative": "Frame as a challenge instead of tutorial",
          "predictedImpact": "Could increase viral potential by 15-20% but harder to produce"
        },
        "humanSummary": "I'm confident this will perform well for your channel. It combines what's worked for you before with a trending angle that should boost discovery."
      }
    }
  ],
  "trendingTopics": [
    {"topic": "Trending Topic 1", "relevance": "High", "predictionNote": "Rising fast, act within 1-2 weeks"},
    {"topic": "Trending Topic 2", "relevance": "Medium", "predictionNote": "Stable trend with room for unique angles"}
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a YouTube content strategist with predictive intelligence. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
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
              user_id: user.id,
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
      hasPredictions: !!(result.topIdeasWithPredictions && result.topIdeasWithPredictions.length > 0),
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
