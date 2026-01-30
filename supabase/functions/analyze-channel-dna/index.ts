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

serve(async (req) => {
  if (req.method === "OPTIONS") {
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

    console.log("🧬 Extracting Channel DNA for user:", userId);

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

    // Fetch user's videos (up to 50 for deep analysis)
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

    console.log(`🔬 Deep analyzing ${videos.length} videos for channel: ${channel.channel_name}`);

    // Calculate performance metrics
    const totalViews = videos.reduce((sum, v) => sum + (v.view_count || 0), 0);
    const totalLikes = videos.reduce((sum, v) => sum + (v.like_count || 0), 0);
    const totalComments = videos.reduce((sum, v) => sum + (v.comment_count || 0), 0);
    const avgViews = Math.round(totalViews / videos.length);
    const avgLikes = Math.round(totalLikes / videos.length);
    const avgComments = Math.round(totalComments / videos.length);
    const viewToLikeRatio = totalViews > 0 ? (totalLikes / totalViews * 100) : 0;

    // Identify performance tiers
    const sortedByViews = [...videos].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    const topPerformers = sortedByViews.slice(0, Math.ceil(videos.length * 0.2));
    const bottomPerformers = sortedByViews.slice(-Math.ceil(videos.length * 0.2));

    // Prepare deep analysis data
    const videoAnalysis = videos.slice(0, 30).map(v => ({
      title: v.title,
      views: v.view_count || 0,
      likes: v.like_count || 0,
      comments: v.comment_count || 0,
      engagementRate: v.view_count ? ((v.like_count || 0) + (v.comment_count || 0)) / v.view_count * 100 : 0,
      tags: v.tags || [],
      descriptionSnippet: v.description?.substring(0, 150) || "",
      isTopPerformer: topPerformers.some(t => t.id === v.id),
      isBottomPerformer: bottomPerformers.some(b => b.id === v.id),
    }));

    // Deep psychological analysis prompt
    const dnaExtractionPrompt = `You are the Channel DNA Engine of ZainIQ — a deep-analysis intelligence system.

You do NOT summarize data. You UNDERSTAND the channel.
You think like the creator AND the audience at the same time.

CHANNEL: ${channel.channel_name}
DESCRIPTION: ${channel.description || "Not provided"}
SUBSCRIBERS: ${channel.subscriber_count || 0}

TOP PERFORMING VIDEOS (these clicked and retained):
${topPerformers.map((t, i) => `${i + 1}. "${t.title}" - ${t.view_count?.toLocaleString()} views, ${((t.like_count || 0) / (t.view_count || 1) * 100).toFixed(1)}% engagement`).join("\n")}

BOTTOM PERFORMING VIDEOS (these died):
${bottomPerformers.map((b, i) => `${i + 1}. "${b.title}" - ${b.view_count?.toLocaleString()} views`).join("\n")}

FULL VIDEO DATA SAMPLE:
${JSON.stringify(videoAnalysis, null, 2)}

PERFORMANCE METRICS:
- Average views: ${avgViews.toLocaleString()}
- Average likes: ${avgLikes.toLocaleString()}
- Engagement rate: ${viewToLikeRatio.toFixed(2)}%
- Videos analyzed: ${videos.length}

🧬 EXTRACT THE CHANNEL DNA:

Analyze deeply and return a JSON object with this EXACT structure:

{
  "coreArchetype": "1-2 word channel personality (e.g., 'Curious Educator', 'Bold Entertainer', 'Street Philosopher')",
  
  "emotionalGravityScore": 0-100 (how emotionally heavy/impactful is the content),
  
  "curiosityDependencyLevel": "low|medium|high" (how much channel relies on curiosity hooks),
  
  "riskToleranceLevel": "low|medium|high" (how experimental is the channel with content),
  
  "audienceIntelligenceLevel": "describe target audience sophistication (e.g., 'Tech-savvy beginners seeking simple explanations')",
  
  "contentPsychology": {
    "dominantEmotion": "main emotional trigger (fear, curiosity, authority, humor, etc.)",
    "emotionalPromiseGap": "describe gap between what titles promise vs what content delivers",
    "fearVsCuriosityRatio": "e.g., '70% curiosity, 30% fear-based'",
    "clickTriggers": ["specific patterns that trigger clicks"],
    "retentionKillers": ["patterns that cause drop-offs"]
  },
  
  "performanceSignature": {
    "whatSpikes": ["formats/topics that spike CTR"],
    "whatKills": ["formats/topics that kill retention"],
    "hiddenGems": ["underperforming quality content patterns"],
    "viewingIntent": "learn|escape|entertain|transform"
  },
  
  "creatorFingerprint": {
    "tone": "aggressive|calm|funny|serious|inspirational",
    "complexityLevel": "simple|moderate|complex",
    "authorityVsRelatability": "e.g., '60% authority, 40% relatable'",
    "uniqueVoiceMarkers": ["specific style traits that define this creator"]
  },
  
  "formatSweetSpots": [
    {"format": "format name", "whyItWorks": "psychological reason", "performanceLevel": "high|medium"}
  ],
  
  "killZones": [
    {"avoid": "content type to avoid", "reason": "why it fails for this channel"}
  ],
  
  "titlePatterns": {
    "avgLength": 45,
    "commonStructures": ["working title structures"],
    "emotionalTriggers": ["emotional words that work"],
    "numbersUsed": true/false
  },
  
  "titleFormulas": [
    {"formula": "pattern that works", "example": "actual title example from data"}
  ],
  
  "powerWords": ["words that drive clicks for THIS channel"],
  
  "toneProfile": {
    "primary": "main communication style",
    "secondary": "supporting style",
    "formality": "casual|semi-formal|formal",
    "energy": "low|medium|high"
  },
  
  "vocabularyStyle": "describe the language style",
  
  "emojiUsage": "none|minimal|moderate|heavy",
  
  "contentCategories": ["main content buckets"],
  
  "topPerformingTopics": [
    {"topic": "topic name", "avgViews": 1000, "frequency": "high|medium|low"}
  ],
  
  "audienceDemographics": {
    "interests": ["audience interests"],
    "skillLevel": "beginner|intermediate|advanced|mixed",
    "contentPreferences": ["what they want to see"]
  },
  
  "peakEngagementPatterns": ["patterns that drive high engagement"],
  
  "dnaSummary": "A 2-3 sentence summary that captures the channel's soul. This should feel like: 'I completely understand this creator.' Write it as if you ARE the creator explaining your channel to a friend. Make it human, not robotic."
}

CRITICAL RULES:
- Think PSYCHOLOGICALLY, not analytically
- Every insight must be ACTIONABLE
- The DNA must feel like you truly understood the channel
- Avoid generic advice - everything must be specific to THIS channel
- dnaSummary should feel like a friend describing the channel, not a report

Return ONLY the JSON object.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openai/gpt-5",
        messages: [
          { 
            role: "system", 
            content: "You are the Channel DNA Engine - a deep psychological analysis system that extracts the complete creative, emotional, and strategic identity of YouTube channels. You don't summarize data - you UNDERSTAND channels at their core." 
          },
          { role: "user", content: dnaExtractionPrompt },
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
      console.error("Failed to parse DNA extraction:", parseError);
      throw new Error("Failed to extract channel DNA");
    }

    console.log("🧬 DNA extraction complete, saving to database...");

    // Store the Channel DNA using service role client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    
    const dnaRecord = {
      user_id: userId,
      channel_id: channel.id,
      analyzed_at: new Date().toISOString(),
      videos_analyzed: videos.length,
      
      // New psychological DNA fields
      core_archetype: analysis.coreArchetype || null,
      emotional_gravity_score: analysis.emotionalGravityScore || null,
      curiosity_dependency_level: analysis.curiosityDependencyLevel || null,
      risk_tolerance_level: analysis.riskToleranceLevel || null,
      audience_intelligence_level: analysis.audienceIntelligenceLevel || null,
      format_sweet_spots: analysis.formatSweetSpots || [],
      kill_zones: analysis.killZones || [],
      content_psychology: analysis.contentPsychology || {},
      performance_signature: analysis.performanceSignature || {},
      creator_fingerprint: analysis.creatorFingerprint || {},
      
      // Existing fields
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
      throw new Error("Failed to save channel DNA");
    }

    console.log("✅ Channel DNA locked and saved");

    return new Response(JSON.stringify({
      success: true,
      dna: savedDna,
      analysis: {
        videosAnalyzed: videos.length,
        channelName: channel.channel_name,
        coreArchetype: analysis.coreArchetype,
        emotionalGravityScore: analysis.emotionalGravityScore,
      }
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in analyze-channel-dna:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to extract channel DNA";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
