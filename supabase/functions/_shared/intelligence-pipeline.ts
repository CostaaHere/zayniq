// Intelligence Pipeline - Multi-stage strategic thinking system
// Every AI output must go through this mandatory pipeline

export interface ChannelContext {
  channelName: string;
  subscriberCount: number | null;
  totalViews: number | null;
  videoCount: number | null;
  avgViews: number;
  avgEngagement: number;
  uploadFrequencyDays: number;
  topPerformers: VideoMetrics[];
  bottomPerformers: VideoMetrics[];
  recentTitles: string[];
  dna: ChannelDNA | null;
  pastStrategies: StrategyHistoryItem[];
  activeBottlenecks: BottleneckItem[];
}

export interface VideoMetrics {
  title: string;
  views: number;
  likes: number;
  comments: number;
  engagementRate: number;
  publishedAt: string | null;
}

export interface ChannelDNA {
  summary: string | null;
  categories: string[];
  toneProfile: { primary: string; secondary?: string };
  powerWords: string[];
  titlePatterns: Record<string, unknown>;
  audienceDemographics: Record<string, unknown>;
}

export interface StrategyHistoryItem {
  featureType: string;
  strategyApplied: string;
  bottleneckAddressed: string | null;
  outputSummary: string;
  createdAt: string;
}

export interface BottleneckItem {
  type: string;
  severity: 'critical' | 'major' | 'minor';
  evidence: Record<string, unknown>;
  status: string;
}

