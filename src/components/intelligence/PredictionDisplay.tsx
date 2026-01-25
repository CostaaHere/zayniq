import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  Target, 
  BarChart3,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Lightbulb
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  PerformancePrediction, 
  getConfidenceColor, 
  getConfidenceBgColor,
  getTrendIcon,
  getRecommendationColor 
} from "@/types/prediction";

interface PredictionDisplayProps {
  prediction: PerformancePrediction;
  title?: string;
  compact?: boolean;
  className?: string;
}

export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
  prediction,
  title,
  compact = false,
  className,
}) => {
  if (compact) {
    return (
      <div className={cn("space-y-2", className)}>
        {/* Compact confidence badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={cn("gap-1", getConfidenceBgColor(prediction.overallConfidence))}>
            <Brain className="w-3 h-3" />
            {prediction.overallConfidence === 'high' ? 'High Confidence' :
             prediction.overallConfidence === 'experimental' ? 'Experimental' :
             prediction.overallConfidence === 'low' ? 'Needs Work' : 'Solid Potential'}
          </Badge>
          
          {prediction.ctr.vsChannelAverage && (
            <Badge variant="outline" className="gap-1 bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
              <TrendingUp className="w-3 h-3" />
              {prediction.ctr.vsChannelAverage}
            </Badge>
          )}
          
          {prediction.algorithm.promotionLikelihood === 'high' && (
            <Badge variant="outline" className="gap-1 bg-blue-500/10 text-blue-400 border-blue-500/30">
              <Zap className="w-3 h-3" />
              Algorithm Favored
            </Badge>
          )}
        </div>
        
        {/* Compact insight */}
        <p className="text-sm text-muted-foreground leading-relaxed">
          {prediction.recommendationSummary}
        </p>
      </div>
    );
  }

  return (
    <Card className={cn("border-border/50 bg-card/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            {title || "Performance Prediction"}
          </CardTitle>
          <Badge className={cn("gap-1", getConfidenceBgColor(prediction.overallConfidence))}>
            {prediction.overallConfidence === 'high' ? 'High Confidence' :
             prediction.overallConfidence === 'experimental' ? 'Experimental' :
             prediction.overallConfidence === 'low' ? 'Low Confidence' : 'Medium Confidence'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Confidence Score</span>
            <span className={cn("font-medium", getConfidenceColor(prediction.overallConfidence))}>
              {prediction.overallConfidenceScore}%
            </span>
          </div>
          <Progress 
            value={prediction.overallConfidenceScore} 
            className="h-2"
          />
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* CTR Prediction */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-muted-foreground">CTR Prediction</span>
            </div>
            <p className="text-sm font-medium text-emerald-400">
              {prediction.ctr.vsChannelAverage}
            </p>
          </div>

          {/* Algorithm */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              <span className="text-xs text-muted-foreground">Algorithm</span>
            </div>
            <p className="text-sm font-medium text-blue-400 capitalize">
              {prediction.algorithm.promotionLikelihood} Promotion
            </p>
          </div>

          {/* Trend */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              {prediction.competition.trendAlignment === 'rising' || 
               prediction.competition.trendAlignment === 'viral_potential' ? (
                <TrendingUp className="w-4 h-4 text-purple-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-amber-400" />
              )}
              <span className="text-xs text-muted-foreground">Trend</span>
            </div>
            <p className="text-sm font-medium capitalize">
              {getTrendIcon(prediction.competition.trendAlignment)}{' '}
              {prediction.competition.trendAlignment.replace('_', ' ')}
            </p>
          </div>

          {/* Competition */}
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-4 h-4 text-amber-400" />
              <span className="text-xs text-muted-foreground">Competition</span>
            </div>
            <p className="text-sm font-medium capitalize">
              {prediction.competition.competitionSaturation} Saturation
            </p>
          </div>
        </div>

        {/* Recommendation Summary */}
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-start gap-2">
            <Lightbulb className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
            <p className="text-sm text-foreground/90 leading-relaxed">
              {prediction.recommendationSummary}
            </p>
          </div>
        </div>

        {/* Success Indicators & Risk Factors */}
        <div className="grid grid-cols-2 gap-3">
          {prediction.successIndicators.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                Success Indicators
              </span>
              <div className="space-y-1">
                {prediction.successIndicators.slice(0, 3).map((indicator, i) => (
                  <p key={i} className="text-xs text-green-400/80">• {indicator}</p>
                ))}
              </div>
            </div>
          )}

          {prediction.riskFactors.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Risk Factors
              </span>
              <div className="space-y-1">
                {prediction.riskFactors.slice(0, 3).map((risk, i) => (
                  <p key={i} className="text-xs text-amber-400/80">• {risk}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* What-If Simulations */}
        {prediction.simulations.simulations.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Brain className="w-3 h-3" />
              What-If Simulations
            </span>
            <div className="space-y-2">
              {prediction.simulations.simulations.slice(0, 3).map((sim, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "p-2 rounded border text-xs",
                    getRecommendationColor(sim.recommendation)
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{sim.scenario}</span>
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {sim.recommendation}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    CTR: {sim.predictedOutcome.ctrChange} • {sim.predictedOutcome.growthImpact}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimal Path */}
        {prediction.simulations.optimalPath && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-green-400" />
              <span className="text-sm font-medium text-green-400">Optimal Path</span>
            </div>
            <p className="text-sm text-foreground/90 mb-1">
              {prediction.simulations.optimalPath.strategy}
            </p>
            <p className="text-xs text-muted-foreground">
              {prediction.simulations.optimalPath.reasoning}
            </p>
            <p className="text-xs text-green-400 mt-1">
              Expected: {prediction.simulations.optimalPath.expectedOutcome}
            </p>
          </div>
        )}

        {/* Optimal Posting Time */}
        {prediction.algorithm.optimalPostingWindow && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Best posting time: {prediction.algorithm.optimalPostingWindow}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PredictionDisplay;
