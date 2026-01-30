import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { 
  CORE_INTELLIGENCE_DIRECTIVE, 
  ANTI_ROBOT_DIRECTIVE,
  buildDNAContext,
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
    const { title, topic, emotion, style } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('[generate-thumbnails] User:', userId, 'title:', title);

    // Fetch channel DNA for style-aligned thumbnails
    const [dnaResult, channelResult] = await Promise.all([
      supabase.from("channel_dna").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("channels").select("*").eq("user_id", userId).maybeSingle(),
    ]);

    const dnaData = dnaResult.data;
    const channelData = channelResult.data;

    const insights: ChannelInsights = {
      channelName: channelData?.channel_name || null,
      subscriberCount: channelData?.subscriber_count || null,
      avgViews: 0,
      avgEngagement: 0,
      topTitles: [],
      bottomTitles: [],
      dnaData: dnaData as any,
    };

    const dnaContext = buildDNAContext(insights);

    const systemPrompt = `${CORE_INTELLIGENCE_DIRECTIVE}

${dnaContext}

${ANTI_ROBOT_DIRECTIVE}

=== THUMBNAIL INTELLIGENCE ===

You are a YouTube Thumbnail Strategist with deep CTR psychology expertise.

YOUR ROLE:
Design thumbnail concepts that align with this channel's visual identity and audience psychology.
Every concept should feel like it belongs on THIS channel, not any random channel.

THUMBNAIL PSYCHOLOGY PRINCIPLES:

1. ATTENTION CAPTURE
   - High contrast is non-negotiable
   - Single clear focal point
   - Readable at small sizes (mobile browse)
   - 3-second decision window

2. EMOTIONAL TRIGGERS
   - Match the video's emotional promise
   - Faces with expressions outperform flat images
   - Color psychology matters (red = urgency, blue = trust, yellow = energy)

3. TEXT OPTIMIZATION
   - MAX 3-4 words for main text
   - Must be readable at 160x90 pixels
   - Complement the title, don't repeat it
   - Power words that trigger clicks

4. BRAND CONSISTENCY
   - Match the channel's established visual language
   - Color palette should feel familiar to returning viewers
   - Style should signal the content type

GENERATE 5 DISTINCT CONCEPTS:
- Vary between: face-focused, object-focused, text-heavy, minimal
- Each targets a different psychological trigger
- All must align with the channel's DNA

Return ONLY valid JSON:
{
  "concepts": [
    {
      "title": "2-4 word concept name",
      "mainText": "MAIN TEXT (max 4 words)",
      "secondaryText": "optional smaller text",
      "colors": ["#hex1", "#hex2", "#hex3"],
      "composition": "Detailed layout description: what's in frame, where elements are positioned",
      "expression": "If face shown: specific expression. If not: N/A",
      "bestFor": "What type of video/audience this works best for",
      "psychologicalTrigger": "The emotion/curiosity this triggers",
      "ctrPotential": "high/medium/low based on principles"
    }
  ],
  "topRecommendation": {
    "conceptIndex": 0,
    "reason": "Why this is the best choice for THIS specific channel and video"
  },
  "styleNote": "How these concepts align with the channel's visual identity"
}`;

    const userPrompt = `Generate thumbnail concepts for:

VIDEO TITLE: ${title}
MAIN TOPIC: ${topic || 'Not specified'}
TARGET EMOTION: ${emotion || 'Curiosity'}
STYLE PREFERENCE: ${style || 'Bold'}

Create concepts that would stop THIS channel's audience from scrolling.`;

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
      throw new Error('Failed to parse thumbnail concepts from response');
    }
    
    const concepts = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({
      ...concepts,
      personalizedWithDNA: !!dnaData,
      generatedAt: new Date().toISOString()
    }), {
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
