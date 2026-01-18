import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VideoData {
  id: string;
  title: string;
  description: string | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  published_at: string | null;
  duration: string | null;
  tags: string[] | null;
}

interface ChannelData {
  channel_name: string;
  subscriber_count: number | null;
  video_count: number | null;
  total_view_count: number | null;
  description: string | null;
}

interface ChannelDNA {
  dna_summary: string | null;
  content_categories: string[];
  top_performing_topics: any[];
  title_patterns: any;
  tone_profile: any;
  power_words: string[];
  avg_views: number | null;
  avg_engagement_rate: number | null;
  videos_analyzed: number;
}

interface CoachRequest {
  question?: string;
  coachType: "diagnosis" | "weakPoints" | "nextContent" | "custom";
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth token
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client with user's auth
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Parse request
    const body: CoachRequest = await req.json();
    const { question, coachType } = body;

    console.log(`[youtube-coach] User ${user.id} requesting ${coachType} analysis`);

    // Fetch channel data
    const { data: channelData } = await supabase
      .from("channels")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Fetch Channel DNA
    const { data: dnaData } = await supabase
      .from("channel_dna")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    // Fetch recent videos
    const { data: videosData } = await supabase
      .from("youtube_videos")
      .select("*")
      .eq("user_id", user.id)
      .order("published_at", { ascending: false })
      .limit(30);

