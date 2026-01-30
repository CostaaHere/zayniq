/**
 * Channel DNA Types
 * Deep psychological/behavioral identity of a YouTube channel
 */

export interface ContentPsychology {
  dominantEmotion?: string;
  emotionalPromiseGap?: string;
  fearVsCuriosityRatio?: string;
  clickTriggers?: string[];
  retentionKillers?: string[];
}

export interface PerformanceSignature {
  whatSpikes?: string[];
  whatKills?: string[];
  hiddenGems?: string[];
  viewingIntent?: "learn" | "escape" | "entertain" | "transform";
}

export interface CreatorFingerprint {
  tone?: "aggressive" | "calm" | "funny" | "serious" | "inspirational";
  complexityLevel?: "simple" | "moderate" | "complex";
  authorityVsRelatability?: string;
  uniqueVoiceMarkers?: string[];
}

export interface FormatSweetSpot {
  format: string;
  whyItWorks: string;
  performanceLevel: "high" | "medium" | "low";
}

export interface KillZone {
  avoid: string;
  reason: string;
}

export interface TopPerformingTopic {
  topic: string;
  avgViews: number;
  frequency: "high" | "medium" | "low";
}

export interface TitleFormula {
  formula: string;
  example: string;
}

export interface TitlePatterns {
  avgLength?: number;
  commonStructures?: string[];
  emotionalTriggers?: string[];
  numbersUsed?: boolean;
}

export interface ToneProfile {
  primary?: string;
  secondary?: string;
  formality?: "casual" | "semi-formal" | "formal";
  energy?: "low" | "medium" | "high";
}

export interface AudienceDemographics {
  interests?: string[];
  skillLevel?: "beginner" | "intermediate" | "advanced" | "mixed";
  contentPreferences?: string[];
}

export interface ChannelDNA {
  id: string;
  user_id: string;
  channel_id: string | null;
  analyzed_at: string;
  videos_analyzed: number;
  
  // Core DNA Profile
  core_archetype: string | null;
  emotional_gravity_score: number | null;
  curiosity_dependency_level: "low" | "medium" | "high" | null;
  risk_tolerance_level: "low" | "medium" | "high" | null;
  audience_intelligence_level: string | null;
  
  // Deep Analysis
  format_sweet_spots: FormatSweetSpot[];
  kill_zones: KillZone[];
  content_psychology: ContentPsychology;
  performance_signature: PerformanceSignature;
  creator_fingerprint: CreatorFingerprint;
  
  // Content Analysis
  content_categories: string[];
  top_performing_topics: TopPerformingTopic[];
  title_patterns: TitlePatterns;
  title_formulas: TitleFormula[];
  power_words: string[];
  
  // Style Profile
  tone_profile: ToneProfile;
  vocabulary_style: string | null;
  emoji_usage: "none" | "minimal" | "moderate" | "heavy";
  
  // Audience
  audience_demographics: AudienceDemographics;
  peak_engagement_times: string[];
  
  // Metrics
  avg_engagement_rate: number | null;
  avg_views: number | null;
  avg_likes: number | null;
  avg_comments: number | null;
  view_to_like_ratio: number | null;
  
  // Summary
  dna_summary: string | null;
  
  // Timestamps
  created_at: string;
  updated_at: string;
}

// Utility function to get DNA level color
export const getDNALevelColor = (level: "low" | "medium" | "high" | null): string => {
  switch (level) {
    case "high": return "text-green-500 bg-green-500/10";
    case "medium": return "text-yellow-500 bg-yellow-500/10";
    case "low": return "text-orange-500 bg-orange-500/10";
    default: return "text-muted-foreground bg-muted";
  }
};

// Utility function to get emotional gravity color based on score
export const getEmotionalGravityColor = (score: number | null): string => {
  if (score === null) return "text-muted-foreground";
  if (score >= 70) return "text-red-500";
  if (score >= 40) return "text-yellow-500";
  return "text-blue-500";
};
