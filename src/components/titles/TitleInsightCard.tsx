import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Copy,
  Check,
  Heart,
  ChevronDown,
  Brain,
  TrendingUp,
  Dna,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TitleInsight, ctrColors } from "@/types/titleIntelligence";

interface TitleInsightCardProps {
  insight: TitleInsight;
  index: number;
  onCopy: (title: string) => void;
  onFavorite: (title: string) => void;
  isCopied: boolean;
  isFavorite: boolean;
  hasDNA: boolean;
}

const TitleInsightCard: React.FC<TitleInsightCardProps> = ({
  insight,
  index,
  onCopy,
  onFavorite,
  isCopied,
  isFavorite,
  hasDNA,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const ctrStyle = ctrColors[insight.ctrPotential] || ctrColors.medium;

  const highlightPowerWords = (title: string, powerWords: string[]): React.ReactNode => {
    if (!powerWords.length) return title;
    
    const escapedWords = powerWords.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const pattern = new RegExp(`\\b(${escapedWords.join('|')})\\b`, 'gi');
    
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    
    pattern.lastIndex = 0;
    
    while ((match = pattern.exec(title)) !== null) {
      if (match.index > lastIndex) {
        parts.push(title.substring(lastIndex, match.index));
      }
      parts.push(
        <span key={match.index} className="text-primary font-semibold">
          {match[0]}
        </span>
      );
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < title.length) {
      parts.push(title.substring(lastIndex));
    }
    
    return parts.length > 0 ? <>{parts}</> : title;
  };

  return (
    <Card className="bg-card/50 border-border hover:border-primary/20 transition-all duration-200">
      <CardContent className="p-4">
        {/* Title Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <p className="font-medium text-lg leading-snug flex-1">
            {highlightPowerWords(insight.title, insight.powerWords || [])}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onCopy(insight.title)}
            >
              {isCopied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn("h-8 w-8", isFavorite && "text-red-500")}
              onClick={() => onFavorite(insight.title)}
            >
              <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <Badge variant="outline" className="text-xs">
            {insight.title.length} chars
          </Badge>
          <Badge className={cn("text-xs", ctrStyle.bg, ctrStyle.text)}>
            <Zap className="w-3 h-3 mr-1" />
            {insight.ctrPotential.toUpperCase()} CTR
          </Badge>
          {insight.powerWords?.length > 0 && (
            <Badge className="text-xs bg-primary/10 text-primary">
              {insight.powerWords.length} power words
            </Badge>
          )}
          {hasDNA && (
            <Badge className="text-xs bg-purple-500/10 text-purple-500">
              <Dna className="w-3 h-3 mr-1" />
              DNA-Matched
            </Badge>
          )}
        </div>

        {/* Expandable Insights */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between text-muted-foreground hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <Brain className="w-4 h-4" />
                View Strategic Insights
              </span>
              <ChevronDown className={cn("w-4 h-4 transition-transform", isOpen && "rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-3 space-y-3">
            {/* Psychology Explanation */}
            <div className="p-3 rounded-lg bg-muted/30 border-l-2 border-purple-500">
              <div className="flex items-center gap-2 text-sm font-medium text-purple-500 mb-1">
                <Brain className="w-4 h-4" />
                Psychology
              </div>
              <p className="text-sm text-muted-foreground">
                {insight.psychologyExplanation}
              </p>
            </div>

            {/* Algorithm Explanation */}
            <div className="p-3 rounded-lg bg-muted/30 border-l-2 border-blue-500">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-500 mb-1">
                <TrendingUp className="w-4 h-4" />
                Algorithm Impact
              </div>
              <p className="text-sm text-muted-foreground">
                {insight.algorithmExplanation}
              </p>
            </div>

            {/* DNA Alignment */}
            <div className="p-3 rounded-lg bg-muted/30 border-l-2 border-green-500">
              <div className="flex items-center gap-2 text-sm font-medium text-green-500 mb-1">
                <Dna className="w-4 h-4" />
                Channel DNA Fit
              </div>
              <p className="text-sm text-muted-foreground">
                {insight.dnaAlignment}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default TitleInsightCard;
