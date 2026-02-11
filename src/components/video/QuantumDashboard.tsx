import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Target,
  Rocket,
  Brain,
  DollarSign,
  Zap,
  Heart,
  Loader2,
  Play,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { AVOEAnalysis } from "@/types/avoe";
import type { ViralSEOResult } from "./ViralSEOPanel";
import type { YAREEResult } from "./YAREEPanel";
import type { YRDEResult } from "./YRDEPanel";
import type { SDEResult } from "./ShortsDominationPanel";
import type { VIEResult } from "./ViewerIntentPanel";
import type { VSEResult } from "./SatisfactionEnginePanel";

interface EngineState {
  avoe: AVOEAnalysis | null;
  seo: ViralSEOResult | null;
  yaree: YAREEResult | null;
  yrde: YRDEResult | null;
  sde: SDEResult | null;
  vie: VIEResult | null;
  vse: VSEResult | null;
}

interface LoadingState {
  avoe: boolean;
  seo: boolean;
  yaree: boolean;
  yrde: boolean;
  sde: boolean;
  vie: boolean;
  vse: boolean;
}

interface QuantumDashboardProps {
  engines: EngineState;
  loading: LoadingState;
  isShort: boolean;
  onRunAVOE: () => void;
  onRunSEO: () => void;
  onRunYAREE: () => void;
  onRunYRDE: () => void;
  onRunSDE: () => void;
  onRunVIE: () => void;
  onRunVSE: () => void;
}

interface EngineConfig {
  key: keyof EngineState;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
  color: string;
  borderColor: string;
  bgColor: string;
  getScore: (engines: EngineState) => number | null;
  getStatus?: (engines: EngineState) => string | null;
  onRun: () => void;
  shortsOnly?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 90) return "text-emerald-400";
  if (score >= 75) return "text-primary";
  if (score >= 60) return "text-amber-400";
  return "text-red-400";
};

const getScoreGrade = (score: number) => {
  if (score >= 90) return "S";
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
};

const getProgressColor = (score: number) => {
  if (score >= 90) return "[&>div]:bg-emerald-500";
  if (score >= 75) return "[&>div]:bg-primary";
  if (score >= 60) return "[&>div]:bg-amber-500";
  return "[&>div]:bg-red-500";
};

