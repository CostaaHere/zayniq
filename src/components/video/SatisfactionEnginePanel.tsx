import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle2, AlertTriangle, XCircle, Heart, Brain, Lightbulb, Trophy, Sparkles, ArrowRight, ShieldCheck, RotateCcw, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export interface VSEResult {
  satisfaction_score: {
    total: number;
    promise_alignment: number;
    payoff_delivery: number;
    emotional_match: number;
    rewatch_potential: number;
  };
  promise_audit: {
    explicit_promises: string[];
    implicit_promises: string[];
    emotional_expectation: string;
    outcome_expectation: string;
  };
  delivery_assessment: {
    information_depth: string;
    entertainment_value: string;
    practical_value: string;
    time_investment_payoff: string;
  };
  gap_detection: {
    gap_type: string;
    severity: string;
    expectation: string;
    reality: string;
    impact: string;
  };
  primary_payoff: {
    type: string;
    label: string;
    trigger: string;
    viewer_feeling: string;
  };
  cognitive_closure: {
    loops_opened: string[];
    loops_closed: boolean;
    loose_ends: string[];
    closure_quality: string;
  };
  satisfaction_signals: {
    not_interested_risk: {
      level: string;
      triggers: string[];
    };
    rewatch_drivers: string[];
    session_extension: {
      likelihood: string;
      reasons: string[];
    };
    trust_signals: string[];
  };
  payoff_fixes: Array<{
    area: string;
    current: string;
    fix: string;
    impact: string;
  }>;
  optimized_title: string;
  optimized_description_hook: string;
  algorithm_confidence: {
    retention_signal: string;
    engagement_signal: string;
    session_signal: string;
    trust_signal: string;
    repush_likelihood: string;
  };
  why_youtube_recommends: string;
  rebuild_needed: boolean;
  rebuild_actions: string[];
  personalizedWithDNA?: boolean;
  generatedAt?: string;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-emerald-400";
  if (score >= 75) return "text-primary";
  if (score >= 60) return "text-amber-400";
  return "text-destructive";
};

const getScoreBg = (score: number) => {
  if (score >= 90) return "bg-emerald-500/10 border-emerald-500/30";
  if (score >= 75) return "bg-primary/10 border-primary/30";
  if (score >= 60) return "bg-amber-500/10 border-amber-500/30";
  return "bg-destructive/10 border-destructive/30";
};

const getSeverityIcon = (severity: string) => {
  switch (severity) {
    case "none": return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
    case "minor": return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    case "moderate": return <AlertTriangle className="w-4 h-4 text-orange-400" />;
    case "critical": return <XCircle className="w-4 h-4 text-destructive" />;
    default: return null;
  }
};

const getPayoffIcon = (type: string) => {
  switch (type) {
    case "knowledge": return <Brain className="w-5 h-5" />;
    case "solution": return <Lightbulb className="w-5 h-5" />;
    case "entertainment": return <Heart className="w-5 h-5" />;
    case "validation": return <Trophy className="w-5 h-5" />;
    case "inspiration": return <Sparkles className="w-5 h-5" />;
    default: return <Heart className="w-5 h-5" />;
  }
};

