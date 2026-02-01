import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  FileText,
  Hash,
  Image,
  Lightbulb,
  Sparkles,
  Target,
  TrendingUp,
  Type,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { AVOEAnalysis, ScoreBreakdown } from "@/types/avoe";

interface AVOEAnalysisPanelProps {
  analysis: AVOEAnalysis;
  onApplyImprovement?: (type: 'title' | 'description' | 'tags' | 'hashtags', value: string | string[]) => void;
}

const getScoreColor = (score: number) => {
  if (score >= 75) return { text: "text-green-500", bg: "bg-green-500", stroke: "stroke-green-500" };
  if (score >= 50) return { text: "text-yellow-500", bg: "bg-yellow-500", stroke: "stroke-yellow-500" };
  return { text: "text-red-500", bg: "bg-red-500", stroke: "stroke-red-500" };
};

const getScoreLabel = (score: number) => {
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs Work";
  return "Poor";
};

const ScoreRing = ({ score, size = 120 }: { score: number; size?: number }) => {
  const colors = getScoreColor(score);
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-muted/30"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          className={colors.stroke}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset,
            transition: "stroke-dashoffset 0.5s ease",
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-2xl font-bold", colors.text)}>{score}</span>
        <span className="text-xs text-muted-foreground">Score</span>
      </div>
    </div>
  );
};

