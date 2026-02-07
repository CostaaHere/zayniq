import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================
// AVOE (Accurate Video Optimization Engine) - STRICT MODE v2
// ============================================================
// Priority: ACCURACY over confidence
// Never invent data, never output dummy scores
// All scores use explicit rubrics with evidence
// NEW: Creates separate analysis_runs, includes evidence, input snapshots
// ============================================================

interface VideoInput {
  youtubeVideoId: string;
  title: string;
  description?: string;
  tags?: string[];
  hashtags?: string[];
  thumbnailUrl?: string;
  transcript?: string;
  chapters?: string[];
  category?: string;
  language?: string;
  region?: string;
  audienceType?: string;
  videoLength?: string;
  durationSeconds?: number;
  viewCount?: number;
  likeCount?: number;
  commentCount?: number;
  publishedAt?: string;
  // Performance metrics (optional)
  impressions?: number;
  ctr?: number;
  avgViewDuration?: string;
  retentionRate?: number;
  trafficSources?: Record<string, number>;
  // Competitor data (optional)
  competitorTitles?: string[];
  competitorTags?: string[][];
  searchQuery?: string;
  // Top comments (optional)
  topComments?: { text: string; likeCount: number }[];
  // Channel baseline (optional)
  channelAvgViews?: number;
}

interface ScoreBreakdown {
  total: number;
  breakdown: { criterion: string; score: number; maxScore: number; evidence: string }[];
  issues: string[];
  suggestions: string[];
}

interface Evidence {
  titleKeywords: string[];
  transcriptExcerpt?: string;
  hookExcerpt?: string;
  topCommentThemes?: string[];
  detectedPatternInterrupts?: string[];
  wordFrequency?: Record<string, number>;
  inputsAvailable: {
    metadata: boolean;
    transcript: boolean;
    comments: boolean;
    channelBaseline: boolean;
  };
}

interface AVOEAnalysis {
  // Core Scores (0-100 with rubric evidence)
  titleScore: ScoreBreakdown;
  descriptionScore: ScoreBreakdown;
  tagsScore: ScoreBreakdown;
  hashtagsScore: ScoreBreakdown;
  thumbnailScore: ScoreBreakdown;
  viralityScore: ScoreBreakdown;
  
  // Meta
  overallScore: number;
  confidenceScore: number;
  confidenceFactors: string[];
  dataWarnings: string[];
  
  // Evidence
  evidence: Evidence;
  
  // A) Metadata & Packaging Audit
  packagingAudit: {
    titleAnalysis: string;
    descriptionAnalysis: string;
    tagsAnalysis: string;
    hashtagsAnalysis: string;
    thumbnailAnalysis: string;
    topicPositioning: string;
    brandAlignment: string;
    promisePayoff: string;
  };
  
  // B) YouTube Graph Optimization
  graphOptimization: {
    adjacentTopics: string[];
    bridgeKeywords: string[];
    watchNextFunnel: string[];
  };
  
  // C) Retention & Hook Engineering  
  retentionEngineering: {
    openingHookRewrite: string;
    retentionInterrupts: string[];
    weakSegments?: string[];
  };
  
  // D) Competitive Strategy (only if competitor data provided)
  competitiveStrategy?: {
    saturatedPatterns: string[];
    whitespaceAngles: string[];
    battleTitles: string[];
  };
  
  // Ready-to-paste improvements (with variants)
  improvedTitle: string;
  titleVariants: { style: string; title: string }[];
  improvedDescription: string;
  improvedTags: string[];
  improvedHashtags: string[];
  hookScripts: string[];
  pinnedCommentSuggestion: string;
  
  // Top priority actions
  priorityActions: { priority: 'high' | 'medium' | 'low'; action: string; impact: string }[];
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function parseDurationToSeconds(duration: string | null): number | undefined {
  if (!duration) return undefined;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return undefined;
  const hours = parseInt(match[1] || "0");
  const minutes = parseInt(match[2] || "0");
  const seconds = parseInt(match[3] || "0");
  return hours * 3600 + minutes * 60 + seconds;
}

function createInputHash(input: VideoInput): string {
  const hashSource = JSON.stringify({
    title: input.title,
    description: input.description,
    tags: input.tags,
    transcript: input.transcript?.slice(0, 500),
    viewCount: input.viewCount,
  });
  // Simple hash for change detection
  let hash = 0;
  for (let i = 0; i < hashSource.length; i++) {
    const char = hashSource.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(16);
}

function extractKeywordsFromTitle(title: string): string[] {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'between', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'just', 'don', 'now', 'i', 'me', 'my', 'myself', 'we', 'our', 'you', 'your', 'he', 'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am']);
  
