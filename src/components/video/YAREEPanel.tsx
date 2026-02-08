import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Skull,
  Pause,
  Flame,
  Rocket,
  Zap,
  Brain,
  Target,
  TrendingUp,
  Clock,
  AlertTriangle,
  Copy,
  Eye,
  ThumbsUp,
  MessageCircle,
  Activity,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface YAREEResult {
  video_status: 'DEAD' | 'STALLED' | 'WARM' | 'HOT' | 'EXPLODING';
  algorithm_confidence: number;
  phase1_discovery: {
    ctr_score: number;
    engagement_speed: number;
    initial_push_score: number;
    analysis: string;
  };
  phase2_satisfaction: {
    retention_expectancy: string;
    emotional_intensity: number;
    rewatch_trigger_score: number;
    analysis: string;
  };
  phase3_trust: {
    algo_trust_score: number;
    channel_reliability: string;
    content_consistency: string;
    analysis: string;
  };
  phase4_push_decision: {
    will_expand: boolean;
    next_push_timing: string;
    unlock_condition: string;
    why_pushing_or_not: string;
  };
  phase5_actions: {
    title_tweak: string;
    description_adjustment: string;
    engagement_bait_comment: string;
    reupload_vs_wait: 'wait' | 'reupload' | 'boost_externally';
    external_triggers: string[];
  };
  growth_prediction: {
    next_72h: string;
    next_7d: string;
    ceiling: string;
  };
  input_metrics?: {
    views: number;
    likes: number;
    comments: number;
    engagementRate: number;
    likeToViewRatio: number;
    viewsPerDay: number;
    videoAgeDays: number;
    channelSize: string;
    videoType: string;
    durationSeconds: number;
  };
}

interface YAREEPanelProps {
  result: YAREEResult;
}

const statusConfig: Record<string, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  DEAD: { icon: <Skull className="w-5 h-5" />, color: 'text-red-400', bg: 'bg-red-500/20 border-red-500/30', label: '❌ DEAD' },
  STALLED: { icon: <Pause className="w-5 h-5" />, color: 'text-amber-400', bg: 'bg-amber-500/20 border-amber-500/30', label: '⚠️ STALLED' },
  WARM: { icon: <Activity className="w-5 h-5" />, color: 'text-green-400', bg: 'bg-green-500/20 border-green-500/30', label: '🟢 WARM' },
  HOT: { icon: <Flame className="w-5 h-5" />, color: 'text-orange-400', bg: 'bg-orange-500/20 border-orange-500/30', label: '🔥 HOT' },
  EXPLODING: { icon: <Rocket className="w-5 h-5" />, color: 'text-purple-400', bg: 'bg-purple-500/20 border-purple-500/30', label: '🚀 EXPLODING' },
};

const retentionLabels: Record<string, string> = {
  very_low: 'Very Low',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  very_high: 'Very High',
};

