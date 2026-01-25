import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Zap,
  Brain,
  ChevronDown,
  AlertTriangle,
  CheckCircle,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  RiskRewardAssessment,
  getRiskLevelColor,
  getStrategyTypeColor,
  getConfidenceColor,
  BOTTLENECK_LABELS,
  BottleneckType,
} from "@/types/intelligence";

interface RiskRewardMatrixProps {
  assessment: RiskRewardAssessment;
  strategicRationale?: string;
  className?: string;
  compact?: boolean;
}

export const RiskRewardMatrix: React.FC<RiskRewardMatrixProps> = ({
  assessment,
  strategicRationale,
  className,
  compact = false,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 flex-wrap", className)}>
        <Badge className={cn("gap-1", getRiskLevelColor(assessment.riskLevel))}>
          {assessment.riskLevel === 'aggressive' ? (
            <Zap className="w-3 h-3" />
          ) : assessment.riskLevel === 'high' ? (
            <AlertTriangle className="w-3 h-3" />
          ) : (
            <Shield className="w-3 h-3" />
          )}
          {assessment.riskLevel.charAt(0).toUpperCase() + assessment.riskLevel.slice(1)} Risk
        </Badge>
        <Badge className={cn("gap-1", getStrategyTypeColor(assessment.strategyType))}>
          <Target className="w-3 h-3" />
          {assessment.strategyType.charAt(0).toUpperCase() + assessment.strategyType.slice(1)}
        </Badge>
        <Badge variant="outline" className={cn("font-mono", getConfidenceColor(assessment.confidenceScore))}>
          {assessment.confidenceScore}% Confidence
        </Badge>
      </div>
    );
  }

  return (
    <Card className={cn("bg-gradient-to-br from-card to-muted/20 border-border/50", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            Strategic Assessment
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge className={cn("gap-1", getRiskLevelColor(assessment.riskLevel))}>
              {assessment.riskLevel === 'aggressive' ? (
                <Zap className="w-3 h-3" />
              ) : assessment.riskLevel === 'high' ? (
                <AlertTriangle className="w-3 h-3" />
              ) : (
                <Shield className="w-3 h-3" />
              )}
              {assessment.riskLevel.charAt(0).toUpperCase() + assessment.riskLevel.slice(1)} Risk
            </Badge>
            <Badge className={cn("gap-1", getStrategyTypeColor(assessment.strategyType))}>
              <Target className="w-3 h-3" />
              {assessment.strategyType.charAt(0).toUpperCase() + assessment.strategyType.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">Confidence Level</span>
            <span className={cn("font-mono font-semibold", getConfidenceColor(assessment.confidenceScore))}>
              {assessment.confidenceScore}%
            </span>
          </div>
          <Progress 
            value={assessment.confidenceScore} 
            className="h-2"
          />
        </div>

        {/* Risk/Reward Summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
            <div className="flex items-center gap-2 text-green-400 text-sm font-medium mb-1">
              <TrendingUp className="w-4 h-4" />
              Potential Upside
            </div>
            <p className="text-sm text-muted-foreground">{assessment.potentialUpside}</p>
          </div>
          <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400 text-sm font-medium mb-1">
              <TrendingDown className="w-4 h-4" />
              Potential Downside
            </div>
            <p className="text-sm text-muted-foreground">{assessment.potentialDownside}</p>
          </div>
        </div>

        {/* Bottleneck Addressed */}
        {assessment.bottleneckAddressed && (
          <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-sm">
              <span className="text-muted-foreground">Addresses: </span>
              <span className="font-medium text-primary">
                {BOTTLENECK_LABELS[assessment.bottleneckAddressed as BottleneckType] || assessment.bottleneckAddressed}
              </span>
            </span>
          </div>
        )}

        {/* Strategic Rationale */}
        {strategicRationale && (
          <div className="p-3 rounded-lg bg-muted/30 border border-border">
            <p className="text-sm text-muted-foreground italic">"{strategicRationale}"</p>
          </div>
        )}

        {/* Expandable Details */}
        <Collapsible open={expanded} onOpenChange={setExpanded}>
          <CollapsibleTrigger className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full justify-center py-2">
            <span>{expanded ? 'Hide' : 'Show'} detailed analysis</span>
            <ChevronDown className={cn("w-4 h-4 transition-transform", expanded && "rotate-180")} />
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            {/* Future Impact */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Target className="w-4 h-4 text-primary" />
                Future Impact (Next 3-5 Videos)
              </h4>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-muted/30 text-sm">
                  <span className="text-muted-foreground">Algorithm Trust: </span>
                  <span className={cn(
                    "font-medium",
                    assessment.futureImpact.algorithmTrust === 'builds' ? 'text-green-400' :
                    assessment.futureImpact.algorithmTrust === 'risks' ? 'text-red-400' : 'text-muted-foreground'
                  )}>
                    {assessment.futureImpact.algorithmTrust.charAt(0).toUpperCase() + assessment.futureImpact.algorithmTrust.slice(1)}
                  </span>
                </div>
                <div className="p-2 rounded bg-muted/30 text-sm">
                  <span className="text-muted-foreground">Channel Identity: </span>
                  <span className={cn(
                    "font-medium",
                    assessment.futureImpact.channelIdentity === 'strengthens' ? 'text-green-400' :
                    assessment.futureImpact.channelIdentity === 'dilutes' ? 'text-red-400' : 'text-muted-foreground'
                  )}>
                    {assessment.futureImpact.channelIdentity.charAt(0).toUpperCase() + assessment.futureImpact.channelIdentity.slice(1)}
                  </span>
                </div>
              </div>
              {assessment.futureImpact.nextVideosGuidance && (
                <p className="text-sm text-muted-foreground pl-6">
                  <Info className="w-3 h-3 inline mr-1" />
                  {assessment.futureImpact.nextVideosGuidance}
                </p>
              )}
            </div>

            {/* Self-Critique */}
            {assessment.selfCritique && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Critical Analysis
                </h4>
                <div className="space-y-2 pl-6">
                  {assessment.selfCritique.assumptions.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Assumptions</span>
                      <ul className="text-sm text-muted-foreground list-disc pl-4">
                        {assessment.selfCritique.assumptions.map((a, i) => (
                          <li key={i}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {assessment.selfCritique.potentialFailures.length > 0 && (
                    <div>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Potential Failures</span>
                      <ul className="text-sm text-muted-foreground list-disc pl-4">
                        {assessment.selfCritique.potentialFailures.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default RiskRewardMatrix;
