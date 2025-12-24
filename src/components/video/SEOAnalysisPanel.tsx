import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, AlertCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScoreItemProps {
  label: string;
  score: number;
  feedback: string;
  onImprove?: () => void;
}

const ScoreItem = ({ label, score, feedback, onImprove }: ScoreItemProps) => {
  const getScoreColor = (s: number) => {
    if (s >= 75) return "text-green-500";
    if (s >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const getScoreIcon = (s: number) => {
    if (s >= 75) return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    if (s >= 50) return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    return <XCircle className="w-4 h-4 text-red-500" />;
  };

  return (
    <div className="p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {getScoreIcon(score)}
          <span className="font-medium">{label}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={cn("font-bold", getScoreColor(score))}>{score}/100</span>
          {onImprove && (
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-7" onClick={onImprove}>
              <Sparkles className="w-3 h-3" />
              Improve with AI
            </Button>
          )}
        </div>
      </div>
      <p className="text-sm text-muted-foreground">{feedback}</p>
    </div>
  );
};

interface SEOAnalysisPanelProps {
  overallScore: number;
  titleScore: number;
  titleFeedback: string;
  descriptionScore: number;
  descriptionFeedback: string;
  tagsScore: number;
  tagsFeedback: string;
  recommendations: string[];
  onImproveTitle?: () => void;
  onImproveDescription?: () => void;
  onImproveTags?: () => void;
}

const SEOAnalysisPanel = ({
  overallScore,
  titleScore,
  titleFeedback,
  descriptionScore,
  descriptionFeedback,
  tagsScore,
  tagsFeedback,
  recommendations,
  onImproveTitle,
  onImproveDescription,
  onImproveTags,
}: SEOAnalysisPanelProps) => {
  const getOverallColor = (s: number) => {
    if (s >= 75) return "stroke-green-500";
    if (s >= 50) return "stroke-yellow-500";
    return "stroke-red-500";
  };

  const getOverallBg = (s: number) => {
    if (s >= 75) return "text-green-500";
    if (s >= 50) return "text-yellow-500";
    return "text-red-500";
  };

  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (overallScore / 100) * circumference;

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">SEO Analysis</h3>
        <Badge variant="outline" className={cn("text-sm", getOverallBg(overallScore))}>
          {overallScore >= 75 ? "Good" : overallScore >= 50 ? "Needs Work" : "Poor"}
        </Badge>
      </div>

      {/* Overall Score Circle */}
      <div className="flex justify-center py-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={getOverallColor(overallScore)}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
                transition: "stroke-dashoffset 0.5s ease",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-bold", getOverallBg(overallScore))}>
              {overallScore}
            </span>
            <span className="text-xs text-muted-foreground">Overall Score</span>
          </div>
        </div>
      </div>

      {/* Individual Scores */}
      <div className="space-y-3">
        <ScoreItem
          label="Title"
          score={titleScore}
          feedback={titleFeedback}
          onImprove={onImproveTitle}
        />
        <ScoreItem
          label="Description"
          score={descriptionScore}
          feedback={descriptionFeedback}
          onImprove={onImproveDescription}
        />
        <ScoreItem
          label="Tags"
          score={tagsScore}
          feedback={tagsFeedback}
          onImprove={onImproveTags}
        />
      </div>

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Recommendations</h4>
          <ul className="space-y-2">
            {recommendations.map((rec, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SEOAnalysisPanel;
