import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Intelligence Pipeline Types
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

interface StrategyHistory {
  feature_type: string;
  strategy_applied: string;
  bottleneck_addressed: string | null;
  output_summary: string;
  created_at: string;
}

interface Bottleneck {
  bottleneck_type: string;
  severity: string;
  evidence: any;
  status: string;
}

interface CoachRequest {
  question?: string;
  coachType: "diagnosis" | "weakPoints" | "nextContent" | "custom";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const serviceSupabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: CoachRequest = await req.json();
    const { question, coachType } = body;

    console.log(`[youtube-coach] User ${user.id} requesting ${coachType} analysis with intelligence pipeline`);

    // Fetch all channel data in parallel
    const [channelResult, dnaResult, videosResult, historyResult, bottlenecksResult] = await Promise.all([
      supabase.from("channels").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("channel_dna").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("youtube_videos").select("*").eq("user_id", user.id).order("published_at", { ascending: false }).limit(30),
      supabase.from("strategy_history").select("*").eq("user_id", user.id).eq("feature_type", "coach").order("created_at", { ascending: false }).limit(5),
      supabase.from("channel_bottlenecks").select("*").eq("user_id", user.id).eq("status", "active").order("severity", { ascending: true }),
    ]);

    const channelData = channelResult.data;
    const dnaData = dnaResult.data;
    const videosData = videosResult.data;
    const historyData = historyResult.data || [];
    const bottlenecksData = bottlenecksResult.data || [];

