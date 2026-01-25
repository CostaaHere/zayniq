import React from "react";
import { Badge } from "@/components/ui/badge";
import { Brain, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionInsightCardProps {
  insight: string;
  confidence?: 'low' | 'medium' | 'high' | 'experimental';
  compact?: boolean;
  className?: string;
}

export const PredictionInsightCard: React.FC<PredictionInsightCardProps> = ({
  insight,
  confidence = 'medium',
  compact = false,
  className,
}) => {
  const getConfidenceBg = () => {
    switch (confidence) {
      case 'high': return 'bg-green-500/10 border-green-500/20';
      case 'experimental': return 'bg-purple-500/10 border-purple-500/20';
      case 'low': return 'bg-amber-500/10 border-amber-500/20';
      default: return 'bg-primary/5 border-primary/20';
    }
  };

  const getConfidenceLabel = () => {
    switch (confidence) {
      case 'high': return { label: 'High Confidence', color: 'text-green-400 bg-green-500/20 border-green-500/30' };
      case 'experimental': return { label: 'Experimental', color: 'text-purple-400 bg-purple-500/20 border-purple-500/30' };
      case 'low': return { label: 'Needs Work', color: 'text-amber-400 bg-amber-500/20 border-amber-500/30' };
      default: return { label: 'Solid Potential', color: 'text-blue-400 bg-blue-500/20 border-blue-500/30' };
    }
  };

  const confLabel = getConfidenceLabel();

  if (compact) {
    return (
      <div className={cn("flex items-start gap-2 p-2 rounded-lg", getConfidenceBg(), className)}>
        <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
        <p className="text-sm text-foreground/90 leading-relaxed">{insight}</p>
      </div>
    );
  }

  return (
    <div className={cn("p-4 rounded-lg border", getConfidenceBg(), className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Prediction Insight</span>
        </div>
        <Badge variant="outline" className={cn("text-xs gap-1", confLabel.color)}>
          {confLabel.label}
        </Badge>
      </div>
      <p className="text-sm text-foreground/90 leading-relaxed">{insight}</p>
    </div>
  );
};

export default PredictionInsightCard;
