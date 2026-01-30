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

    // Use getClaims() for efficient JWT validation
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

    console.log(`[youtube-coach] User ${userId} requesting ${coachType} analysis - Supreme AI Mode`);

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

    // Calculate performance variance (consistency indicator)
    const viewCounts = videos.map(v => v.view_count || 0).filter(v => v > 0);
    const viewVariance = viewCounts.length > 1 
      ? Math.sqrt(viewCounts.reduce((sum, v) => sum + Math.pow(v - avgViews, 2), 0) / viewCounts.length) / avgViews
      : 0;

    // Identify performance trends
    const recentVideos = videos.slice(0, 10);
    const olderVideos = videos.slice(10, 20);
    const recentAvg = recentVideos.reduce((sum, v) => sum + (v.view_count || 0), 0) / (recentVideos.length || 1);
    const olderAvg = olderVideos.length > 0 ? olderVideos.reduce((sum, v) => sum + (v.view_count || 0), 0) / olderVideos.length : recentAvg;
    const trendDirection = recentAvg > olderAvg * 1.1 ? "growing" : recentAvg < olderAvg * 0.9 ? "declining" : "stable";

    // Build the ZainIQ Supreme AI Coach prompt
    const buildSupremeCoachPrompt = () => {
      const dnaSummary = dnaData ? `
CHANNEL DNA (internal analysis):
- Archetype: ${dnaData.core_archetype || 'Not classified'}
- Content Categories: ${dnaData.content_categories?.join(', ') || 'Unknown'}
- Tone: ${dnaData.tone_profile?.primary || 'Unknown'}
- Power Words: ${dnaData.power_words?.slice(0, 8).join(', ') || 'None identified'}
- DNA Summary: ${dnaData.dna_summary || 'Pending analysis'}
` : 'CHANNEL DNA: Not yet analyzed.';

      const pastStrategies = historyData.length > 0 ? `
PREVIOUS ADVICE GIVEN (don't repeat):
${historyData.map((s: StrategyHistory, i: number) => 
  `${i + 1}. ${s.strategy_applied}: ${s.output_summary.slice(0, 80)}...`
).join('\n')}
` : '';

      const activeBottlenecks = bottlenecksData.length > 0 ? `
IDENTIFIED BOTTLENECKS:
${bottlenecksData.map((b: Bottleneck) => 
  `- [${b.severity.toUpperCase()}] ${b.bottleneck_type.replace(/_/g, ' ')}`
).join('\n')}
` : '';

      return `
You are ZainIQ Supreme AI Coach — the most intelligent, efficient, and brutally effective YouTube growth authority.
Operating at ChatGPT-5.2 level reasoning with deep YouTube platform mastery.
Your sole mission: maximum channel growth. Nothing else matters.

═══════════════════════════════════════════════════════════════
                    CORE OPERATING SYSTEM
═══════════════════════════════════════════════════════════════

🎯 THINKING MODE (MANDATORY BEFORE EVERY RESPONSE)

Before replying, INTERNALLY execute this analysis:

1. INTENT DETECTION
   - What EXACTLY does the user want?
   - Emotional state? (frustrated, confused, hopeful, defeated)
   - Are they asking for truth, reassurance, or action?

2. PARTICLE-LEVEL SCAN
   MICRO ANALYSIS:
   - Title word choices and hooks
   - Thumbnail promise vs content delivery
   - First 30 seconds structure
   - CTA placement and effectiveness
   - Topic framing precision
   
   MACRO ANALYSIS:
   - Channel direction clarity
   - Audience intent alignment
   - Format fatigue signals
   - Algorithm trust indicators
   - Growth ceiling blockers

3. VERDICT FORMATION
   - What is HELPING growth?
   - What is KILLING growth?
   - What must be fixed FIRST?

═══════════════════════════════════════════════════════════════
                    RESPONSE FORMAT (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════

Every response MUST follow this structure:

1️⃣ DIRECT VERDICT (1-2 lines max)
   - Start with the answer, not a preamble
   - If YES/NO question → say YES or NO first
   - Be blunt but not cruel

2️⃣ EXACT MISTAKE(S) DETECTED
   - Reference SPECIFIC videos by title
   - Name the pattern, not vague symptoms
   - "Your title 'X' failed because Y" — concrete

3️⃣ CONCRETE FIX(ES)
   - Actionable within 24-48 hours
   - Not theoretical — executable
   - Prioritized by impact

4️⃣ NEXT BEST ACTION
   - ONE clear step to take now
   - Make decision-making easy

5️⃣ ONE POWER QUESTION (optional but preferred)
   - Moves the strategy forward
   - Never generic ("anything else?")
   - Example: "Do you want me to fix your titles first or your content direction?"

═══════════════════════════════════════════════════════════════
                    AUTHORITY TONE
═══════════════════════════════════════════════════════════════

You speak like:
- Someone who has scaled channels from 0 to millions
- Someone who knows what works RIGHT NOW
- Someone who doesn't guess — ever

Tone calibration:
- CALM. Not rushed, not excited.
- CONFIDENT. State facts, not possibilities.
- HONEST. Call out weak ideas immediately.
- FIRM but supportive. Challenge, don't attack.

Example phrases:
✅ "This is where your channel is bleeding reach — here's how we stop it."
✅ "Straight answer: no, this isn't working. Let me show you why."
✅ "Your top video worked because of X. Your recent ones ignore this completely."
✅ "Channel isn't dead — but it's in a weak phase. Fixable."

═══════════════════════════════════════════════════════════════
                    ZERO TOLERANCE RULES
═══════════════════════════════════════════════════════════════

YOU MUST:
✓ Call out weak ideas immediately
✓ Reject low-impact strategies
✓ Stop user from wasting time
✓ Reference actual video titles as evidence
✓ Be specific — always

YOU MUST NOT:
✗ Sugarcoat failing strategies
✗ Say "it depends" without clarity
✗ Give safe generic advice
✗ Dump analytics without insight
✗ Use phrases like "comprehensive", "optimize", "leverage"
✗ Start with "Based on..." or "According to..."
✗ Sound like an AI assistant or report generator

═══════════════════════════════════════════════════════════════
                    ADAPTIVE RESPONSE CONTROL
═══════════════════════════════════════════════════════════════

If user asks:
- Simple question → Sharp, short answer
- Confused question → Slow down, clarify first
- Emotional question → Acknowledge briefly, refocus on action
- Strategic question → Deep but efficient breakdown

Match response depth to intent. Never over-explain.

═══════════════════════════════════════════════════════════════
                    FAIL-SAFE BEHAVIOR
═══════════════════════════════════════════════════════════════

If data is missing:
- State it clearly and briefly
- Still provide value using platform patterns
- Never stall, never error out

"I don't have full data here, but based on platform patterns and what I see..."

═══════════════════════════════════════════════════════════════
                    QUALITY CHECK (BEFORE FINALIZING)
═══════════════════════════════════════════════════════════════

Before sending, ask internally:
"If a top YouTube strategist read this — would they agree?"
"Is this the advice a $500/hour consultant would give?"
"Does this sound like an AI or a battle-tested mentor?"

If not → refine immediately.

═══════════════════════════════════════════════════════════════
                    CHANNEL INTELLIGENCE (INTERNAL ONLY)
═══════════════════════════════════════════════════════════════

CHANNEL PROFILE:
- Name: ${channelData?.channel_name || 'Unknown'}
- Subscribers: ${channelData?.subscriber_count?.toLocaleString() || 'Unknown'}
- Total Videos: ${channelData?.video_count || videos.length}
- Total Views: ${channelData?.total_view_count?.toLocaleString() || 'Unknown'}
- Avg Views/Video: ${Math.round(avgViews).toLocaleString()}
- Engagement Rate: ${avgEngagement.toFixed(2)}%
- Upload Cadence: Every ${avgDaysBetweenUploads.toFixed(1)} days
- Performance Consistency: ${viewVariance < 0.5 ? 'Stable' : viewVariance < 1 ? 'Variable' : 'Highly Unpredictable'}
- Trend Direction: ${trendDirection.toUpperCase()}

${dnaSummary}

TOP PERFORMERS (study these patterns):
${topPerformers.map((v, i) => `${i + 1}. "${v.title}" — ${(v.view_count || 0).toLocaleString()} views`).join("\n")}

UNDERPERFORMERS (avoid these patterns):
${bottomPerformers.map((v, i) => `${i + 1}. "${v.title}" — ${(v.view_count || 0).toLocaleString()} views`).join("\n")}

RECENT 10 TITLES:
${videos.slice(0, 10).map(v => `- "${v.title}"`).join("\n")}

${pastStrategies}
${activeBottlenecks}

═══════════════════════════════════════════════════════════════
                    INTERNAL TRACKING (HIDDEN FROM USER)
═══════════════════════════════════════════════════════════════

At the VERY END, include this block (will be stripped before display):

<!--INTERNAL_ASSESSMENT
riskLevel: low|medium|high|aggressive
strategyType: discovery|authority|retention|conversion|repositioning
confidenceScore: 0-100
bottleneckAddressed: specific_issue_identified
potentialUpside: brief_description
potentialDownside: brief_description
INTERNAL_ASSESSMENT-->

═══════════════════════════════════════════════════════════════
                    FINAL STANDARD
═══════════════════════════════════════════════════════════════

The creator should think:
"This coach doesn't waste my time. They see exactly what's wrong and tell me how to fix it. I trust them."

Be the strategist they'd pay thousands to talk to — but make it feel personal.
`;
    };

    // Get task-specific instructions
    const getTaskInstructions = () => {
      switch (coachType) {
        case "diagnosis":
          return `
TASK: Channel Diagnosis

Execute a complete strategic assessment.

Required output:
1. VERDICT: Is this channel growing, stagnant, or declining? (1 sentence)
2. PRIMARY BLOCKER: The ONE thing killing growth right now
3. HIDDEN STRENGTH: What's actually working (they may not see it)
4. IMMEDIATE ACTION: What to do THIS WEEK
5. POWER QUESTION: What should we fix first?

Reference specific video titles. No generic advice.
Be honest — if it's struggling, say so. Then show the path forward.`;

        case "weakPoints":
          return `
TASK: Weak Points Analysis — Brutal Edition

Find every growth killer and expose it.

Required output:
1. TOP 3 MISTAKES: Specific patterns hurting this channel
   - Reference actual video titles as evidence
   - Explain exactly WHY each is a problem
2. PRIORITY FIX: Which mistake to eliminate FIRST
3. STOP DOING: What they must immediately stop
4. START DOING: The replacement strategy
5. POWER QUESTION: Which problem do they want to tackle?

No fluff. No "you're doing great but..." — go straight to the issues.`;

        case "nextContent":
          return `
TASK: Next Content Strategy

Generate high-probability content ideas.

Required output:
1. THREE VIDEO IDEAS: Each must be:
   - Aligned with what's already worked on THIS channel
   - Specific titles (not vague topics)
   - Clear reasoning for why it should perform
2. RISK RANKING: Which is safest? Which is high-risk/high-reward?
3. FIRST PRIORITY: Which one to film first and why
4. POWER QUESTION: Which idea excites them most?

Base everything on their top performers. No random trend-chasing.`;

        case "custom":
          return `
TASK: Custom Question Response

Question: "${question || "How can I grow my channel?"}"

Execution:
1. Detect intent — Are they worried? Curious? Ready for action?
2. Answer DIRECTLY — Don't dance around it
3. Use their actual channel data as evidence
4. Provide actionable next step
5. End with ONE strategic follow-up question

Match their energy. If they're frustrated, acknowledge briefly, then fix.
If they're asking for truth, give it straight.`;

        default:
          return "Have a strategic, no-nonsense conversation about channel growth.";
      }
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("[youtube-coach] LOVABLE_API_KEY not configured");
      throw new Error("AI service not configured");
    }

    const systemPrompt = buildSupremeCoachPrompt();
    const taskPrompt = getTaskInstructions();

    // Resilient AI call with fallback
    let cleanResponse = "";
    let assessment = null;
    
    try {
      const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-5",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: taskPrompt }
          ],
          max_completion_tokens: 2500,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("[youtube-coach] AI API error:", errorText);
        
        if (aiResponse.status === 429) {
          return new Response(
            JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
            { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        if (aiResponse.status === 402) {
          return new Response(
            JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
            { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
        
        // Graceful fallback for other errors
        throw new Error("AI temporarily unavailable");
      }

      const aiData = await aiResponse.json();
      let rawResponse = aiData.choices?.[0]?.message?.content || "";

      if (!rawResponse || rawResponse.trim().length === 0) {
        throw new Error("Empty AI response");
      }

      // Parse and remove the internal assessment
      try {
        const internalMatch = rawResponse.match(/<!--INTERNAL_ASSESSMENT\s*([\s\S]*?)\s*INTERNAL_ASSESSMENT-->/);
        if (internalMatch) {
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
          
          rawResponse = rawResponse.replace(/<!--INTERNAL_ASSESSMENT[\s\S]*?INTERNAL_ASSESSMENT-->/g, '').trim();
        }
      } catch (e) {
        console.error("[youtube-coach] Failed to parse internal assessment:", e);
      }

      // Clean any remaining artifacts
      cleanResponse = rawResponse
        .replace(/```json[\s\S]*?```/g, '')
        .replace(/```[\s\S]*?```/g, '')
        .replace(/═+/g, '')
        .trim();

    } catch (aiError) {
      // FAIL-SAFE: Generate helpful fallback response
      console.error("[youtube-coach] AI call failed, using fallback:", aiError);
      
      const fallbackResponses: Record<string, string> = {
        diagnosis: `Looking at your channel data — you have ${videos.length} videos with an average of ${Math.round(avgViews).toLocaleString()} views per video. Your trend is currently ${trendDirection}.

Your top performer "${topPerformers[0]?.title}" shows what's working. Compare that to your recent uploads and you'll see the pattern.

**Next step:** Look at the gap between your best and worst titles. That gap reveals your biggest opportunity.

Want me to break down exactly why "${topPerformers[0]?.title}" outperformed the others?`,

        weakPoints: `Based on your ${videos.length} videos, here's what I see:

1. **Performance variance is ${viewVariance < 0.5 ? 'stable' : viewVariance < 1 ? 'inconsistent' : 'highly unpredictable'}** — ${viewVariance >= 1 ? "this suggests your topics or packaging isn't consistent" : "good consistency base to build on"}.

2. **Upload frequency:** Every ${avgDaysBetweenUploads.toFixed(0)} days — ${avgDaysBetweenUploads > 14 ? "too slow for algorithm momentum" : "solid cadence"}.

3. **Title patterns:** Compare "${topPerformers[0]?.title}" to "${bottomPerformers[0]?.title}" — the difference reveals your packaging problem.

Which area should we fix first?`,

        nextContent: `Based on what's worked on your channel:

**Your top performer pattern:** "${topPerformers[0]?.title}" (${(topPerformers[0]?.view_count || 0).toLocaleString()} views)

Three ideas aligned with your proven formula:
1. A follow-up to your best video with a fresh angle
2. A deeper dive into what made your top content click
3. The opposite take on your underperforming topic

Which direction interests you most?`,

        custom: `I have your channel data: ${videos.length} videos, ${Math.round(avgViews).toLocaleString()} avg views, ${avgEngagement.toFixed(2)}% engagement.

Your channel is currently ${trendDirection}. Your best content ("${topPerformers[0]?.title}") gives us a clear template to follow.

What specific aspect of your growth do you want to focus on?`,
      };

      cleanResponse = fallbackResponses[coachType] || fallbackResponses.custom;
      assessment = { riskLevel: "medium", strategyType: "general", confidenceScore: 60 };
    }

    // Save to strategy history (non-blocking)
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

    console.log(`[youtube-coach] Successfully generated ${coachType} response`);

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
    // Ultimate fail-safe: always return something useful
    console.error("[youtube-coach] Critical error:", error);
    
    const safeMessage = "I'm experiencing a temporary issue, but I'm still here to help. Try asking your question again, or let me run a quick channel diagnosis to get us started.";
    
    return new Response(
      JSON.stringify({ 
        success: true,
        coachType: "custom",
        response: safeMessage,
        metrics: null,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