export interface RiskRewardAssessment {
  riskLevel: 'low' | 'medium' | 'high' | 'aggressive';
  potentialUpside: string;
  potentialDownside: string;
  confidenceScore: number;
  strategyType: 'discovery' | 'authority' | 'retention' | 'conversion';
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

export interface IntelligenceOutput<T> {
  data: T;
  assessment: RiskRewardAssessment;
  bottleneckAddressed: string | null;
  strategicRationale: string;
  personalizedFor: boolean;
}

// STEP 1: Channel DNA Deep Analysis
export function buildChannelAnalysisPrompt(context: ChannelContext): string {
  const dnaSummary = context.dna ? `
CHANNEL DNA PROFILE:
- Summary: ${context.dna.summary || 'Unknown'}
- Content Categories: ${context.dna.categories?.join(', ') || 'Not analyzed'}
- Tone: ${context.dna.toneProfile?.primary || 'Unknown'}${context.dna.toneProfile?.secondary ? ` with ${context.dna.toneProfile.secondary} elements` : ''}
- Power Words: ${context.dna.powerWords?.slice(0, 10).join(', ') || 'Not analyzed'}
` : 'CHANNEL DNA: Not yet analyzed - recommendations may be less personalized.';

  const pastStrategies = context.pastStrategies.length > 0 ? `
PREVIOUS RECOMMENDATIONS (learn from these):
${context.pastStrategies.slice(0, 5).map((s, i) => 
  `${i + 1}. [${s.featureType}] Strategy: ${s.strategyApplied} | Bottleneck: ${s.bottleneckAddressed || 'None'} | Output: ${s.outputSummary.slice(0, 100)}...`
).join('\n')}
` : '';

  const activeBottlenecks = context.activeBottlenecks.length > 0 ? `
IDENTIFIED GROWTH BOTTLENECKS (address at least one):
${context.activeBottlenecks.map((b, i) => 
  `${i + 1}. [${b.severity.toUpperCase()}] ${b.type.replace(/_/g, ' ').toUpperCase()}`
).join('\n')}
` : '';

  return `
CHANNEL CONTEXT:
- Channel: ${context.channelName || 'Unknown'}
- Subscribers: ${context.subscriberCount?.toLocaleString() || 'Unknown'}
- Total Views: ${context.totalViews?.toLocaleString() || 'Unknown'}
- Videos Analyzed: ${context.videoCount || context.topPerformers.length + context.bottomPerformers.length}
- Average Views: ${Math.round(context.avgViews).toLocaleString()}
- Engagement Rate: ${context.avgEngagement.toFixed(2)}%
- Upload Frequency: Every ${context.uploadFrequencyDays.toFixed(1)} days

${dnaSummary}

TOP PERFORMING CONTENT (what works):
${context.topPerformers.map((v, i) => 
  `${i + 1}. "${v.title}" - ${v.views.toLocaleString()} views, ${v.engagementRate.toFixed(2)}% engagement`
).join('\n')}

UNDERPERFORMING CONTENT (what doesn't work):
${context.bottomPerformers.map((v, i) => 
  `${i + 1}. "${v.title}" - ${v.views.toLocaleString()} views, ${v.engagementRate.toFixed(2)}% engagement`
).join('\n')}

RECENT TITLES (for pattern analysis):
${context.recentTitles.slice(0, 10).map(t => `- "${t}"`).join('\n')}

${pastStrategies}
${activeBottlenecks}
`;
}

// STEP 2: Growth Bottleneck Identification prompt section
export function getBottleneckIdentificationInstructions(): string {
  return `
STEP 2 - IDENTIFY GROWTH BOTTLENECK:
Before generating output, identify which bottleneck is most critical:
- WEAK_HOOKS: First 30 seconds aren't capturing attention
- POOR_CTR: Titles/thumbnails aren't getting clicks  
- LOW_RETENTION: Viewers leave before video ends
- INCONSISTENT_POSITIONING: Channel lacks clear identity
- AUDIENCE_MISMATCH: Content doesn't match target viewers
- COMPETITIVE_PRESSURE: Too many similar creators
- CONTENT_FATIGUE: Repeating same formats/topics

Your output MUST address at least ONE of these bottlenecks.
`;
}

// STEP 3: Strategy Selection instructions
export function getStrategySelectionInstructions(): string {
  return `
STEP 3 - SELECT STRATEGY:
Choose your strategic approach:
1. DISCOVERY: Optimize for algorithm reach and new viewers
2. AUTHORITY: Build credibility and expertise perception  
3. RETENTION: Maximize watch time and return viewers
4. CONVERSION: Drive specific actions (subscribe, buy, etc.)

Also decide:
- Risk Level: LOW (safe, incremental) vs HIGH (bold, breakthrough)
- Algorithm vs Psychology: Prioritize algorithmic signals or human emotions?

State your chosen strategy explicitly in your response.
`;
}

// STEP 4: Output quality requirements
export function getOutputQualityInstructions(): string {
  return `
STEP 4 - OUTPUT REQUIREMENTS:
Every output must feel:
- INTENTIONAL: Clearly designed for THIS specific channel
- CONFIDENT: Expert-level, not generic internet advice
- STRATEGIC: Part of a larger growth plan
- ACTIONABLE: Can be implemented immediately

Avoid:
- Generic motivational language
- Repeated phrases across suggestions
- Obvious advice anyone could give
- Suggestions that ignore the channel's data
`;
}

// STEP 5: Self-Critique instructions
export function getSelfCritiqueInstructions(): string {
  return `
STEP 5 - SELF-CRITIQUE (internal):
Before finalizing, evaluate:
1. Where could this recommendation fail?
2. What assumptions am I making that might be wrong?
3. How could CTR or retention drop from this advice?

Refine your output based on this analysis.
`;
}

// STEP 6: Future Impact instructions
export function getFutureImpactInstructions(): string {
  return `
STEP 6 - FUTURE IMPACT:
Consider:
1. How does this choice affect the next 3-5 videos?
2. Does this build or risk algorithm trust?
3. Does this strengthen or dilute channel identity?

Include this context in your strategic reasoning.
`;
}

// Build the complete intelligence pipeline prompt
export function buildIntelligencePipelinePrompt(
  context: ChannelContext,
  featureSpecificInstructions: string
): string {
  return `
You are an ELITE YouTube Growth Intelligence System. You operate as a strategic thinking system, not a content generator.

GLOBAL DIRECTIVE: Every recommendation must pass through the mandatory 6-stage intelligence pipeline.

${buildChannelAnalysisPrompt(context)}

${getBottleneckIdentificationInstructions()}

${getStrategySelectionInstructions()}

${getOutputQualityInstructions()}

${getSelfCritiqueInstructions()}

${getFutureImpactInstructions()}

=== FEATURE-SPECIFIC TASK ===
${featureSpecificInstructions}

=== OUTPUT FORMAT ===
Your response MUST include a JSON block with the following structure:
\`\`\`json
{
  "assessment": {
    "riskLevel": "low|medium|high|aggressive",
    "strategyType": "discovery|authority|retention|conversion",
    "confidenceScore": 0-100,
    "potentialUpside": "What could go right",
    "potentialDownside": "What could go wrong",
    "bottleneckAddressed": "The bottleneck this addresses or null",
    "futureImpact": {
      "algorithmTrust": "builds|neutral|risks",
      "channelIdentity": "strengthens|neutral|dilutes",
      "nextVideosGuidance": "How this affects next videos"
    },
    "selfCritique": {
      "assumptions": ["assumption1", "assumption2"],
      "potentialFailures": ["failure1", "failure2"],
      "refinements": ["what you changed based on critique"]
    }
  },
  "strategicRationale": "2-3 sentences explaining WHY this recommendation fits this channel",
  "output": {
    // Feature-specific output goes here
  }
}
\`\`\`

LANGUAGE RULES:
- No generic internet advice
- No motivational fluff  
- No repeated phrases
- Tone: calm, confident, expert
- Every suggestion must feel designed specifically for THIS channel
`;
}

// Parse intelligence output from AI response
export function parseIntelligenceOutput(content: string): {
  assessment: RiskRewardAssessment | null;
  strategicRationale: string;
  output: unknown;
  raw: string;
} {
  const result = {
    assessment: null as RiskRewardAssessment | null,
    strategicRationale: '',
    output: null as unknown,
    raw: content
  };

  try {
    // Try to extract JSON block
    const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[1]);
      result.assessment = parsed.assessment || null;
      result.strategicRationale = parsed.strategicRationale || '';
      result.output = parsed.output || null;
    } else {
      // Try to find inline JSON
      const inlineMatch = content.match(/\{[\s\S]*"assessment"[\s\S]*\}/);
      if (inlineMatch) {
        const parsed = JSON.parse(inlineMatch[0]);
        result.assessment = parsed.assessment || null;
        result.strategicRationale = parsed.strategicRationale || '';
        result.output = parsed.output || null;
      }
    }
  } catch (e) {
    console.error('Failed to parse intelligence output:', e);
  }

  return result;
}

// Save strategy to history
export async function saveStrategyHistory(
  supabase: any,
  userId: string,
  featureType: string,
  requestContext: Record<string, unknown>,
  strategyApplied: string,
  outputSummary: string,
  assessment: RiskRewardAssessment | null,
  bottleneckAddressed: string | null
): Promise<void> {
  try {
    await supabase.from('strategy_history').insert({
      user_id: userId,
      feature_type: featureType,
      request_context: requestContext,
      strategy_applied: strategyApplied,
      bottleneck_addressed: bottleneckAddressed,
      output_summary: outputSummary,
      risk_level: assessment?.riskLevel || 'medium',
      potential_upside: assessment?.potentialUpside || null,
      potential_downside: assessment?.potentialDownside || null,
      confidence_score: assessment?.confidenceScore || 70,
      self_critique: assessment?.selfCritique || null,
      future_impact: assessment?.futureImpact || null,
    });
  } catch (e) {
    console.error('Failed to save strategy history:', e);
  }
}