const ScoreBreakdownCard = ({ 
  title, 
  icon, 
  scoreData,
  improvedValue,
  onApply
}: { 
  title: string;
  icon: React.ReactNode;
  scoreData: ScoreBreakdown;
  improvedValue?: string | string[];
  onApply?: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const colors = getScoreColor(scoreData.total);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  return (
    <Card className="overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className={cn("cursor-pointer hover:bg-muted/50 transition-colors", isOpen && "border-b border-border")}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center bg-muted", colors.text)}>
                  {icon}
                </div>
                <div>
                  <CardTitle className="text-base">{title}</CardTitle>
                  <div className={cn("text-sm font-semibold", colors.text)}>
                    {scoreData.total}/100 - {getScoreLabel(scoreData.total)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={scoreData.total} className="w-20 h-2" />
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <CardContent className="pt-4 space-y-4">
            {/* Rubric Breakdown */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Rubric Breakdown</h4>
              {scoreData.breakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm p-2 bg-muted/30 rounded">
                  <div className="flex-1">
                    <div className="font-medium">{item.criterion}</div>
                    <div className="text-xs text-muted-foreground">{item.evidence}</div>
                  </div>
                  <div className={cn("font-bold", getScoreColor(item.score / item.maxScore * 100).text)}>
                    {item.score}/{item.maxScore}
                  </div>
                </div>
              ))}
            </div>

            {/* Issues */}
            {scoreData.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Issues
                </h4>
                <ul className="space-y-1">
                  {scoreData.issues.map((issue, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-red-500">•</span> {issue}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Suggestions */}
            {scoreData.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-yellow-500 flex items-center gap-1">
                  <Lightbulb className="w-4 h-4" /> Suggestions
                </h4>
                <ul className="space-y-1">
                  {scoreData.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-yellow-500">•</span> {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Improved Version */}
            {improvedValue && (
              <div className="space-y-2 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="text-sm font-medium text-primary flex items-center gap-1">
                  <Sparkles className="w-4 h-4" /> AI-Improved Version
                </h4>
                <div className="text-sm">
                  {Array.isArray(improvedValue) 
                    ? improvedValue.join(', ')
                    : improvedValue
                  }
                </div>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => copyToClipboard(Array.isArray(improvedValue) ? improvedValue.join(', ') : improvedValue)}
                  >
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                  {onApply && (
                    <Button size="sm" onClick={onApply}>
                      <Zap className="w-3 h-3 mr-1" /> Apply
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

const AVOEAnalysisPanel = ({ analysis, onApplyImprovement }: AVOEAnalysisPanelProps) => {
  const overallColors = getScoreColor(analysis.overallScore);
  const confidenceColors = getScoreColor(analysis.confidenceScore);

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                AVOE Analysis
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Accurate Video Optimization Engine - Strict Mode
              </p>
              <Badge 
                variant="outline" 
                className={cn("mt-2", overallColors.text)}
              >
                {getScoreLabel(analysis.overallScore)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-center">
                <ScoreRing score={analysis.overallScore} />
                <div className="text-xs text-muted-foreground mt-1">Overall</div>
              </div>
              <div className="text-center">
                <ScoreRing score={analysis.confidenceScore} size={80} />
                <div className="text-xs text-muted-foreground mt-1">Confidence</div>
              </div>
            </div>
          </div>

          {/* Data Warnings */}
          {analysis.dataWarnings.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-yellow-500">Data Limitations</div>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-0.5">
                    {analysis.dataWarnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for Different Sections */}
      <Tabs defaultValue="scores" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Scores Tab */}
        <TabsContent value="scores" className="space-y-4 mt-4">
          <ScoreBreakdownCard
            title="Title Score"
            icon={<Type className="w-5 h-5" />}
            scoreData={analysis.titleScore}
            improvedValue={analysis.improvedTitle}
            onApply={() => onApplyImprovement?.('title', analysis.improvedTitle)}
          />
          <ScoreBreakdownCard
            title="Description Score"
            icon={<FileText className="w-5 h-5" />}
            scoreData={analysis.descriptionScore}
            improvedValue={analysis.improvedDescription}
            onApply={() => onApplyImprovement?.('description', analysis.improvedDescription)}
          />
          <ScoreBreakdownCard
            title="Tags Score"
            icon={<Hash className="w-5 h-5" />}
            scoreData={analysis.tagsScore}
            improvedValue={analysis.improvedTags}
            onApply={() => onApplyImprovement?.('tags', analysis.improvedTags)}
          />
          <ScoreBreakdownCard
            title="Thumbnail Score"
            icon={<Image className="w-5 h-5" />}
            scoreData={analysis.thumbnailScore}
          />
          <ScoreBreakdownCard
            title="Virality Readiness"
            icon={<TrendingUp className="w-5 h-5" />}
            scoreData={analysis.viralityScore}
          />
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-4 mt-4">
          {/* Packaging Audit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" /> Packaging Audit
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(analysis.packagingAudit).map(([key, value]) => (
                <div key={key} className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                  <div className="text-sm text-muted-foreground mt-1">{value}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* YouTube Graph Optimization */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" /> YouTube Graph Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Adjacent Topics (for Suggested feed)</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.graphOptimization.adjacentTopics.map((topic, idx) => (
                    <Badge key={idx} variant="secondary">{topic}</Badge>
                  ))}
                  {analysis.graphOptimization.adjacentTopics.length === 0 && (
                    <span className="text-sm text-muted-foreground">No data available</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Bridge Keywords</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.graphOptimization.bridgeKeywords.map((keyword, idx) => (
                    <Badge key={idx} variant="outline">{keyword}</Badge>
                  ))}
                  {analysis.graphOptimization.bridgeKeywords.length === 0 && (
                    <span className="text-sm text-muted-foreground">No data available</span>
                  )}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Watch-Next Funnel</h4>
                <ul className="space-y-1">
                  {analysis.graphOptimization.watchNextFunnel.map((item, idx) => (
                    <li key={idx} className="text-sm text-muted-foreground flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5" /> {item}
                    </li>
                  ))}
                  {analysis.graphOptimization.watchNextFunnel.length === 0 && (
                    <span className="text-sm text-muted-foreground">No data available</span>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retention Tab */}
        <TabsContent value="retention" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4" /> Hook Engineering
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <h4 className="text-sm font-medium flex items-center gap-1 mb-2">
                  <Sparkles className="w-4 h-4" /> 0-20 Second Opening Hook Rewrite
                </h4>
                <p className="text-sm italic">"{analysis.retentionEngineering.openingHookRewrite}"</p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2"
                  onClick={() => {
                    navigator.clipboard.writeText(analysis.retentionEngineering.openingHookRewrite);
                    toast.success("Hook copied!");
                  }}
                >
                  <Copy className="w-3 h-3 mr-1" /> Copy Hook
                </Button>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Retention Pattern Interrupts</h4>
                <ul className="space-y-2">
                  {analysis.retentionEngineering.retentionInterrupts.map((interrupt, idx) => (
                    <li key={idx} className="p-3 bg-muted/30 rounded-lg text-sm flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0">
                        {idx + 1}
                      </span>
                      {interrupt}
                    </li>
                  ))}
                  {analysis.retentionEngineering.retentionInterrupts.length === 0 && (
                    <span className="text-sm text-muted-foreground">Provide transcript for retention analysis</span>
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Zap className="w-4 h-4" /> Priority Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.priorityActions.map((action, idx) => (
                  <div 
                    key={idx} 
                    className={cn(
                      "p-4 rounded-lg border",
                      action.priority === 'high' && "border-red-500/30 bg-red-500/5",
                      action.priority === 'medium' && "border-yellow-500/30 bg-yellow-500/5",
                      action.priority === 'low' && "border-green-500/30 bg-green-500/5"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Badge 
                        variant="outline"
                        className={cn(
                          action.priority === 'high' && "text-red-500 border-red-500/30",
                          action.priority === 'medium' && "text-yellow-500 border-yellow-500/30",
                          action.priority === 'low' && "text-green-500 border-green-500/30"
                        )}
                      >
                        {action.priority.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="font-medium">{action.action}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      <span className="text-primary">Impact:</span> {action.impact}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Confidence Factors */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <AlertCircle className="w-4 h-4" /> Confidence Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className={cn("text-3xl font-bold", confidenceColors.text)}>
                  {analysis.confidenceScore}%
                </div>
                <Progress value={analysis.confidenceScore} className="flex-1" />
              </div>
              <ul className="space-y-1 text-sm">
                {analysis.confidenceFactors.map((factor, idx) => (
                  <li key={idx} className="text-muted-foreground">{factor}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AVOEAnalysisPanel;
