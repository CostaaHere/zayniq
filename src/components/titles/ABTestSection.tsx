import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { GitBranch, Users, Brain } from "lucide-react";
import { ABTestCluster } from "@/types/titleIntelligence";
import TitleInsightCard from "./TitleInsightCard";

interface ABTestSectionProps {
  clusters: ABTestCluster[];
  onCopy: (title: string) => void;
  onFavorite: (title: string) => void;
  copiedTitle: string | null;
  favorites: string[];
  hasDNA: boolean;
}

const ABTestSection: React.FC<ABTestSectionProps> = ({
  clusters,
  onCopy,
  onFavorite,
  copiedTitle,
  favorites,
  hasDNA,
}) => {
  if (!clusters?.length) return null;

  return (
    <Card className="bg-card border-border border-l-4 border-l-violet-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-violet-500/10">
              <GitBranch className="w-5 h-5 text-violet-500" />
            </div>
            <div>
              <CardTitle className="text-lg">A/B Test Variations</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                Test different psychological triggers to find what works best
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {clusters.length} test clusters
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {clusters.map((cluster, clusterIndex) => (
          <div key={clusterIndex} className="space-y-3">
            <div className="p-3 rounded-lg bg-muted/30">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-violet-500/20 text-violet-500">
                  Cluster {clusterIndex + 1}
                </Badge>
                <span className="font-medium">{cluster.clusterName}</span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4" />
                  <span>{cluster.targetAudience}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Brain className="w-4 h-4" />
                  <span>{cluster.psychologicalTrigger}</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 pl-4 border-l-2 border-violet-500/30">
              {cluster.titles.map((insight, titleIndex) => (
                <TitleInsightCard
                  key={titleIndex}
                  insight={insight}
                  index={titleIndex}
                  onCopy={onCopy}
                  onFavorite={onFavorite}
                  isCopied={copiedTitle === insight.title}
                  isFavorite={favorites.includes(insight.title)}
                  hasDNA={hasDNA}
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default ABTestSection;
