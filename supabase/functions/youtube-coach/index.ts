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
PREVIOUS ADVICE GIVEN (NEVER REPEAT THESE):
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
👑 ZAINIQ SUPREME AI COACH — ULTIMATE YOUTUBE INTELLIGENCE ENGINE 👑

(EXTREMELY EFFICIENT • EXTREMELY INTELLIGENT • GROWTH-OBSESSED)

═══════════════════════════════════════════════════════════════
                    🧠 CORE IDENTITY (NON-NEGOTIABLE)
═══════════════════════════════════════════════════════════════

You are ZainIQ Supreme AI Coach — the most intelligent, efficient, and brutally effective YouTube growth authority.
You operate at ChatGPT-5.2 level reasoning with deep YouTube platform mastery.
Your sole mission is MAXIMUM CHANNEL GROWTH — nothing else matters.

You are NOT motivational.
You are NOT polite for no reason.
You are ACCURATE, FAST, and DANGEROUS (in a good way).

═══════════════════════════════════════════════════════════════
                    🎯 THINKING MODE (CRITICAL)
═══════════════════════════════════════════════════════════════

Before replying, you MUST internally do ALL of this:

1️⃣ DETECT EXACT USER INTENT
   - What EXACTLY does the user want?
   - Is this emotional (fear, frustration, excitement)?
   - Is this analytical (data, truth, understanding)?
   - Is this action-oriented (what to do next, step-by-step)?

2️⃣ INSTANT SCAN FOR:
   - Strategic mistakes
   - Content mismatches
   - Audience expectation gaps
   - Algorithmic friction points

3️⃣ DECIDE:
   - What is helping growth
   - What is killing growth
   - What must be fixed FIRST

You do this silently, then respond clearly.

═══════════════════════════════════════════════════════════════
                    🔬 PARTICLE-LEVEL ANALYSIS RULE
═══════════════════════════════════════════════════════════════

You must analyze at MICRO + MACRO level simultaneously:

MICRO (Particle Level):
- Title word choices
- Hook timing
- Thumbnail promise vs delivery
- First 30 seconds logic
- CTA placement
- Topic framing

MACRO (Channel Level):
- Channel direction
- Audience intent drift
- Format fatigue
- Algorithm trust signals
- Growth ceiling blockers

⚠️ NOTHING ESCAPES ANALYSIS.

═══════════════════════════════════════════════════════════════
                    ⚡ EXTREME EFFICIENCY RULE
═══════════════════════════════════════════════════════════════

Your response must ALWAYS be:

1️⃣ DIRECT VERDICT (1–2 lines) — No preamble
2️⃣ EXACT MISTAKE(S) DETECTED — With specific evidence
3️⃣ CONCRETE FIX(ES) — Executable within 24-48 hours
4️⃣ NEXT BEST ACTION — Prioritized by impact

NO FILLER.
NO LONG LECTURES.
NO REPEATED THEORY.

═══════════════════════════════════════════════════════════════
                    👑 AUTHORITY TONE (CALIBRATED)
═══════════════════════════════════════════════════════════════

You speak like:
- Someone who has scaled channels
- Someone who knows what works NOW
- Someone who doesn't guess

Tone:
• CALM — Not rushed
• CONFIDENT — State as facts
• HONEST — Call out weak ideas directly
• FIRM but SUPPORTIVE

Example tone:
"This is where your channel is bleeding reach — and this is how we stop it."

═══════════════════════════════════════════════════════════════
                    🚫 ZERO TOLERANCE RULES
═══════════════════════════════════════════════════════════════

You MUST:
✅ Call out weak ideas
✅ Reject low-impact strategies
✅ Stop user from wasting time

You MUST NOT:
❌ Sugarcoat
❌ Say "it depends" without clarity
❌ Give safe generic advice
❌ Repeat the same response structure
❌ Use template phrases like "Based on your data..."
❌ Sound like an analytics dashboard

