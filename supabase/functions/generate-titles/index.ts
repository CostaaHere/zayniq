import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TitleInsight {
  title: string;
  powerWords: string[];
  psychologyExplanation: string;
  algorithmExplanation: string;
  dnaAlignment: string;
  ctrPotential: "high" | "medium" | "low";
}

interface TitleCategory {
  category: string;
  categoryDescription: string;
  icon: string;
  titles: TitleInsight[];
}

interface ABTestCluster {
  clusterName: string;
  targetAudience: string;
  psychologicalTrigger: string;
  titles: TitleInsight[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { topic, keyword, tone, includeEmoji, channelDNA } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log("Generating intent-based titles for user:", user.id, "topic:", topic, "with DNA:", !!channelDNA);

    // Build comprehensive DNA-aware system prompt
    let dnaContext = "";
    let dnaPersonalization = "";
    
    if (channelDNA) {
      dnaContext = `
CRITICAL - CHANNEL DNA (You MUST personalize ALL titles based on this):
${channelDNA}

PERSONALIZATION RULES:
- Every title MUST feel like it was written specifically for this channel
- Use the channel's preferred power words and vocabulary style
- Match the channel's proven title patterns and formulas
- Align with the audience demographics and psychology
- Reference the channel's top-performing topics where relevant
- NEVER generate generic, one-size-fits-all titles
`;
      dnaPersonalization = `Explain specifically how this title aligns with the channel's DNA - reference specific elements like their tone, vocabulary, audience, or successful patterns.`;
    } else {
      dnaPersonalization = `Note: No Channel DNA available. Explain how this title could be personalized once the creator analyzes their channel.`;
    }

    const systemPrompt = `You are an elite YouTube growth strategist with deep expertise in:
- Click-Through Rate optimization psychology
- YouTube algorithm mechanics
- Viewer behavior patterns
- Emotional engagement triggers

${dnaContext}

You are generating an INTENT-BASED TITLE INTELLIGENCE report - not just titles, but strategic insights.

GENERATE TITLES IN 5 PSYCHOLOGICAL CATEGORIES:

1. CURIOSITY-DRIVEN TITLES (3 titles)
   - Create powerful open loops that demand closure
   - Trigger unanswered questions in the viewer's mind
   - Use curiosity tension without clickbait lies
   - Make viewers feel they're missing something important

2. AUTHORITY TITLES (3 titles)
   - Position the creator as the definitive expert
   - Signal insider knowledge and credibility
   - Use authority language: "The Truth About", "What [Experts] Won't Tell You", "After [X] Years"
   - Best for educational and niche channels

3. EMOTIONAL TITLES (3 titles)
   - Trigger specific emotions: fear, excitement, relief, urgency, or aspiration
   - Emotion must align with the topic and audience psychology
   - Use visceral language that creates immediate reaction
   - Connect to viewer's pain points or desires

4. SHORT-FORM OPTIMIZED TITLES (3 titles)
   - Maximum 40 characters for mobile discovery
   - High impact in minimal words
   - Optimized for Shorts, suggested feeds, and mobile browse
   - Front-load the hook

5. A/B TEST CLUSTERS (2 clusters of 2 titles each)
   - Each cluster targets a different psychological trigger
   - Provide variation sets for testing
   - Explain which audience segment each cluster targets

FOR EVERY TITLE, PROVIDE:
- psychologyExplanation: Why this works psychologically (what mental triggers it activates)
- algorithmExplanation: How YouTube's algorithm will favor this (CTR signals, watch time correlation, suggested video potential)
- dnaAlignment: ${dnaPersonalization}
- powerWords: Array of power words used
- ctrPotential: "high", "medium", or "low" based on expected CTR

TITLE RULES:
- ${includeEmoji ? "Include 1-2 strategic emojis that add meaning" : "Do NOT include any emojis"}
- ${keyword ? `Naturally incorporate "${keyword}" - preferably early in the title` : ""}
- Match the ${tone} tone
- Character limit: 60 for standard, 40 for short-form
- NO generic titles - every title must feel crafted for this specific creator

Return a JSON object with this exact structure:
{
  "categories": [
    {
      "category": "Curiosity-Driven",
      "categoryDescription": "Titles that create open loops and trigger viewer curiosity",
      "icon": "help-circle",
      "titles": [
        {
          "title": "...",
          "powerWords": ["word1", "word2"],
          "psychologyExplanation": "...",
          "algorithmExplanation": "...",
          "dnaAlignment": "...",
          "ctrPotential": "high"
        }
      ]
    }
  ],
  "abTestClusters": [
    {
      "clusterName": "Fear of Missing Out",
      "targetAudience": "Competitive creators worried about falling behind",
      "psychologicalTrigger": "Loss aversion and social proof",
      "titles": [...]
    }
  ],
  "topPick": {
    "title": "...",
    "reason": "Why this is the strategically best title for this specific video and channel"
  }
}

Return ONLY valid JSON. No markdown, no explanation outside the JSON.`;

    const userPrompt = `Generate an Intent-Based Title Intelligence report for:

VIDEO TOPIC: ${topic}
${keyword ? `TARGET KEYWORD: ${keyword}` : ""}
TONE: ${tone}
${includeEmoji ? "EMOJIS: Yes" : "EMOJIS: No"}

Remember: This creator needs titles that feel personally crafted for their channel, not generic suggestions.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      console.error("AI gateway error:", response.status);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      throw new Error("AI service temporarily unavailable");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    // Parse the JSON response
    let intelligence;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        intelligence = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No valid JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse intelligence response:", parseError);
      throw new Error("Failed to parse AI response");
    }

    return new Response(JSON.stringify({ 
      intelligence, 
      personalizedWithDNA: !!channelDNA,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-titles:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to generate titles";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
