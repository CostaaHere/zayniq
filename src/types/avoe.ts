// AVOE (Accurate Video Optimization Engine) Types

export interface ScoreBreakdown {
  total: number;
  breakdown: {
    criterion: string;
    score: number;
    maxScore: number;
    evidence: string;
  }[];
  issues: string[];
  suggestions: string[];
}

export interface AVOEAnalysis {
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
  
  // Ready-to-paste improvements
  improvedTitle: string;
  improvedDescription: string;
  improvedTags: string[];
  improvedHashtags: string[];
  
  // Top priority actions
  priorityActions: {
    priority: 'high' | 'medium' | 'low';
    action: string;
    impact: string;
  }[];
}

export interface AVOEInput {
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
}
