import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input = await req.json();

    if (!input.youtubeVideoId || !input.title) {
      return new Response(JSON.stringify({ error: 'Missing required fields: youtubeVideoId, title' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback: fetch from DB if critical fields missing
    const authHeader = req.headers.get('Authorization');
    if (!input.viewCount && authHeader) {
      try {
        const supabase = createClient(
          Deno.env.get('SUPABASE_URL')!,
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        );
        const token = authHeader.replace('Bearer ', '');
        const { data: { user } } = await supabase.auth.getUser(token);
        if (user) {
          const { data: vid } = await supabase
            .from('youtube_videos')
            .select('*')
            .eq('user_id', user.id)
            .eq('youtube_video_id', input.youtubeVideoId)
            .maybeSingle();
          if (vid) {
            input.viewCount = input.viewCount ?? vid.view_count;
            input.likeCount = input.likeCount ?? vid.like_count;
            input.commentCount = input.commentCount ?? vid.comment_count;
            input.description = input.description ?? vid.description;
            input.tags = input.tags ?? (Array.isArray(vid.tags) ? vid.tags : []);
          }
        }
      } catch (e) {
        console.warn('DB fallback failed:', e);
      }
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const views = input.viewCount ?? 0;
    const likes = input.likeCount ?? 0;
    const comments = input.commentCount ?? 0;
    const engagementRate = views > 0 ? ((likes + comments) / views * 100) : 0;
    const durationSec = input.durationSeconds ?? 0;
    const videoType = input.videoType || (durationSec <= 60 ? 'short' : 'long');

    const systemPrompt = `You are YRDE — the YouTube Revenue Domination Engine. You are a senior YouTube monetization strategist.

You understand ad auction mechanics, viewer buying psychology, RPM manipulation tactics, and Shorts vs Long revenue funnels.

You DO NOT care about views. You care about MONEY PER VIEW.

RULES:
- No motivational language
- Brutal truth only
- If a niche is trash for money, say it clearly
- Think like an advertiser, not a creator
- All recommendations must be specific and actionable
- Never invent revenue numbers — estimate ranges based on niche and signals`;

    const userPrompt = `ANALYZE THIS VIDEO FOR REVENUE OPTIMIZATION:

Title: "${input.title}"
Video Type: ${videoType}
Duration: ${durationSec}s
Views: ${views.toLocaleString()}
Likes: ${likes.toLocaleString()}
Comments: ${comments.toLocaleString()}
Engagement Rate: ${engagementRate.toFixed(2)}%
Niche: ${input.niche || 'Auto-detect from title/description'}
Description Preview: "${(input.description || '').slice(0, 300)}"
Tags: [${(input.tags || []).slice(0, 15).join(', ')}]
Channel Authority: ${input.channelAuthority || 'unknown'}

Run the full 5-phase YRDE analysis and return results using the suggest_yrde_analysis tool.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_yrde_analysis',
              description: 'Return the full YRDE revenue domination analysis.',
              parameters: {
                type: 'object',
                properties: {
                  monetization_health: {
                    type: 'number',
                    description: 'Overall monetization health score 0-100',
                  },
                  phase1_rpm_diagnosis: {
                    type: 'object',
                    properties: {
                      expected_rpm_range: { type: 'string', description: 'Expected RPM range for this niche e.g. "$4-8"' },
                      estimated_actual_rpm: { type: 'string', description: 'Estimated actual RPM based on signals e.g. "$2-4"' },
                      monetization_efficiency: { type: 'number', description: '0-100 efficiency score' },
                      low_paying_signals: { type: 'array', items: { type: 'string' }, description: 'Detected low-paying audience signals' },
                      low_intent_keywords: { type: 'array', items: { type: 'string' }, description: 'Low advertiser intent keywords found' },
                      entertainment_trap: { type: 'boolean', description: 'Is this content stuck in entertainment-only trap?' },
                      diagnosis: { type: 'string', description: 'Brutal RPM diagnosis (2-3 sentences)' },
                    },
                    required: ['expected_rpm_range', 'estimated_actual_rpm', 'monetization_efficiency', 'low_paying_signals', 'low_intent_keywords', 'entertainment_trap', 'diagnosis'],
                  },
                  phase2_ad_auction: {
                    type: 'object',
                    properties: {
                      viewer_intent_stage: { type: 'string', enum: ['passive', 'curious', 'buying'], description: 'Current viewer intent stage' },
                      high_bid_keywords: { type: 'array', items: { type: 'string' }, description: 'High-CPM keyword replacements to use' },
                      title_rpm_boost: { type: 'string', description: 'Exact title rewording to increase ad bids' },
                      description_rpm_boost: { type: 'string', description: 'Description changes to boost RPM' },
                      safe_high_value_phrases: { type: 'array', items: { type: 'string' }, description: 'Safe but high-value phrases to include' },
                      analysis: { type: 'string', description: 'Ad auction optimization analysis (2-3 sentences)' },
                    },
                    required: ['viewer_intent_stage', 'high_bid_keywords', 'title_rpm_boost', 'description_rpm_boost', 'safe_high_value_phrases', 'analysis'],
                  },
                  phase3_content_structure: {
                    type: 'object',
                    properties: {
                      optimal_ad_count: { type: 'number', description: 'Optimal number of ads' },
                      ad_placements: { type: 'array', items: { type: 'object', properties: { timestamp_seconds: { type: 'number' }, reason: { type: 'string' } }, required: ['timestamp_seconds', 'reason'] }, description: 'Exact ad placement suggestions' },
                      retention_vs_revenue: { type: 'string', description: 'Analysis of retention vs revenue tradeoff' },
                      mid_roll_eligible: { type: 'boolean', description: 'Is video eligible for mid-roll ads (8+ min)' },
                      emotional_spike_alignment: { type: 'string', description: 'How to align emotional spikes with ad breaks' },
                    },
                    required: ['optimal_ad_count', 'ad_placements', 'retention_vs_revenue', 'mid_roll_eligible', 'emotional_spike_alignment'],
                  },
                  phase4_shorts_long_funnel: {
                    type: 'object',
                    properties: {
                      monetization_ceiling: { type: 'string', description: 'Revenue ceiling for this content type' },
                      funnel_strategy: { type: 'string', enum: ['shorts_for_reach', 'long_for_money', 'hybrid', 'pivot_to_long'], description: 'Recommended funnel strategy' },
                      cta_wording: { type: 'string', description: 'Exact CTA wording to drive to monetizable content' },
                      pin_comment: { type: 'string', description: 'Pinned comment strategy text' },
                      bridge_video_ideas: { type: 'array', items: { type: 'string' }, description: 'Bridge video ideas to connect Shorts to Long' },
                    },
                    required: ['monetization_ceiling', 'funnel_strategy', 'cta_wording', 'pin_comment', 'bridge_video_ideas'],
                  },
                  phase5_alternative_monetization: {
                    type: 'object',
                    properties: {
                      affiliate_opportunities: { type: 'array', items: { type: 'string' }, description: 'Non-spam affiliate integration ideas' },
                      brand_deal_readiness: { type: 'number', description: '0-100 brand deal readiness score' },
                      product_opportunities: { type: 'array', items: { type: 'string' }, description: 'Productized content opportunities' },
                      revenue_per_1000: { type: 'string', description: 'Estimated total revenue per 1000 viewers (ads + alternatives)' },
                      scale_without_uploads: { type: 'string', description: 'How to scale revenue without more uploads' },
                    },
                    required: ['affiliate_opportunities', 'brand_deal_readiness', 'product_opportunities', 'revenue_per_1000', 'scale_without_uploads'],
                  },
                  why_underpaid: { type: 'string', description: 'Brutal explanation of why creator is underpaid (3-4 sentences)' },
                  next_30_day_plan: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        week: { type: 'string' },
                        action: { type: 'string' },
                        expected_impact: { type: 'string' },
                      },
                      required: ['week', 'action', 'expected_impact'],
                    },
                    description: '4-week revenue optimization plan',
                  },
                },
                required: ['monetization_health', 'phase1_rpm_diagnosis', 'phase2_ad_auction', 'phase3_content_structure', 'phase4_shorts_long_funnel', 'phase5_alternative_monetization', 'why_underpaid', 'next_30_day_plan'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_yrde_analysis' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      throw new Error('AI analysis failed');
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      throw new Error('AI did not return structured analysis');
    }

    let analysis;
    try {
      analysis = typeof toolCall.function.arguments === 'string'
        ? JSON.parse(toolCall.function.arguments)
        : toolCall.function.arguments;
    } catch {
      throw new Error('Failed to parse AI analysis');
    }

    // Attach input context
    analysis.input_context = {
      videoType,
      durationSeconds: durationSec,
      views,
      likes,
      comments,
      engagementRate: +engagementRate.toFixed(2),
    };

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('YRDE error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
