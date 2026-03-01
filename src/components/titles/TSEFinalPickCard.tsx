import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Copy, Check, ArrowRight, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TSEFinalPick, TSEStrategy } from "@/types/titleIntelligence";

interface TSEFinalPickCardProps {
  strategy: TSEStrategy;
  finalPick: TSEFinalPick;
  onCopy: (title: string) => void;
  copiedTitle: string | null;
  hasDNA: boolean;
}

const TSEFinalPickCard: React.FC<TSEFinalPickCardProps> = ({
  strategy,
  finalPick,
  onCopy,
  copiedTitle,
  hasDNA,
}) => {
  const isCopied = copiedTitle === finalPick.optimizedTitle;
  const scoreEntries: { label: string; value: number }[] = [
    { label: "Curiosity", value: finalPick.scores.curiosityStrength },
    { label: "Clarity", value: finalPick.scores.clarity },
    { label: "Emotion", value: finalPick.scores.emotionalPull },
    { label: "Competitive", value: finalPick.scores.competitiveAdvantage },
    { label: "Intent", value: finalPick.scores.intentMatch },
  ];

  return (
    <div className="space-y-4">
      {/* Strategy Card */}
      <Card className="bg-card border-border border-l-4 border-l-amber-500">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Target className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <CardTitle className="text-base">Strategy: {strategy.chosenFormat}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">{strategy.reasoning}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>Alternatives:</span>
            {strategy.alternativeFormats.map((f, i) => (
              <Badge key={i} variant="outline" className="text-[10px]">{f}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Final Pick Card */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30 border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/15">
                <Crown className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  Title Supremacy Pick
                  {hasDNA && (
                    <Badge className="text-[10px] bg-purple-500/10 text-purple-500">DNA-Optimized</Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground">Final optimized title after scoring & refinement</p>
              </div>
            </div>
            <Button
              variant={isCopied ? "default" : "outline"}
              size="sm"
              className="gap-1.5"
              onClick={() => onCopy(finalPick.optimizedTitle)}
            >
              {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {isCopied ? "Copied!" : "Use This"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Before → After */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="line-through">{finalPick.originalTitle}</span>
            </div>
            <div className="flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-xl font-bold text-foreground leading-snug">
                {finalPick.optimizedTitle}
              </p>
            </div>
          </div>

          {/* Score Bars */}
          <div className="grid grid-cols-5 gap-3">
            {scoreEntries.map(({ label, value }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-primary">{value}</div>
                <div className="text-[10px] text-muted-foreground">{label}</div>
                <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={cn(
                      "h-full rounded-full transition-all",
                      value >= 8 ? "bg-green-500" : value >= 6 ? "bg-yellow-500" : "bg-orange-500"
                    )}
                    style={{ width: `${value * 10}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="text-center p-3 rounded-lg bg-primary/10">
            <span className="text-sm text-muted-foreground">Total Score: </span>
            <span className="text-2xl font-bold text-primary">{finalPick.scores.total}</span>
            <span className="text-sm text-muted-foreground"> / 50</span>
          </div>

          {/* Why It Wins */}
          <div className="p-3 rounded-lg bg-muted/30 border-l-2 border-primary">
            <p className="text-sm font-medium text-primary mb-1">Why It Wins</p>
            <p className="text-sm text-muted-foreground">{finalPick.whyItWins}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TSEFinalPickCard;
