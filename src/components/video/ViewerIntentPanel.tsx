import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Target,
  Users,
  Search,
  Lightbulb,
  Smile,
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Copy,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export interface VIEResult {
  primary_intent: {
    type: string;
    label: string;
    expectation: string;
    satisfaction_trigger: string;
    intent_signal: string;
  };
  secondary_intent: {
    type: string;
    label: string;
    why: string;
  };
  intent_layers: Array<{
    type: string;
    label: string;
    relevance: "high" | "medium" | "low";
    what_they_expect: string[];
    what_makes_them_stay: string[];
    what_makes_them_rewatch: string[];
  }>;
  intent_aligned_title: string;
  intent_aligned_description: string;
  supportive_tags: string[];
  consistency_check: {
    title_delivery_match: { aligned: boolean; explanation: string };
    description_reinforcement: { aligned: boolean; explanation: string };
    tags_classification: { aligned: boolean; explanation: string };
  };
  detected_issues: Array<{
    type: string;
    detected: string;
    correction: string;
  }>;
  gravity_score: {
    total: number;
    intent_clarity: number;
    consistency: number;
    satisfaction_probability: number;
    recommendation_compatibility: number;
  };
  why_youtube_recommends: string;
  rebuild_needed: boolean;
  rebuild_actions: string[];
  personalizedWithDNA?: boolean;
}

const intentIcons: Record<string, React.ReactNode> = {
  passive_scroller: <Users className="w-4 h-4" />,
  curious_explorer: <Search className="w-4 h-4" />,
  problem_solver: <Lightbulb className="w-4 h-4" />,
  entertainment_seeker: <Smile className="w-4 h-4" />,
  high_retention_repeat: <BookOpen className="w-4 h-4" />,
};

const intentColors: Record<string, string> = {
  passive_scroller: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  curious_explorer: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  problem_solver: "bg-green-500/10 text-green-500 border-green-500/20",
  entertainment_seeker: "bg-pink-500/10 text-pink-500 border-pink-500/20",
  high_retention_repeat: "bg-amber-500/10 text-amber-500 border-amber-500/20",
};

const relevanceColors: Record<string, string> = {
  high: "bg-green-500/10 text-green-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  low: "bg-muted text-muted-foreground",
};

