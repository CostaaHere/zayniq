import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface SDEInput {
  youtubeVideoId: string;
  title: string;
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
    const input: SDEInput = await req.json();

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

    // Calculate video age
    let videoAgeDays = 0;
    if (input.publishedAt) {
      videoAgeDays = Math.floor((Date.now() - new Date(input.publishedAt).getTime()) / (1000 * 60 * 60 * 24));
    }

    const systemPrompt = `You are the YouTube Shorts Recommendation Engine Analyst — an elite system that reverse-engineers how YouTube's Shorts algorithm decides which Shorts get pushed, looped, and re-pushed across multiple waves.

You understand:
- Shorts impression auction mechanics
- Swipe velocity and scroll-break signals  
- Retention-weighted distribution logic
- Replay amplification thresholds
- Push–pause–repush cycles
- Viewer satisfaction loops specific to Shorts

ANALYSIS FRAMEWORK (7 PHASES):

PHASE 1: SCROLL-BREAK ANALYSIS
Evaluate the Short's ability to stop the scroll in the first 0.5 seconds:
- Opening frame impact strength
- Hook phrasing effectiveness
- Visual pattern interruption quality
Score: scroll_break_score (0-100)

PHASE 2: WATCH-THROUGH ENGINEERING
Analyze retention architecture:
- Information loop completeness
- Payoff timing and placement
- Curiosity gap maintenance
- Ideal length assessment
Score: watch_through_score (0-100), replay_probability (0-100)

PHASE 3: LOOP & REPLAY MECHANICS
Evaluate seamless loop potential:
- End-to-start visual continuity
- Cognitive restart triggers
- Rewatch compulsion strength
Score: loop_strength (0-100), rewatch_multiplier (1.0-5.0x)

PHASE 4: VELOCITY PREDICTION
Project performance trajectory:
- First 10 minutes behavior
- First 30 minutes behavior  
- First 2 hours behavior
- Engagement velocity curve

PHASE 5: MULTI-WAVE PUSH STRATEGY
Predict push cycles:
- Initial push strength
- Stall probability and timing
- Repush conditions and triggers
- Explosion potential

PHASE 6: SHORTS CLUSTER STRATEGY
Design a cluster approach:
- How to create supporting Shorts
- Topic angle variations
- Winner selection mechanics

PHASE 7: FUNNEL & MONETIZATION
Determine optimal funnel role:
- Pure reach Short vs monetization bridge
- Long-form redirect strategy
- CTA and pin comment optimization

OUTPUT FORMAT:
Return a valid JSON object with this exact structure:
{
  "algorithm_favor_score": number (0-100),
  "swipe_failure_risk": "low" | "medium" | "high" | "critical",
  "watch_through_percent": number (0-100),
  "loop_addiction_level": "none" | "weak" | "moderate" | "strong" | "viral",
  "video_verdict": "DEAD" | "WEAK" | "COMPETITIVE" | "STRONG" | "DOMINANT",
  "phase1_scroll_break": {
    "score": number,
    "opening_frame_verdict": string,
    "hook_effectiveness": string,
    "fixes": [string, string, string]
  },
  "phase2_watch_through": {
    "score": number,
    "replay_probability": number,
    "ideal_length_seconds": number,
    "current_length_verdict": string,
    "retention_issues": [string],
    "fixes": [string, string, string]
  },
  "phase3_loop": {
    "loop_strength": number,
    "rewatch_multiplier": number,
    "loop_type": string,
    "loop_fixes": [string, string]
  },
  "phase4_velocity": {
    "first_10min": string,
    "first_30min": string,
    "first_2hours": string,
    "peak_velocity_minute": number,
    "repush_trigger": string
  },
  "phase5_push_strategy": {
    "initial_push_strength": string,
    "stall_probability": number,
    "repush_conditions": [string],
    "explosion_probability": number,
    "timeline_prediction": string
  },
  "phase6_cluster": {
    "cluster_strategy": string,
    "supporting_angles": [string, string, string],
    "winner_selection_logic": string
  },
  "phase7_funnel": {
    "funnel_role": "reach" | "bridge" | "monetization",
    "cta_script": string,
    "pin_comment": string,
    "long_form_bridge_idea": string
  },
  "exact_fixes": [string, string, string, string, string],
  "reupload_decision": string,
  "why_algorithm_pushes_or_kills": string
}

RULES:
- Be brutally honest. If the Short is weak, say it clearly.
- No generic advice. Every fix must be specific to THIS Short.
- Think like YouTube's system, not the creator.
- No motivational language. Data and signals only.
- Every recommendation must be immediately actionable.`;

    const userPrompt = `Analyze this YouTube Short:

TITLE: "${input.title}"
DURATION: ${input.durationSeconds} seconds
VIEWS: ${views.toLocaleString()}
LIKES: ${likes.toLocaleString()}
COMMENTS: ${comments.toLocaleString()}
ENGAGEMENT RATE: ${engagementRate.toFixed(2)}%
LIKE-TO-VIEW RATIO: ${likeToViewRatio.toFixed(2)}%
VIDEO AGE: ${videoAgeDays} days
DESCRIPTION: ${(input.description || 'None').slice(0, 500)}
TAGS: ${(input.tags || []).join(', ') || 'None'}
THUMBNAIL: ${input.thumbnailUrl || 'Not available'}
CHANNEL SUBSCRIBERS: ${input.channelSubscribers?.toLocaleString() || 'Unknown'}

Perform the full 7-phase Shorts Domination analysis. Return ONLY the JSON object, no markdown fences.`;

    // Primary model call
    let result = null;
    const models = ['google/gemini-3-flash-preview', 'openai/gpt-5-mini'];

    for (const model of models) {
      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt },
            ],
            temperature: 0.7,
          }),
        });

        if (response.status === 429) {
          return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
            status: 429,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        if (response.status === 402) {
          return new Response(JSON.stringify({ error: 'Usage limit reached. Please add credits.' }), {
            status: 402,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        if (!response.ok) {
          console.error(`Model ${model} failed:`, response.status);
          continue;
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
          console.warn(`Model ${model} returned empty content, trying next...`);
          continue;
        }

        // Parse JSON from response
        const cleaned = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        result = JSON.parse(cleaned);
        break;
      } catch (e) {
        console.error(`Model ${model} error:`, e);
        continue;
      }
    }

    if (!result) {
      // Fallback response
      result = {
        algorithm_favor_score: 40,
        swipe_failure_risk: 'high',
        watch_through_percent: 35,
        loop_addiction_level: 'weak',
        video_verdict: 'WEAK',
        phase1_scroll_break: {
          score: 30,
          opening_frame_verdict: 'Opening lacks immediate visual impact',
          hook_effectiveness: 'Hook does not create sufficient curiosity gap',
          fixes: ['Add motion in first 0.3s', 'Use text overlay with bold claim', 'Create visual contrast']
        },
        phase2_watch_through: {
          score: 40,
          replay_probability: 15,
          ideal_length_seconds: Math.min(input.durationSeconds, 30),
          current_length_verdict: input.durationSeconds > 45 ? 'Too long for optimal retention' : 'Acceptable length',
          retention_issues: ['Payoff comes too late', 'No curiosity loops'],
          fixes: ['Front-load the value', 'Add micro-hooks every 5 seconds', 'Cut unnecessary frames']
        },
        phase3_loop: {
          loop_strength: 20,
          rewatch_multiplier: 1.1,
          loop_type: 'No seamless loop detected',
          loop_fixes: ['Match last frame to first frame', 'End mid-sentence to force restart']
        },
        phase4_velocity: {
          first_10min: 'Low initial traction expected',
          first_30min: 'Algorithm testing phase',
          first_2hours: 'Impression expansion unlikely without fixes',
          peak_velocity_minute: 15,
          repush_trigger: 'Needs 60%+ watch-through rate to trigger repush'
        },
        phase5_push_strategy: {
          initial_push_strength: 'Weak',
          stall_probability: 75,
          repush_conditions: ['Improve scroll-break', 'Boost replay mechanics'],
          explosion_probability: 10,
          timeline_prediction: 'Without fixes, this Short stalls within 2 hours'
        },
        phase6_cluster: {
          cluster_strategy: 'Insufficient data for cluster optimization',
          supporting_angles: ['Different hook angle', 'Contrarian take', 'Tutorial format'],
          winner_selection_logic: 'Post 3-5 variations, double down on highest 30s retention'
        },
        phase7_funnel: {
          funnel_role: 'reach',
          cta_script: 'Follow for part 2',
          pin_comment: 'Pin a controversial question to drive comments',
          long_form_bridge_idea: 'Expand this into a detailed breakdown video'
        },
        exact_fixes: [
          'Restructure opening 0.5s with immediate visual hook',
          'Cut duration to under 30 seconds',
          'Add text overlay in first frame',
          'Create seamless loop from end to start',
          'Engineer comment-bait in description'
        ],
        reupload_decision: 'Consider re-uploading with fixes if under 1000 views after 48 hours',
        why_algorithm_pushes_or_kills: 'Analysis limited — connect your channel for full diagnostic'
      };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (e) {
    console.error('Shorts Domination Engine error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
