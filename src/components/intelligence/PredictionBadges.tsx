import React from "react";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  TrendingUp, 
  Zap, 
  Target,
  Sparkles,
  AlertTriangle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PredictionBadgesProps {
  prediction: {
    overallConfidence?: string;
    ctr?: { vsChannelAverage?: string };
    algorithm?: { promotionLikelihood?: string };
    competition?: { trendAlignment?: string };
  };
  className?: string;
  maxBadges?: number;
}

export const PredictionBadges: React.FC<PredictionBadgesProps> = ({
  prediction,
  className,
  maxBadges = 4,
}) => {
  const badges: Array<{ key: string; icon: React.ReactNode; label: string; className: string }> = [];

  // Confidence badge
  if (prediction.overallConfidence) {
    const conf = prediction.overallConfidence;
    if (conf === 'high') {
      badges.push({
        key: 'confidence',
        icon: <Brain className="w-3 h-3" />,
        label: 'High Confidence',
        className: 'bg-green-500/20 text-green-400 border-green-500/30',
      });
    } else if (conf === 'experimental') {
      badges.push({
        key: 'confidence',
        icon: <Sparkles className="w-3 h-3" />,
        label: 'Experimental',
        className: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      });
    } else if (conf === 'low') {
      badges.push({
        key: 'confidence',
        icon: <AlertTriangle className="w-3 h-3" />,
        label: 'Needs Work',
        className: 'bg-red-500/20 text-red-400 border-red-500/30',
      });
    }
  }

  // CTR badge
  if (prediction.ctr?.vsChannelAverage) {
    const ctrText = prediction.ctr.vsChannelAverage;
    if (ctrText.includes('+') || ctrText.toLowerCase().includes('above')) {
      badges.push({
        key: 'ctr',
        icon: <TrendingUp className="w-3 h-3" />,
        label: ctrText.length > 25 ? 'Above Average CTR' : ctrText,
        className: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      });
    }
  }

  // Algorithm badge
  if (prediction.algorithm?.promotionLikelihood === 'high') {
    badges.push({
      key: 'algorithm',
      icon: <Zap className="w-3 h-3" />,
      label: 'Algorithm Favored',
      className: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    });
  }

  // Trend badge
  if (prediction.competition?.trendAlignment) {
    const trend = prediction.competition.trendAlignment;
    if (trend === 'viral_potential') {
      badges.push({
        key: 'trend',
        icon: <Target className="w-3 h-3" />,
        label: 'Viral Potential',
        className: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
      });
    } else if (trend === 'rising') {
      badges.push({
        key: 'trend',
        icon: <TrendingUp className="w-3 h-3" />,
        label: 'Rising Trend',
        className: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      });
    }
  }

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
      {badges.slice(0, maxBadges).map((badge) => (
        <Badge 
          key={badge.key} 
          variant="outline"
          className={cn("gap-1 text-xs", badge.className)}
        >
          {badge.icon}
          {badge.label}
        </Badge>
      ))}
    </div>
  );
};

export default PredictionBadges;
