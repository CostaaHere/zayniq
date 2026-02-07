import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// VIRAL SEO ENGINE — YOUTUBE SUPREMACY MODE
// ============================================================
// Combines competitive intelligence, psychological CTR optimization,
// SEO saturation scoring, and auto-optimization.
// Target: Maximum SEO Score (100/100)
// ============================================================

interface SEOInput {
  video_id: string;
  current_title: string;
  current_description: string;
  current_tags: string[];
  video_type: 'short' | 'long';
  niche: string;
  language: string;
  region: string;
  channel_authority_level: 'new' | 'medium' | 'high';
  thumbnail_url?: string;
  view_count?: number;
  like_count?: number;
  comment_count?: number;
  duration_seconds?: number;
}

interface TitleCandidate {
  title: string;
  seo_strength: number;
  ctr_probability: number;
  competition_dominance: number;
  algorithm_friendliness: number;
  total_score: number;
  reasoning: string;
}

interface TagScore {
  tag: string;
  search_volume: 'high' | 'medium' | 'low';
  competition: 'high' | 'medium' | 'low';
  viral_probability: number;
}

interface SEOOutput {
  // Applied optimizations
  applied_title: string;
  applied_description: string;
  applied_tags: TagScore[];

  // Title candidates
  title_candidates: TitleCandidate[];

  // Scores
  title_seo_score: number;
  description_seo_score: number;
  tags_seo_score: number;
  thumbnail_ctr_score: number;
  competition_advantage: number;
  final_seo_score: number;

  // Predictions
  ctr_prediction: number;
  viral_probability: number;

  // Thumbnail analysis
  thumbnail_analysis: {
    title_alignment: number;
    curiosity_gap: number;
    emotion_clarity: number;
    mobile_readability: number;
    improvement_instructions: string[];
  };

  // Competitive intelligence
  competitive_intel: {
    power_words: string[];
    emotional_hooks: string[];
    keyword_patterns: string[];
    emoji_trends: string[];
    avg_title_length: number;
  };

  // Meta
  optimization_loops: number;
  engine_version: string;
}

// ============================================================
// DETERMINISTIC SCORING
// ============================================================

function scoreTitleSEO(title: string, primaryKeyword: string, secondaryKeyword: string): number {
  let score = 0;
  const lower = title.toLowerCase();
  const pkLower = primaryKeyword.toLowerCase();
  const skLower = secondaryKeyword.toLowerCase();

  // Primary keyword in first 3 words (25 pts)
  const words = lower.split(/\s+/);
  const pkWords = pkLower.split(/\s+/);
  const pkInFirst3 = pkWords.some(w => words.slice(0, 3).includes(w));
  if (pkInFirst3) score += 25;
  else if (lower.includes(pkLower)) score += 15;

  // Secondary keyword present (15 pts)
  if (skLower && lower.includes(skLower)) score += 15;
  else if (skLower) score += 5;

  // Length optimization (15 pts)
  if (title.length >= 40 && title.length <= 60) score += 15;
  else if (title.length >= 30 && title.length <= 70) score += 10;
  else score += 5;

  // Emotional trigger (15 pts)
  const emotionalWords = /shock|secret|truth|never|always|must|mistake|warning|exposed|finally|actually|insane|crazy|unbelievable/i;
  if (emotionalWords.test(title)) score += 15;

  // Curiosity element (10 pts)
  if (/\?|how|why|what if|the real|nobody|everyone/i.test(title)) score += 10;

  // Number/specificity (10 pts)
  if (/\d+/.test(title)) score += 10;

  // No pipe/bracket spam (10 pts)
  if (!/\||\[|\]/.test(title)) score += 10;
  else score += 3;

  return Math.min(100, score);
}

