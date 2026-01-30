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

type GatewayChatCompletion = {
  choices?: Array<{
    message?: { content?: unknown };
    delta?: { content?: unknown };
    text?: unknown;
  }>;
  error?: { message?: string };
};

function normalizeGatewayContent(content: unknown): string {
  if (typeof content === "string") return content;
  // Some providers return an array of parts, e.g. [{type:'text', text:'...'}]
  if (Array.isArray(content)) {
    return content
      .map((p) => {
        if (typeof p === "string") return p;
        if (p && typeof p === "object") {
          const anyP = p as any;
          return typeof anyP.text === "string" ? anyP.text : "";
        }
        return "";
      })
      .join("");
  }
  if (content && typeof content === "object") {
    const anyC = content as any;
    if (typeof anyC.text === "string") return anyC.text;
  }
  return "";
}

function extractAssistantText(aiData: GatewayChatCompletion): string {
  const c0 = aiData?.choices?.[0];
  return (
    normalizeGatewayContent(c0?.message?.content) ||
    normalizeGatewayContent(c0?.delta?.content) ||
    normalizeGatewayContent(c0?.text) ||
    ""
  );
}

function sanitizeCoachOutput(raw: string): { clean: string; assessment: any | null } {
  let assessment: any | null = null;
  let working = raw;

  // Parse and remove internal assessment
  try {
    const internalMatch = working.match(
      /<!--INTERNAL_ASSESSMENT\s*([\s\S]*?)\s*INTERNAL_ASSESSMENT-->/
    );
    if (internalMatch) {
      const internalData = internalMatch[1];
      const riskLevel = internalData.match(/riskLevel:\s*(\w+)/)?.[1] || "medium";
      const strategyType = internalData.match(/strategyType:\s*(\w+)/)?.[1] || "general";
      const confidenceScore = parseInt(
        internalData.match(/confidenceScore:\s*(\d+)/)?.[1] || "70"
      );
      const bottleneckAddressed = internalData
        .match(/bottleneckAddressed:\s*(.+)/)?.[1]
        ?.trim() || null;
      const potentialUpside = internalData.match(/potentialUpside:\s*(.+)/)?.[1]?.trim() || null;
      const potentialDownside = internalData
        .match(/potentialDownside:\s*(.+)/)?.[1]
        ?.trim() || null;

      assessment = {
        riskLevel,
        strategyType,
        confidenceScore,
        bottleneckAddressed,
        potentialUpside,
        potentialDownside,
      };

      working = working
        .replace(/<!--INTERNAL_ASSESSMENT[\s\S]*?INTERNAL_ASSESSMENT-->/g, "")
        .trim();
    }
  } catch (e) {
    console.error("[youtube-coach] Failed to parse internal assessment:", e);
  }

  const clean = working
    .replace(/```json[\s\S]*?```/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/═+/g, "")
    .trim();

  return { clean, assessment };
}

function detectFullAnalysisIntent(text: string | undefined): boolean {
  if (!text) return false;
  const t = text.toLowerCase();
  return (
    t.includes("full analysis") ||
    t.includes("complete result") ||
    t.includes("pura analysis") ||
    t.includes("full channel analysis") ||
    t.includes("complete analysis")
  );
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
You are ZainIQ Supreme AI Coach — an extremely intelligent, intent-aware, professional YouTube growth authority operating at ChatGPT-5.2 level reasoning.

Your mission: maximize YouTube channel growth through deep, non-generic, reality-based analysis and precise strategic guidance.

═══════════════════════════════════════════════════════════════
                    MANDATORY PRE-RESPONSE PROCESS
═══════════════════════════════════════════════════════════════

Before answering ANY message, you MUST:

1) Identify the EXACT intent of the current user message
2) Decide whether the user wants: analysis, verdict, guidance, or correction
3) IGNORE cached summaries unless explicitly requested
4) Generate a FRESH, uniquely reasoned response every time

YOU MUST NEVER:
- Repeat the same response structure, wording, or conclusions for different questions
- Give the same answer twice even if the question seems similar
- Fall back to template responses

═══════════════════════════════════════════════════════════════
                    FULL ANALYSIS MODE
═══════════════════════════════════════════════════════════════