const copyText = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied!`);
};

interface Props {
  result: VSEResult;
}

const SatisfactionEnginePanel = ({ result }: Props) => {
  const score = result.satisfaction_score;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <Heart className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Viewer Satisfaction Engine</h3>
            <p className="text-xs text-muted-foreground">Post-watch satisfaction optimization</p>
          </div>
        </div>
        {result.personalizedWithDNA && (
          <Badge variant="secondary" className="text-xs">DNA-Aligned</Badge>
        )}
      </div>

      {/* Main Score */}
      <div className={`rounded-xl border p-6 text-center ${getScoreBg(score.total)}`}>
        <div className={`text-5xl font-bold mb-1 ${getScoreColor(score.total)}`}>
          {score.total}
        </div>
        <div className="text-sm text-muted-foreground mb-4">Satisfaction Score</div>
        
        <div className="grid grid-cols-2 gap-4 text-left">
          {[
            { label: "Promise Alignment", value: score.promise_alignment, weight: "30%" },
            { label: "Payoff Delivery", value: score.payoff_delivery, weight: "30%" },
            { label: "Emotional Match", value: score.emotional_match, weight: "20%" },
            { label: "Rewatch Potential", value: score.rewatch_potential, weight: "20%" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">{item.label}</span>
                <span className={`text-sm font-bold ${getScoreColor(item.value)}`}>{item.value}</span>
              </div>
              <Progress value={item.value} className="h-1.5" />
              <span className="text-[10px] text-muted-foreground">Weight: {item.weight}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gap Detection */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          {getSeverityIcon(result.gap_detection.severity)}
          <h4 className="font-semibold">Promise vs Delivery Gap</h4>
          <Badge variant={result.gap_detection.severity === "none" ? "secondary" : "destructive"} className="text-xs">
            {result.gap_detection.gap_type.replace("_", " ")}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Expectation</div>
            <p className="text-sm">{result.gap_detection.expectation}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3">
            <div className="text-xs text-muted-foreground mb-1">Reality</div>
            <p className="text-sm">{result.gap_detection.reality}</p>
          </div>
        </div>
        
        {result.gap_detection.severity !== "none" && (
          <p className="text-sm text-muted-foreground italic">{result.gap_detection.impact}</p>
        )}
      </div>

      {/* Primary Payoff */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          {getPayoffIcon(result.primary_payoff.type)}
          <h4 className="font-semibold">Primary Payoff</h4>
          <Badge className="text-xs capitalize">{result.primary_payoff.type}</Badge>
        </div>
        <div className="bg-muted/30 rounded-lg p-4 space-y-2">
          <p className="text-sm font-medium">{result.primary_payoff.label}</p>
          <p className="text-sm text-muted-foreground">Trigger: {result.primary_payoff.trigger}</p>
          <p className="text-sm text-muted-foreground">Viewer feels: <span className="text-foreground italic">"{result.primary_payoff.viewer_feeling}"</span></p>
        </div>
      </div>

      {/* Cognitive Closure */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          {result.cognitive_closure.loops_closed ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          )}
          <h4 className="font-semibold">Cognitive Closure</h4>
          <Badge variant={result.cognitive_closure.closure_quality === "complete" ? "secondary" : "outline"} className="text-xs capitalize">
            {result.cognitive_closure.closure_quality}
          </Badge>
        </div>
        
        {result.cognitive_closure.loops_opened.length > 0 && (
          <div>
            <div className="text-xs text-muted-foreground mb-1">Loops Opened</div>
            <div className="flex flex-wrap gap-1">
              {result.cognitive_closure.loops_opened.map((loop, i) => (
                <Badge key={i} variant="outline" className="text-xs">{loop}</Badge>
              ))}
            </div>
          </div>
        )}
        
        {result.cognitive_closure.loose_ends.length > 0 && (
          <div>
            <div className="text-xs text-destructive mb-1">⚠️ Loose Ends</div>
            <ul className="space-y-1">
              {result.cognitive_closure.loose_ends.map((end, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                  <ArrowRight className="w-3 h-3 mt-1 flex-shrink-0 text-destructive" />
                  {end}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Satisfaction Signals */}
      <div className="rounded-xl border border-border p-4 space-y-4">
        <h4 className="font-semibold flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Satisfaction Signals
        </h4>
        
        {/* Not Interested Risk */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">"Not Interested" Risk:</span>
            <Badge variant={result.satisfaction_signals.not_interested_risk.level === "low" ? "secondary" : "destructive"} className="text-xs capitalize">
              {result.satisfaction_signals.not_interested_risk.level}
            </Badge>
          </div>
          {result.satisfaction_signals.not_interested_risk.triggers.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {result.satisfaction_signals.not_interested_risk.triggers.map((t, i) => (
                <Badge key={i} variant="outline" className="text-xs">{t}</Badge>
              ))}
            </div>
          )}
        </div>

        {/* Rewatch Drivers */}
        {result.satisfaction_signals.rewatch_drivers.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <RotateCcw className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Rewatch Drivers</span>
            </div>
            <ul className="space-y-1">
              {result.satisfaction_signals.rewatch_drivers.map((d, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-1">
                  <CheckCircle2 className="w-3 h-3 mt-1 flex-shrink-0 text-emerald-400" />
                  {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trust Signals */}
        {result.satisfaction_signals.trust_signals.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <ShieldCheck className="w-3 h-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Trust Signals</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {result.satisfaction_signals.trust_signals.map((s, i) => (
                <Badge key={i} variant="secondary" className="text-xs">{s}</Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Payoff Fixes */}
      {result.payoff_fixes.length > 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <h4 className="font-semibold text-amber-400">🔧 Satisfaction Fixes</h4>
          <div className="space-y-3">
            {result.payoff_fixes.map((fix, i) => (
              <div key={i} className="bg-background/50 rounded-lg p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge className="text-xs capitalize">{fix.area}</Badge>
                  <span className="text-xs text-muted-foreground">→ {fix.impact}</span>
                </div>
                <p className="text-sm text-muted-foreground"><span className="text-destructive">Current:</span> {fix.current}</p>
                <p className="text-sm"><span className="text-emerald-400">Fix:</span> {fix.fix}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimized Title & Description */}
      {result.optimized_title && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 space-y-3">
          <h4 className="font-semibold text-emerald-400">✨ Satisfaction-Optimized Metadata</h4>
          
          <div className="space-y-3">
            <div className="bg-background/50 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Optimized Title</span>
                <Button variant="ghost" size="sm" onClick={() => copyText(result.optimized_title, "Title")}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
              <p className="text-sm font-medium">{result.optimized_title}</p>
            </div>
            
            {result.optimized_description_hook && (
              <div className="bg-background/50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">Description Hook</span>
                  <Button variant="ghost" size="sm" onClick={() => copyText(result.optimized_description_hook, "Description")}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
                <p className="text-sm whitespace-pre-wrap">{result.optimized_description_hook}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Algorithm Confidence */}
      <div className="rounded-xl border border-border p-4 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4" />
          <h4 className="font-semibold">Algorithm Confidence</h4>
          <Badge variant={result.algorithm_confidence.repush_likelihood === "high" ? "secondary" : "outline"} className="text-xs capitalize">
            Repush: {result.algorithm_confidence.repush_likelihood}
          </Badge>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            { label: "Retention", value: result.algorithm_confidence.retention_signal },
            { label: "Engagement", value: result.algorithm_confidence.engagement_signal },
            { label: "Session", value: result.algorithm_confidence.session_signal },
            { label: "Trust", value: result.algorithm_confidence.trust_signal },
          ].map((item) => (
            <div key={item.label} className="bg-muted/30 rounded-lg p-2">
              <div className="text-xs text-muted-foreground">{item.label}</div>
              <p className="text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why YouTube Recommends */}
      <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
        <h4 className="font-semibold mb-2">📡 Why YouTube Recommends This</h4>
        <p className="text-sm text-muted-foreground">{result.why_youtube_recommends}</p>
      </div>

      {/* Rebuild Actions */}
      {result.rebuild_needed && result.rebuild_actions.length > 0 && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
          <h4 className="font-semibold text-destructive">🚨 Rebuild Required</h4>
          <ol className="space-y-1">
            {result.rebuild_actions.map((action, i) => (
              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-destructive font-bold">{i + 1}.</span>
                {action}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
};

export default SatisfactionEnginePanel;