function ScoreBar({ label, value }: { label: string; value: number }) {
  const color =
    value >= 85 ? "text-green-500" : value >= 70 ? "text-yellow-500" : "text-red-500";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-bold ${color}`}>{value}/100</span>
      </div>
      <Progress value={value} className="h-1.5" />
    </div>
  );
}

export default function ViewerIntentPanel({ result }: { result: VIEResult }) {
  const [showLayers, setShowLayers] = useState(false);
  const score = result.gravity_score;
  const scoreColor =
    score.total >= 85
      ? "text-green-500"
      : score.total >= 70
        ? "text-yellow-500"
        : "text-red-500";

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-cyan-500" />
        </div>
        <div>
          <h2 className="text-lg font-bold">Viewer Intent Engine</h2>
          <p className="text-xs text-muted-foreground">
            Intent alignment, not SEO
            {result.personalizedWithDNA && " • DNA-personalized"}
          </p>
        </div>
      </div>

      {/* Gravity Score */}
      <div className="bg-muted/30 rounded-xl p-6 text-center space-y-4">
        <div>
          <div className={`text-5xl font-black ${scoreColor}`}>{score.total}</div>
          <div className="text-sm text-muted-foreground mt-1">Intent Gravity Score</div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <ScoreBar label="Intent Clarity" value={score.intent_clarity} />
          <ScoreBar label="Consistency" value={score.consistency} />
          <ScoreBar label="Satisfaction" value={score.satisfaction_probability} />
          <ScoreBar label="Recommendation" value={score.recommendation_compatibility} />
        </div>
        {result.rebuild_needed && (
          <Badge variant="destructive" className="text-xs">
            ⚠️ Rebuild Needed — Score below 85
          </Badge>
        )}
      </div>

      {/* Primary & Secondary Intent */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Primary Intent</h3>
        <div
          className={`rounded-lg border p-4 space-y-2 ${intentColors[result.primary_intent.type] || "bg-muted/30"}`}
        >
          <div className="flex items-center gap-2 font-medium">
            {intentIcons[result.primary_intent.type]}
            {result.primary_intent.label}
          </div>
          <p className="text-sm opacity-90">{result.primary_intent.expectation}</p>
          <p className="text-xs opacity-70">
            Satisfaction: {result.primary_intent.satisfaction_trigger}
          </p>
          <Badge variant="outline" className="text-xs">
            Signal: "{result.primary_intent.intent_signal}"
          </Badge>
        </div>

        {result.secondary_intent && (
          <div className="rounded-lg border border-border p-3 space-y-1">
            <div className="flex items-center gap-2 text-sm font-medium">
              {intentIcons[result.secondary_intent.type]}
              Secondary: {result.secondary_intent.label}
            </div>
            <p className="text-xs text-muted-foreground">{result.secondary_intent.why}</p>
          </div>
        )}
      </div>

      {/* Intent Layers (collapsible) */}
      {result.intent_layers?.length > 0 && (
        <div>
          <button
            onClick={() => setShowLayers(!showLayers)}
            className="flex items-center gap-2 text-sm font-semibold w-full"
          >
            Intent Layer Breakdown
            {showLayers ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
          {showLayers && (
            <div className="mt-3 space-y-3">
              {result.intent_layers.map((layer, i) => (
                <div key={i} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      {intentIcons[layer.type]}
                      {layer.label}
                    </div>
                    <Badge className={`text-xs ${relevanceColors[layer.relevance]}`}>
                      {layer.relevance}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground font-medium">Expect: </span>
                      {layer.what_they_expect?.join(" • ")}
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium">Stay: </span>
                      {layer.what_makes_them_stay?.join(" • ")}
                    </div>
                    <div>
                      <span className="text-muted-foreground font-medium">Rewatch: </span>
                      {layer.what_makes_them_rewatch?.join(" • ")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Consistency Check */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Consistency Check</h3>
        {Object.entries(result.consistency_check || {}).map(([key, check]) => (
          <div key={key} className="flex items-start gap-2 text-sm">
            {check.aligned ? (
              <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <span className="font-medium">
                {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
              <p className="text-xs text-muted-foreground">{check.explanation}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Detected Issues */}
      {result.detected_issues?.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Detected Issues</h3>
          {result.detected_issues.map((issue, i) => (
            <Alert key={i} className="border-amber-500/30 bg-amber-500/5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <AlertDescription className="text-sm">
                <div className="font-medium capitalize mb-1">
                  {issue.type.replace(/_/g, " ")}
                </div>
                <p className="text-muted-foreground text-xs mb-1">
                  Found: {issue.detected}
                </p>
                <p className="text-xs">Fix: {issue.correction}</p>
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Intent-Aligned Recommendations */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Intent-Aligned Metadata</h3>

        <div className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Recommended Title</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => copyText(result.intent_aligned_title, "Title")}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-sm font-medium">{result.intent_aligned_title}</p>
        </div>

        <div className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Description Core
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() => copyText(result.intent_aligned_description, "Description")}
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <p className="text-sm">{result.intent_aligned_description}</p>
        </div>

        <div className="rounded-lg border border-border p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">
              Supportive Tags
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2"
              onClick={() =>
                copyText(result.supportive_tags?.join(", ") || "", "Tags")
              }
            >
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-1">
            {result.supportive_tags?.map((tag, i) => (
              <Badge key={i} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Why YouTube Recommends */}
      <div className="rounded-lg bg-primary/5 border border-primary/20 p-4 space-y-2">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Target className="w-4 h-4 text-primary" />
          Why YouTube Will Recommend This
        </h3>
        <p className="text-sm text-muted-foreground">{result.why_youtube_recommends}</p>
      </div>

      {/* Rebuild Actions */}
      {result.rebuild_needed && result.rebuild_actions?.length > 0 && (
        <div className="rounded-lg bg-destructive/5 border border-destructive/20 p-4 space-y-2">
          <h3 className="font-semibold text-sm text-destructive">
            🔄 Rebuild Sequence Required
          </h3>
          <ol className="list-decimal list-inside text-sm space-y-1 text-muted-foreground">
            {result.rebuild_actions.map((action, i) => (
              <li key={i}>{action}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  );
}
