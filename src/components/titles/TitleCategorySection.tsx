import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  HelpCircle,
  Shield,
  Heart,
  Smartphone,
  GitBranch,
  LucideIcon,
} from "lucide-react";
import { TitleCategory, TitleInsight } from "@/types/titleIntelligence";
import TitleInsightCard from "./TitleInsightCard";

interface TitleCategorySectionProps {
  category: TitleCategory;
  onCopy: (title: string) => void;
  onFavorite: (title: string) => void;
  copiedTitle: string | null;
  favorites: string[];
  hasDNA: boolean;
}

const iconMap: Record<string, LucideIcon> = {
  "help-circle": HelpCircle,
  "shield": Shield,
  "heart": Heart,
  "smartphone": Smartphone,
  "git-branch": GitBranch,
};

const categoryColors: Record<string, { border: string; text: string; bg: string }> = {
  "Curiosity-Driven": { border: "border-l-amber-500", text: "text-amber-500", bg: "bg-amber-500/10" },
  "Authority": { border: "border-l-blue-500", text: "text-blue-500", bg: "bg-blue-500/10" },
  "Emotional": { border: "border-l-red-500", text: "text-red-500", bg: "bg-red-500/10" },
  "Short-Form Optimized": { border: "border-l-green-500", text: "text-green-500", bg: "bg-green-500/10" },
};

const TitleCategorySection: React.FC<TitleCategorySectionProps> = ({
  category,
  onCopy,
  onFavorite,
  copiedTitle,
  favorites,
  hasDNA,
}) => {
  const IconComponent = iconMap[category.icon] || HelpCircle;
  const colors = categoryColors[category.category] || { 
    border: "border-l-primary", 
    text: "text-primary",
    bg: "bg-primary/10"
  };

  return (
    <Card className={`bg-card border-border ${colors.border} border-l-4`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${colors.bg}`}>
              <IconComponent className={`w-5 h-5 ${colors.text}`} />
            </div>
            <div>
              <CardTitle className="text-lg">{category.category}</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {category.categoryDescription}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-xs">
            {category.titles.length} titles
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {category.titles.map((insight, index) => (
          <TitleInsightCard
            key={index}
            insight={insight}
            index={index}
            onCopy={onCopy}
            onFavorite={onFavorite}
            isCopied={copiedTitle === insight.title}
            isFavorite={favorites.includes(insight.title)}
            hasDNA={hasDNA}
          />
        ))}
      </CardContent>
    </Card>
  );
};

export default TitleCategorySection;