    if (!videosData || videosData.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No video data found. Please sync your YouTube channel first." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const videos: VideoData[] = videosData.map((v: any) => ({
      id: v.id,
      title: v.title,
      description: v.description,
      view_count: v.view_count,
      like_count: v.like_count,
      comment_count: v.comment_count,
      published_at: v.published_at,
      duration: v.duration,
      tags: Array.isArray(v.tags) ? v.tags : [],
    }));

    const channel: ChannelData | null = channelData ? {
      channel_name: channelData.channel_name,
      subscriber_count: channelData.subscriber_count,
      video_count: channelData.video_count,
      total_view_count: channelData.total_view_count,
      description: channelData.description,
    } : null;

    const dna: ChannelDNA | null = dnaData ? {
      dna_summary: dnaData.dna_summary,
      content_categories: dnaData.content_categories || [],
      top_performing_topics: dnaData.top_performing_topics || [],
      title_patterns: dnaData.title_patterns || {},
      tone_profile: dnaData.tone_profile || {},
      power_words: dnaData.power_words || [],
      avg_views: dnaData.avg_views,
      avg_engagement_rate: dnaData.avg_engagement_rate,
      videos_analyzed: dnaData.videos_analyzed,
    } : null;

    // Calculate performance metrics
    const totalViews = videos.reduce((sum, v) => sum + (v.view_count || 0), 0);
    const avgViews = videos.length > 0 ? totalViews / videos.length : 0;
    const totalLikes = videos.reduce((sum, v) => sum + (v.like_count || 0), 0);
    const avgLikes = videos.length > 0 ? totalLikes / videos.length : 0;
    const avgEngagement = avgViews > 0 ? (avgLikes / avgViews) * 100 : 0;

    // Sort by views to find top and bottom performers
    const sortedByViews = [...videos].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    const topPerformers = sortedByViews.slice(0, 5);
    const bottomPerformers = sortedByViews.slice(-5).reverse();

    // Calculate upload frequency
    const dates = videos
      .map(v => v.published_at ? new Date(v.published_at).getTime() : null)
      .filter((d): d is number => d !== null)
      .sort((a, b) => b - a);
    
    let avgDaysBetweenUploads = 0;
    if (dates.length > 1) {
      const gaps: number[] = [];
      for (let i = 0; i < dates.length - 1; i++) {
        gaps.push((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
      }
      avgDaysBetweenUploads = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    }

    // Build the system prompt based on coach type
    const getSystemPrompt = () => {
      const baseContext = `
You are a SENIOR YouTube Growth Strategist working 1-on-1 with a creator. You are NOT motivational - you are diagnostic, honest, and tactical.

COMMUNICATION STYLE:
- Clear and direct - no fluff
- Actionable - every insight must lead to a specific action
- Channel-specific - reference their actual content patterns, never generic advice
- Brutally honest - if something isn't working, say it clearly

CHANNEL CONTEXT:
${channel ? `
Channel: ${channel.channel_name}
Subscribers: ${channel.subscriber_count?.toLocaleString() || 'Unknown'}
Total Videos: ${channel.video_count || videos.length}
Total Views: ${channel.total_view_count?.toLocaleString() || 'Unknown'}
` : ''}

PERFORMANCE METRICS:
- Videos analyzed: ${videos.length}
- Average views per video: ${Math.round(avgViews).toLocaleString()}
- Average engagement rate: ${avgEngagement.toFixed(2)}%
- Upload frequency: Every ${avgDaysBetweenUploads.toFixed(1)} days

${dna ? `
CHANNEL DNA PROFILE:
${dna.dna_summary || 'No summary available'}
- Content categories: ${dna.content_categories.join(", ") || 'Not analyzed'}
- Tone: ${dna.tone_profile?.primary || 'Unknown'} ${dna.tone_profile?.secondary ? `with ${dna.tone_profile.secondary} elements` : ''}
- Power words that work: ${dna.power_words?.slice(0, 5).join(", ") || 'Not analyzed'}
` : ''}

TOP 5 PERFORMING VIDEOS:
${topPerformers.map((v, i) => `${i + 1}. "${v.title}" - ${(v.view_count || 0).toLocaleString()} views, ${((v.like_count || 0) / (v.view_count || 1) * 100).toFixed(2)}% engagement`).join("\n")}

BOTTOM 5 PERFORMING VIDEOS:
${bottomPerformers.map((v, i) => `${i + 1}. "${v.title}" - ${(v.view_count || 0).toLocaleString()} views, ${((v.like_count || 0) / (v.view_count || 1) * 100).toFixed(2)}% engagement`).join("\n")}

RECENT VIDEO TITLES (for pattern analysis):
${videos.slice(0, 15).map(v => `- "${v.title}"`).join("\n")}
`;

      switch (coachType) {
        case "diagnosis":
          return `${baseContext}

YOUR TASK: Provide a comprehensive channel diagnosis.

Analyze:
1. **Current Growth Status** - Is this channel growing, stagnating, or declining? Why?
2. **Audience Fit** - Is the content attracting the right viewers?
3. **Algorithm Signals** - What's the algorithm seeing from this channel?
4. **Critical Bottleneck** - What's the ONE thing holding this channel back most?

FORMAT YOUR RESPONSE AS:
## 🎯 Channel Status: [Growing/Stagnating/Declining]
[2-3 sentences explaining why]

## 📊 Key Finding
[The most important insight about this channel]

## 🔍 Root Cause Analysis
[What's actually causing performance issues, based on the data]

## 💡 Priority Action
[ONE specific, immediate action to take]

Be specific. Reference actual video titles. No generic YouTube advice.`;

        case "weakPoints":
          return `${baseContext}

YOUR TASK: Identify and rank the channel's weak points.

Analyze these areas and RANK them from most critical to least critical:
1. **Titles** - Are titles optimized for CTR? Common mistakes?
2. **Thumbnails** (based on title patterns, infer thumbnail strategy)
3. **Hooks** - Based on video descriptions and patterns
4. **Consistency** - Upload frequency and schedule
5. **Niche Clarity** - Is the channel focused or scattered?
6. **Audience Retention Signals** - Based on engagement patterns

FORMAT YOUR RESPONSE AS:
## 🚨 Critical Issues (Fix Immediately)
[List 1-2 issues with specific examples from their content]

## ⚠️ Important Issues (Fix This Month)
[List 2-3 issues with specific examples]

## 📝 Minor Issues (Optimize Later)
[List 1-2 lower priority items]

For EACH issue:
- Cite a specific example from their videos
- Explain the impact
- Give a concrete fix

No generic advice. Every point must reference their actual content.`;

        case "nextContent":
          return `${baseContext}

YOUR TASK: Create a strategic content plan for the next week.

Based on what's working (top performers) and what's not (bottom performers), recommend:
1. **2-3 specific video ideas** that align with proven success patterns
2. **Title options** for each idea (2 variations each)
3. **Why each video will perform** - connect to their audience psychology
4. **Optimal posting timing** based on their upload patterns

FORMAT YOUR RESPONSE AS:
## 📅 This Week's Content Strategy

### Video 1: [Topic]
**Why this will work:** [Based on their top performers]
**Title Options:**
1. "[Title A]"
2. "[Title B]"
**Key hook angle:** [What will make viewers click and stay]

### Video 2: [Topic]
[Same format]

### Video 3: [Topic]  
[Same format]

## 🎯 Strategic Reasoning
[Why these specific topics, in this order, for this channel]

Ideas must be based on patterns from their successful content. No generic topic suggestions.`;

        case "custom":
          return `${baseContext}

YOUR TASK: Answer the creator's specific question with strategic, actionable advice.

Remember:
- Be direct and specific
- Reference their actual content
- Give actionable steps, not vague suggestions
- Think like a $5,000/month YouTube consultant

CREATOR'S QUESTION: ${question || "How can I grow my channel?"}

Provide a thorough, strategic answer.`;

        default:
          return baseContext;
      }
    };

    // Call AI
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[youtube-coach] LOVABLE_API_KEY not configured");
      throw new Error("AI service not configured");
    }

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: getSystemPrompt() },
          { role: "user", content: coachType === "custom" && question 
            ? question 
            : `Provide your ${coachType} analysis for this channel.` 
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[youtube-coach] AI API error:", errorText);
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const coachResponse = aiData.choices?.[0]?.message?.content || "Unable to generate analysis.";

    console.log(`[youtube-coach] Successfully generated ${coachType} response`);

    return new Response(
      JSON.stringify({
        success: true,
        coachType,
        response: coachResponse,
        metrics: {
          videosAnalyzed: videos.length,
          avgViews: Math.round(avgViews),
          avgEngagement: avgEngagement.toFixed(2),
          uploadFrequency: avgDaysBetweenUploads.toFixed(1),
          hasDNA: !!dna,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("[youtube-coach] Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to get coaching advice" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
