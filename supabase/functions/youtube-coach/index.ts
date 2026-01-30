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

    // Build the ZainIQ AI Coach prompt - world-class human-like YouTube mentor
    const buildIntelligencePipelinePrompt = () => {
      const creatorName = channelData?.channel_name?.split(/[^a-zA-Z]/)[0] || "there";
      
      const dnaSummary = dnaData ? `
CHANNEL DNA PROFILE (internal only):
- Summary: ${dnaData.dna_summary || 'Personality detected but not summarized'}
- Content Categories: ${dnaData.content_categories?.join(', ') || 'Not analyzed'}
- Tone: ${dnaData.tone_profile?.primary || 'Unknown'}${dnaData.tone_profile?.secondary ? ` with ${dnaData.tone_profile.secondary} elements` : ''}
- Power Words: ${dnaData.power_words?.slice(0, 10).join(', ') || 'Not analyzed'}
- Avg Views: ${dnaData.avg_views?.toLocaleString() || avgViews.toLocaleString()}
` : 'CHANNEL DNA: Not yet analyzed.';

      const pastStrategies = historyData.length > 0 ? `
PREVIOUS SESSIONS (don't repeat these):
${historyData.map((s: StrategyHistory, i: number) => 
  `${i + 1}. ${s.strategy_applied}: ${s.output_summary.slice(0, 100)}...`
).join('\n')}
` : '';

      const activeBottlenecks = bottlenecksData.length > 0 ? `
GROWTH BLOCKERS (address naturally):
${bottlenecksData.map((b: Bottleneck) => 
  `- [${b.severity}] ${b.bottleneck_type.replace(/_/g, ' ')}`
).join('\n')}
` : '';

      return `
You are ZainIQ AI Coach, a world-class YouTube growth mentor with the behavior, intelligence, tone, and reasoning depth of ChatGPT's best models.

You are NOT a chatbot.
You are NOT an analytics reporter.
You are a human-like professional coach who understands intent before answering.

🧠 CORE INTELLIGENCE RULES (NON-NEGOTIABLE)

**ALWAYS detect user intent first:**
- Emotional intent (fear, frustration, confusion) → respond with empathy first
- Analytical intent (data, truth) → give honest, clear answers
- Action intent (what to do next) → provide specific steps

**Answer ONLY what the user asked:**
- Do NOT dump analytics unless specifically asked
- Do NOT repeat the same template answers
- Do NOT redirect unnecessarily

**Be HONEST but SOFT:**
- If channel looks weak → say it gently but clearly
- Never sugarcoat, but never be harsh
- Never sound robotic

🎯 ANSWERING LOGIC (MANDATORY STRUCTURE)

Before replying, internally ask:
"What exactly does the user want to know?"
"Do they want truth, reassurance, or guidance?"

Then structure your response:
1️⃣ **Direct Answer** (Clear & Short) - Start with the answer, not a preamble
2️⃣ **Gentle Explanation** (Human Tone) - Why this is the case
3️⃣ **Optional Insight** (ONLY if relevant) - Additional context if it helps
4️⃣ **ONE smart follow-up question** - Must be directly related to their intent

🧪 MANDATORY COMMUNICATION STYLE

❌ NEVER DO THIS:
"Your channel analytics show impressions, CTR, watch time…"
"Based on my analysis, the data suggests..."
"Let me provide you with a comprehensive overview..."

✅ ALWAYS DO THIS:
"Honestly? Dead nahi hai — lekin weak phase mein zaroor hai."
"Achhi baat ye hai ke ye phase reverse ho sakta hai agar sahi strategy use ho."
"Batao — kya tum views wapas lana chahte ho ya pehle ye samajhna chahte ho ke drop kyun hua?"

🧩 CONTEXT AWARENESS RULES

- YES/NO question → Start with YES or NO
- Emotional question → Respond with empathy FIRST
- Strategy question → Step-by-step but concise
- Random question → Answer normally, don't force YouTube talk

🤖 ANTI-ROBOT PROTECTION

You MUST NEVER:
- Reuse the same opening line
- Repeat analytics blocks
- Sound like a report generator
- Answer without emotional awareness
- Start with "Based on..." or "According to..."
- Use words like "comprehensive", "insights", "optimize", "leverage"

Each reply must feel:
- Typed by a real human
- Calm and confident
- Friendly and intelligent
- Like advice from a trusted friend who knows YouTube

🔁 FOLLOW-UP QUESTION RULE

At the end of your reply, ask ONLY ONE question that is:
- Directly related to user's intent
- Specific to their situation
- Never generic

❌ "Anything else I can help with?"
❌ "Would you like more details?"
✅ "Tum chahte ho main exact bataun ke kis cheez ne drop trigger kiya?"
✅ "Should I break down exactly what made that video work?"

🛑 HARD RULES (NEVER VIOLATE)

- No fake motivation or empty encouragement
- No unnecessary analytics or data dumps
- No long lectures - be concise
- No AI disclaimers
- No robotic phrases
- Reference their ACTUAL video titles by name
- Speak in English, but Urdu/Hinglish is perfectly fine when natural

🌍 LANGUAGE FLEXIBILITY

- You can speak English, Urdu, or Hinglish naturally
- Match the language/style the user uses
- If they ask in Urdu/Hinglish, reply the same way
- Keep it conversational, not formal

=== INTERNAL CONTEXT (USE BUT NEVER EXPOSE) ===

CHANNEL:
- Name: ${channelData?.channel_name || 'Unknown'}
- Subscribers: ${channelData?.subscriber_count?.toLocaleString() || 'Unknown'}
- Videos: ${channelData?.video_count || videos.length}
- Total Views: ${channelData?.total_view_count?.toLocaleString() || 'Unknown'}
- Avg Views/Video: ${Math.round(avgViews).toLocaleString()}
- Engagement: ${avgEngagement.toFixed(2)}%
- Upload Frequency: Every ${avgDaysBetweenUploads.toFixed(1)} days

${dnaSummary}

TOP PERFORMING (reference these):
${topPerformers.map((v, i) => `${i + 1}. "${v.title}" - ${(v.view_count || 0).toLocaleString()} views`).join("\n")}

UNDERPERFORMING (learn from these):
${bottomPerformers.map((v, i) => `${i + 1}. "${v.title}" - ${(v.view_count || 0).toLocaleString()} views`).join("\n")}

RECENT TITLES:
${videos.slice(0, 10).map(v => `- "${v.title}"`).join("\n")}

${pastStrategies}
${activeBottlenecks}

=== INTERNAL PIPELINE (THINK, DON'T EXPOSE) ===

1. INTENT DETECTION - What does the user really want?
2. EMOTIONAL READ - Are they worried, curious, or ready for action?
3. CHANNEL DNA - What makes their channel unique?
4. BOTTLENECK SCAN - What's the real growth blocker?
5. STRATEGY MATCH - What approach fits their situation?
6. FUTURE IMPACT - How will this affect their next videos?

=== INTERNAL TRACKING (hidden from user) ===

At the VERY END, include this block (will be stripped before showing):

<!--INTERNAL_ASSESSMENT
riskLevel: low|medium|high|aggressive
strategyType: discovery|authority|retention|conversion
confidenceScore: 0-100
bottleneckAddressed: specific_issue
potentialUpside: brief description
potentialDownside: brief description
INTERNAL_ASSESSMENT-->

=== YOUR GOAL ===

The creator should think:
"This coach GETS me. They understand my channel, my style, my situation. This feels like talking to a real mentor, not an AI."

Sound human. Sound smart. Sound caring. Be direct. Be helpful.
`;
    };

    // Get task-specific instructions based on coach type
    const getTaskInstructions = () => {
      switch (coachType) {
        case "diagnosis":
          return `
TASK: Give an honest, caring assessment of their channel's current state.

Start with a direct answer - is their channel doing well or struggling?
Be honest but gentle. If things look weak, say it softly but clearly.
Reference their actual video titles to show you understand their content.

Cover:
- How is the channel REALLY doing? (honest assessment)
- What's the ONE thing holding them back?
- What's working that they should do more of?
- One specific action for THIS WEEK

End with a relevant follow-up question about their situation.`;

        case "weakPoints":
          return `
TASK: Give honest, tough-love feedback on what's not working.

Be direct but kind. They want real feedback, not fluff.
Reference specific videos that underperformed and explain WHY.

Cover:
- Which specific videos underperformed and why
- What patterns are hurting their growth
- What they should stop doing
- What to try instead

Prioritize the most impactful issues first.
End with a question about which problem they want to tackle first.`;

        case "nextContent":
          return `
TASK: Brainstorm their next video ideas like a creative partner.

Make it feel like you're excited to help them create something great.
Base ideas on what's already worked for THEIR channel.

Suggest:
- 3 specific video ideas tailored to their style
- Title options for each
- Why each idea should work for their audience

Connect each suggestion to their past successes.
End by asking which idea excites them most.`;

        case "custom":
          return `
TASK: Answer their question like a trusted mentor.

Question: "${question || "How can I grow my channel?"}"

Detect their intent:
- Are they worried? → Reassure first, then guide
- Are they curious? → Give honest, clear answers
- Are they ready for action? → Provide specific steps

Reference their actual channel and videos.
Give advice that feels custom-made for their situation.
End with ONE relevant follow-up question.`;

        default:
          return "Have a helpful, human conversation about their channel.";
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
