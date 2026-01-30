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
  tags: string[] | null;
  category_id: string | null;
}

interface ChannelData {
  id: string;
  channel_name: string;
  description: string | null;
  subscriber_count: number | null;
  video_count: number | null;
  total_view_count: number | null;
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Analyzing Channel DNA for user:", userId);

    // Fetch user's channel
    const { data: channel, error: channelError } = await supabase
      .from("channels")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (channelError || !channel) {
      return new Response(
        JSON.stringify({ error: "No channel found. Please sync your YouTube channel first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch user's videos (up to 50 for analysis)
    const { data: videos, error: videosError } = await supabase
      .from("youtube_videos")
      .select("*")
      .eq("user_id", userId)
      .order("view_count", { ascending: false })
      .limit(50);

    if (videosError || !videos || videos.length === 0) {
      return new Response(
        JSON.stringify({ error: "No videos found. Please sync your YouTube channel first." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Analyzing ${videos.length} videos for channel: ${channel.channel_name}`);

    // Calculate performance metrics
    const totalViews = videos.reduce((sum, v) => sum + (v.view_count || 0), 0);
    const totalLikes = videos.reduce((sum, v) => sum + (v.like_count || 0), 0);
    const totalComments = videos.reduce((sum, v) => sum + (v.comment_count || 0), 0);
    const avgViews = Math.round(totalViews / videos.length);
    const avgLikes = Math.round(totalLikes / videos.length);
    const avgComments = Math.round(totalComments / videos.length);
    const viewToLikeRatio = totalViews > 0 ? (totalLikes / totalViews * 100) : 0;

    // Identify top performing videos (top 20%)
    const topPerformingCount = Math.max(3, Math.ceil(videos.length * 0.2));
    const topVideos = videos.slice(0, topPerformingCount);

    // Prepare video data for AI analysis
    const videoSummaries = videos.slice(0, 20).map(v => ({
      title: v.title,
      views: v.view_count || 0,
      likes: v.like_count || 0,
      comments: v.comment_count || 0,
      engagementRate: v.view_count ? ((v.like_count || 0) + (v.comment_count || 0)) / v.view_count * 100 : 0,
      tags: v.tags || [],
      description: v.description?.substring(0, 200) || "",
    }));

    const topVideoTitles = topVideos.map(v => v.title);

    // AI Analysis prompt
    const analysisPrompt = `Analyze this YouTube channel's content patterns and create a "Channel DNA" profile.

CHANNEL: ${channel.channel_name}
CHANNEL DESCRIPTION: ${channel.description || "Not provided"}
SUBSCRIBER COUNT: ${channel.subscriber_count || 0}

TOP PERFORMING VIDEO TITLES (by views):
${topVideoTitles.map((t, i) => `${i + 1}. ${t}`).join("\n")}

VIDEO DATA (sample of ${videoSummaries.length} videos):
${JSON.stringify(videoSummaries, null, 2)}

PERFORMANCE METRICS:
- Average views: ${avgViews}
- Average likes: ${avgLikes}
- Average comments: ${avgComments}
- View-to-like ratio: ${viewToLikeRatio.toFixed(2)}%

Analyze and return a JSON object with this EXACT structure:
{
  "contentCategories": ["category1", "category2", "category3"],
  "topPerformingTopics": [
    {"topic": "topic name", "avgViews": 1000, "frequency": "high"}
  ],
  "titlePatterns": {
    "avgLength": 45,
    "commonStructures": ["How to...", "X Ways to...", "Why..."],
    "emotionalTriggers": ["curiosity", "urgency"],
    "numbersUsed": true
  },
  "titleFormulas": [
    {"formula": "[Number] + [Topic] + [Benefit]", "example": "5 Ways to Grow Your Channel Fast"}
  ],
  "powerWords": ["ultimate", "secret", "proven"],
  "toneProfile": {
    "primary": "educational",
    "secondary": "entertaining",
    "formality": "casual",
    "energy": "high"
  },
  "vocabularyStyle": "conversational and accessible",
  "emojiUsage": "moderate",
  "audienceDemographics": {
    "interests": ["topic1", "topic2"],
    "skillLevel": "beginner to intermediate",
    "contentPreferences": ["tutorials", "reviews"]
  },
  "peakEngagementPatterns": ["videos under 10 minutes perform best", "listicles get high engagement"],
  "dnaSummary": "A concise 2-3 sentence summary of this channel's unique DNA that can be used to personalize AI outputs. Include the channel's voice, content style, and what makes their content successful."
}

Return ONLY the JSON object, no explanation.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { 
            role: "system", 
            content: "You are a YouTube analytics expert. Analyze channel data and identify patterns that define the channel's unique content DNA. Be specific and actionable." 
          },
          { role: "user", content: analysisPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      throw new Error("AI service temporarily unavailable");
    }

    const aiData = await response.json();
    const content = aiData.choices?.[0]?.message?.content;

    let analysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI analysis:", parseError);
      throw new Error("Failed to parse channel analysis");
    }

    // Store the Channel DNA using service role client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const dnaRecord = {
      user_id: userId,
      channel_id: channel.id,
      analyzed_at: new Date().toISOString(),
      videos_analyzed: videos.length,
      content_categories: analysis.contentCategories || [],
      top_performing_topics: analysis.topPerformingTopics || [],
      title_patterns: analysis.titlePatterns || {},
      avg_title_length: analysis.titlePatterns?.avgLength || null,
      title_formulas: analysis.titleFormulas || [],
      power_words: analysis.powerWords || [],
      tone_profile: analysis.toneProfile || {},
      vocabulary_style: analysis.vocabularyStyle || null,
      emoji_usage: analysis.emojiUsage || "minimal",
      audience_demographics: analysis.audienceDemographics || {},
      peak_engagement_times: analysis.peakEngagementPatterns || [],
      avg_engagement_rate: viewToLikeRatio,
      avg_views: avgViews,
      avg_likes: avgLikes,
      avg_comments: avgComments,
      view_to_like_ratio: viewToLikeRatio,
      dna_summary: analysis.dnaSummary || null,
    };

    // Upsert the DNA record
    const { data: savedDna, error: saveError } = await supabaseAdmin
      .from("channel_dna")
      .upsert(dnaRecord, { 
        onConflict: "user_id,channel_id",
      })
      .select()
      .single();

    if (saveError) {
      console.error("Error saving Channel DNA:", saveError);
      throw new Error("Failed to save channel analysis");
    }

    console.log("Channel DNA analysis complete and saved");

    return new Response(JSON.stringify({
      success: true,
      dna: savedDna,
      analysis: {
        videosAnalyzed: videos.length,
        channelName: channel.channel_name,
        ...analysis,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-channel-dna:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze channel";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