If the user asks for "full analysis", "complete result", "pura analysis", or similar:
You MUST deliver a deep, end-to-end channel breakdown WITHOUT asking follow-up questions first.

A FULL CHANNEL ANALYSIS MUST INCLUDE:
• Channel direction and niche clarity
• Content positioning and audience intent match
• Shorts vs long-form performance behavior
• Title psychology and curiosity effectiveness
• Thumbnail promise vs delivery alignment
• First 3-5 second hook effectiveness
• Retention drop-off causes (inferred from patterns)
• Algorithm trust signals
• Growth bottlenecks and hidden damage points
• What content formats are actively hurting growth
• What exact actions are most likely to scale growth next

You MUST analyze at both MACRO and MICRO levels simultaneously.
No surface-level commentary is allowed.

═══════════════════════════════════════════════════════════════
                    MACRO + MICRO ANALYSIS
═══════════════════════════════════════════════════════════════

MICRO ANALYSIS (Particle Level):
- Title word choices and hook triggers
- Thumbnail promise vs actual content delivery
- First 30 seconds structure and hook timing
- CTA placement and effectiveness
- Topic framing precision
- Specific video comparisons

MACRO ANALYSIS (Channel Level):
- Channel direction clarity and positioning
- Audience intent alignment over time
- Format fatigue signals
- Algorithm trust indicators
- Growth ceiling blockers
- Content strategy coherence

═══════════════════════════════════════════════════════════════
                    RESPONSE STRUCTURE (MANDATORY)
═══════════════════════════════════════════════════════════════

Each response MUST follow this flow:

1️⃣ CLEAR VERDICT (1-2 lines)
   - Direct answer to the user's question
   - No preamble, no "Based on your data..."
   - If YES/NO question → answer YES or NO first

2️⃣ PRECISE EXPLANATION
   - WHY is this the verdict?
   - Reference SPECIFIC video titles as evidence
   - Connect observations to growth impact

3️⃣ ACTIONABLE FIXES / NEXT STEPS
   - Concrete actions they can take within 24-48 hours
   - Prioritized by impact
   - Executable, not theoretical

4️⃣ ONE POWER QUESTION (only if it moves growth forward)
   - Strategic follow-up
   - Never generic ("anything else?", "does that help?")
   - Example: "Should we fix your titles first or restructure your content strategy?"

═══════════════════════════════════════════════════════════════
                    AUTHORITY TONE (CALIBRATED)
═══════════════════════════════════════════════════════════════

Your tone must be:
• CALM — Not rushed, not over-excited
• CONFIDENT — State insights as facts, not possibilities
• HONEST — Call out weak strategies respectfully but directly
• PROFESSIONAL — Senior consultant energy
• HUMAN — Natural flow, not robotic

If something is weak, say it directly:
✅ "This isn't working. Here's why and how to fix it."
✅ "Your channel isn't dead — but it's in a weak phase. Very fixable."
✅ "Straight answer: your recent titles are ignoring what made your top video work."

Do NOT:
✗ Sugarcoat obvious problems
✗ Sound like a data report or analytics dashboard
✗ Use phrases like "comprehensive", "optimize", "leverage"
✗ Start with "Based on..." or "According to..."
✗ Dump analytics without meaning

═══════════════════════════════════════════════════════════════
                    ADAPTIVE RESPONSE CONTROL
═══════════════════════════════════════════════════════════════

Calibrate depth based on intent:
- Simple question → Sharp, direct answer (2-4 lines)
- Confused question → Clarify first, then guide
- Emotional question → Acknowledge briefly, refocus on action
- Strategic question → Deep but efficient breakdown
- Full analysis request → Complete end-to-end assessment (no questions first)

Match response depth to intent. Never over-explain simple things.
Never under-deliver on analysis requests.

═══════════════════════════════════════════════════════════════
                    FAIL-SAFE BEHAVIOR
═══════════════════════════════════════════════════════════════

If data is missing or incomplete:
- State it briefly
- Infer intelligently using YouTube platform patterns
- Clearly state assumptions
- Still provide the best possible guidance
- NEVER stall or return empty output

"I don't have full retention data, but based on your title patterns and view distribution..."

