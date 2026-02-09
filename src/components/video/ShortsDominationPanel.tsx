import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Zap,
  Eye,
  RotateCcw,
  TrendingUp,
  Clock,
  Target,
  Copy,
  ChevronDown,
  ChevronUp,
  Layers,
  ArrowRight,
  AlertTriangle,
  Repeat,
  Rocket,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface SDEResult {
  algorithm_favor_score: number;
  swipe_failure_risk: 'low' | 'medium' | 'high' | 'critical';
  watch_through_percent: number;
  loop_addiction_level: 'none' | 'weak' | 'moderate' | 'strong' | 'viral';
  video_verdict: 'DEAD' | 'WEAK' | 'COMPETITIVE' | 'STRONG' | 'DOMINANT';
  phase1_scroll_break: {
    score: number;
    opening_frame_verdict: string;
    hook_effectiveness: string;
    fixes: string[];
  };
  phase2_watch_through: {
    score: number;
    replay_probability: number;
    ideal_length_seconds: number;
    current_length_verdict: string;
    retention_issues: string[];
    fixes: string[];
  };
  phase3_loop: {
    loop_strength: number;
    rewatch_multiplier: number;
    loop_type: string;
    loop_fixes: string[];
  };
  phase4_velocity: {
    first_10min: string;
    first_30min: string;
    first_2hours: string;
    peak_velocity_minute: number;
    repush_trigger: string;
  };
  phase5_push_strategy: {
    initial_push_strength: string;
    stall_probability: number;
    repush_conditions: string[];
    explosion_probability: number;
    timeline_prediction: string;
  };
  phase6_cluster: {
    cluster_strategy: string;
    supporting_angles: string[];
    winner_selection_logic: string;
  };
  phase7_funnel: {
    funnel_role: 'reach' | 'bridge' | 'monetization';
    cta_script: string;
    pin_comment: string;
    long_form_bridge_idea: string;
  };
  exact_fixes: string[];
  reupload_decision: string;
  why_algorithm_pushes_or_kills: string;
}

interface Props {
  result: SDEResult;
}

const verdictConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  DEAD: { color: 'text-destructive', icon: <AlertTriangle className="w-5 h-5" />, label: 'DEAD' },
  WEAK: { color: 'text-amber-500', icon: <AlertTriangle className="w-5 h-5" />, label: 'WEAK' },
  COMPETITIVE: { color: 'text-blue-500', icon: <Target className="w-5 h-5" />, label: 'COMPETITIVE' },
  STRONG: { color: 'text-emerald-500', icon: <TrendingUp className="w-5 h-5" />, label: 'STRONG' },
  DOMINANT: { color: 'text-purple-500', icon: <Rocket className="w-5 h-5" />, label: 'DOMINANT' },
};

