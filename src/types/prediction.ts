// Performance Prediction Types for Frontend

export interface CTRPrediction {
  predictedRange: {
    min: number;
    max: number;
    baseline: number;
  };
  confidence: 'low' | 'medium' | 'high';
  factors: Array<{
    factor: string;
    impact: 'positive' | 'negative' | 'neutral';
    weight: number;
  }>;
  vsChannelAverage: string;
  assumptions: string[];
}

export interface RetentionPrediction {
  retentionCurve: {
    "5s": number;
    "10s": number;
    "30s": number;
    "60s": number;
  };
  sessionImpact: 'negative' | 'neutral' | 'positive' | 'strong_positive';
  dropoffTriggers: Array<{
    trigger: string;
    likelihood: 'low' | 'medium' | 'high';
    mitigation: string;
  }>;
  watchTimeEstimate: string;
}

export interface AlgorithmPrediction {
  promotionLikelihood: 'low' | 'medium' | 'high' | 'experimental';
  feedPredictions: {
    suggested: 'low' | 'medium' | 'high';
    browse: 'low' | 'medium' | 'high';
    trending: 'low' | 'medium' | 'high';
  };
  algorithmFactors: Array<{
    factor: string;
    direction: 'for' | 'against';
    explanation: string;
  }>;
  timingSensitivity: 'low' | 'medium' | 'high';
  optimalPostingWindow?: string;
}

export interface CompetitionPrediction {
  trendAlignment: 'declining' | 'neutral' | 'rising' | 'viral_potential';
  competitionSaturation: 'low' | 'medium' | 'high' | 'saturated';
  gapAnalysis: {
    opportunities: string[];
    risks: string[];
    differentiation: string;
  };
  shortTermOutlook: string;
  longTermOutlook: string;
}

export interface WhatIfSimulation {
  scenario: string;
  predictedOutcome: {
    ctrChange: string;
    retentionChange: string;
    growthImpact: string;
  };
  riskLevel: 'low' | 'medium' | 'high';
  recommendation: 'avoid' | 'consider' | 'recommended' | 'optimal';
}

export interface SimulationResults {
  simulations: WhatIfSimulation[];
  optimalPath: {
    strategy: string;
    reasoning: string;
    expectedOutcome: string;
  };
}

export interface PerformancePrediction {
  ctr: CTRPrediction;
  retention: RetentionPrediction;
  algorithm: AlgorithmPrediction;
  competition: CompetitionPrediction;
  simulations: SimulationResults;
  overallConfidence: 'low' | 'medium' | 'high' | 'experimental';
  overallConfidenceScore: number;
  recommendationSummary: string;
  riskFactors: string[];
  successIndicators: string[];
}

// Helper functions for UI
export function getConfidenceColor(confidence: string): string {
  switch (confidence) {
    case 'high': return 'text-green-400';
    case 'experimental': return 'text-purple-400';
    case 'low': return 'text-red-400';
    default: return 'text-amber-400';
  }
}

export function getConfidenceBgColor(confidence: string): string {
  switch (confidence) {
    case 'high': return 'bg-green-500/20 border-green-500/30';
    case 'experimental': return 'bg-purple-500/20 border-purple-500/30';
    case 'low': return 'bg-red-500/20 border-red-500/30';
    default: return 'bg-amber-500/20 border-amber-500/30';
  }
}

export function getTrendIcon(trend: string): string {
  switch (trend) {
    case 'viral_potential': return '🚀';
    case 'rising': return '📈';
    case 'declining': return '📉';
    default: return '➡️';
  }
}

export function getRecommendationColor(rec: string): string {
  switch (rec) {
    case 'optimal': return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'recommended': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case 'consider': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    case 'avoid': return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-muted text-muted-foreground';
  }
}

export function formatPredictionInsight(prediction: PerformancePrediction): string {
  const { ctr, algorithm, competition, simulations, overallConfidence } = prediction;
  
  let insight = '';
  
  // Confidence opener
  if (overallConfidence === 'high') {
    insight += "I'm quite confident this will perform well. ";
  } else if (overallConfidence === 'experimental') {
    insight += "This is a bolder move with higher risk, but the potential payoff is significant. ";
  } else if (overallConfidence === 'low') {
    insight += "I'd recommend some adjustments before moving forward. ";
  } else {
    insight += "This has solid potential with some considerations. ";
  }
  
  // CTR insight
  insight += `Based on your channel's patterns, this should perform ${ctr.vsChannelAverage} in terms of clicks. `;
  
  // Algorithm insight
  if (algorithm.promotionLikelihood === 'high') {
    insight += "YouTube's algorithm should favor this content for recommendations. ";
  } else if (algorithm.promotionLikelihood === 'experimental') {
    insight += "This is experimental territory for the algorithm - could break out or underperform. ";
  }
  
  // Competition insight
  if (competition.trendAlignment === 'viral_potential') {
    insight += "The timing is excellent - this topic is gaining momentum. ";
  } else if (competition.competitionSaturation === 'saturated') {
    insight += "Be aware that this space is crowded, so differentiation is key. ";
  }
  
  // Optimal path
  if (simulations.optimalPath) {
    insight += `\n\nMy recommendation: ${simulations.optimalPath.strategy}. ${simulations.optimalPath.reasoning}`;
  }
  
  return insight;
}
