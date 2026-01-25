// Performance Prediction & Simulation Engine
// 5-Layer Predictive Intelligence System

export interface ChannelMetrics {
  avgViews: number;
  avgCtr?: number;
  avgRetention?: number;
  avgEngagementRate: number;
  subscriberCount: number;
  videoCount: number;
  uploadFrequency: number; // days between uploads
  topPerformingTitles: string[];
  bottomPerformingTitles: string[];
  powerWords: string[];
  contentCategories: string[];
  toneProfile: {
    primary: string;
    secondary?: string;
  };
}

export interface PredictionInput {
  content: string; // title, description, topic being analyzed
  contentType: 'title' | 'content_idea' | 'description' | 'thumbnail' | 'hook';
  channelMetrics: ChannelMetrics;
  competitorContext?: string[];
  trendContext?: string[];
}

// Layer 1: CTR & View Prediction
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
  vsChannelAverage: string; // e.g., "+12-18% above average"
  assumptions: string[];
}

// Layer 2: Retention & Session Impact
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

// Layer 3: Algorithm Optimization
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

// Layer 4: Trend & Competition
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

// Layer 5: What-If Simulations
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

// Complete Prediction Output
export interface PerformancePrediction {
  ctr: CTRPrediction;
  retention: RetentionPrediction;
  algorithm: AlgorithmPrediction;
  competition: CompetitionPrediction;
  simulations: SimulationResults;
  
  // Overall Assessment
  overallConfidence: 'low' | 'medium' | 'high' | 'experimental';
  overallConfidenceScore: number;
  recommendationSummary: string;
  riskFactors: string[];
  successIndicators: string[];
}

// Build the prediction engine prompt for AI
export function buildPredictionEnginePrompt(input: PredictionInput): string {
  const { content, contentType, channelMetrics, competitorContext, trendContext } = input;
  
  return `
=== PERFORMANCE PREDICTION & SIMULATION ENGINE ===

You are operating as a PREDICTIVE INTELLIGENCE SYSTEM. Your task is to simulate outcomes and evaluate risk/reward for the following ${contentType}.

CONTENT TO ANALYZE:
"${content}"

CHANNEL BASELINE METRICS:
- Average Views: ${channelMetrics.avgViews.toLocaleString()}
- Estimated CTR: ${channelMetrics.avgCtr || 'Unknown (use 4% baseline)'}%
- Subscriber Count: ${channelMetrics.subscriberCount.toLocaleString()}
- Total Videos: ${channelMetrics.videoCount}
- Upload Frequency: Every ${channelMetrics.uploadFrequency.toFixed(1)} days
- Engagement Rate: ${channelMetrics.avgEngagementRate.toFixed(2)}%
- Primary Tone: ${channelMetrics.toneProfile.primary}${channelMetrics.toneProfile.secondary ? ` / ${channelMetrics.toneProfile.secondary}` : ''}
- Content Categories: ${channelMetrics.contentCategories.join(', ') || 'General'}
- Power Words That Work: ${channelMetrics.powerWords.slice(0, 10).join(', ') || 'Unknown'}

TOP PERFORMING TITLES (learn from these):
${channelMetrics.topPerformingTitles.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

BOTTOM PERFORMING TITLES (avoid these patterns):
${channelMetrics.bottomPerformingTitles.map((t, i) => `${i + 1}. "${t}"`).join('\n')}

${competitorContext ? `COMPETITOR CONTEXT:\n${competitorContext.join('\n')}` : ''}
${trendContext ? `TREND CONTEXT:\n${trendContext.join('\n')}` : ''}

=== PREDICTION LAYERS (MANDATORY) ===

Run the content through ALL 5 prediction layers:

**LAYER 1 - CTR & VIEW PREDICTION**
Simulate expected click-through rate based on:
- Historical CTR patterns of this channel
- Emotional/psychological triggers in the content
- Power word usage and title structure
- Thumbnail compatibility signals
Output: Predicted CTR range, confidence, factors, comparison to channel average

**LAYER 2 - RETENTION & SESSION IMPACT**
Simulate how this affects watch time:
- Predict retention at 5s, 10s, 30s, 60s marks
- Identify potential drop-off triggers
- Estimate session duration impact
- Flag high-risk retention patterns

**LAYER 3 - ALGORITHM OPTIMIZATION**
Estimate promotion likelihood:
- Suggested feed probability
- Browse feature probability
- Trending potential
- Timing sensitivity and optimal posting window

**LAYER 4 - TREND & COMPETITION**
Compare against market:
- Is this topic rising, stable, or declining?
- Competition saturation level
- Gap opportunities and risks
- Short-term vs long-term outlook

**LAYER 5 - WHAT-IF SIMULATIONS**
Generate 3-4 alternative scenarios:
- What if we adjusted the hook?
- What if we changed the emotional angle?
- What if we posted at different timing?
- Which path is optimal and why?

=== SELF-CRITIQUE ===
Before finalizing, ask:
- Are there hidden risks not accounted for?
- Could this fail due to audience mismatch?
- What assumptions might be wrong?
- Should confidence be adjusted?

=== OUTPUT FORMAT ===

Respond with a JSON object in this exact structure:

\`\`\`json
{
  "ctr": {
    "predictedRange": { "min": 3.5, "max": 5.2, "baseline": 4.0 },
    "confidence": "medium",
    "factors": [
      { "factor": "Strong power word usage", "impact": "positive", "weight": 0.8 },
      { "factor": "Unfamiliar topic angle", "impact": "negative", "weight": 0.3 }
    ],
    "vsChannelAverage": "+12-18% above average",
    "assumptions": ["Assumes standard thumbnail quality", "Based on similar past titles"]
  },
  "retention": {
    "retentionCurve": { "5s": 85, "10s": 72, "30s": 55, "60s": 40 },
    "sessionImpact": "positive",
    "dropoffTriggers": [
      { "trigger": "Complex intro", "likelihood": "medium", "mitigation": "Start with hook question" }
    ],
    "watchTimeEstimate": "4-5 minutes average"
  },
  "algorithm": {
    "promotionLikelihood": "high",
    "feedPredictions": { "suggested": "high", "browse": "medium", "trending": "low" },
    "algorithmFactors": [
      { "factor": "High engagement potential", "direction": "for", "explanation": "Strong emotional hooks" },
      { "factor": "Saturated topic", "direction": "against", "explanation": "Many similar videos recently" }
    ],
    "timingSensitivity": "medium",
    "optimalPostingWindow": "Weekday evenings 6-9 PM"
  },
  "competition": {
    "trendAlignment": "rising",
    "competitionSaturation": "medium",
    "gapAnalysis": {
      "opportunities": ["Unique angle not covered by competitors"],
      "risks": ["Large creators may cover this soon"],
      "differentiation": "Personal experience adds authenticity"
    },
    "shortTermOutlook": "Strong potential in next 2 weeks",
    "longTermOutlook": "May become saturated within 1-2 months"
  },
  "simulations": {
    "simulations": [
      {
        "scenario": "Add number to title (e.g., '7 Secrets...')",
        "predictedOutcome": { "ctrChange": "+8-12%", "retentionChange": "neutral", "growthImpact": "moderate positive" },
        "riskLevel": "low",
        "recommendation": "recommended"
      },
      {
        "scenario": "Make title more controversial",
        "predictedOutcome": { "ctrChange": "+15-25%", "retentionChange": "-5%", "growthImpact": "mixed" },
        "riskLevel": "medium",
        "recommendation": "consider"
      }
    ],
    "optimalPath": {
      "strategy": "Use power words with specific number",
      "reasoning": "Combines proven patterns with novelty",
      "expectedOutcome": "15-20% above channel average views"
    }
  },
  "overallConfidence": "high",
  "overallConfidenceScore": 82,
  "recommendationSummary": "This content shows strong potential with calculated risk. Expected to outperform channel average if executed with recommended optimizations.",
  "riskFactors": ["Competition may increase", "Requires quality thumbnail"],
  "successIndicators": ["Strong power words", "Aligns with channel DNA", "Trending topic"]
}
\`\`\`

CRITICAL: Return ONLY the JSON object, no additional text.
`;
}

