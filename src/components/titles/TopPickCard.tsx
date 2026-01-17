import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Copy, Check, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { TopPick } from "@/types/titleIntelligence";

interface TopPickCardProps {
  topPick: TopPick;
  onCopy: (title: string) => void;
  isCopied: boolean;
  hasDNA: boolean;
}

const TopPickCard: React.FC<TopPickCardProps> = ({
  topPick,
  onCopy,
  isCopied,
  hasDNA,
}) => {
  if (!topPick?.title) return null;

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
      <CardContent className="p-6 relative">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/20">
              <Trophy className="w-6 h-6 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-lg">Strategic Top Pick</h3>
                {hasDNA && (
                  <Badge className="text-xs bg-purple-500/20 text-purple-400">
                    DNA-Optimized
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                The AI's recommended title for maximum impact
              </p>
            </div>
          </div>
          <Button
            onClick={() => onCopy(topPick.title)}
            className="gap-2"
          >
            {isCopied ? (
              <>
                <Check className="w-4 h-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Use This
              </>
            )}
          </Button>
        </div>

        <div className="p-4 rounded-xl bg-background/80 backdrop-blur-sm border border-primary/20 mb-4">
          <p className="text-xl font-medium text-foreground flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary flex-shrink-0" />
            {topPick.title}
          </p>
        </div>

        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Why this title: </span>
            {topPick.reason}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TopPickCard;
