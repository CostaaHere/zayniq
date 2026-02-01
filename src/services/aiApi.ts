import { supabase } from "@/integrations/supabase/client";
import type { AVOEAnalysis, AVOEInput } from "@/types/avoe";

// Types for AI service responses
export interface GeneratedTitle {
  title: string;
  powerWords: string[];
}

export interface GeneratedDescription {
  description: string;
  hashtags: string[];
  callToAction: string;
  characterCount: number;
}

export interface GeneratedTags {
  broad: string[];
  specific: string[];
  longTail: string[];
}

export interface KeywordSuggestion {
  keyword: string;
  difficulty: 'low' | 'medium' | 'high';
}

export interface GeneratedKeywords {
  primary_keywords: KeywordSuggestion[];
  longtail_keywords: KeywordSuggestion[];
  question_keywords: KeywordSuggestion[];
  trending_topics: KeywordSuggestion[];
}

export interface SEOScore {
  score: number;
  issues: string[];
  suggestions: string[];
}

export interface SEOAnalysis {
  overallScore: number;
  scores: {
    title: SEOScore;
    description: SEOScore;
    tags: SEOScore;
    keywords: {
      score: number;
      primaryKeyword: string;
      keywordDensity: string;
      suggestions: string[];
    };
  };
  recommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: string;
    action: string;
    impact: string;
  }>;
  competitorInsights: {
    titlePatterns: string[];
    suggestedFormats: string[];
  };
}

export interface ContentIdea {
  title: string;
  description: string;
  viralScore: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  contentType: string;
  keyPoints: string[];
  thumbnailConcept: string;
  bestPostingTime: string;
}

export interface GeneratedContentIdeas {
  ideas: ContentIdea[];
  trendingTopics: Array<{
    topic: string;
    relevance: string;
  }>;
}

// Helper to handle API errors consistently
async function handleApiResponse<T>(response: { data: T | null; error: { message: string } | null }): Promise<T> {
  if (response.error) {
    throw new Error(response.error.message || 'An error occurred');
  }
  if (!response.data) {
    throw new Error('No data received');
  }
  return response.data as T;
}

/**
 * Generate viral YouTube titles
 * @param channelDNA - Optional Channel DNA string for personalization
 */
export async function generateTitles(
  topic: string,
  keyword?: string,
  tone: string = 'engaging',
  includeEmoji: boolean = false,
  channelDNA?: string
): Promise<GeneratedTitle[]> {
  const response = await supabase.functions.invoke('generate-titles', {
    body: { topic, keyword, tone, includeEmoji, channelDNA }
  });
  
  const data = await handleApiResponse<{ titles: GeneratedTitle[]; personalizedWithDNA?: boolean }>(response);
  return data.titles;
}

/**
 * Generate SEO-optimized video description
 * @param channelDNA - Optional Channel DNA string for personalization
 */
export async function generateDescription(
  title: string,
  summary: string,
  keyPoints?: string[],
  links?: string[],
  includeTimestamps: boolean = true,
  channelDNA?: string
): Promise<GeneratedDescription> {
  const response = await supabase.functions.invoke('generate-description', {
    body: { title, summary, keyPoints, links, includeTimestamps, channelDNA }
  });
  
  return handleApiResponse<GeneratedDescription>(response);
}

/**
 * Generate YouTube tags
 */
export async function generateTags(
  title: string,
  description?: string,
  category?: string
): Promise<GeneratedTags> {
  const response = await supabase.functions.invoke('generate-tags', {
    body: { title, description, category }
  });
  
  const data = await handleApiResponse<{ tags: GeneratedTags }>(response);
  return data.tags;
}

/**
 * Generate keyword suggestions for YouTube SEO
 */
export async function generateKeywords(
  topic: string,
  niche?: string
): Promise<GeneratedKeywords> {
  const response = await supabase.functions.invoke('generate-keywords', {
    body: { topic, niche }
  });
  
  return handleApiResponse<GeneratedKeywords>(response);
}

/**
 * Analyze SEO and get scores with recommendations (legacy)
 */
export async function analyzeSEO(
  title: string,
  description?: string,
  tags?: string[]
): Promise<SEOAnalysis> {
  const response = await supabase.functions.invoke('analyze-seo', {
    body: { title, description, tags }
  });
  
  return handleApiResponse<SEOAnalysis>(response);
}

/**
 * AVOE (Accurate Video Optimization Engine) - Strict Mode Analysis
 * Priority: Accuracy over confidence
 * Uses explicit rubrics with evidence-based scoring
 */
export async function analyzeWithAVOE(input: AVOEInput): Promise<AVOEAnalysis> {
  const response = await supabase.functions.invoke('avoe-analyze', {
    body: input
  });
  
  return handleApiResponse<AVOEAnalysis>(response);
}

/**
 * Generate content ideas
 */
export async function generateContentIdeas(
  topic: string,
  niche?: string,
  targetAudience?: string,
  contentStyles?: string[],
  includeTrending: boolean = true,
  numberOfIdeas: number = 10
): Promise<GeneratedContentIdeas> {
  const response = await supabase.functions.invoke('generate-content-ideas', {
    body: { 
      topic, 
      niche, 
      targetAudience, 
      contentStyles, 
      includeTrending, 
      numberOfIdeas 
    }
  });
  
  return handleApiResponse<GeneratedContentIdeas>(response);
}

// Export all functions as a namespace for convenience
export const aiApi = {
  generateTitles,
  generateDescription,
  generateTags,
  generateKeywords,
  analyzeSEO,
  analyzeWithAVOE,
  generateContentIdeas,
};
