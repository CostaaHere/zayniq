import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface YAREEInput {
  youtubeVideoId: string;
  title: string;
  videoType: 'short' | 'long';
  durationSeconds: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  publishedAt?: string;
  channelSubscribers?: number;
  description?: string;
  tags?: string[];
  thumbnailUrl?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const input: YAREEInput = await req.json();

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

    // Calculate derived metrics
    const views = input.viewCount ?? 0;
    const likes = input.likeCount ?? 0;
    const comments = input.commentCount ?? 0;
    const engagementRate = views > 0 ? ((likes + comments) / views * 100) : 0;
    const likeToViewRatio = views > 0 ? (likes / views * 100) : 0;
    const commentToViewRatio = views > 0 ? (comments / views * 100) : 0;

    // Calculate video age
    let videoAgeDays = 0;
    let videoAgeHours = 0;
    if (input.publishedAt) {
      const pubDate = new Date(input.publishedAt);
      const now = new Date();
      videoAgeHours = Math.floor((now.getTime() - pubDate.getTime()) / (1000 * 60 * 60));
      videoAgeDays = Math.floor(videoAgeHours / 24);
    }

    // Channel size category
    const subs = input.channelSubscribers ?? 0;
    const channelSize = subs >= 1000000 ? 'mega' : subs >= 100000 ? 'large' : subs >= 10000 ? 'medium' : subs >= 1000 ? 'small' : 'micro';

    // Views per day
    const viewsPerDay = videoAgeDays > 0 ? Math.round(views / videoAgeDays) : views;

    const systemPrompt = `You are YAREE — the YouTube Algorithm Reverse Engine. You understand YouTube's recommendation system at signal-level depth.

CORE PRINCIPLE: YouTube does NOT rank videos. It ranks viewer satisfaction loops.

You must analyze the provided video data and produce a BRUTALLY HONEST assessment of how YouTube's algorithm is treating this video and why.

IMPORTANT RULES:
- Be brutally honest. If a video is dead, say it clearly.
- No generic advice. Every recommendation must be specific to THIS video.
- Think like YouTube's algorithm, not like a creator.
- All scores must be justified with specific evidence from the data.
- Never invent metrics you don't have. State what data is missing.`;

    const userPrompt = `ANALYZE THIS VIDEO:

Title: "${input.title}"
Video Type: ${input.videoType}
Duration: ${input.durationSeconds}s
Views: ${views.toLocaleString()}
Likes: ${likes.toLocaleString()}
Comments: ${comments.toLocaleString()}
Engagement Rate: ${engagementRate.toFixed(2)}%
Like-to-View Ratio: ${likeToViewRatio.toFixed(3)}%
Comment-to-View Ratio: ${commentToViewRatio.toFixed(4)}%
Video Age: ${videoAgeDays} days (${videoAgeHours} hours)
Views Per Day: ${viewsPerDay}
Channel Size: ${channelSize} (${subs > 0 ? subs.toLocaleString() + ' subscribers' : 'unknown'})
Description Length: ${(input.description || '').length} chars
Tags: ${(input.tags || []).length} tags
${input.thumbnailUrl ? 'Thumbnail: Available' : 'Thumbnail: Not available'}

Run the full 5-phase YAREE analysis and return results using the suggest_yaree_analysis tool.`;

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
              name: 'suggest_yaree_analysis',
              description: 'Return the full YAREE algorithm reverse-engineering analysis.',
              parameters: {
                type: 'object',
                properties: {
                  video_status: {
                    type: 'string',
                    enum: ['DEAD', 'STALLED', 'WARM', 'HOT', 'EXPLODING'],
                    description: 'Current algorithm status of the video',
                  },
                  algorithm_confidence: {
                    type: 'number',
                    description: 'How confident YouTube is in pushing this video (0-100)',
                  },
                  phase1_discovery: {
                    type: 'object',
                    properties: {
                      ctr_score: { type: 'number', description: '0-100 estimated CTR performance' },
                      engagement_speed: { type: 'number', description: '0-100 early engagement velocity' },
                      initial_push_score: { type: 'number', description: '0-100 initial impression burst score' },
                      analysis: { type: 'string', description: 'Detailed discovery signal analysis (2-3 sentences)' },
                    },
                    required: ['ctr_score', 'engagement_speed', 'initial_push_score', 'analysis'],
                  },
                  phase2_satisfaction: {
                    type: 'object',
                    properties: {
                      retention_expectancy: { type: 'string', enum: ['very_low', 'low', 'medium', 'high', 'very_high'] },
                      emotional_intensity: { type: 'number', description: '0-100 emotional payoff strength' },
                      rewatch_trigger_score: { type: 'number', description: '0-100 rewatch potential' },
                      analysis: { type: 'string', description: 'Satisfaction loop analysis (2-3 sentences)' },
                    },
                    required: ['retention_expectancy', 'emotional_intensity', 'rewatch_trigger_score', 'analysis'],
                  },
                  phase3_trust: {
                    type: 'object',
                    properties: {
                      algo_trust_score: { type: 'number', description: '0-100 algorithm trust index' },
                      channel_reliability: { type: 'string', description: 'Assessment of channel consistency' },
                      content_consistency: { type: 'string', description: 'How well this fits channel pattern' },
                      analysis: { type: 'string', description: 'Trust index analysis (2-3 sentences)' },
                    },
                    required: ['algo_trust_score', 'channel_reliability', 'content_consistency', 'analysis'],
                  },
                  phase4_push_decision: {
                    type: 'object',
                    properties: {
                      will_expand: { type: 'boolean', description: 'Will YouTube expand impressions?' },
                      next_push_timing: { type: 'string', description: 'When next push might happen' },
                      unlock_condition: { type: 'string', description: 'What condition must be met to unlock next tier' },
                      why_pushing_or_not: { type: 'string', description: 'Detailed explanation of why YouTube is or isnt pushing (3-4 sentences)' },
                    },
                    required: ['will_expand', 'next_push_timing', 'unlock_condition', 'why_pushing_or_not'],
                  },
                  phase5_actions: {
                    type: 'object',
                    properties: {
                      title_tweak: { type: 'string', description: 'Exact title micro-adjustment (not full rewrite)' },
                      description_adjustment: { type: 'string', description: 'Specific description fix' },
                      engagement_bait_comment: { type: 'string', description: 'Suggested pinned comment to boost engagement' },
                      reupload_vs_wait: { type: 'string', enum: ['wait', 'reupload', 'boost_externally'] },
                      external_triggers: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Specific external actions to trigger algorithm attention',
                      },
                    },
                    required: ['title_tweak', 'description_adjustment', 'engagement_bait_comment', 'reupload_vs_wait', 'external_triggers'],
                  },
                  growth_prediction: {
                    type: 'object',
                    properties: {
                      next_72h: { type: 'string', description: 'Predicted performance next 72 hours' },
                      next_7d: { type: 'string', description: 'Predicted performance next 7 days' },
                      ceiling: { type: 'string', description: 'Maximum potential for this video' },
                    },
                    required: ['next_72h', 'next_7d', 'ceiling'],
                  },
                },
                required: ['video_status', 'algorithm_confidence', 'phase1_discovery', 'phase2_satisfaction', 'phase3_trust', 'phase4_push_decision', 'phase5_actions', 'growth_prediction'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_yaree_analysis' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add funds.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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

    // Attach input metrics for UI display
    analysis.input_metrics = {
      views,
      likes,
      comments,
      engagementRate: +engagementRate.toFixed(2),
      likeToViewRatio: +likeToViewRatio.toFixed(3),
      commentToViewRatio: +commentToViewRatio.toFixed(4),
      videoAgeDays,
      videoAgeHours,
      viewsPerDay,
      channelSize,
      videoType: input.videoType,
      durationSeconds: input.durationSeconds,
    };

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('YAREE error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