const copyText = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied!`);
};

const ScoreBar: React.FC<{ label: string; score: number; max?: number }> = ({ label, score, max = 100 }) => {
  const pct = Math.min(score, max);
  const color = pct >= 70 ? 'text-green-400' : pct >= 40 ? 'text-amber-400' : 'text-red-400';
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={cn("font-bold", color)}>{score}/{max}</span>
      </div>
      <Progress value={pct} className="h-2" />
    </div>
  );
};

export const YAREEPanel: React.FC<YAREEPanelProps> = ({ result }) => {
  const [expandedPhase, setExpandedPhase] = React.useState<string | null>(null);
  const status = statusConfig[result.video_status] || statusConfig.STALLED;

  const toggle = (phase: string) => setExpandedPhase(prev => prev === phase ? null : phase);

  return (
    <div className="space-y-4">
      {/* Hero Status */}
      <Card className={cn("border-2", status.bg)}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", status.bg)}>
                {status.icon}
              </div>
              <div>
                <h2 className={cn("text-2xl font-bold", status.color)}>{status.label}</h2>
                <p className="text-sm text-muted-foreground">YouTube Algorithm Verdict</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{result.algorithm_confidence}%</div>
              <p className="text-xs text-muted-foreground">Algorithm Confidence</p>
            </div>
          </div>
          <Progress value={result.algorithm_confidence} className="h-3" />
        </CardContent>
      </Card>

      {/* Input Metrics Summary */}
      {result.input_metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-card rounded-lg border border-border p-3 text-center">
            <Eye className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-lg font-bold">{result.input_metrics.views.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Views</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-3 text-center">
            <TrendingUp className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-lg font-bold">{result.input_metrics.viewsPerDay.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Views/Day</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-3 text-center">
            <ThumbsUp className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-lg font-bold">{result.input_metrics.engagementRate}%</div>
            <div className="text-xs text-muted-foreground">Engagement</div>
          </div>
          <div className="bg-card rounded-lg border border-border p-3 text-center">
            <Clock className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
            <div className="text-lg font-bold">{result.input_metrics.videoAgeDays}d</div>
            <div className="text-xs text-muted-foreground">Video Age</div>
          </div>
        </div>
      )}

      {/* Phase 1: Discovery Signals */}
      <Card className="border-border/50">
        <button onClick={() => toggle('p1')} className="w-full">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Phase 1: Discovery Signals
            </CardTitle>
            {expandedPhase === 'p1' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardHeader>
        </button>
        <CardContent className={cn("space-y-3", expandedPhase !== 'p1' && "hidden")}>
          <ScoreBar label="CTR Score" score={result.phase1_discovery.ctr_score} />
          <ScoreBar label="Engagement Speed" score={result.phase1_discovery.engagement_speed} />
          <ScoreBar label="Initial Push Score" score={result.phase1_discovery.initial_push_score} />
          <p className="text-sm text-muted-foreground mt-2">{result.phase1_discovery.analysis}</p>
        </CardContent>
      </Card>

      {/* Phase 2: Satisfaction Loop */}
      <Card className="border-border/50">
        <button onClick={() => toggle('p2')} className="w-full">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Brain className="w-4 h-4 text-purple-400" />
              Phase 2: Satisfaction Loop
            </CardTitle>
            {expandedPhase === 'p2' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardHeader>
        </button>
        <CardContent className={cn("space-y-3", expandedPhase !== 'p2' && "hidden")}>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Retention Expectancy</span>
            <Badge variant="outline">{retentionLabels[result.phase2_satisfaction.retention_expectancy] || result.phase2_satisfaction.retention_expectancy}</Badge>
          </div>
          <ScoreBar label="Emotional Intensity" score={result.phase2_satisfaction.emotional_intensity} />
          <ScoreBar label="Rewatch Trigger" score={result.phase2_satisfaction.rewatch_trigger_score} />
          <p className="text-sm text-muted-foreground mt-2">{result.phase2_satisfaction.analysis}</p>
        </CardContent>
      </Card>

      {/* Phase 3: Algorithm Trust */}
      <Card className="border-border/50">
        <button onClick={() => toggle('p3')} className="w-full">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="w-4 h-4 text-blue-400" />
              Phase 3: Algorithm Trust Index
            </CardTitle>
            {expandedPhase === 'p3' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardHeader>
        </button>
        <CardContent className={cn("space-y-3", expandedPhase !== 'p3' && "hidden")}>
          <ScoreBar label="Algorithm Trust Score" score={result.phase3_trust.algo_trust_score} />
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="text-xs text-muted-foreground">Channel Reliability</span>
              <p className="text-sm font-medium mt-1">{result.phase3_trust.channel_reliability}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="text-xs text-muted-foreground">Content Consistency</span>
              <p className="text-sm font-medium mt-1">{result.phase3_trust.content_consistency}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{result.phase3_trust.analysis}</p>
        </CardContent>
      </Card>

      {/* Phase 4: Push or Kill */}
      <Card className={cn("border-2", result.phase4_push_decision.will_expand ? "border-green-500/30 bg-green-500/5" : "border-red-500/30 bg-red-500/5")}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            {result.phase4_push_decision.will_expand ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400" />
            )}
            Phase 4: Push or Kill Decision
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Badge className={result.phase4_push_decision.will_expand ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-red-500/20 text-red-400 border-red-500/30"}>
            {result.phase4_push_decision.will_expand ? '📈 YouTube WILL expand impressions' : '📉 YouTube will NOT expand impressions'}
          </Badge>
          <p className="text-sm leading-relaxed">{result.phase4_push_decision.why_pushing_or_not}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="text-xs text-muted-foreground">Next Push Timing</span>
              <p className="text-sm font-medium mt-1">{result.phase4_push_decision.next_push_timing}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="text-xs text-muted-foreground">Unlock Condition</span>
              <p className="text-sm font-medium mt-1">{result.phase4_push_decision.unlock_condition}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 5: Actions */}
      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Phase 5: Exact Fixes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Title Tweak */}
          <div className="bg-card p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Title Tweak</span>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyText(result.phase5_actions.title_tweak, 'Title')}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm font-medium">{result.phase5_actions.title_tweak}</p>
          </div>

          {/* Description Fix */}
          <div className="bg-card p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Description Adjustment</span>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyText(result.phase5_actions.description_adjustment, 'Description')}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm">{result.phase5_actions.description_adjustment}</p>
          </div>

          {/* Engagement Comment */}
          <div className="bg-card p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Engagement Bait Comment</span>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyText(result.phase5_actions.engagement_bait_comment, 'Comment')}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm italic">"{result.phase5_actions.engagement_bait_comment}"</p>
          </div>

          {/* Decision */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Verdict:</span>
            <Badge variant="outline" className="capitalize">
              {result.phase5_actions.reupload_vs_wait === 'wait' ? '⏳ Wait' : 
               result.phase5_actions.reupload_vs_wait === 'reupload' ? '🔄 Re-upload' : '📢 Boost Externally'}
            </Badge>
          </div>

          {/* External Triggers */}
          {result.phase5_actions.external_triggers.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">External Triggers</span>
              <div className="flex flex-wrap gap-2 mt-1">
                {result.phase5_actions.external_triggers.map((trigger, i) => (
                  <Badge key={i} variant="secondary">{trigger}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Growth Prediction */}
      <Card className="border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Growth Prediction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="text-xs text-muted-foreground">Next 72 Hours</span>
              <p className="text-sm font-medium mt-1">{result.growth_prediction.next_72h}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="text-xs text-muted-foreground">Next 7 Days</span>
              <p className="text-sm font-medium mt-1">{result.growth_prediction.next_7d}</p>
            </div>
            <div className="bg-muted/30 p-3 rounded-lg">
              <span className="text-xs text-muted-foreground">Video Ceiling</span>
              <p className="text-sm font-medium mt-1">{result.growth_prediction.ceiling}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default YAREEPanel;
