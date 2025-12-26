import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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

    console.log('Analyzing SEO for user:', user.id, 'title:', title);

    const systemPrompt = `You are a YouTube SEO expert. Analyze the provided video metadata and provide detailed scoring and recommendations.

Score each category from 0-100 and provide specific, actionable recommendations.

Return your analysis in this exact JSON format:
{
  "overallScore": 75,
  "scores": {
    "title": {
      "score": 80,
      "issues": ["Issue 1", "Issue 2"],
      "suggestions": ["Suggestion 1", "Suggestion 2"]
    },
    "description": {
      "score": 70,
      "issues": ["Issue 1"],
      "suggestions": ["Suggestion 1", "Suggestion 2"]
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
      "suggestions": ["Add keyword X", "Remove keyword Y"]
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
    "titlePatterns": ["Pattern 1", "Pattern 2"],
    "suggestedFormats": ["Format suggestion 1"]
  }
}

Be thorough but practical. Focus on YouTube-specific SEO best practices.`;

    const userPrompt = `Analyze this YouTube video's SEO:

Title: ${title}
${description ? `Description: ${description}` : 'Description: Not provided'}
${tags?.length ? `Tags: ${tags.join(', ')}` : 'Tags: None provided'}

Provide a comprehensive SEO analysis with scores and actionable recommendations.`;

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

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse SEO analysis from response');
    }
    
    const analysis = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(analysis), {
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
