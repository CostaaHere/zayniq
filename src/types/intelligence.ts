// Strategic Intelligence Types for Risk/Reward Matrix UI

export interface RiskRewardAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'aggressive';
  strategyType: 'discovery' | 'authority' | 'retention' | 'conversion';
  confidenceScore: number;
  potentialUpside: string;
  potentialDownside: string;
  bottleneckAddressed: string | null;
  futureImpact: {
    algorithmTrust: 'builds' | 'neutral' | 'risks';
    channelIdentity: 'strengthens' | 'neutral' | 'dilutes';
    nextVideosGuidance: string;
  };
  selfCritique: {
    assumptions: string[];
    potentialFailures: string[];
    refinements: string[];
  };
}

export interface StrategicOutput<T> {
  data: T;
  assessment: RiskRewardAssessment;
  strategicRationale: string;
  personalizedFor: boolean;
}

// Strategy types for visual indicators
export type StrategyBadge = 
  | 'high_confidence'
  | 'strategic_move'
  | 'aggressive_growth'
  | 'safe_play'
  | 'algorithm_optimized'
  | 'psychology_focused'
  | 'identity_builder'
  | 'discovery_play';

export function getStrategyBadges(assessment: RiskRewardAssessment): StrategyBadge[] {
  const badges: StrategyBadge[] = [];
  
  if (assessment.confidenceScore >= 85) badges.push('high_confidence');
  if (assessment.riskLevel === 'aggressive') badges.push('aggressive_growth');
  if (assessment.riskLevel === 'low') badges.push('safe_play');
  if (assessment.strategyType === 'discovery') badges.push('discovery_play');
  if (assessment.futureImpact.channelIdentity === 'strengthens') badges.push('identity_builder');
  if (assessment.futureImpact.algorithmTrust === 'builds') badges.push('algorithm_optimized');
  
  return badges;
}

export function getRiskLevelColor(level: RiskRewardAssessment['riskLevel']): string {
  switch (level) {
    case 'low': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'high': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case 'aggressive': return 'bg-red-500/20 text-red-400 border-red-500/30';
  }
}

export function getStrategyTypeColor(type: RiskRewardAssessment['strategyType']): string {
  switch (type) {
    case 'discovery': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'authority': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    case 'retention': return 'bg-teal-500/20 text-teal-400 border-teal-500/30';
    case 'conversion': return 'bg-pink-500/20 text-pink-400 border-pink-500/30';
  }
}

export function getConfidenceColor(score: number): string {
  if (score >= 85) return 'text-green-400';
  if (score >= 70) return 'text-yellow-400';
  if (score >= 50) return 'text-orange-400';
  return 'text-red-400';
}

// Bottleneck types
export type BottleneckType = 
  | 'weak_hooks'
  | 'poor_ctr'
  | 'low_retention'
  | 'inconsistent_positioning'
  | 'audience_mismatch'
  | 'competitive_pressure'
  | 'content_fatigue';

export const BOTTLENECK_LABELS: Record<BottleneckType, string> = {
  weak_hooks: 'Weak Hooks',
  poor_ctr: 'Poor CTR',
  low_retention: 'Low Retention',
  inconsistent_positioning: 'Inconsistent Positioning',
  audience_mismatch: 'Audience Mismatch',
  competitive_pressure: 'Competitive Pressure',
  content_fatigue: 'Content Fatigue'
};

export const BOTTLENECK_DESCRIPTIONS: Record<BottleneckType, string> = {
  weak_hooks: 'First 30 seconds aren\'t capturing attention',
  poor_ctr: 'Titles/thumbnails aren\'t getting clicks',
  low_retention: 'Viewers leave before video ends',
  inconsistent_positioning: 'Channel lacks clear identity',
  audience_mismatch: 'Content doesn\'t match target viewers',
  competitive_pressure: 'Too many similar creators',
  content_fatigue: 'Repeating same formats/topics'
};