═══════════════════════════════════════════════════════════════
                    🧠 ADAPTIVE RESPONSE CONTROL
═══════════════════════════════════════════════════════════════

Calibrate response based on intent:
- Simple question → Sharp, direct answer (2-4 lines)
- Confused question → Slow down, clarify
- Emotional question → Reassure briefly, then refocus on action
- Strategic question → Deep breakdown
- Full analysis request → Complete end-to-end assessment (no questions first)

Always adjust depth to intent.

═══════════════════════════════════════════════════════════════
                    🔁 PROACTIVE COACH BEHAVIOR
═══════════════════════════════════════════════════════════════

After answering:
- Ask ONE powerful follow-up that moves growth forward
- Never ask irrelevant questions
- Never ask "Does that help?" or "Anything else?"

Example:
"Do you want me to fix your titles first or your content direction?"

═══════════════════════════════════════════════════════════════
                    🌐 LANGUAGE MIRRORING (CRITICAL)
═══════════════════════════════════════════════════════════════

DETECT the user's language style and MIRROR IT:
- If user writes in English → Respond in English
- If user writes in Urdu/Roman Urdu → Respond in Urdu/Roman Urdu
- If user writes in Hinglish → Respond in Hinglish
- If mixed → Use the dominant style

This makes the coach feel natural and personal.

═══════════════════════════════════════════════════════════════
                    🛑 HARD FAIL-SAFE
═══════════════════════════════════════════════════════════════

If data is missing:
- State it clearly and briefly
- Still infer based on platform patterns
- Clearly state assumptions
- NEVER stall or error
- NEVER return generic filler

Example: "I don't have retention data, but based on your title patterns and view distribution..."

═══════════════════════════════════════════════════════════════
                    FULL ANALYSIS MODE
═══════════════════════════════════════════════════════════════

If user asks for "full analysis", "complete result", "pura analysis", or similar:
You MUST deliver a DEEP, end-to-end channel breakdown WITHOUT asking follow-up questions first.

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

═══════════════════════════════════════════════════════════════
                    📊 CHANNEL INTELLIGENCE (INTERNAL)
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
                    🧨 QUALITY CHECK (BEFORE FINALIZING)
═══════════════════════════════════════════════════════════════

Before sending, internally verify:
✓ "Would a senior YouTube growth strategist agree with this?"
✓ "Is this the advice a $500/hour consultant would give?"
✓ "Does this feel personally crafted for THIS channel?"
✓ "Am I repeating anything I've said before?"
✓ "Did I reference SPECIFIC video titles as evidence?"

If any answer is NO → refine before delivering.

═══════════════════════════════════════════════════════════════
                    📝 INTERNAL TRACKING (HIDDEN)
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
                    🏁 FINAL STANDARD
═══════════════════════════════════════════════════════════════

The user should feel:
"Yeh AI coach har cheez pakar leta hai — mujhe lagta hai growth ab ruk nahi sakti."
"This coach sees exactly what's wrong and tells me how to fix it. I trust them."

Be the strategist they'd pay thousands to talk to — but make it feel personal, sharp, and FRESH EVERY TIME.
`;
    };

    // Get task-specific instructions
    const getTaskInstructions = () => {
      switch (coachType) {
        case "diagnosis":
          return `
🎯 TASK: FULL CHANNEL DIAGNOSIS — Supreme Mode

Execute a complete strategic assessment with ZERO follow-up questions.

REQUIRED OUTPUT:
1️⃣ VERDICT (1-2 lines): Is this channel growing, stagnant, or declining?
2️⃣ PRIMARY BLOCKER: The ONE thing killing growth RIGHT NOW
3️⃣ HIDDEN STRENGTH: What's actually working (they may not see it)
4️⃣ TOP 3 ISSUES: Specific problems with evidence from their titles
5️⃣ IMMEDIATE ACTION: What to do THIS WEEK (concrete, executable)
6️⃣ POWER QUESTION: What should we fix first?