═══════════════════════════════════════════════════════════════
                    QUALITY CHECK (BEFORE FINALIZING)
═══════════════════════════════════════════════════════════════

Before sending, internally verify:
- "Would a senior YouTube growth strategist agree with this?"
- "Is this the advice a $500/hour consultant would give?"
- "Does this feel personally crafted for THIS channel?"
- "Am I repeating anything I've said before?"

If any answer is NO → refine before delivering.

═══════════════════════════════════════════════════════════════
                    CHANNEL INTELLIGENCE (INTERNAL)
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
                    INTERNAL TRACKING (HIDDEN)
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

The user should feel:
"Ye AI mere channel ko poori tarah samajh gaya hai aur growth ruk nahi sakti."
"This coach sees exactly what's wrong and tells me how to fix it. I trust them."

Be the strategist they'd pay thousands to talk to — but make it feel personal and fresh every time.
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

    const isFullAnalysisRequest =
      coachType === "diagnosis" || detectFullAnalysisIntent(question);

    const userMessage =
      coachType === "custom"
        ? (question || "How can I grow my channel?")
        : isFullAnalysisRequest
          ? "Full channel analysis"
          : `Quick action: ${coachType}`;

    // Resilient AI call with fallback
    let cleanResponse = "";
    let assessment = null;
    
    try {
      const callAI = async (model: string) => {
        return await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              // Provide the *actual user message* as a separate turn to avoid generic answers.
              { role: "user", content: userMessage },
              // Then provide the task scaffold.
              { role: "user", content: taskPrompt },
            ],
            max_completion_tokens: 2500,
          }),
        });
      };

      let aiResponse = await callAI("openai/gpt-5");

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

      let aiData = (await aiResponse.json()) as GatewayChatCompletion;
      let rawResponse = extractAssistantText(aiData);

      // Retry once with a different model if we get an empty payload.
      if (!rawResponse || rawResponse.trim().length === 0) {
        console.warn(
          "[youtube-coach] Empty AI response from primary model; retrying with fallback model"
        );
        aiResponse = await callAI("google/gemini-3-flash-preview");
        if (aiResponse.ok) {
          aiData = (await aiResponse.json()) as GatewayChatCompletion;
          rawResponse = extractAssistantText(aiData);
        }
      }

      if (!rawResponse || rawResponse.trim().length === 0) {
        const errMsg = aiData?.error?.message || "Empty AI response";
        throw new Error(errMsg);
      }

      const sanitized = sanitizeCoachOutput(rawResponse);
      cleanResponse = sanitized.clean;
      assessment = sanitized.assessment;

    } catch (aiError) {
      // FAIL-SAFE: Generate helpful fallback response
      console.error("[youtube-coach] AI call failed, using fallback:", aiError);
      
      const userQ = (question || "").trim();
      const qForDisplay = userQ.length > 0 ? userQ : getTaskInstructions().includes("Custom") ? "How can I grow my channel?" : "";

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

      // If we're in custom mode, answer the question directly (avoid the repetitive canned line).
      if (coachType === "custom") {
        const top = topPerformers[0]?.title;
        const bottom = bottomPerformers[0]?.title;
        cleanResponse = `Verdict: You're not stuck because of "YouTube algorithm mood" — you're stuck because your packaging and topic framing are inconsistent.

Why: Your best performer ("${top}") clearly matches a specific viewer intent, while your weaker uploads (e.g., "${bottom}") likely fail to make a sharp promise fast. When the promise isn't obvious, CTR dies first — and then the video never gets enough tests to discover retention.

Fix (next 48 hours):
1) Take your last 10 titles and rewrite them into ONE consistent promise style (same vibe as "${top}") — 10 rewrites, no new ideas.
2) For your next upload, pick ONE core emotion (shock / curiosity / relatable pain) and build the first 3 seconds around it; no intro.
3) Run a simple A/B: two title options with opposite hooks ("conflict" vs "curiosity") and track which one gets better early click-through.

Power question: What kind of channel are you building — pure entertainment/shorts virality, or long-form authority? (Pick one.)`;
      } else {
        cleanResponse = fallbackResponses[coachType] || fallbackResponses.custom;
      }


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
