import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, AlertTriangle, Lightbulb, TrendingUp } from "lucide-react";
import type { TSELandscape } from "@/types/titleIntelligence";

interface TSELandscapePanelProps {
  landscape: TSELandscape;
}

const TSELandscapePanel: React.FC<TSELandscapePanelProps> = ({ landscape }) => {
  return (
    <Card className="bg-card border-border border-l-4 border-l-cyan-500">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Search className="w-5 h-5 text-cyan-500" />
          </div>
          <div>
            <CardTitle className="text-lg">Title Landscape Analysis</CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Competitive scan of existing titles in this niche
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Competitive Summary */}
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-sm text-muted-foreground">{landscape.competitiveSummary}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Top Patterns */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-cyan-500">
              <TrendingUp className="w-4 h-4" />
              Top Performing Patterns
            </div>
            <div className="flex flex-wrap gap-1.5">
              {landscape.topPatterns.map((p, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {p}
                </Badge>
              ))}
            </div>
          </div>

          {/* Power Words */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <Lightbulb className="w-4 h-4" />
              Frequent Power Words
            </div>
            <div className="flex flex-wrap gap-1.5">
              {landscape.powerWordFrequency.map((w, i) => (
                <Badge key={i} className="text-xs bg-primary/10 text-primary">
                  {w}
                </Badge>
              ))}
            </div>
          </div>

          {/* Overused Patterns */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Overused — Avoid These
            </div>
            <div className="flex flex-wrap gap-1.5">
              {landscape.overusedPatterns.map((p, i) => (
                <Badge key={i} variant="outline" className="text-xs border-destructive/30 text-destructive">
                  {p}
                </Badge>
              ))}
            </div>
          </div>

          {/* Missing Opportunities */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-green-500">
              <Lightbulb className="w-4 h-4" />
              Untapped Opportunities
            </div>
            <div className="flex flex-wrap gap-1.5">
              {landscape.missingOpportunities.map((o, i) => (
                <Badge key={i} className="text-xs bg-green-500/10 text-green-500">
                  {o}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Avg Character Length */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Avg. title length in niche:</span>
          <Badge variant="outline">{landscape.averageCharLength} chars</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default TSELandscapePanel;