function scoreDescriptionSEO(desc: string, keywords: string[]): number {
  let score = 0;
  const lower = desc.toLowerCase();
  const first150 = lower.slice(0, 150);

  // Primary keyword in first 2 lines (25 pts)
  const pkInFirst = keywords.some(k => first150.includes(k.toLowerCase()));
  if (pkInFirst) score += 25;

  // Semantic keyword clustering - multiple keywords naturally (20 pts)
  const keywordsFound = keywords.filter(k => lower.includes(k.toLowerCase()));
  const coverage = keywords.length > 0 ? keywordsFound.length / keywords.length : 0;
  score += Math.round(coverage * 20);

  // No keyword stuffing - check density (15 pts)
  const wordCount = desc.split(/\s+/).length;
  const keywordMentions = keywords.reduce((sum, k) => {
    const regex = new RegExp(k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return sum + (desc.match(regex)?.length || 0);
  }, 0);
  const density = wordCount > 0 ? keywordMentions / wordCount : 0;
  if (density > 0.01 && density < 0.04) score += 15; // Natural density
  else if (density <= 0.01) score += 8; // Under-optimized
  else score += 5; // Over-stuffed

  // Viewer retention hooks (15 pts)
  if (/you('ll| will)|learn|discover|find out|in this video/i.test(desc)) score += 8;
  if (/watch|stay|don't miss|till the end/i.test(desc)) score += 7;

  // CTA for engagement (10 pts)
  if (/subscribe|like|comment|share|bell|notification/i.test(desc)) score += 10;

  // Structure (10 pts)
  if (/\d{1,2}:\d{2}/.test(desc)) score += 4; // Timestamps
  if (desc.split('\n').length >= 5) score += 3; // Multiple lines
  if (/https?:\/\//.test(desc)) score += 3; // Links

  // Readability (5 pts)
  const avgSentenceLen = desc.split(/[.!?]+/).filter(s => s.trim()).reduce((sum, s) => sum + s.split(/\s+/).length, 0) / Math.max(1, desc.split(/[.!?]+/).filter(s => s.trim()).length);
  if (avgSentenceLen < 20) score += 5;

  return Math.min(100, score);
}

function scoreTagsSEO(tags: string[]): number {
  if (!tags || tags.length === 0) return 0;
  let score = 0;

  // Count (20 pts) - optimal 15-30
  if (tags.length >= 15 && tags.length <= 30) score += 20;
  else if (tags.length >= 8 && tags.length <= 40) score += 12;
  else score += 5;

  // Exact-match vs partial (20 pts)
  const multiWord = tags.filter(t => t.split(' ').length >= 2);
  if (multiWord.length >= 10) score += 20;
  else if (multiWord.length >= 5) score += 12;
  else score += 5;

  // Long-tail (20 pts)
  const longTail = tags.filter(t => t.split(' ').length >= 3);
  if (longTail.length >= 8) score += 20;
  else if (longTail.length >= 4) score += 12;
  else score += 5;

  // No generic spam (20 pts)
  const generic = tags.filter(t => /^(video|youtube|viral|trending|fyp|shorts)$/i.test(t.trim()));
  score += Math.max(0, 20 - generic.length * 5);

  // Variety (20 pts)
  const uniqueFirstWords = new Set(tags.map(t => t.split(' ')[0].toLowerCase()));
  if (uniqueFirstWords.size >= 10) score += 20;
  else if (uniqueFirstWords.size >= 5) score += 12;
  else score += 5;

  return Math.min(100, score);
}

function scoreThumbnailCTR(thumbnailUrl: string | undefined, title: string): {
  score: number;
  title_alignment: number;
  curiosity_gap: number;
  emotion_clarity: number;
  mobile_readability: number;
} {
  if (!thumbnailUrl) return { score: 0, title_alignment: 0, curiosity_gap: 0, emotion_clarity: 0, mobile_readability: 0 };

  // Without vision API, estimate based on title psychology
  const hasCuriosity = /\?|secret|truth|reveal|how|why/i.test(title);
  const hasEmotion = /!|shock|insane|crazy|amazing|terrible|worst|best/i.test(title);
  const isShort = title.length <= 50;

  const title_alignment = 60 + (hasCuriosity ? 15 : 0) + (hasEmotion ? 10 : 0);
  const curiosity_gap = hasCuriosity ? 75 : 45;
  const emotion_clarity = hasEmotion ? 70 : 50;
  const mobile_readability = isShort ? 80 : 55;

  const score = Math.round((title_alignment + curiosity_gap + emotion_clarity + mobile_readability) / 4);

  return { score, title_alignment, curiosity_gap, emotion_clarity, mobile_readability };
}

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
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userId = claimsData.claims.sub;
    let input: SEOInput = await req.json();

    // DEFENSIVE: fetch from DB if fields missing
    if (!input.current_title && input.video_id) {
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const admin = createClient(supabaseUrl, serviceKey);

      const { data: dbVideo } = await admin
        .from('youtube_videos')
        .select('*')
        .eq('youtube_video_id', input.video_id)
        .eq('user_id', userId)
        .maybeSingle();

      if (dbVideo) {
        input = {
          ...input,
          current_title: input.current_title || dbVideo.title,
          current_description: input.current_description || dbVideo.description || '',
          current_tags: input.current_tags?.length ? input.current_tags : (Array.isArray(dbVideo.tags) ? dbVideo.tags as string[] : []),
          thumbnail_url: input.thumbnail_url || dbVideo.thumbnail_url || undefined,
          view_count: input.view_count ?? (dbVideo.view_count ? Number(dbVideo.view_count) : undefined),
          like_count: input.like_count ?? (dbVideo.like_count ? Number(dbVideo.like_count) : undefined),
          comment_count: input.comment_count ?? (dbVideo.comment_count ? Number(dbVideo.comment_count) : undefined),
        };
      }
    }

    if (!input.current_title || !input.video_id) {
      return new Response(
        JSON.stringify({ error: "video_id and current_title are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    console.log('[ViralSEO] Starting for:', input.video_id, '-', input.current_title);

    // Extract current keywords
    const stopWords = new Set(['the','a','an','is','are','was','were','be','been','have','has','had','do','does','did','will','would','could','should','to','of','in','for','on','with','at','by','from','as','i','me','my','we','you','your','he','she','it','they','this','that','how','what','why','when','where']);
    const titleKeywords = input.current_title.toLowerCase()
      .replace(/[^\w\s]/g, '').split(/\s+/)
      .filter(w => w.length > 2 && !stopWords.has(w));

    const primaryKeyword = titleKeywords[0] || input.niche || '';
    const secondaryKeyword = titleKeywords[1] || '';

    // ============================================================
    // CALL AI: Competitive Intelligence + Title Generation + Description + Tags
    // ============================================================
    const systemPrompt = `You are the VIRAL SEO ENGINE — an elite YouTube Growth AI.

MISSION: Achieve MAXIMUM SEO score (target = 100/100) for this video.

VIDEO DATA:
- Video ID: ${input.video_id}
- Current Title: "${input.current_title}"
- Current Description: "${input.current_description?.slice(0, 300) || 'None'}"
- Current Tags: [${(input.current_tags || []).slice(0, 15).join(', ')}]
- Type: ${input.video_type}
- Niche: ${input.niche || 'General'}
- Language: ${input.language || 'English'}
- Region: ${input.region || 'Global'}
- Channel Authority: ${input.channel_authority_level || 'medium'}
- Views: ${input.view_count?.toLocaleString() || 'N/A'}
- Likes: ${input.like_count?.toLocaleString() || 'N/A'}

DETECTED KEYWORDS: [${titleKeywords.join(', ')}]
PRIMARY KEYWORD: "${primaryKeyword}"
SECONDARY KEYWORD: "${secondaryKeyword}"

EXECUTE ALL STEPS:

1. COMPETITIVE INTELLIGENCE: Simulate top 20 ranking analysis for "${primaryKeyword}" on YouTube.
   Extract power words, emotional hooks, keyword patterns, emoji usage.

2. TITLE GENERATION: Generate 6 title candidates. Each MUST:
   - Primary keyword in positions 1-3
   - Emotional trigger (shock, curiosity, authority)
   - Optimized length for ${input.video_type === 'short' ? 'Shorts (≤50 chars)' : 'Long (40-60 chars)'}
   Score each on: seo_strength, ctr_probability, competition_dominance, algorithm_friendliness (0-100)
   
3. DESCRIPTION: Rewrite the description with:
   - Primary keyword in first 2 lines
   - Semantic keyword clustering
   - Viewer retention hooks
   - Engagement CTA
   - Timestamps placeholders
   Target: 100% keyword coverage, readability > 90

4. TAGS: Generate 30 tags:
   - Exact-match keywords
   - Partial-match variants
   - Long-tail viral phrases
   Score each: search_volume, competition, viral_probability

5. THUMBNAIL: Analyze title-thumbnail alignment and give improvement instructions.

Return ONLY valid JSON:
{
  "competitive_intel": {
    "power_words": ["word1", "word2", ...],
    "emotional_hooks": ["hook1", "hook2", ...],
    "keyword_patterns": ["pattern1", ...],
    "emoji_trends": ["emoji usage insight 1", ...],
    "avg_title_length": 48
  },
  "title_candidates": [
    {
      "title": "Optimized title",
      "seo_strength": 92,
      "ctr_probability": 88,
      "competition_dominance": 85,
      "algorithm_friendliness": 90,
      "reasoning": "Why this title wins"
    }
  ],
  "best_title": "The single highest scoring title",
  "optimized_description": "Full rewritten description with keywords and CTAs",
  "optimized_tags": [
    {"tag": "keyword phrase", "search_volume": "high", "competition": "low", "viral_probability": 85}
  ],
  "thumbnail_improvements": ["instruction 1", "instruction 2"],
  "ctr_prediction": 8.5,
  "viral_probability": 72
}`;

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
          { role: 'user', content: `Execute FULL Viral SEO Engine pipeline for video "${input.current_title}" in niche "${input.niche || 'General'}". Generate optimized title, description, 30 tags, and competitive intel. Target SEO 100/100.` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Add credits to continue.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error('AI service unavailable');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{}';

    let aiResult: any;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      aiResult = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      console.error('[ViralSEO] Failed to parse AI response');
      aiResult = {};
    }

    // Extract results
    const bestTitle = aiResult.best_title || aiResult.title_candidates?.[0]?.title || input.current_title;
    const optimizedDesc = aiResult.optimized_description || input.current_description;
    const optimizedTags: TagScore[] = (aiResult.optimized_tags || []).map((t: any) => ({
      tag: t.tag || t,
      search_volume: t.search_volume || 'medium',
      competition: t.competition || 'medium',
      viral_probability: t.viral_probability || 50,
    }));

    // Compute deterministic scores
    const titleSEO = scoreTitleSEO(bestTitle, primaryKeyword, secondaryKeyword);
    const allTagStrings = optimizedTags.map(t => t.tag);
    const descSEO = scoreDescriptionSEO(optimizedDesc, [...titleKeywords, ...allTagStrings.slice(0, 5)]);
    const tagsSEO = scoreTagsSEO(allTagStrings);
    const thumbnailResult = scoreThumbnailCTR(input.thumbnail_url, bestTitle);

    // Competition advantage (estimated from AI + authority)
    const authorityBonus = input.channel_authority_level === 'high' ? 15 : input.channel_authority_level === 'medium' ? 8 : 0;
    const competitionAdvantage = Math.min(100, 50 + authorityBonus + (titleSEO > 80 ? 15 : 0) + (tagsSEO > 70 ? 10 : 0));

    // Final unified SEO score
    const finalSEO = Math.round(
      titleSEO * 0.30 +
      descSEO * 0.25 +
      tagsSEO * 0.20 +
      thumbnailResult.score * 0.15 +
      competitionAdvantage * 0.10
    );

    const output: SEOOutput = {
      applied_title: bestTitle,
      applied_description: optimizedDesc,
      applied_tags: optimizedTags,

      title_candidates: (aiResult.title_candidates || []).map((tc: any) => ({
        title: tc.title,
        seo_strength: tc.seo_strength || 0,
        ctr_probability: tc.ctr_probability || 0,
        competition_dominance: tc.competition_dominance || 0,
        algorithm_friendliness: tc.algorithm_friendliness || 0,
        total_score: Math.round(((tc.seo_strength || 0) + (tc.ctr_probability || 0) + (tc.competition_dominance || 0) + (tc.algorithm_friendliness || 0)) / 4),
        reasoning: tc.reasoning || '',
      })),

      title_seo_score: titleSEO,
      description_seo_score: descSEO,
      tags_seo_score: tagsSEO,
      thumbnail_ctr_score: thumbnailResult.score,
      competition_advantage: competitionAdvantage,
      final_seo_score: finalSEO,

      ctr_prediction: aiResult.ctr_prediction || parseFloat((3 + (titleSEO / 20) + (thumbnailResult.score / 25)).toFixed(1)),
      viral_probability: aiResult.viral_probability || Math.min(95, Math.round(finalSEO * 0.8 + (input.view_count && input.view_count > 10000 ? 10 : 0))),

      thumbnail_analysis: {
        ...thumbnailResult,
        improvement_instructions: aiResult.thumbnail_improvements || [
          'Ensure high contrast between text and background',
          'Use expressive facial emotion if applicable',
          'Keep text to 3 words max, large font',
          'Create visual curiosity gap matching title',
        ],
      },

      competitive_intel: aiResult.competitive_intel || {
        power_words: titleKeywords,
        emotional_hooks: [],
        keyword_patterns: [],
        emoji_trends: [],
        avg_title_length: 48,
      },

      optimization_loops: 1,
      engine_version: 'v1.0',
    };

    // If score < 95, log that re-optimization could be run
    if (finalSEO < 95) {
      console.log(`[ViralSEO] Score ${finalSEO}/100 — below 95 target. Consider re-optimization.`);
    }

    return new Response(JSON.stringify(output), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[ViralSEO] Error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
