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

    const { topic, niche, targetAudience, contentStyles, includeTrending, numberOfIdeas } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Use custom topic if provided, otherwise fallback to niche
    const mainTopic = topic?.trim() || niche || 'General';
    
    console.log('Generating content ideas for user:', user.id, 'topic:', mainTopic, 'count:', numberOfIdeas);

    const stylesText = contentStyles?.length > 0 ? contentStyles.join(', ') : 'Any style';
    const trendingText = includeTrending ? 'Include current trending topics and viral formats relevant to this topic.' : '';

    const prompt = `You are a YouTube content strategist and trend analyst. Generate ${numberOfIdeas || 10} unique viral video content ideas.

Topic/Niche: ${mainTopic}
Target Audience: ${targetAudience || 'General audience'}
Content Styles: ${stylesText}
${trendingText}

IMPORTANT: Focus specifically on "${mainTopic}" - create ideas that are highly relevant, catchy, and creator-ready for this exact topic. Ideas should be clickable and optimized for YouTube/Shorts.

For each idea, provide:
1. A compelling video title (optimized for CTR)
2. Brief description (2-3 sentences explaining the concept)
3. Viral potential score (0-100, be realistic based on niche and trend potential)
4. Difficulty level (Easy, Medium, or Hard based on production requirements)
5. Content type (Tutorial, Review, Vlog, List, Challenge, Story, etc.)
6. Key points to cover (3-5 bullet points)
7. Thumbnail concept (brief visual description)
8. Best posting time/day

Make ideas varied, creative, and actionable. Consider SEO, engagement potential, and current trends.

Respond in this exact JSON format:
{
  "ideas": [
    {
      "title": "Video Title Here",
      "description": "Brief description of the video concept",
      "viralScore": 75,
      "difficulty": "Medium",
      "contentType": "Tutorial",
      "keyPoints": ["Point 1", "Point 2", "Point 3"],
      "thumbnailConcept": "Description of thumbnail visual",
      "bestPostingTime": "Tuesday 2-4 PM"
    }
  ],
  "trendingTopics": [
    {"topic": "Trending Topic 1", "relevance": "High"},
    {"topic": "Trending Topic 2", "relevance": "Medium"}
  ]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are a YouTube content strategist. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
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
      throw new Error('Failed to parse ideas from response');
    }
    
    const result = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-content-ideas function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