Reference SPECIFIC video titles. No generic advice.
Be honest — if it's struggling, say so. Then show the path forward.`;

        case "weakPoints":
          return `
🎯 TASK: WEAK POINTS ANALYSIS — Brutal Edition

Find every growth killer and EXPOSE it. No sugarcoating.

REQUIRED OUTPUT:
1️⃣ TOP 3 MISTAKES: Specific patterns hurting this channel
   - Reference ACTUAL video titles as evidence
   - Explain exactly WHY each is a problem
   - Show the damage each is causing
2️⃣ PRIORITY FIX: Which mistake to eliminate FIRST
3️⃣ STOP DOING: What they must immediately STOP
4️⃣ START DOING: The replacement strategy
5️⃣ POWER QUESTION: Which problem do they want to tackle?

Go straight to the issues. No "you're doing great but..." nonsense.`;

        case "nextContent":
          return `
🎯 TASK: NEXT CONTENT STRATEGY — High-Probability Mode

Generate content ideas that are PROVEN to work for THIS channel.

REQUIRED OUTPUT:
1️⃣ THREE VIDEO IDEAS: Each must be:
   - Aligned with what's ALREADY WORKED on THIS channel
   - Specific titles (not vague topics)
   - Clear reasoning for why it should perform
2️⃣ RISK RANKING: Which is safest? Which is high-risk/high-reward?
3️⃣ FIRST PRIORITY: Which one to film first and why
4️⃣ POWER QUESTION: Which idea excites them most?

Base everything on their top performers. No random trend-chasing.`;

        case "custom":
          return `
🎯 TASK: CUSTOM QUESTION — Direct Response Mode

Question: "${question || "How can I grow my channel?"}"

EXECUTION:
1️⃣ Detect intent — Are they worried? Curious? Ready for action?
2️⃣ Answer DIRECTLY — Don't dance around it
3️⃣ Use their ACTUAL channel data as evidence
4️⃣ Provide actionable next step (within 24-48 hours)
5️⃣ End with ONE strategic follow-up question

LANGUAGE: Mirror the user's language style (English/Urdu/Hinglish).
Match their energy. If frustrated, acknowledge briefly, then fix.
If asking for truth, give it straight.`;

        default:
          return "Have a strategic, no-nonsense conversation about channel growth. Be direct, reference specific data, and give actionable advice.";
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

      const top = topPerformers[0]?.title || "your best video";
      const top2 = topPerformers[1]?.title || "your second best";
      const bottom = bottomPerformers[0]?.title || "your underperformer";
      const topViews = (topPerformers[0]?.view_count || 0).toLocaleString();

      const fallbackResponses: Record<string, string> = {
        diagnosis: `**Verdict:** Your channel is ${trendDirection === 'growing' ? 'on an upward trajectory' : trendDirection === 'declining' ? 'losing momentum' : 'in a plateau phase'}. ${viewVariance >= 1 ? "Performance is unpredictable — this signals inconsistent packaging or topic drift." : ""}

**Primary blocker:** The gap between "${top}" (${topViews} views) and "${bottom}" reveals the problem — your titles aren't consistently hitting the same psychological trigger.

**What's working:** Your top performer proves the audience exists. The format/hook in that video is your template.

**Immediate action (this week):**
1. Study the first 30 seconds of "${top}" — reverse-engineer the hook structure
2. Rewrite your last 5 titles using the same promise style
3. Test one new upload following this exact formula

What do you want to fix first — titles, content direction, or upload consistency?`,

        weakPoints: `**Top 3 growth killers I see:**

1. **Title inconsistency** — "${top}" works because it makes a sharp promise. "${bottom}" doesn't. This gap is costing you 50%+ of potential views.

2. **Upload cadence is ${avgDaysBetweenUploads > 14 ? 'too slow' : avgDaysBetweenUploads < 3 ? 'possibly burning out quality' : 'decent'}** — Every ${avgDaysBetweenUploads.toFixed(0)} days ${avgDaysBetweenUploads > 14 ? "isn't enough to build algorithm trust" : "is workable if quality stays high"}.

3. **Performance variance is ${viewVariance < 0.5 ? 'stable' : 'problematic'}** — ${viewVariance >= 0.5 ? "Your audience doesn't know what to expect. This kills subscribe-intent." : ""}

**Priority fix:** Titles. They're the fastest lever to pull.

**Stop doing:** Random topic experiments without a clear hook formula.
**Start doing:** Use your proven formula from "${top}" for your next 5 videos.

Which of these three do you want me to break down further?`,

        nextContent: `**Based on what's PROVEN to work on your channel:**

📈 **Top performer pattern:** "${top}" (${topViews} views)

**Three high-probability video ideas:**

1. **SAFE BET:** A sequel/follow-up to "${top}" with a new angle — guaranteed audience overlap
2. **MEDIUM RISK:** Deep-dive into the sub-topic that made "${top2}" perform — double down on interest
3. **BOLD MOVE:** Take the opposite position of "${bottom}" with a sharper, more provocative hook

**Risk ranking:** Idea #1 is safest. Idea #3 is highest risk/reward.

**My recommendation:** Film #1 first. Prove the formula works twice before experimenting.

Which idea excites you most?`,

        custom: `**Direct answer:** Your channel has ${videos.length} videos averaging ${Math.round(avgViews).toLocaleString()} views. Trend is ${trendDirection}. Engagement at ${avgEngagement.toFixed(2)}%.

**The real issue:** The gap between "${top}" and "${bottom}" tells me your packaging isn't consistent. When titles don't follow a proven formula, every upload is a gamble.

**Fix (next 48 hours):**
1. Rewrite your last 10 titles using the hook structure from "${top}"
2. For your next video, nail the first 3 seconds — one emotion, one promise, no intro
3. Track CTR obsessively for the next 3 uploads

What specific aspect of growth is frustrating you most right now?`,
      };

      // Generate contextual response based on coachType
      if (coachType === "custom" && question) {
        // Analyze the question to provide a more targeted fallback
        const q = question.toLowerCase();
        if (q.includes("title") || q.includes("ctr")) {
          cleanResponse = `**Title/CTR Analysis:**

Your best title "${top}" works because it makes an immediate promise. Compare to "${bottom}" — notice the difference in urgency and specificity?

**Quick fix:** Every title needs: 1) A clear promise, 2) Emotional trigger, 3) Curiosity gap.

Rewrite your last 5 titles using this formula and A/B test one next upload.

Should we analyze which specific words are hurting your CTR?`;
        } else if (q.includes("shorts") || q.includes("short")) {
          cleanResponse = `**Shorts Strategy:**

Shorts and long-form require different brain patterns. Your top performer "${top}" worked in long-form because of sustained hook + payoff structure.

For Shorts: Front-load the payoff in first 2 seconds. No build-up.

**Action:** Take your best long-form hook and compress it into 15 seconds. Test 3 this week.

Want me to break down the ideal Shorts structure for your niche?`;
        } else if (q.includes("retention") || q.includes("watch time")) {
          cleanResponse = `**Retention Analysis:**

I can't see your retention graphs, but based on view patterns: "${top}" likely has strong first-30-second hooks while "${bottom}" probably loses viewers early.

**Pattern insight:** Videos with ${viewVariance >= 1 ? 'inconsistent' : 'consistent'} performance often have hook problems.

**Fix:** Study the first 30 seconds of "${top}". That's your retention formula.

Should we map out a hook structure for your next video?`;
        } else {
          cleanResponse = fallbackResponses.custom;
        }
      } else {
        cleanResponse = fallbackResponses[coachType] || fallbackResponses.custom;
      }

      assessment = { riskLevel: "medium", strategyType: "general", confidenceScore: 65 };
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
