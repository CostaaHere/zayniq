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
    // Verify authentication using getClaims() for efficient JWT validation
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
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

    const body: CoachRequest = await req.json();
    const { question, coachType } = body;

    console.log(`[youtube-coach] User ${userId} requesting ${coachType} analysis with intelligence pipeline`);

    // Fetch all channel data in parallel
    const [channelResult, dnaResult, videosResult, historyResult, bottlenecksResult] = await Promise.all([
      supabase.from("channels").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("channel_dna").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("youtube_videos").select("*").eq("user_id", userId).order("published_at", { ascending: false }).limit(30),
      supabase.from("strategy_history").select("*").eq("user_id", userId).eq("feature_type", "coach").order("created_at", { ascending: false }).limit(5),
      supabase.from("channel_bottlenecks").select("*").eq("user_id", userId).eq("status", "active").order("severity", { ascending: true }),
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

    // Build the ELITE intelligence pipeline prompt with HUMAN-FIRST communication
    const buildIntelligencePipelinePrompt = () => {
      const creatorName = channelData?.channel_name?.split(/[^a-zA-Z]/)[0] || "there";
      
      const dnaSummary = dnaData ? `
CHANNEL DNA PROFILE (use internally, don't expose):
- Summary: ${dnaData.dna_summary || 'Personality detected but not summarized'}
- Content Categories: ${dnaData.content_categories?.join(', ') || 'Not analyzed'}
- Tone: ${dnaData.tone_profile?.primary || 'Unknown'}${dnaData.tone_profile?.secondary ? ` with ${dnaData.tone_profile.secondary} elements` : ''}
- Power Words That Work: ${dnaData.power_words?.slice(0, 10).join(', ') || 'Not analyzed'}
- Average Views: ${dnaData.avg_views?.toLocaleString() || avgViews.toLocaleString()}
` : 'CHANNEL DNA: Not yet analyzed - recommendations will be less personalized.';

      const pastStrategies = historyData.length > 0 ? `
PREVIOUS COACHING SESSIONS (build upon these, don't repeat):
${historyData.map((s: StrategyHistory, i: number) => 
  `${i + 1}. Strategy: ${s.strategy_applied} | Bottleneck: ${s.bottleneck_addressed || 'None'} | Summary: ${s.output_summary.slice(0, 150)}...`
).join('\n')}
` : '';

      const activeBottlenecks = bottlenecksData.length > 0 ? `
IDENTIFIED GROWTH BOTTLENECKS (address these naturally, without naming them as "bottlenecks"):
${bottlenecksData.map((b: Bottleneck, i: number) => 
  `${i + 1}. [${b.severity.toUpperCase()}] ${b.bottleneck_type.replace(/_/g, ' ').toUpperCase()}`
).join('\n')}
` : '';

      return `
You are an ELITE YouTube Growth Strategist having a personal conversation with a creator.

=== CRITICAL PRESENTATION RULES (NON-NEGOTIABLE) ===

1. **HUMAN-FIRST COMMUNICATION**
   - Talk like a real human expert, not an AI system
   - Be calm, confident, clear, and friendly
   - No robotic transitions, no system-language
   - Feel professional, intelligent, and focused

2. **CHATGPT-STYLE CONVERSATION FLOW**
   - Address the creator as "${creatorName}" when natural
   - State the main finding in simple, clear language
   - Explain WHY it matters without jargon
   - Provide clear, step-by-step guidance
   - End with actionable next steps, not data dumps

3. **ABSOLUTELY FORBIDDEN IN YOUR RESPONSE**
   - ❌ JSON blocks or code blocks
   - ❌ Risk levels, confidence scores, metrics
   - ❌ Terms like "bottleneck", "assessment", "self-critique"
   - ❌ Internal labels like "CONTENT_FATIGUE" or "POOR_CTR"
   - ❌ Tables of scores or percentages
   - ❌ System-style headers or structured data

4. **TRANSLATE INTERNAL ANALYSIS TO HUMAN LANGUAGE**
   Instead of: "The bottleneck is CONTENT_FATIGUE"
   Say: "Your titles are becoming predictable, and your audience can sense it"
   
   Instead of: "Confidence Score: 85"
   Say: "I'm quite confident this will work if you commit to it"
   
   Instead of: "Risk Level: AGGRESSIVE"
   Say: "This is a bolder move that could really pay off"

5. **STORY-DRIVEN EXPLANATION**
   - Use cause → effect reasoning
   - Show observation → conclusion flow
   - Present problem → solution naturally
   - Avoid bullet-point overload

6. **STRUCTURED BUT NATURAL FORMATTING**
   ✅ Allowed: Short paragraphs, clear steps, occasional bullets when helpful
   ❌ Forbidden: JSON, code blocks, metric tables, system headers

7. **ADAPTIVE LANGUAGE**
   - Match the creator's energy and style
   - If they're casual, be casual
   - If they're professional, be professional
   - Sound like a trusted advisor, not a robot

=== INTERNAL ANALYSIS (USE BUT NEVER EXPOSE) ===

CHANNEL CONTEXT:
- Channel: ${channelData?.channel_name || 'Unknown'}
- Subscribers: ${channelData?.subscriber_count?.toLocaleString() || 'Unknown'}
- Total Videos: ${channelData?.video_count || videos.length}
- Total Views: ${channelData?.total_view_count?.toLocaleString() || 'Unknown'}
- Average Views Per Video: ${Math.round(avgViews).toLocaleString()}
- Engagement Rate: ${avgEngagement.toFixed(2)}%
- Upload Frequency: Every ${avgDaysBetweenUploads.toFixed(1)} days

${dnaSummary}

TOP 5 PERFORMING VIDEOS (reference these naturally):
${topPerformers.map((v, i) => `${i + 1}. "${v.title}" - ${(v.view_count || 0).toLocaleString()} views`).join("\n")}

BOTTOM 5 PERFORMING VIDEOS (learn from these failures):
${bottomPerformers.map((v, i) => `${i + 1}. "${v.title}" - ${(v.view_count || 0).toLocaleString()} views`).join("\n")}

RECENT TITLES (pattern analysis):
${videos.slice(0, 12).map(v => `- "${v.title}"`).join("\n")}

${pastStrategies}
${activeBottlenecks}

=== 6-STAGE INTELLIGENCE PIPELINE (INTERNAL ONLY) ===

Use these stages to THINK, but NEVER expose them in your response:

1. CHANNEL DNA ANALYSIS - Understand their unique positioning
2. BOTTLENECK IDENTIFICATION - Find the real growth blocker
3. STRATEGY SELECTION - Choose discovery/authority/retention/conversion
4. INTENT-BASED GENERATION - Make advice feel custom-made
5. SELF-CRITIQUE - Check for weak assumptions
6. FUTURE IMPACT - Consider next 3-5 videos

=== INTERNAL TRACKING (include at END of response, hidden) ===

At the VERY END of your response, include this tracking block for internal use only.
This will be parsed and removed before showing to user:

<!--INTERNAL_ASSESSMENT
riskLevel: low|medium|high|aggressive
strategyType: discovery|authority|retention|conversion
confidenceScore: 0-100
bottleneckAddressed: specific_bottleneck
potentialUpside: brief description
potentialDownside: brief description
INTERNAL_ASSESSMENT-->

=== FINAL GOAL ===

The creator should feel:
"This coach really understands MY channel and talks to me like a real expert, not an AI."

Your response should feel written, not generated.
It should feel like advice from a trusted mentor who knows their content.
`;
    };

    // Get task-specific instructions based on coach type
    const getTaskInstructions = () => {
      switch (coachType) {
        case "diagnosis":
          return `
YOUR TASK: Have a conversation about their channel's current state.

Write like you're a trusted advisor catching up with a creator you know well.

Cover naturally in your conversation:
- How is the channel really doing? Be honest but encouraging.
- What's the ONE thing that's holding them back most right now?
- What's actually working that they should do more of?
- What specific action should they take THIS WEEK?

Reference their actual video titles. Make it feel personal.
End with clear, actionable guidance they can start today.`;

        case "weakPoints":
          return `
YOUR TASK: Gently but honestly discuss where the channel is struggling.

Write like a trusted mentor giving tough-love feedback.

Walk through the main areas that need work:
- Which videos underperformed and WHY (be specific)
- What patterns are hurting their growth
- What their competitors might be doing better

For each issue, naturally suggest a specific fix.
Prioritize the most impactful problems first.
Be honest but constructive - they want real feedback, not fluff.`;

        case "nextContent":
          return `
YOUR TASK: Recommend their next few video ideas.

Write like a creative partner brainstorming with them.

Based on what's worked for their channel, suggest:
- 3 specific video ideas that fit their style
- Title options for each one
- Why each idea should perform well for THEIR audience

Make the ideas feel custom-made for this channel.
Connect each suggestion to their past successes.
End with which video they should make first and why.`;

        case "custom":
          return `
YOUR TASK: Answer their question thoughtfully.

Question: "${question || "How can I grow my channel?"}"

Write like you're having a real conversation about their question.
Reference their actual channel data and video titles.
Give specific, actionable advice tailored to their situation.
Think about how this affects their next 3-5 videos.`;

        default:
          return "Have a helpful conversation about their channel growth.";
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
    let rawResponse = aiData.choices?.[0]?.message?.content || "Unable to generate analysis.";

    // Parse and remove the internal assessment from the response (keep it hidden from user)
    let assessment = null;
    try {
      const internalMatch = rawResponse.match(/<!--INTERNAL_ASSESSMENT\s*([\s\S]*?)\s*INTERNAL_ASSESSMENT-->/);
      if (internalMatch) {
        // Parse the key-value pairs from internal assessment
        const internalData = internalMatch[1];
        const riskLevel = internalData.match(/riskLevel:\s*(\w+)/)?.[1] || "medium";
        const strategyType = internalData.match(/strategyType:\s*(\w+)/)?.[1] || "general";
        const confidenceScore = parseInt(internalData.match(/confidenceScore:\s*(\d+)/)?.[1] || "70");
        const bottleneckAddressed = internalData.match(/bottleneckAddressed:\s*(.+)/)?.[1]?.trim() || null;
        const potentialUpside = internalData.match(/potentialUpside:\s*(.+)/)?.[1]?.trim() || null;
        const potentialDownside = internalData.match(/potentialDownside:\s*(.+)/)?.[1]?.trim() || null;
        
        assessment = {
          riskLevel,
          strategyType,
          confidenceScore,
          bottleneckAddressed,
          potentialUpside,
          potentialDownside,
        };
        
        // Remove the internal block from the response shown to user
        rawResponse = rawResponse.replace(/<!--INTERNAL_ASSESSMENT[\s\S]*?INTERNAL_ASSESSMENT-->/g, '').trim();
      }
    } catch (e) {
      console.error("[youtube-coach] Failed to parse internal assessment:", e);
    }

    // Also remove any JSON blocks that might have slipped through
    const cleanResponse = rawResponse
      .replace(/```json[\s\S]*?```/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .trim();

    // Save to strategy history (internal tracking, never shown to user)
    try {
      await serviceSupabase.from("strategy_history").insert({
        user_id: userId,
        feature_type: "coach",
        request_context: { coachType, question },
        strategy_applied: assessment?.strategyType || "general",
        bottleneck_addressed: assessment?.bottleneckAddressed || null,
        output_summary: cleanResponse.slice(0, 500),
        risk_level: assessment?.riskLevel || "medium",
        potential_upside: assessment?.potentialUpside || null,
        potential_downside: assessment?.potentialDownside || null,
        confidence_score: assessment?.confidenceScore || 70,
        self_critique: null,
        future_impact: null,
      });
    } catch (e) {
      console.error("[youtube-coach] Failed to save strategy history:", e);
    }

    console.log(`[youtube-coach] Successfully generated ${coachType} human-friendly response`);

    // Return ONLY clean, human-friendly response - no assessment data exposed
    return new Response(
      JSON.stringify({
        success: true,
        coachType,
        response: cleanResponse,
        metrics: {
          videosAnalyzed: videos.length,
          avgViews: Math.round(avgViews),
          avgEngagement: avgEngagement.toFixed(2),
          uploadFrequency: avgDaysBetweenUploads.toFixed(1),
          hasDNA: !!dnaData,
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