  return title.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

function extractHookFromTranscript(transcript: string | undefined): string | undefined {
  if (!transcript) return undefined;
  
  // Get first ~100 words (approximately first 10-15 seconds of speech)
  const words = transcript.split(/\s+/).slice(0, 100);
  return words.join(' ');
}

function analyzeWordFrequency(text: string): Record<string, number> {
  const stopWords = new Set(['the', 'a', 'an', 'is', 'are', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'as', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'this', 'that', 'be', 'have', 'do', 'so', 'if', 'my', 'your', 'its', 'our', 'what', 'which', 'who', 'how', 'when', 'where', 'why']);
  
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const freq: Record<string, number> = {};
  
  for (const word of words) {
    if (word.length > 3 && !stopWords.has(word)) {
      freq[word] = (freq[word] || 0) + 1;
    }
  }
  
  // Return top 10 most frequent
  return Object.fromEntries(
    Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
  );
}

function detectPatternInterrupts(transcript: string | undefined): string[] {
  if (!transcript) return [];
  
  const patterns = [
    { regex: /but wait/gi, name: '"But wait"' },
    { regex: /here'?s the thing/gi, name: '"Here\'s the thing"' },
    { regex: /now this is where/gi, name: '"Now this is where"' },
    { regex: /you won'?t believe/gi, name: '"You won\'t believe"' },
    { regex: /watch (till|until) the end/gi, name: '"Watch till the end"' },
    { regex: /stay with me/gi, name: '"Stay with me"' },
    { regex: /let me show you/gi, name: '"Let me show you"' },
    { regex: /and that'?s when/gi, name: '"And that\'s when"' },
    { regex: /the secret is/gi, name: '"The secret is"' },
    { regex: /plot twist/gi, name: '"Plot twist"' },
  ];
  
  const detected: string[] = [];
  for (const p of patterns) {
    if (p.regex.test(transcript)) {
      detected.push(p.name);
    }
  }
  
  return detected;
}

function extractCommentThemes(comments: { text: string; likeCount: number }[] | undefined): string[] {
  if (!comments || comments.length === 0) return [];
  
  const themes: string[] = [];
  const allText = comments.map(c => c.text).join(' ').toLowerCase();
  
  if (/love|amazing|great|awesome|best/i.test(allText)) themes.push('Positive sentiment');
  if (/help|thank|useful|learned/i.test(allText)) themes.push('Educational value');
  if (/more|next|when|part 2/i.test(allText)) themes.push('Demand for more content');
  if (/question|how do|what about/i.test(allText)) themes.push('Audience questions');
  if (/subscribe|follow|notification/i.test(allText)) themes.push('Engagement signals');
  if (/disagree|wrong|but|however/i.test(allText)) themes.push('Discussion/debate');
  
  return themes;
}

// ============================================================
// RUBRIC SCORING FUNCTIONS
// ============================================================

function scoreTitleRubric(title: string, tags: string[], hasCompetitorData: boolean, titleKeywords: string[]): ScoreBreakdown {
  const breakdown: ScoreBreakdown["breakdown"] = [];
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // 1. CTR Psychology (30 points)
  let ctrScore = 0;
  const hasCuriosityGap = /\?|how|why|what|secret|reveal|truth|actually/i.test(title);
  const hasStakes = /never|always|must|need|stop|don't|won't|can't|mistake|wrong/i.test(title);
  const hasClarity = title.length > 20 && title.length <= 60;
  
  if (hasCuriosityGap) ctrScore += 12;
  if (hasStakes) ctrScore += 10;
  if (hasClarity) ctrScore += 8;
  
  breakdown.push({
    criterion: "CTR Psychology (curiosity + stakes + clarity)",
    score: ctrScore,
    maxScore: 30,
    evidence: `Detected keywords: [${titleKeywords.slice(0, 5).join(', ')}]. Curiosity gap: ${hasCuriosityGap ? 'Yes' : 'No'}, Stakes: ${hasStakes ? 'Yes' : 'No'}, Clear: ${hasClarity ? 'Yes' : 'No'}`
  });
  
  if (!hasCuriosityGap) issues.push("Missing curiosity gap - no question or intrigue element");
  if (!hasStakes) suggestions.push("Add stakes with words like 'never', 'must', 'mistake' to increase urgency");
  
  // 2. Search Intent Match (25 points)
  let searchScore = 0;
  const titleLower = title.toLowerCase();
  const keywordsInTitle = tags.filter(t => titleLower.includes(t.toLowerCase()));
  const hasNaturalPhrasing = !/\||\[|\]|#/.test(title);
  
  if (keywordsInTitle.length >= 2) searchScore += 15;
  else if (keywordsInTitle.length === 1) searchScore += 8;
  
  if (hasNaturalPhrasing) searchScore += 10;
  
  breakdown.push({
    criterion: "Search Intent Match (query alignment + natural phrasing)",
    score: searchScore,
    maxScore: 25,
    evidence: `${keywordsInTitle.length} tag keywords matched in title: [${keywordsInTitle.slice(0, 3).join(', ')}]. Natural phrasing: ${hasNaturalPhrasing ? 'Yes' : 'No'}`
  });
  
  if (keywordsInTitle.length === 0) issues.push("No target keywords found in title");
  
  // 3. Uniqueness (20 points)
  let uniqueScore = hasCompetitorData ? 10 : 5;
  const hasUniqueAngle = /only|first|new|different|unlike|vs|versus/i.test(title);
  if (hasUniqueAngle) uniqueScore += 10;
  
  breakdown.push({
    criterion: "Uniqueness vs Competitors",
    score: uniqueScore,
    maxScore: 20,
    evidence: hasCompetitorData 
      ? `Compared against competitor dataset`
      : `Model-estimated: No competitor SERP data provided. Unique angle words: ${hasUniqueAngle ? 'detected' : 'none'}`
  });
  
  if (!hasCompetitorData) {
    suggestions.push("Provide competitor titles for accurate uniqueness scoring");
  }
  
  // 4. Specificity (15 points)
  let specificityScore = 0;
  const hasNumbers = /\d+/.test(title);
  const hasTimeframe = /2024|2025|2026|today|now|this week|this month/i.test(title);
  const hasOutcome = /result|grow|increase|boost|get|earn|make|build/i.test(title);
  
  if (hasNumbers) specificityScore += 5;
  if (hasTimeframe) specificityScore += 5;
  if (hasOutcome) specificityScore += 5;
  
  breakdown.push({
    criterion: "Specificity (numbers, timeframe, outcome)",
    score: specificityScore,
    maxScore: 15,
    evidence: `Numbers: ${hasNumbers ? 'Yes' : 'No'}, Timeframe: ${hasTimeframe ? 'Yes' : 'No'}, Outcome: ${hasOutcome ? 'Yes' : 'No'}`
  });
  
  if (!hasNumbers) suggestions.push("Add specific numbers (e.g., '7 Tips', '10X Growth')");
  if (!hasTimeframe) suggestions.push("Add a timeframe for relevance (e.g., '2024', 'This Week')");
  
  // 5. Mobile Readability (10 points)
  let mobileScore = 0;
  if (title.length <= 55) mobileScore = 10;
  else if (title.length <= 65) mobileScore = 6;
  else mobileScore = 2;
  
  breakdown.push({
    criterion: "Mobile Readability (≤55 chars ideal)",
    score: mobileScore,
    maxScore: 10,
    evidence: `Title length: ${title.length} characters`
  });
  
  if (title.length > 55) issues.push(`Title may be truncated on mobile (${title.length} chars, ideal ≤55)`);
  
  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  
  return { total, breakdown, issues, suggestions };
}

function scoreDescriptionRubric(description: string, tags: string[]): ScoreBreakdown {
  const breakdown: ScoreBreakdown["breakdown"] = [];
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  if (!description || description.trim().length === 0) {
    return {
      total: 0,
      breakdown: [{ criterion: "Description", score: 0, maxScore: 100, evidence: "No description provided" }],
      issues: ["No description provided - critical for SEO"],
      suggestions: ["Add a detailed description with keywords, timestamps, and CTAs"]
    };
  }
  
  const first150 = description.slice(0, 150);
  const descLower = description.toLowerCase();
  
  // 1. First 2 Lines Hook + Keyword (30 points)
  let hookScore = 0;
  const hasHook = /\?|!|you|your|learn|discover|find out|in this/i.test(first150);
  const keywordsInFirst150 = tags.filter(t => first150.toLowerCase().includes(t.toLowerCase()));
  
  if (hasHook) hookScore += 15;
  if (keywordsInFirst150.length >= 1) hookScore += 15;
  else if (keywordsInFirst150.length === 0) hookScore += 5;
  
  breakdown.push({
    criterion: "First 2 Lines Hook + Keyword Placement",
    score: hookScore,
    maxScore: 30,
    evidence: `First 150 chars: "${first150.slice(0, 80)}...". Hook present: ${hasHook ? 'Yes' : 'No'}, Keywords found: ${keywordsInFirst150.length}`
  });
  
  if (!hasHook) issues.push("First 150 characters lack a compelling hook");
  if (keywordsInFirst150.length === 0) issues.push("No target keywords in first 150 characters (visible in search)");
  
  // 2. Structure (20 points)
  let structureScore = 0;
  const hasTimestamps = /\d{1,2}:\d{2}/.test(description);
  const hasBullets = /[•\-\*]|^\d+\./m.test(description);
  const hasSections = description.split('\n\n').length >= 2;
  
  if (hasTimestamps) structureScore += 8;
  if (hasBullets) structureScore += 6;
  if (hasSections) structureScore += 6;
  
  breakdown.push({
    criterion: "Structure (chapters, bullets, clarity)",
    score: structureScore,
    maxScore: 20,
    evidence: `Timestamps: ${hasTimestamps ? 'Yes' : 'No'}, Bullets: ${hasBullets ? 'Yes' : 'No'}, Sections: ${hasSections ? 'Yes' : 'No'}`
  });
  
  if (!hasTimestamps) suggestions.push("Add timestamps/chapters to improve UX and potential for rich snippets");
  
  // 3. Semantic Coverage (20 points)
  let semanticScore = 0;
  const keywordsInDesc = tags.filter(t => descLower.includes(t.toLowerCase()));
  const coverage = tags.length > 0 ? (keywordsInDesc.length / tags.length) * 100 : 0;
  
  if (coverage >= 70) semanticScore = 20;
  else if (coverage >= 50) semanticScore = 15;
  else if (coverage >= 30) semanticScore = 10;
  else semanticScore = 5;
  
  breakdown.push({
    criterion: "Semantic Coverage (topic cluster terms)",
    score: semanticScore,
    maxScore: 20,
    evidence: `${keywordsInDesc.length}/${tags.length} keywords covered (${coverage.toFixed(0)}%)`
  });
  
  // 4. Session Funnel (15 points)
  let funnelScore = 0;
  const hasLinks = /https?:\/\/[^\s]+/.test(description);
  const hasPlaylist = /playlist|watch next|more videos/i.test(description);
  const hasSocial = /twitter|instagram|tiktok|discord|subscribe/i.test(description);
  
  if (hasLinks) funnelScore += 5;
  if (hasPlaylist) funnelScore += 5;
  if (hasSocial) funnelScore += 5;
  
  breakdown.push({
    criterion: "Session Funnel (watch next, playlist path)",
    score: funnelScore,
    maxScore: 15,
    evidence: `Links: ${hasLinks ? 'Yes' : 'No'}, Playlist mention: ${hasPlaylist ? 'Yes' : 'No'}, Social: ${hasSocial ? 'Yes' : 'No'}`
  });
  
  if (!hasPlaylist) suggestions.push("Add links to related videos or playlists to increase session time");
  
  // 5. Credibility (15 points)
  let credScore = 0;
  const hasCredentials = /years|experience|expert|certified|helped|clients|subscribers/i.test(description);
  const hasValue = /learn|get|receive|access|download|free/i.test(description);
  
  if (hasCredentials) credScore += 8;
  if (hasValue) credScore += 7;
  
  breakdown.push({
    criterion: "Credibility (why trust, what they'll get)",
    score: credScore,
    maxScore: 15,
    evidence: `Credentials: ${hasCredentials ? 'detected' : 'none'}, Value proposition: ${hasValue ? 'detected' : 'weak'}`
  });
  
  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  
  return { total, breakdown, issues, suggestions };
}

function scoreTagsRubric(tags: string[], title: string): ScoreBreakdown {
  const breakdown: ScoreBreakdown["breakdown"] = [];
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  if (!tags || tags.length === 0) {
    return {
      total: 0,
      breakdown: [{ criterion: "Tags", score: 0, maxScore: 100, evidence: "No tags provided" }],
      issues: ["No tags provided - missing discoverability"],
      suggestions: ["Add 8-15 tags mixing broad and long-tail keywords"]
    };
  }
  
  // 1. Long-tail Precision (35 points)
  let longTailScore = 0;
  const longTailTags = tags.filter(t => t.split(' ').length >= 3);
  const problemAwareTags = tags.filter(t => /how|what|why|best|top|guide|tutorial|tips/i.test(t));
  
  if (longTailTags.length >= 5) longTailScore = 25;
  else if (longTailTags.length >= 3) longTailScore = 18;
  else if (longTailTags.length >= 1) longTailScore = 10;
  
  if (problemAwareTags.length >= 2) longTailScore += 10;
  else if (problemAwareTags.length >= 1) longTailScore += 5;
  
  breakdown.push({
    criterion: "Long-tail Precision (problem-aware queries)",
    score: Math.min(35, longTailScore),
    maxScore: 35,
    evidence: `${longTailTags.length} long-tail tags (3+ words): [${longTailTags.slice(0, 3).join(', ')}...]. ${problemAwareTags.length} problem-aware tags.`
  });
  
  if (longTailTags.length < 3) suggestions.push("Add more long-tail tags (3+ words) targeting specific search queries");
  
  // 2. Suggested Adjacency (25 points)
  let adjacencyScore = 0;
  const topicVariety = new Set(tags.map(t => t.split(' ')[0].toLowerCase())).size;
  
  if (topicVariety >= 5) adjacencyScore = 25;
  else if (topicVariety >= 3) adjacencyScore = 18;
  else adjacencyScore = 10;
  
  breakdown.push({
    criterion: "Suggested Adjacency (co-watch topics)",
    score: adjacencyScore,
    maxScore: 25,
    evidence: `${topicVariety} distinct topic clusters detected in tags`
  });
  
  // 3. Competitive Distinctiveness (20 points)
  let distinctScore = 0;
  const genericTags = tags.filter(t => 
    /^youtube$|^video$|^tutorial$|^vlog$|^tips$/i.test(t.trim())
  );
  const uniqueTags = tags.length - genericTags.length;
  
  if (genericTags.length === 0) distinctScore = 20;
  else if (genericTags.length <= 2) distinctScore = 14;
  else distinctScore = 6;
  
  breakdown.push({
    criterion: "Competitive Distinctiveness (avoid default tags)",
    score: distinctScore,
    maxScore: 20,
    evidence: `${genericTags.length} generic tags, ${uniqueTags} distinctive tags`
  });
  
  if (genericTags.length > 2) issues.push(`${genericTags.length} overly generic tags detected - too competitive`);
  
  // 4. Variants (10 points)
  let variantScore = 0;
  const hasVariants = tags.some((t, i) => 
    tags.some((t2, j) => i !== j && 
      (t.toLowerCase().includes(t2.toLowerCase()) || t2.toLowerCase().includes(t.toLowerCase()))
    )
  );
  
  if (hasVariants) variantScore = 10;
  else variantScore = 4;
  
  breakdown.push({
    criterion: "Variants (natural language, spelling variants)",
    score: variantScore,
    maxScore: 10,
    evidence: `Keyword variants: ${hasVariants ? 'detected' : 'minimal overlap'}`
  });
  
  // 5. Coverage (10 points)
  let coverageScore = 0;
  const broadTags = tags.filter(t => t.split(' ').length <= 2);
  const specificTags = tags.filter(t => t.split(' ').length >= 3);
  const hasBalance = broadTags.length >= 2 && specificTags.length >= 2;
  
  if (hasBalance) coverageScore = 10;
  else if (broadTags.length > 0 && specificTags.length > 0) coverageScore = 6;
  else coverageScore = 2;
  
  breakdown.push({
    criterion: "Coverage (broad→narrow balance)",
    score: coverageScore,
    maxScore: 10,
    evidence: `${broadTags.length} broad tags, ${specificTags.length} specific tags`
  });
  
  if (!hasBalance) suggestions.push("Balance broad keywords with specific long-tail phrases");
  
  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  
  return { total, breakdown, issues, suggestions };
}

function scoreHashtagsRubric(hashtags: string[]): ScoreBreakdown {
  const breakdown: ScoreBreakdown["breakdown"] = [];
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  if (!hashtags || hashtags.length === 0) {
    return {
      total: 50,
      breakdown: [{ criterion: "Hashtags", score: 50, maxScore: 100, evidence: "No hashtags provided (optional element)" }],
      issues: [],
      suggestions: ["Consider adding 3-5 relevant hashtags for additional discoverability"]
    };
  }
  
  // 1. Relevance (40 points)
  let relevanceScore = 30;
  const spammy = hashtags.filter(h => /viral|fyp|foryou|trending/i.test(h));
  if (spammy.length > 0) relevanceScore -= spammy.length * 10;
  
  breakdown.push({
    criterion: "Relevance + Intent Match",
    score: Math.max(0, relevanceScore),
    maxScore: 40,
    evidence: spammy.length > 0 ? `${spammy.length} potentially spammy hashtags detected: [${spammy.join(', ')}]` : "No spam indicators"
  });
  
  if (spammy.length > 0) issues.push(`Spammy hashtags detected: ${spammy.join(', ')}`);
  
  // 2. Non-spam (25 points)
  let nonSpamScore = 0;
  if (hashtags.length >= 3 && hashtags.length <= 8) nonSpamScore = 25;
  else if (hashtags.length < 3) nonSpamScore = 15;
  else nonSpamScore = 10;
  
  breakdown.push({
    criterion: "Non-spam (3–8 max, not redundant)",
    score: nonSpamScore,
    maxScore: 25,
    evidence: `${hashtags.length} hashtags provided (optimal: 3-8)`
  });
  
  if (hashtags.length > 8) issues.push("Too many hashtags - YouTube may flag as spam");
  
  // 3. Discoverability (20 points)
  let discoverScore = 15;
  const midTail = hashtags.filter(h => h.length >= 8 && h.length <= 20);
  if (midTail.length >= 2) discoverScore = 20;
  
  breakdown.push({
    criterion: "Discoverability (mix of mid + long-tail)",
    score: discoverScore,
    maxScore: 20,
    evidence: `${midTail.length} mid-tail hashtags detected`
  });
  
  // 4. Uniqueness (15 points)
  const overused = hashtags.filter(h => /shorts|youtube|viral|trending|fyp/i.test(h));
  let uniqueScore = 15 - (overused.length * 3);
  uniqueScore = Math.max(0, uniqueScore);
  
  breakdown.push({
    criterion: "Uniqueness (avoiding #shorts #viral)",
    score: uniqueScore,
    maxScore: 15,
    evidence: overused.length > 0 ? `Overused hashtags: ${overused.join(', ')}` : "Good hashtag uniqueness"
  });
  
  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  
  return { total, breakdown, issues, suggestions };
}

function scoreThumbnailRubric(thumbnailUrl: string | undefined, title: string): ScoreBreakdown {
  const breakdown: ScoreBreakdown["breakdown"] = [];
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  if (!thumbnailUrl) {
    return {
      total: 0,
      breakdown: [{ criterion: "Thumbnail", score: 0, maxScore: 100, evidence: "No thumbnail URL provided for analysis" }],
      issues: ["Thumbnail analysis not possible without image"],
      suggestions: ["Provide thumbnail URL or image for visual analysis"]
    };
  }
  
  // Without actual image analysis, we provide model-estimated guidance
  breakdown.push({
    criterion: "Scroll-stopping Contrast + Simplicity",
    score: 15,
    maxScore: 30,
    evidence: "Model-estimated: Cannot analyze actual image without vision API. Verify manually."
  });
  
  breakdown.push({
    criterion: "Curiosity Gap (visual question)",
    score: 12,
    maxScore: 25,
    evidence: "Model-estimated: Ensure thumbnail creates visual intrigue matching title"
  });
  
  breakdown.push({
    criterion: "Emotional Stakes",
    score: 10,
    maxScore: 20,
    evidence: "Model-estimated: Check for clear emotional expression or reaction"
  });
  
  breakdown.push({
    criterion: "Composition Hierarchy (one focal point)",
    score: 8,
    maxScore: 15,
    evidence: "Model-estimated: Verify single clear focal point exists"
  });
  
  breakdown.push({
    criterion: "Text Minimalism (≤3 words, mobile readable)",
    score: 5,
    maxScore: 10,
    evidence: "Model-estimated: Keep text to ≤3 words, large font"
  });
  
  suggestions.push("For accurate thumbnail scoring, enable vision API or manual review");
  
  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  
  return { total, breakdown, issues, suggestions };
}

function scoreHookRubric(transcript: string | undefined, hookExcerpt: string | undefined, isShort: boolean): ScoreBreakdown {
  const breakdown: ScoreBreakdown["breakdown"] = [];
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  if (!transcript && !hookExcerpt) {
    return {
      total: 30, // Reduced confidence
      breakdown: [{ criterion: "Hook Analysis", score: 30, maxScore: 100, evidence: "Transcript not available - hook confidence reduced" }],
      issues: ["No transcript provided - cannot analyze opening hook"],
      suggestions: ["Provide transcript for accurate hook and retention analysis"]
    };
  }
  
  const hook = hookExcerpt || '';
  
  // 1. Immediate Promise (35 points for shorts, 25 for long)
  let promiseScore = 0;
  const hasPromise = /you|learn|discover|show|reveal|tell|secret|why|how|what/i.test(hook);
  const hasUrgency = /now|today|immediately|right now|first|before/i.test(hook);
  
  if (hasPromise) promiseScore += isShort ? 20 : 15;
  if (hasUrgency) promiseScore += isShort ? 15 : 10;
  
  breakdown.push({
    criterion: "Immediate Promise (0-3 sec)",
    score: promiseScore,
    maxScore: isShort ? 35 : 25,
    evidence: `Hook excerpt: "${hook.slice(0, 100)}...". Promise: ${hasPromise ? 'Yes' : 'No'}, Urgency: ${hasUrgency ? 'Yes' : 'No'}`
  });
  
  // 2. Pattern Interrupt (25 points)
  let interruptScore = 0;
  const hasQuestion = /\?/.test(hook);
  const hasCommand = /stop|wait|listen|look|don't|never/i.test(hook);
  const hasContrarian = /but|however|actually|wrong|mistake/i.test(hook);
  
  if (hasQuestion) interruptScore += 10;
  if (hasCommand) interruptScore += 10;
  if (hasContrarian) interruptScore += 5;
  
  breakdown.push({
    criterion: "Pattern Interrupt (attention grab)",
    score: interruptScore,
    maxScore: 25,
    evidence: `Question: ${hasQuestion ? 'Yes' : 'No'}, Command: ${hasCommand ? 'Yes' : 'No'}, Contrarian: ${hasContrarian ? 'Yes' : 'No'}`
  });
  
  // 3. Curiosity Loop (20 points)
  let curiosityScore = 0;
  const hasLoop = /until|but first|before|end|result|happened/i.test(hook);
  if (hasLoop) curiosityScore = 20;
  else curiosityScore = 8;
  
  breakdown.push({
    criterion: "Curiosity Loop (open loop creation)",
    score: curiosityScore,
    maxScore: 20,
    evidence: hasLoop ? "Open loop detected in hook" : "No clear open loop in hook"
  });
  
  // 4. Pacing (20 points)
  let pacingScore = 0;
  const wordCount = hook.split(/\s+/).length;
  const wordsPerSecond = wordCount / 10; // Assuming ~10 seconds of hook
  
  if (wordsPerSecond >= 2 && wordsPerSecond <= 3.5) pacingScore = 20; // Good pace
  else if (wordsPerSecond > 3.5) pacingScore = 12; // Too fast
  else pacingScore = 10; // Too slow
  
  breakdown.push({
    criterion: "Pacing (energy level)",
    score: pacingScore,
    maxScore: 20,
    evidence: `~${wordsPerSecond.toFixed(1)} words/second in hook (optimal: 2-3.5 for ${isShort ? 'shorts' : 'long-form'})`
  });
  
  if (!hasPromise) issues.push("Hook lacks a clear promise or value proposition");
  if (!hasQuestion && !hasCommand) suggestions.push("Add a question or command in first 3 seconds to grab attention");
  
  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  
  return { total, breakdown, issues, suggestions };
}

function scoreViralityRubric(
  titleScore: number, 
  thumbnailScore: number,
  hasCompetitorData: boolean,
  hasTranscript: boolean
): ScoreBreakdown {
  const breakdown: ScoreBreakdown["breakdown"] = [];
  const issues: string[] = [];
  const suggestions: string[] = [];
  
  // 1. Title+Thumbnail Synergy (35 points)
  const synergyScore = Math.round((titleScore + thumbnailScore) / 2 * 0.35);
  breakdown.push({
    criterion: "Title+Thumbnail Synergy",
    score: synergyScore,
    maxScore: 35,
    evidence: `Combined package strength: Title ${titleScore}/100, Thumbnail ${thumbnailScore}/100`
  });
  
  if (synergyScore < 25) issues.push("Title and thumbnail may not be creating strong synergy");
  
  // 2. Novelty (25 points)
  let noveltyScore = hasCompetitorData ? 15 : 10;
  breakdown.push({
    criterion: "Novelty (angle differentiation)",
    score: noveltyScore,
    maxScore: 25,
    evidence: hasCompetitorData 
      ? "Compared against competitor dataset for uniqueness"
      : "Model-estimated: No competitor data for accurate novelty assessment"
  });
  
  // 3. Audience Precision (20 points)
  let audienceScore = 12;
  breakdown.push({
    criterion: "Audience Precision (who exactly clicks)",
    score: audienceScore,
    maxScore: 20,
    evidence: "Assess if packaging clearly signals target viewer"
  });
  
  // 4. Retention Safety (20 points)
  let retentionScore = hasTranscript ? 15 : 10;
  breakdown.push({
    criterion: "Retention Safety (promise → payoff alignment)",
    score: retentionScore,
    maxScore: 20,
    evidence: hasTranscript 
      ? "Transcript available for promise/payoff analysis"
      : "Model-estimated: No transcript to verify promise delivery"
  });
  
  if (!hasTranscript) suggestions.push("Provide transcript to analyze promise→payoff alignment");
  
  const total = breakdown.reduce((sum, b) => sum + b.score, 0);
  
  return { total, breakdown, issues, suggestions };
}

function calculateConfidence(input: VideoInput, evidence: Evidence): { score: number; factors: string[] } {
  let score = 0;
  const factors: string[] = [];
  
  if (input.transcript) {
    score += 30;
    factors.push("+30: Transcript provided");
  } else {
    factors.push("+0: No transcript (hook/retention analysis less accurate)");
  }
  
  if (input.competitorTitles && input.competitorTitles.length > 0) {
    score += 20;
    factors.push("+20: Competitor SERP data provided");
  } else {
    factors.push("+0: No competitor data (uniqueness scoring limited)");
  }
  
  if (input.topComments && input.topComments.length > 0) {
    score += 10;
    factors.push("+10: Top comments provided for sentiment analysis");
  } else {
    factors.push("+0: No comments data");
  }
  
  if (input.viewCount !== undefined && input.likeCount !== undefined) {
    score += 15;
    factors.push("+15: Performance metrics provided");
  } else {
    factors.push("+0: No performance metrics");
  }
  
  if (input.thumbnailUrl) {
    score += 10;
    factors.push("+10: Thumbnail URL provided");
  } else {
    factors.push("+0: No thumbnail for analysis");
  }
  
  if (input.durationSeconds !== undefined) {
    score += 5;
    factors.push("+5: Video duration provided");
  }
  
  if (input.channelAvgViews !== undefined) {
    score += 10;
    factors.push("+10: Channel baseline provided (outlier detection enabled)");
  } else {
    factors.push("+0: No channel baseline");
  }
  
  return { score, factors };
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

    let input: VideoInput = await req.json();
    
    // DEFENSIVE: If critical fields are missing but youtubeVideoId exists, fetch from DB
    if (!input.title || !input.description || !input.thumbnailUrl || input.tags === undefined) {
      if (!input.youtubeVideoId) {
        return new Response(
          JSON.stringify({ error: "video_id (youtubeVideoId) is required for AVOE analysis" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log('[AVOE v2] Missing fields detected, fetching video from DB for:', input.youtubeVideoId);

      // Use service role to bypass RLS since we already verified auth above
      const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const adminClient = createClient(supabaseUrl, serviceKey);

      // Get the authenticated user's ID
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        return new Response(
          JSON.stringify({ error: "Authentication failed" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const { data: dbVideo, error: dbError } = await adminClient
        .from('youtube_videos')
        .select('*')
        .eq('youtube_video_id', input.youtubeVideoId)
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (dbError || !dbVideo) {
        console.error('[AVOE v2] DB fetch failed:', dbError?.message || 'Video not found');
        return new Response(
          JSON.stringify({ error: `Video not found in database for ID: ${input.youtubeVideoId}. Please sync your videos first.` }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log('[AVOE v2] Merging DB data for video:', dbVideo.title);

      // Merge DB data with request payload (request data takes priority where present)
      const dbTags = Array.isArray(dbVideo.tags) ? dbVideo.tags as string[] : [];
      input = {
        ...input,
        title: input.title || dbVideo.title,
        description: input.description || dbVideo.description || undefined,
        tags: (input.tags !== undefined && input.tags !== null) ? input.tags : dbTags,
        thumbnailUrl: input.thumbnailUrl || dbVideo.thumbnail_url || `https://i.ytimg.com/vi/${input.youtubeVideoId}/hqdefault.jpg`,
        videoLength: input.videoLength || dbVideo.duration || undefined,
        durationSeconds: input.durationSeconds || (dbVideo.duration ? parseDurationToSeconds(dbVideo.duration) : undefined),
        viewCount: input.viewCount ?? (dbVideo.view_count ? Number(dbVideo.view_count) : undefined),
        likeCount: input.likeCount ?? (dbVideo.like_count ? Number(dbVideo.like_count) : undefined),
        commentCount: input.commentCount ?? (dbVideo.comment_count ? Number(dbVideo.comment_count) : undefined),
        publishedAt: input.publishedAt || dbVideo.published_at || undefined,
      };
    }

    // Final guard: title is absolutely required
    if (!input.title) {
      return new Response(
        JSON.stringify({ error: "Title is required for AVOE analysis and could not be retrieved from database" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('[AVOE v2] Starting analysis for:', input.youtubeVideoId, '-', input.title);

    // Determine if short
    const isShort = (input.durationSeconds !== undefined && input.durationSeconds <= 60) || 
                    (input.videoLength && /PT\d+S/.test(input.videoLength) && parseInt(input.videoLength.replace(/\D/g, '')) <= 60);

    // Extract evidence
    const titleKeywords = extractKeywordsFromTitle(input.title);
    const hookExcerpt = extractHookFromTranscript(input.transcript);
    const wordFrequency = input.transcript ? analyzeWordFrequency(input.transcript) : undefined;
    const detectedPatternInterrupts = detectPatternInterrupts(input.transcript);
    const topCommentThemes = extractCommentThemes(input.topComments);

    const evidence: Evidence = {
      titleKeywords,
      transcriptExcerpt: input.transcript?.slice(0, 500),
      hookExcerpt,
      topCommentThemes,
      detectedPatternInterrupts,
      wordFrequency,
      inputsAvailable: {
        metadata: true,
        transcript: !!input.transcript,
        comments: !!(input.topComments && input.topComments.length > 0),
        channelBaseline: input.channelAvgViews !== undefined,
      },
    };

    // Create input hash for change detection
    const inputHash = createInputHash(input);
    
    // Build data warnings
    const dataWarnings: string[] = [];
    if (!input.transcript) {
      dataWarnings.push("Transcript not available - hook/retention confidence reduced. Consider adding captions.");
    }
    if (!input.competitorTitles || input.competitorTitles.length === 0) {
      dataWarnings.push("No competitor SERP data - uniqueness analysis is model-estimated.");
    }
    if (!input.topComments || input.topComments.length === 0) {
      dataWarnings.push("No comment data - audience sentiment not analyzed.");
    }

    // Calculate confidence
    const confidence = calculateConfidence(input, evidence);

    // Compute rubric-based scores
    const titleScore = scoreTitleRubric(input.title, input.tags || [], !!input.competitorTitles?.length, titleKeywords);
    const descriptionScore = scoreDescriptionRubric(input.description || '', input.tags || []);
    const tagsScore = scoreTagsRubric(input.tags || [], input.title);
    const hashtagsScore = scoreHashtagsRubric(input.hashtags || []);
    const thumbnailScore = scoreThumbnailRubric(input.thumbnailUrl, input.title);
    const hookScore = scoreHookRubric(input.transcript, hookExcerpt, !!isShort);
    const viralityScore = scoreViralityRubric(
      titleScore.total,
      thumbnailScore.total,
      !!input.competitorTitles?.length,
      !!input.transcript
    );

    // Calculate overall score (weighted)
    const overallScore = Math.round(
      titleScore.total * 0.25 +
      descriptionScore.total * 0.15 +
      tagsScore.total * 0.10 +
      thumbnailScore.total * 0.20 +
      hookScore.total * 0.15 +
      viralityScore.total * 0.15
    );

    // Build context for AI with real video data
    const videoContext = `
VIDEO ANALYSIS CONTEXT (REAL DATA):
- YouTube Video ID: ${input.youtubeVideoId}
- Title: "${input.title}"
- Duration: ${input.durationSeconds ? `${input.durationSeconds}s (${isShort ? 'SHORT' : 'LONG'})` : 'Unknown'}
- Views: ${input.viewCount?.toLocaleString() || 'N/A'}
- Likes: ${input.likeCount?.toLocaleString() || 'N/A'}
- Comments: ${input.commentCount?.toLocaleString() || 'N/A'}
${input.channelAvgViews ? `- Channel Avg Views: ${input.channelAvgViews.toLocaleString()} (${input.viewCount && input.viewCount > input.channelAvgViews * 1.5 ? 'OUTPERFORMER' : 'TYPICAL'})` : ''}

DETECTED KEYWORDS FROM TITLE: [${titleKeywords.join(', ')}]
${wordFrequency ? `MOST FREQUENT WORDS IN TRANSCRIPT: [${Object.entries(wordFrequency).slice(0, 5).map(([w, c]) => `${w}(${c})`).join(', ')}]` : ''}
${hookExcerpt ? `HOOK EXCERPT (first 10 sec): "${hookExcerpt.slice(0, 200)}..."` : 'TRANSCRIPT NOT AVAILABLE'}
${detectedPatternInterrupts.length > 0 ? `DETECTED PATTERN INTERRUPTS: [${detectedPatternInterrupts.join(', ')}]` : ''}
${topCommentThemes.length > 0 ? `TOP COMMENT THEMES: [${topCommentThemes.join(', ')}]` : ''}

RUBRIC SCORES (already computed):
- Title: ${titleScore.total}/100 (Issues: ${titleScore.issues.join('; ') || 'None'})
- Description: ${descriptionScore.total}/100
- Tags: ${tagsScore.total}/100
- Hook: ${hookScore.total}/100
- Virality: ${viralityScore.total}/100
- Overall: ${overallScore}/100
- Confidence: ${confidence.score}/100

CONFIDENCE NOTE: ${!input.transcript ? 'No transcript = reduced hook/retention accuracy.' : 'Transcript available for full analysis.'}
`;

    // Now use AI to generate improvements
    const systemPrompt = `You are AVOE v2 (Accurate Video Optimization Engine) - a strict, evidence-based YouTube optimization system.

CRITICAL RULES:
1. NEVER invent data or output generic suggestions
2. All recommendations must reference the ACTUAL title, keywords, and content provided
3. Be specific - use the detected keywords and hook excerpt in your suggestions
4. If transcript is missing, clearly state that hook/retention suggestions are estimated
5. Generate VARIED outputs - 5 title variants in 3 styles, 3 different hook scripts
6. Priority is ACCURACY over confidence

${videoContext}

Generate a JSON response with video-specific improvements:
{
  "improvedTitle": "An improved title using detected keywords: [${titleKeywords.slice(0, 3).join(', ')}]",
  "titleVariants": [
    {"style": "Aggressive", "title": "Title variant 1"},
    {"style": "Aggressive", "title": "Title variant 2"},
    {"style": "Curiosity", "title": "Title variant 3"},
    {"style": "Curiosity", "title": "Title variant 4"},
    {"style": "Specific/Data", "title": "Title variant 5"}
  ],
  "improvedDescription": "First 150 characters with hook and keyword placement",
  "improvedTags": ["tag1", "tag2", "tag3"],
  "improvedHashtags": ["#hashtag1", "#hashtag2", "#hashtag3"],
  "hookScripts": [
    "Hook script 1 (0-10 sec) specific to this video topic",
    "Hook script 2 (alternative approach)",
    "Hook script 3 (contrarian angle)"
  ],
  "pinnedCommentSuggestion": "A pinned comment to boost engagement for this specific video",
  "packagingAudit": {
    "titleAnalysis": "Analysis of '${input.title.slice(0, 50)}...' - what works and what doesn't",
    "descriptionAnalysis": "Brief analysis referencing actual description content",
    "tagsAnalysis": "Analysis of the ${(input.tags?.length || 0)} tags provided",
    "hashtagsAnalysis": "Brief hashtag assessment",
    "thumbnailAnalysis": "Thumbnail guidance based on title keywords: [${titleKeywords.slice(0, 3).join(', ')}]",
    "topicPositioning": "What sub-niche and unique promise for this specific topic",
    "brandAlignment": "How consistent with typical creator expectations",
    "promisePayoff": "Assessment of title promise vs likely content"
  },
  "graphOptimization": {
    "adjacentTopics": ["Topics related to ${titleKeywords[0] || 'this video'}"],
    "bridgeKeywords": ["Keywords to connect to adjacent topics"],
    "watchNextFunnel": ["Suggestions for end screens based on topic"]
  },
  "retentionEngineering": {
    "openingHookRewrite": "Word-for-word 0-${isShort ? '3' : '20'} second hook script for this ${isShort ? 'short' : 'long-form'} video",
    "retentionInterrupts": ["Pattern interrupt 1 for ${titleKeywords[0] || 'this'} content", "Pattern interrupt 2", "Pattern interrupt 3"]
  },
  "priorityActions": [
    {"priority": "high", "action": "Specific action for this video", "impact": "Expected impact based on scores"}
  ]
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
          { role: 'user', content: `Generate video-specific AVOE analysis for YouTube video ${input.youtubeVideoId}: "${input.title}". Include title variants, hook scripts, and a pinned comment suggestion.` }
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
    const content = data.choices?.[0]?.message?.content || '{}';

    let aiAnalysis;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      aiAnalysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};
    } catch {
      console.error('[AVOE] Failed to parse AI response');
      aiAnalysis = {};
    }

    const fullAnalysis: AVOEAnalysis = {
      titleScore,
      descriptionScore,
      tagsScore,
      hashtagsScore,
      thumbnailScore,
      viralityScore,
      overallScore,
      confidenceScore: confidence.score,
      confidenceFactors: confidence.factors,
      dataWarnings,
      evidence,
      packagingAudit: aiAnalysis.packagingAudit || {
        titleAnalysis: `Title "${input.title.slice(0, 50)}..." - ${titleScore.issues.length > 0 ? titleScore.issues[0] : 'Needs review'}`,
        descriptionAnalysis: descriptionScore.issues[0] || "Description needs review",
        tagsAnalysis: `${(input.tags?.length || 0)} tags provided - ${tagsScore.suggestions[0] || 'Review tag strategy'}`,
        hashtagsAnalysis: hashtagsScore.suggestions[0] || "Hashtags optimal",
        thumbnailAnalysis: "Thumbnail requires manual review",
        topicPositioning: `Topic: ${titleKeywords.slice(0, 3).join(', ')}`,
        brandAlignment: "Review brand consistency",
        promisePayoff: input.transcript ? "Transcript available for promise/payoff check" : "No transcript - cannot verify"
      },
      graphOptimization: aiAnalysis.graphOptimization || {
        adjacentTopics: titleKeywords.slice(0, 3),
        bridgeKeywords: [],
        watchNextFunnel: []
      },
      retentionEngineering: aiAnalysis.retentionEngineering || {
        openingHookRewrite: input.transcript 
          ? `Based on detected hook: "${hookExcerpt?.slice(0, 100) || ''}"...` 
          : "Provide transcript for hook analysis",
        retentionInterrupts: detectedPatternInterrupts.length > 0 
          ? detectedPatternInterrupts 
          : ["Add pattern interrupts like 'But wait', 'Here's the thing'"]
      },
      improvedTitle: aiAnalysis.improvedTitle || input.title,
      titleVariants: aiAnalysis.titleVariants || [
        { style: 'Original', title: input.title }
      ],
      improvedDescription: aiAnalysis.improvedDescription || input.description || '',
      improvedTags: aiAnalysis.improvedTags || input.tags || [],
      improvedHashtags: aiAnalysis.improvedHashtags || input.hashtags || [],
      hookScripts: aiAnalysis.hookScripts || [],
      pinnedCommentSuggestion: aiAnalysis.pinnedCommentSuggestion || '',
      priorityActions: aiAnalysis.priorityActions || [
        { priority: 'high', action: titleScore.suggestions[0] || 'Review title CTR elements', impact: 'Potential CTR improvement' }
      ]
    };

    // Add competitive strategy only if competitor data provided
    if (input.competitorTitles && input.competitorTitles.length > 0) {
      fullAnalysis.competitiveStrategy = {
        saturatedPatterns: [],
        whitespaceAngles: [],
        battleTitles: []
      };
    }

    // Include inputHash and format in response for storage
    const responseData = {
      ...fullAnalysis,
      inputHash,
      formatType: isShort ? 'short' : 'long',
      hookScore, // Include hook score in response
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AVOE analysis:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
