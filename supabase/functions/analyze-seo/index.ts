import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  CORE_INTELLIGENCE_DIRECTIVE, 
  ANTI_ROBOT_DIRECTIVE,
  SELF_CRITIQUE_DIRECTIVE,
  buildDNAContext,
  buildPerformanceContext,
  type ChannelInsights 
} from "../_shared/core-intelligence.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
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
    const { title, description, tags } = await req.json();
    
    if (!title) {
      return new Response(
        JSON.stringify({ error: "Title is required for SEO analysis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('[analyze-seo] User:', userId, 'title:', title);

    // Fetch channel data for contextual analysis
    const [channelResult, dnaResult, videosResult] = await Promise.all([
      supabase.from("channels").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("channel_dna").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("youtube_videos").select("*").eq("user_id", userId).order("view_count", { ascending: false }).limit(15),
    ]);

    const channelData = channelResult.data;
    const dnaData = dnaResult.data;
    const videosData = videosResult.data || [];

    const avgViews = videosData.length > 0 
      ? videosData.reduce((sum: number, v: any) => sum + (v.view_count || 0), 0) / videosData.length 
      : 1000;
    const avgLikes = videosData.length > 0
      ? videosData.reduce((sum: number, v: any) => sum + (v.like_count || 0), 0) / videosData.length
      : 50;
    const avgEngagement = avgViews > 0 ? (avgLikes / avgViews) * 100 : 3;
    
    const topTitles = videosData.slice(0, 5).map((v: any) => v.title);
    const bottomTitles = [...videosData].sort((a: any, b: any) => (a.view_count || 0) - (b.view_count || 0)).slice(0, 3).map((v: any) => v.title);

    const insights: ChannelInsights = {
      channelName: channelData?.channel_name || null,
      subscriberCount: channelData?.subscriber_count || null,
      avgViews,
      avgEngagement,
      topTitles,
      bottomTitles,
      dnaData: dnaData as any,
    };

    const dnaContext = buildDNAContext(insights);
    const performanceContext = buildPerformanceContext(insights);

    const systemPrompt = `${CORE_INTELLIGENCE_DIRECTIVE}

${dnaContext}

${performanceContext}

${ANTI_ROBOT_DIRECTIVE}

=== SEO ANALYSIS INTELLIGENCE ===

You are a YouTube SEO Analyst with deep expertise in discoverability optimization.

YOUR ROLE:
Analyze this video's metadata RELATIVE to the channel's patterns and proven success.
Compare against their top performers. Identify gaps and opportunities.
Provide actionable, specific recommendations - not generic SEO advice.

ANALYSIS FRAMEWORK:

1. TITLE ANALYSIS (0-100)
   - CTR potential based on channel's historical patterns
   - Power word usage vs channel's proven power words
   - Length and readability optimization
   - Comparison to top-performing titles

2. DESCRIPTION ANALYSIS (0-100)
   - Hook strength in first 150 characters
   - Keyword integration and placement
   - Structure and scannability
   - CTA effectiveness

3. TAG ANALYSIS (0-100)
   - Relevance and coverage
   - Mix of broad vs specific
   - Alignment with channel's niche

4. KEYWORD ANALYSIS (0-100)
   - Primary keyword identification
   - Keyword density assessment
   - Search intent alignment

RECOMMENDATIONS:
Prioritize by impact: HIGH, MEDIUM, LOW
Be specific - reference the actual content
Explain the expected impact

${SELF_CRITIQUE_DIRECTIVE}

Return ONLY valid JSON:
{
  "overallScore": 75,
  "scores": {
    "title": {
      "score": 80,
      "issues": ["Specific issue 1", "Specific issue 2"],
      "suggestions": ["Specific suggestion 1", "Specific suggestion 2"]
    },
    "description": {
      "score": 70,
      "issues": ["Issue 1"],
      "suggestions": ["Suggestion 1"]
    },
    "tags": {
      "score": 65,
      "issues": ["Issue 1"],
      "suggestions": ["Suggestion 1"]
    },
    "keywords": {
      "score": 72,
      "primaryKeyword": "detected keyword",
      "keywordDensity": "good/low/high",
      "suggestions": ["Keyword suggestion 1"]
    }
  },
  "recommendations": [
    {
      "priority": "high",
      "category": "title",
      "action": "Specific action to take",
      "impact": "Expected improvement description"
    }
  ],
  "competitorInsights": {
    "titlePatterns": ["Pattern from top performers"],
    "suggestedFormats": ["Format suggestion based on channel DNA"]
  },
  "overallInsight": "A human-readable summary of the SEO health and top priority action"
}`;

    const userPrompt = `Analyze this YouTube video's SEO:

TITLE: ${title}
DESCRIPTION: ${description || 'Not provided'}
TAGS: ${tags?.length ? tags.join(', ') : 'None provided'}

Provide analysis relative to this channel's proven patterns and DNA.
Focus on actionable improvements, not generic advice.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      console.error('AI gateway error:', response.status);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI service temporarily unavailable');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse SEO analysis from response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({
      ...analysis,
      personalizedWithDNA: !!dnaData,
      analyzedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in analyze-seo function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
