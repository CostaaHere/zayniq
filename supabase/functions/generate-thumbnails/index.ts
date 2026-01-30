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
    // Verify authentication using getClaims() for efficient JWT validation
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

    const { title, topic, emotion, style } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating thumbnail ideas for user:', userId, 'title:', title);

    const prompt = `You are a YouTube thumbnail design expert. Generate 5 unique thumbnail concept ideas for a YouTube video.

Video Title: ${title}
Main Topic/Subject: ${topic || 'Not specified'}
Target Emotion: ${emotion || 'Curiosity'}
Style Preference: ${style || 'Bold'}

For each thumbnail concept, provide:
1. A short concept title (2-4 words)
2. Main text overlay (max 3-4 words, punchy and readable)
3. Secondary text (optional, smaller supporting text)
4. Color scheme with 3 hex colors that work well together
5. Composition description (layout, focal points, background)
6. Expression/pose guidance if a face is shown
7. What type of video this thumbnail works best for

Make the concepts varied - some with faces, some without. Focus on high CTR (click-through rate) principles:
- High contrast
- Readable text at small sizes
- Emotional triggers
- Clear focal point

Respond in this exact JSON format:
{
  "concepts": [
    {
      "title": "concept name",
      "mainText": "MAIN TEXT",
      "secondaryText": "optional secondary",
      "colors": ["#hex1", "#hex2", "#hex3"],
      "composition": "Description of the layout and visual elements",
      "expression": "Facial expression or pose guidance",
      "bestFor": "Tutorial videos"
    }
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
          { role: 'system', content: 'You are a YouTube thumbnail design expert. Always respond with valid JSON only.' },
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

    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse thumbnail concepts from response');
    }
    
    const concepts = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify(concepts), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-thumbnails function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