const swipeRiskConfig: Record<string, { color: string; bg: string }> = {
  low: { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  medium: { color: 'text-amber-500', bg: 'bg-amber-500/10' },
  high: { color: 'text-orange-500', bg: 'bg-orange-500/10' },
  critical: { color: 'text-destructive', bg: 'bg-destructive/10' },
};

const loopConfig: Record<string, { color: string; bg: string }> = {
  none: { color: 'text-muted-foreground', bg: 'bg-muted' },
  weak: { color: 'text-amber-500', bg: 'bg-amber-500/10' },
  moderate: { color: 'text-blue-500', bg: 'bg-blue-500/10' },
  strong: { color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
  viral: { color: 'text-purple-500', bg: 'bg-purple-500/10' },
};

const ShortsDominationPanel: React.FC<Props> = ({ result }) => {
  const [expandedPhases, setExpandedPhases] = useState<Record<string, boolean>>({
    phase1: true, phase2: true, phase3: false, phase4: false,
    phase5: false, phase6: false, phase7: false,
  });

  const togglePhase = (phase: string) => {
    setExpandedPhases(prev => ({ ...prev, [phase]: !prev[phase] }));
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied!");
  };

  const verdict = verdictConfig[result.video_verdict] || verdictConfig.WEAK;
  const swipeRisk = swipeRiskConfig[result.swipe_failure_risk] || swipeRiskConfig.high;
  const loopLevel = loopConfig[result.loop_addiction_level] || loopConfig.weak;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <Zap className="w-5 h-5 text-violet-500" />
        </div>
        <div>
          <h3 className="text-lg font-bold">Shorts Domination Engine</h3>
          <p className="text-xs text-muted-foreground">7-Phase Algorithm Manipulation Analysis</p>
        </div>
      </div>

      {/* Top-Level Scores */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Algorithm Favor */}
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{result.algorithm_favor_score}</div>
            <div className="text-xs text-muted-foreground">Algorithm Favor</div>
            <Progress value={result.algorithm_favor_score} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        {/* Swipe Failure Risk */}
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Badge className={cn("text-sm", swipeRisk.bg, swipeRisk.color, "border-0")}>
              {result.swipe_failure_risk.toUpperCase()}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">Swipe Risk</div>
          </CardContent>
        </Card>
        {/* Watch-Through */}
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{result.watch_through_percent}%</div>
            <div className="text-xs text-muted-foreground">Watch-Through</div>
            <Progress value={result.watch_through_percent} className="h-1.5 mt-2" />
          </CardContent>
        </Card>
        {/* Loop Addiction */}
        <Card className="border-border">
          <CardContent className="p-4 text-center">
            <Badge className={cn("text-sm", loopLevel.bg, loopLevel.color, "border-0")}>
              {result.loop_addiction_level.toUpperCase()}
            </Badge>
            <div className="text-xs text-muted-foreground mt-2">Loop Level</div>
          </CardContent>
        </Card>
      </div>

      {/* Verdict */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={verdict.color}>{verdict.icon}</div>
            <div>
              <span className={cn("text-lg font-bold", verdict.color)}>{verdict.label}</span>
              <p className="text-sm text-muted-foreground mt-1">{result.why_algorithm_pushes_or_kills}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 1: Scroll-Break */}
      <Card className="border-border">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => togglePhase('phase1')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="w-4 h-4 text-violet-500" />
              Phase 1: Scroll-Break Dominance
              <Badge variant="outline">{result.phase1_scroll_break.score}/100</Badge>
            </CardTitle>
            {expandedPhases.phase1 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedPhases.phase1 && (
          <CardContent className="pt-0 space-y-3">
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Opening Frame:</span> {result.phase1_scroll_break.opening_frame_verdict}</div>
              <div><span className="text-muted-foreground">Hook:</span> {result.phase1_scroll_break.hook_effectiveness}</div>
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">FIXES:</span>
              {result.phase1_scroll_break.fixes?.map((fix, i) => (
                <div key={i} className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                  <Zap className="w-3 h-3 text-violet-500 mt-0.5 shrink-0" />
                  {fix}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Phase 2: Watch-Through */}
      <Card className="border-border">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => togglePhase('phase2')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              Phase 2: Watch-Through Engineering
              <Badge variant="outline">{result.phase2_watch_through.score}/100</Badge>
            </CardTitle>
            {expandedPhases.phase2 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedPhases.phase2 && (
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Replay Probability:</span> <strong>{result.phase2_watch_through.replay_probability}%</strong></div>
              <div><span className="text-muted-foreground">Ideal Length:</span> <strong>{result.phase2_watch_through.ideal_length_seconds}s</strong></div>
            </div>
            <div className="text-sm"><span className="text-muted-foreground">Length Verdict:</span> {result.phase2_watch_through.current_length_verdict}</div>
            {result.phase2_watch_through.retention_issues?.length > 0 && (
              <div className="space-y-1">
                <span className="text-xs font-medium text-destructive">RETENTION ISSUES:</span>
                {result.phase2_watch_through.retention_issues.map((issue, i) => (
                  <div key={i} className="text-sm text-destructive/80 bg-destructive/5 p-2 rounded">⚠ {issue}</div>
                ))}
              </div>
            )}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">FIXES:</span>
              {result.phase2_watch_through.fixes?.map((fix, i) => (
                <div key={i} className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                  <Zap className="w-3 h-3 text-blue-500 mt-0.5 shrink-0" />
                  {fix}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Phase 3: Loop & Replay */}
      <Card className="border-border">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => togglePhase('phase3')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Repeat className="w-4 h-4 text-emerald-500" />
              Phase 3: Loop & Replay Mechanics
              <Badge variant="outline">{result.phase3_loop.loop_strength}/100</Badge>
            </CardTitle>
            {expandedPhases.phase3 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedPhases.phase3 && (
          <CardContent className="pt-0 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">Rewatch Multiplier:</span> <strong>{result.phase3_loop.rewatch_multiplier}x</strong></div>
              <div><span className="text-muted-foreground">Loop Type:</span> <strong>{result.phase3_loop.loop_type}</strong></div>
            </div>
            <div className="space-y-1">
              {result.phase3_loop.loop_fixes?.map((fix, i) => (
                <div key={i} className="flex items-start gap-2 text-sm bg-muted/50 p-2 rounded">
                  <RotateCcw className="w-3 h-3 text-emerald-500 mt-0.5 shrink-0" />
                  {fix}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Phase 4: Velocity */}
      <Card className="border-border">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => togglePhase('phase4')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-orange-500" />
              Phase 4: Velocity Prediction
            </CardTitle>
            {expandedPhases.phase4 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedPhases.phase4 && (
          <CardContent className="pt-0 space-y-2 text-sm">
            <div className="grid grid-cols-1 gap-2">
              <div className="bg-muted/50 p-2 rounded"><span className="text-muted-foreground">First 10min:</span> {result.phase4_velocity.first_10min}</div>
              <div className="bg-muted/50 p-2 rounded"><span className="text-muted-foreground">First 30min:</span> {result.phase4_velocity.first_30min}</div>
              <div className="bg-muted/50 p-2 rounded"><span className="text-muted-foreground">First 2hrs:</span> {result.phase4_velocity.first_2hours}</div>
            </div>
            <div><span className="text-muted-foreground">Peak Velocity:</span> Minute {result.phase4_velocity.peak_velocity_minute}</div>
            <div className="bg-primary/5 border border-primary/20 p-2 rounded">
              <span className="text-xs font-medium text-primary">REPUSH TRIGGER:</span>
              <p className="text-sm mt-1">{result.phase4_velocity.repush_trigger}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Phase 5: Push Strategy */}
      <Card className="border-border">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => togglePhase('phase5')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Rocket className="w-4 h-4 text-pink-500" />
              Phase 5: Multi-Wave Push Strategy
              <Badge variant="outline">{result.phase5_push_strategy.explosion_probability}% Explosion</Badge>
            </CardTitle>
            {expandedPhases.phase5 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedPhases.phase5 && (
          <CardContent className="pt-0 space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><span className="text-muted-foreground">Initial Push:</span> <strong>{result.phase5_push_strategy.initial_push_strength}</strong></div>
              <div><span className="text-muted-foreground">Stall Prob:</span> <strong>{result.phase5_push_strategy.stall_probability}%</strong></div>
            </div>
            <div><span className="text-muted-foreground">Timeline:</span> {result.phase5_push_strategy.timeline_prediction}</div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">REPUSH CONDITIONS:</span>
              {result.phase5_push_strategy.repush_conditions?.map((cond, i) => (
                <div key={i} className="text-sm bg-muted/50 p-2 rounded flex items-start gap-2">
                  <ArrowRight className="w-3 h-3 text-pink-500 mt-0.5 shrink-0" />
                  {cond}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Phase 6: Cluster */}
      <Card className="border-border">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => togglePhase('phase6')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-500" />
              Phase 6: Shorts Cluster Strategy
            </CardTitle>
            {expandedPhases.phase6 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedPhases.phase6 && (
          <CardContent className="pt-0 space-y-3 text-sm">
            <div>{result.phase6_cluster.cluster_strategy}</div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">SUPPORTING ANGLES:</span>
              {result.phase6_cluster.supporting_angles?.map((angle, i) => (
                <div key={i} className="bg-muted/50 p-2 rounded flex items-start gap-2">
                  <Target className="w-3 h-3 text-cyan-500 mt-0.5 shrink-0" />
                  {angle}
                </div>
              ))}
            </div>
            <div className="bg-cyan-500/5 border border-cyan-500/20 p-2 rounded">
              <span className="text-xs font-medium text-cyan-500">WINNER LOGIC:</span>
              <p className="mt-1">{result.phase6_cluster.winner_selection_logic}</p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Phase 7: Funnel */}
      <Card className="border-border">
        <CardHeader className="pb-2 cursor-pointer" onClick={() => togglePhase('phase7')}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-amber-500" />
              Phase 7: Funnel & Monetization
              <Badge variant="outline" className="capitalize">{result.phase7_funnel.funnel_role}</Badge>
            </CardTitle>
            {expandedPhases.phase7 ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </CardHeader>
        {expandedPhases.phase7 && (
          <CardContent className="pt-0 space-y-3 text-sm">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">CTA SCRIPT:</span>
                <Button variant="ghost" size="sm" onClick={() => copyText(result.phase7_funnel.cta_script)}><Copy className="w-3 h-3" /></Button>
              </div>
              <div className="bg-muted/50 p-2 rounded italic">"{result.phase7_funnel.cta_script}"</div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-muted-foreground">PIN COMMENT:</span>
                <Button variant="ghost" size="sm" onClick={() => copyText(result.phase7_funnel.pin_comment)}><Copy className="w-3 h-3" /></Button>
              </div>
              <div className="bg-muted/50 p-2 rounded flex items-start gap-2">
                <MessageCircle className="w-3 h-3 text-amber-500 mt-0.5 shrink-0" />
                {result.phase7_funnel.pin_comment}
              </div>
            </div>
            <div>
              <span className="text-xs font-medium text-muted-foreground">LONG-FORM BRIDGE:</span>
              <div className="bg-muted/50 p-2 rounded mt-1">{result.phase7_funnel.long_form_bridge_idea}</div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Exact Fixes */}
      <Card className="border-primary/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Exact Fixes (Priority Order)
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-2">
          {result.exact_fixes?.map((fix, i) => (
            <div key={i} className="flex items-start gap-3 text-sm bg-primary/5 border border-primary/10 p-3 rounded">
              <span className="font-bold text-primary shrink-0">{i + 1}.</span>
              {fix}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reupload Decision */}
      <Card className="border-border">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <RotateCcw className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <span className="text-xs font-medium text-muted-foreground">REUPLOAD DECISION:</span>
              <p className="text-sm mt-1">{result.reupload_decision}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShortsDominationPanel;