const QuantumDashboard = ({
  engines,
  loading,
  isShort,
  onRunAVOE,
  onRunSEO,
  onRunYAREE,
  onRunYRDE,
  onRunSDE,
  onRunVIE,
  onRunVSE,
}: QuantumDashboardProps) => {
  const engineConfigs: EngineConfig[] = [
    {
      key: "avoe",
      label: "Packaging & Metadata",
      shortLabel: "AVOE",
      icon: <Target className="w-4 h-4" />,
      color: "text-primary",
      borderColor: "border-primary/30",
      bgColor: "bg-primary/5",
      getScore: (e) => e.avoe?.overallScore ?? null,
      onRun: onRunAVOE,
    },
    {
      key: "seo",
      label: "Search & Visibility",
      shortLabel: "Viral SEO",
      icon: <Rocket className="w-4 h-4" />,
      color: "text-primary",
      borderColor: "border-primary/30",
      bgColor: "bg-primary/5",
      getScore: (e) => (e.seo as any)?.final_seo_score ?? null,
      onRun: onRunSEO,
    },
    {
      key: "yaree",
      label: "Algorithm Signals",
      shortLabel: "YAREE",
      icon: <Brain className="w-4 h-4" />,
      color: "text-amber-500",
      borderColor: "border-amber-500/30",
      bgColor: "bg-amber-500/5",
      getScore: (e) => e.yaree?.algorithm_confidence ?? null,
      getStatus: (e) => e.yaree?.video_status ?? null,
      onRun: onRunYAREE,
    },
    {
      key: "yrde",
      label: "Monetization",
      shortLabel: "YRDE",
      icon: <DollarSign className="w-4 h-4" />,
      color: "text-emerald-500",
      borderColor: "border-emerald-500/30",
      bgColor: "bg-emerald-500/5",
      getScore: (e) => e.yrde?.monetization_health ?? null,
      onRun: onRunYRDE,
    },
    {
      key: "sde",
      label: "Shorts Domination",
      shortLabel: "SDE",
      icon: <Zap className="w-4 h-4" />,
      color: "text-violet-500",
      borderColor: "border-violet-500/30",
      bgColor: "bg-violet-500/5",
      getScore: (e) => e.sde?.algorithm_favor_score ?? null,
      onRun: onRunSDE,
      shortsOnly: true,
    },
    {
      key: "vie",
      label: "Viewer Intent",
      shortLabel: "VIE",
      icon: <Target className="w-4 h-4" />,
      color: "text-cyan-500",
      borderColor: "border-cyan-500/30",
      bgColor: "bg-cyan-500/5",
      getScore: (e) => e.vie?.gravity_score?.total ?? null,
      onRun: onRunVIE,
    },
    {
      key: "vse",
      label: "Satisfaction",
      shortLabel: "VSE",
      icon: <Heart className="w-4 h-4" />,
      color: "text-rose-500",
      borderColor: "border-rose-500/30",
      bgColor: "bg-rose-500/5",
      getScore: (e) => e.vse?.satisfaction_score?.total ?? null,
      onRun: onRunVSE,
    },
  ];

  const activeEngines = engineConfigs.filter(
    (ec) => !ec.shortsOnly || isShort
  );

  const completedEngines = activeEngines.filter(
    (ec) => ec.getScore(engines) !== null
  );

  const scores = completedEngines
    .map((ec) => ec.getScore(engines)!)
    .filter((s) => s !== null);

  const quantumScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : null;

  const anyRunning = Object.values(loading).some(Boolean);

  const runAll = () => {
    activeEngines.forEach((ec) => {
      if (ec.getScore(engines) === null && !loading[ec.key]) {
        ec.onRun();
      }
    });
  };

  return (
    <div className="bg-card rounded-xl border border-border overflow-hidden">
      {/* Header with Quantum Score */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-sm tracking-wide uppercase text-muted-foreground">
              Quantum Score
            </h3>
          </div>
          <Badge
            variant="outline"
            className="text-xs"
          >
            {completedEngines.length}/{activeEngines.length} engines
          </Badge>
        </div>

        {quantumScore !== null ? (
          <div className="text-center space-y-2">
            <div className="relative inline-flex items-center justify-center">
              <div
                className={cn(
                  "text-5xl font-bold tracking-tight",
                  getScoreColor(quantumScore)
                )}
              >
                {quantumScore}
              </div>
              <div
                className={cn(
                  "absolute -top-1 -right-6 text-lg font-bold",
                  getScoreColor(quantumScore)
                )}
              >
                {getScoreGrade(quantumScore)}
              </div>
            </div>
            <Progress
              value={quantumScore}
              className={cn("h-1.5", getProgressColor(quantumScore))}
            />
          </div>
        ) : (
          <div className="text-center py-3">
            <div className="text-3xl font-bold text-muted-foreground/30">—</div>
            <p className="text-xs text-muted-foreground mt-1">
              Run engines to generate score
            </p>
          </div>
        )}
      </div>

      {/* Engine Grid */}
      <div className="p-3 space-y-1">
        {activeEngines.map((ec) => {
          const score = ec.getScore(engines);
          const isLoading = loading[ec.key];
          const status = ec.getStatus?.(engines);

          return (
            <button
              key={ec.key}
              onClick={ec.onRun}
              disabled={isLoading}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left",
                "hover:bg-muted/50",
                score !== null && ec.bgColor,
                score !== null && "border",
                score !== null && ec.borderColor,
                score === null && !isLoading && "opacity-60 hover:opacity-100"
              )}
            >
              {/* Icon */}
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  score !== null ? ec.bgColor : "bg-muted"
                )}
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                ) : (
                  <span className={score !== null ? ec.color : "text-muted-foreground"}>
                    {ec.icon}
                  </span>
                )}
              </div>

              {/* Label */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {ec.shortLabel}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {isLoading
                    ? "Analyzing..."
                    : score !== null
                    ? ec.label
                    : "Tap to run"}
                </div>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 text-right">
                {score !== null ? (
                  <div className="flex items-center gap-1.5">
                    {status && (
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          status === "EXPLODING" && "border-emerald-500/50 text-emerald-400",
                          status === "HOT" && "border-amber-500/50 text-amber-400",
                          status === "WARM" && "border-yellow-500/50 text-yellow-400",
                          status === "STALLED" && "border-orange-500/50 text-orange-400",
                          status === "DEAD" && "border-red-500/50 text-red-400"
                        )}
                      >
                        {status}
                      </Badge>
                    )}
                    <span
                      className={cn(
                        "text-lg font-bold tabular-nums",
                        getScoreColor(score)
                      )}
                    >
                      {score}
                    </span>
                  </div>
                ) : isLoading ? (
                  <span className="text-xs text-muted-foreground">...</span>
                ) : (
                  <Play className="w-3.5 h-3.5 text-muted-foreground" />
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Run All Button */}
      {completedEngines.length < activeEngines.length && (
        <div className="p-3 pt-0">
          <Button
            onClick={runAll}
            disabled={anyRunning}
            variant="outline"
            className="w-full gap-2 text-sm"
            size="sm"
          >
            {anyRunning ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5" />
            )}
            Run All Remaining Engines
          </Button>
        </div>
      )}

      {/* Summary when all complete */}
      {completedEngines.length === activeEngines.length && quantumScore !== null && (
        <div className="p-4 border-t border-border bg-muted/20">
          <div className="flex items-center gap-2 mb-2">
            {quantumScore >= 80 ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-sm font-medium">
              {quantumScore >= 90
                ? "Exceptional — Algorithm-Ready"
                : quantumScore >= 80
                ? "Strong — Minor Optimizations Possible"
                : quantumScore >= 70
                ? "Good — Review Weak Engines"
                : quantumScore >= 60
                ? "Needs Work — Multiple Gaps Detected"
                : "Critical — Rebuild Recommended"}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {completedEngines
              .filter((ec) => (ec.getScore(engines) ?? 0) < 70)
              .map((ec) => (
                <Badge
                  key={ec.key}
                  variant="outline"
                  className="text-[10px] border-amber-500/30 text-amber-400"
                >
                  {ec.shortLabel} needs attention
                </Badge>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantumDashboard;
