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
    const { title, description, category } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('[generate-tags] User:', userId, 'title:', title);

    // Fetch channel DNA for intelligent tagging
    const [dnaResult, videosResult] = await Promise.all([
      supabase.from("channel_dna").select("*").eq("user_id", userId).maybeSingle(),
      supabase.from("youtube_videos").select("title, tags").eq("user_id", userId).order("view_count", { ascending: false }).limit(10),
    ]);

    const dnaData = dnaResult.data;
    const videosData = videosResult.data || [];

    // Extract tags from top-performing videos
    const existingTags = videosData.flatMap((v: any) => v.tags || []).slice(0, 20);

    const insights: ChannelInsights = {
      channelName: null,
      subscriberCount: null,
      avgViews: 0,
      avgEngagement: 0,
      topTitles: videosData.map((v: any) => v.title),
      bottomTitles: [],
      dnaData: dnaData as any,
    };

    const dnaContext = buildDNAContext(insights);

    const systemPrompt = `${CORE_INTELLIGENCE_DIRECTIVE}

${dnaContext}

${ANTI_ROBOT_DIRECTIVE}

=== TAG INTELLIGENCE TASK ===

You are a YouTube Tag Strategist with deep SEO expertise.

YOUR ROLE:
Generate tags that align with this channel's identity AND maximize discoverability.
Tags should reflect the channel's niche positioning, not generic keywords.

${existingTags.length > 0 ? `
TAGS FROM TOP-PERFORMING VIDEOS (Reference these patterns):
${existingTags.slice(0, 15).join(', ')}
` : ''}

TAG STRATEGY:

1. BROAD TAGS (5): High-volume terms that establish category
   - Must relate to channel's core niche
   - Think: What would someone search if they've never heard of this channel?

2. SPECIFIC TAGS (15): Targeted keywords for this exact video
   - Include variations and synonyms
   - Match the video's specific angle/approach
   - Reference channel's proven power words if relevant

3. LONG-TAIL TAGS (10): Low-competition, high-intent phrases
   - "How to [specific thing] for [specific audience]"
   - Question-format tags that match search intent
   - Niche-specific combinations

QUALITY REQUIREMENTS:
- Total character count under 450 characters
- No hashtags or special characters in tags
- Mix single words and 2-4 word phrases
- Prioritize discoverability over cleverness

Return ONLY valid JSON in this exact format:
{
  "broad": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "specific": ["tag1", "tag2", ...],
  "longTail": ["tag1", "tag2", ...],
  "strategy": "One sentence explaining the tag strategy for this video"
}`;

    const userPrompt = `Generate intelligent YouTube tags for:

VIDEO TITLE: ${title}
DESCRIPTION: ${description || 'Not provided'}
CATEGORY: ${category || 'General'}

Create tags that will help this video get discovered while staying aligned with the channel's identity.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'openai/gpt-5',
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
      throw new Error('Failed to parse tags from response');
    }
    
    const tags = JSON.parse(jsonMatch[0]);

    return new Response(JSON.stringify({ 
      tags,
      personalizedWithDNA: !!dnaData,
      generatedAt: new Date().toISOString()
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-tags function');
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