    if (!videosData || videosData.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: "No video data found. Please sync your YouTube channel first." 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process video data
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

    // Calculate metrics
    const totalViews = videos.reduce((sum, v) => sum + (v.view_count || 0), 0);
    const avgViews = videos.length > 0 ? totalViews / videos.length : 0;
    const totalLikes = videos.reduce((sum, v) => sum + (v.like_count || 0), 0);
    const avgEngagement = avgViews > 0 ? (totalLikes / totalViews) * 100 : 0;

    const sortedByViews = [...videos].sort((a, b) => (b.view_count || 0) - (a.view_count || 0));
    const topPerformers = sortedByViews.slice(0, 5);
    const bottomPerformers = sortedByViews.slice(-5).reverse();

    // Calculate upload frequency
    const dates = videos
      .map(v => v.published_at ? new Date(v.published_at).getTime() : null)
      .filter((d): d is number => d !== null)
      .sort((a, b) => b - a);
    
    let avgDaysBetweenUploads = 7;
    if (dates.length > 1) {
      const gaps: number[] = [];
      for (let i = 0; i < dates.length - 1; i++) {
        gaps.push((dates[i] - dates[i + 1]) / (1000 * 60 * 60 * 24));
      }
      avgDaysBetweenUploads = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    }

    // Build the ELITE intelligence pipeline prompt
    const buildIntelligencePipelinePrompt = () => {
      const dnaSummary = dnaData ? `
CHANNEL DNA PROFILE:
- Summary: ${dnaData.dna_summary || 'Personality detected but not summarized'}
- Content Categories: ${dnaData.content_categories?.join(', ') || 'Not analyzed'}
- Tone: ${dnaData.tone_profile?.primary || 'Unknown'}${dnaData.tone_profile?.secondary ? ` with ${dnaData.tone_profile.secondary} elements` : ''}
- Power Words That Work: ${dnaData.power_words?.slice(0, 10).join(', ') || 'Not analyzed'}
- Average Views: ${dnaData.avg_views?.toLocaleString() || avgViews.toLocaleString()}
` : 'CHANNEL DNA: Not yet analyzed - recommendations will be less personalized.';

      const pastStrategies = historyData.length > 0 ? `
PREVIOUS COACHING SESSIONS (build upon these):
${historyData.map((s: StrategyHistory, i: number) => 
  `${i + 1}. Strategy: ${s.strategy_applied} | Bottleneck: ${s.bottleneck_addressed || 'None'} | Summary: ${s.output_summary.slice(0, 150)}...`
).join('\n')}
` : '';

      const activeBottlenecks = bottlenecksData.length > 0 ? `
IDENTIFIED GROWTH BOTTLENECKS (your output MUST address at least one):
${bottlenecksData.map((b: Bottleneck, i: number) => 
  `${i + 1}. [${b.severity.toUpperCase()}] ${b.bottleneck_type.replace(/_/g, ' ').toUpperCase()}`
).join('\n')}
` : '';

      return `
You are an ELITE YouTube Growth Intelligence System. You are NOT a motivational coach or content generator.
You are a STRATEGIC THINKING SYSTEM that provides diagnostic, honest, and tactical advice.

MANDATORY: Your response must pass through this 6-stage intelligence pipeline:

=== STAGE 1: CHANNEL DNA DEEP ANALYSIS ===
Analyze before generating anything:
- Creator's niche and sub-niche positioning
- Top-performing vs underperforming video patterns
- CTR patterns from title analysis
- Tone, language, and creator personality
- Audience maturity level and intent
- Content fatigue or saturation signals

CHANNEL CONTEXT:
- Channel: ${channelData?.channel_name || 'Unknown'}
- Subscribers: ${channelData?.subscriber_count?.toLocaleString() || 'Unknown'}
- Total Videos: ${channelData?.video_count || videos.length}
- Total Views: ${channelData?.total_view_count?.toLocaleString() || 'Unknown'}
- Average Views Per Video: ${Math.round(avgViews).toLocaleString()}
- Engagement Rate: ${avgEngagement.toFixed(2)}%
- Upload Frequency: Every ${avgDaysBetweenUploads.toFixed(1)} days

${dnaSummary}

TOP 5 PERFORMING VIDEOS (what works):
${topPerformers.map((v, i) => `${i + 1}. "${v.title}" - ${(v.view_count || 0).toLocaleString()} views, ${((v.like_count || 0) / (v.view_count || 1) * 100).toFixed(2)}% engagement`).join("\n")}

BOTTOM 5 PERFORMING VIDEOS (what fails):
${bottomPerformers.map((v, i) => `${i + 1}. "${v.title}" - ${(v.view_count || 0).toLocaleString()} views`).join("\n")}

RECENT TITLES (pattern analysis):
${videos.slice(0, 12).map(v => `- "${v.title}"`).join("\n")}

${pastStrategies}
${activeBottlenecks}

=== STAGE 2: GROWTH BOTTLENECK IDENTIFICATION ===
Before generating output, identify the PRIMARY bottleneck:
- WEAK_HOOKS: First 30 seconds aren't capturing attention
- POOR_CTR: Titles/thumbnails aren't getting clicks
- LOW_RETENTION: Viewers leave before video ends
- INCONSISTENT_POSITIONING: Channel lacks clear identity
- AUDIENCE_MISMATCH: Content doesn't match target viewers
- COMPETITIVE_PRESSURE: Too many similar creators
- CONTENT_FATIGUE: Repeating same formats/topics

Your output MUST address at least ONE real bottleneck based on the data.

=== STAGE 3: STRATEGY SELECTION ===
Choose your strategic approach:
1. DISCOVERY: Optimize for algorithm reach and new viewers
2. AUTHORITY: Build credibility and expertise perception
3. RETENTION: Maximize watch time and return viewers
4. CONVERSION: Drive specific actions (subscribe, engage)

Also decide:
- Risk Level: LOW (safe) vs AGGRESSIVE (breakthrough)
- Algorithm vs Psychology priority

=== STAGE 4: OUTPUT WITH INTENT ===
Every recommendation must feel:
- INTENTIONAL: Designed specifically for THIS channel
- CONFIDENT: Expert-level, not generic advice
- STRATEGIC: Part of a larger growth plan
- ACTIONABLE: Can be implemented today

=== STAGE 5: SELF-CRITIQUE ===
Before finalizing, evaluate internally:
- Where could this fail?
- What assumption might be wrong?
- How could CTR or retention drop?

Refine based on this analysis.

=== STAGE 6: FUTURE IMPACT SIMULATION ===
Consider:
- How this affects next 3-5 videos
- Whether it builds algorithm trust
- Whether it strengthens channel identity

=== RESPONSE FORMAT ===
You MUST include a JSON block with strategic assessment:

\`\`\`json
{
  "assessment": {
    "riskLevel": "low|medium|high|aggressive",
    "strategyType": "discovery|authority|retention|conversion",
    "confidenceScore": 0-100,
    "potentialUpside": "What could go right (specific)",
    "potentialDownside": "What could go wrong (specific)",
    "bottleneckAddressed": "The specific bottleneck this addresses",
    "futureImpact": {
      "algorithmTrust": "builds|neutral|risks",
      "channelIdentity": "strengthens|neutral|dilutes",
      "nextVideosGuidance": "How this affects next videos"
    },
    "selfCritique": {
      "assumptions": ["assumption1", "assumption2"],
      "potentialFailures": ["failure1", "failure2"],
      "refinements": ["what you improved based on critique"]
    }
  },
  "strategicRationale": "2-3 sentences explaining WHY this fits this channel specifically"
}
\`\`\`

LANGUAGE RULES:
- NO generic internet advice
- NO motivational fluff
- NO repeated phrases
- Tone: calm, confident, expert
- Reference actual video titles from their channel
- Every insight must feel: "This was designed specifically for MY channel"
`;
    };

    // Get task-specific instructions based on coach type
    const getTaskInstructions = () => {
      switch (coachType) {
        case "diagnosis":
          return `
YOUR TASK: Comprehensive Channel Diagnosis

Deliver:
1. **Growth Status**: Growing, Stagnating, or Declining? WHY based on the data?
2. **Critical Finding**: The ONE most important insight about this channel
3. **Root Cause**: What's actually causing performance issues
4. **Priority Action**: ONE specific, immediate action

Format your analysis with headers (##) and be brutally honest. Reference specific videos.`;

        case "weakPoints":
          return `
YOUR TASK: Identify and Rank Channel Weak Points

Analyze and RANK from most critical:
1. Titles - CTR optimization issues
2. Hooks - Based on retention signals in engagement
3. Consistency - Upload frequency patterns
4. Niche Clarity - Topic focus or scatter
5. Competitive Position - Market saturation

For EACH issue:
- Cite a specific example from THEIR videos
- Explain the measurable impact
- Give a concrete fix they can implement TODAY

Use severity levels: 🚨 CRITICAL | ⚠️ IMPORTANT | 📝 MINOR`;

        case "nextContent":
          return `
YOUR TASK: Strategic Content Plan for Next Week

Based on success patterns (top performers) and failure patterns (bottom performers), recommend:
1. **3 specific video ideas** aligned with proven success patterns
2. **Title options** for each (2 variations)
3. **Why each will perform** - connect to audience psychology
4. **Risk level** for each idea

Ideas must be based on THEIR successful content patterns. No generic topics.`;

        case "custom":
          return `
YOUR TASK: Answer the Creator's Question Strategically

Question: "${question || "How can I grow my channel?"}"

Provide consultant-level advice that:
- References their actual content
- Gives specific, actionable steps
- Considers their unique channel DNA
- Thinks 3-5 videos ahead`;

        default:
          return "Provide strategic growth advice based on the channel data.";
      }
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[youtube-coach] LOVABLE_API_KEY not configured");
      throw new Error("AI service not configured");
    }

    const systemPrompt = buildIntelligencePipelinePrompt();
    const taskPrompt = getTaskInstructions();

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: taskPrompt }
        ],
        temperature: 0.7,
        max_tokens: 3000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error("[youtube-coach] AI API error:", errorText);
      
      if (aiResponse.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiResponse.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI analysis failed");
    }

    const aiData = await aiResponse.json();
    const coachResponse = aiData.choices?.[0]?.message?.content || "Unable to generate analysis.";

    // Parse the strategic assessment from the response
    let assessment = null;
    let strategicRationale = "";
    try {
      const jsonMatch = coachResponse.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[1]);
        assessment = parsed.assessment || null;
        strategicRationale = parsed.strategicRationale || "";
      }
    } catch (e) {
      console.error("[youtube-coach] Failed to parse assessment:", e);
    }

    // Save to strategy history
    try {
      await serviceSupabase.from("strategy_history").insert({
        user_id: user.id,
        feature_type: "coach",
        request_context: { coachType, question },
        strategy_applied: assessment?.strategyType || "general",
        bottleneck_addressed: assessment?.bottleneckAddressed || null,
        output_summary: coachResponse.slice(0, 500),
        risk_level: assessment?.riskLevel || "medium",
        potential_upside: assessment?.potentialUpside || null,
        potential_downside: assessment?.potentialDownside || null,
        confidence_score: assessment?.confidenceScore || 70,
        self_critique: assessment?.selfCritique || null,
        future_impact: assessment?.futureImpact || null,
      });
    } catch (e) {
      console.error("[youtube-coach] Failed to save strategy history:", e);
    }

    console.log(`[youtube-coach] Successfully generated ${coachType} response with intelligence pipeline`);

    return new Response(
      JSON.stringify({
        success: true,
        coachType,
        response: coachResponse,
        assessment,
        strategicRationale,
        metrics: {
          videosAnalyzed: videos.length,
          avgViews: Math.round(avgViews),
          avgEngagement: avgEngagement.toFixed(2),
          uploadFrequency: avgDaysBetweenUploads.toFixed(1),
          hasDNA: !!dnaData,
          hasHistory: historyData.length > 0,
          activeBottlenecks: bottlenecksData.length,
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