// Parse prediction from AI response
export function parsePrediction(content: string): PerformancePrediction | null {
  try {
    // Extract JSON from response
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || 
                      content.match(/\{[\s\S]*"ctr"[\s\S]*"simulations"[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('[prediction-engine] No valid JSON found in response');
      return null;
    }
    
    const jsonStr = jsonMatch[1] || jsonMatch[0];
    const parsed = JSON.parse(jsonStr);
    
    return parsed as PerformancePrediction;
  } catch (e) {
    console.error('[prediction-engine] Failed to parse prediction:', e);
    return null;
  }
}

// Convert prediction to human-friendly insights
export function predictionToHumanInsight(prediction: PerformancePrediction): string {
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

// Save prediction to database
export async function savePrediction(
  supabase: any,
  userId: string,
  featureType: string,
  contentReference: string,
  prediction: PerformancePrediction
): Promise<string | null> {
  try {
    const { data, error } = await supabase.from('performance_predictions').insert({
      user_id: userId,
      feature_type: featureType,
      content_reference: contentReference,
      predicted_ctr_range: prediction.ctr.predictedRange,
      ctr_confidence: prediction.ctr.confidence,
      ctr_factors: prediction.ctr.factors,
      predicted_retention_curve: prediction.retention.retentionCurve,
      session_impact: prediction.retention.sessionImpact,
      dropoff_triggers: prediction.retention.dropoffTriggers,
      promotion_likelihood: prediction.algorithm.promotionLikelihood,
      algorithm_factors: prediction.algorithm.algorithmFactors,
      feed_predictions: prediction.algorithm.feedPredictions,
      trend_alignment: prediction.competition.trendAlignment,
      competition_saturation: prediction.competition.competitionSaturation,
      competitive_gap_analysis: prediction.competition.gapAnalysis,
      simulations: prediction.simulations.simulations,
      optimal_path: prediction.simulations.optimalPath,
      overall_confidence: prediction.overallConfidence,
      overall_confidence_score: prediction.overallConfidenceScore,
      recommendation_summary: prediction.recommendationSummary,
      risk_factors: prediction.riskFactors,
      success_indicators: prediction.successIndicators,
    }).select('id').single();
    
    if (error) {
      console.error('[prediction-engine] Failed to save prediction:', error);
      return null;
    }
    
    return data?.id || null;
  } catch (e) {
    console.error('[prediction-engine] Error saving prediction:', e);
    return null;
  }
}
