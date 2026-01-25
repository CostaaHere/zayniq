import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  Target,
  Shield,
  Brain,
  TrendingUp,
  Users,
  Sparkles,
  Crown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RiskRewardAssessment, getStrategyBadges, StrategyBadge } from "@/types/intelligence";

interface StrategyBadgesProps {
  assessment: RiskRewardAssessment;
  className?: string;
  maxBadges?: number;
}

const BADGE_CONFIG: Record<StrategyBadge, { 
  label: string; 
  icon: React.ReactNode; 
  className: string;
}> = {
  high_confidence: {
    label: "High Confidence",
    icon: <Crown className="w-3 h-3" />,
    className: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  strategic_move: {
    label: "Strategic Move",
    icon: <Target className="w-3 h-3" />,
    className: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  aggressive_growth: {
    label: "Aggressive Growth",
    icon: <Zap className="w-3 h-3" />,
    className: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  safe_play: {
    label: "Safe Play",
    icon: <Shield className="w-3 h-3" />,
    className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  },
  algorithm_optimized: {
    label: "Algorithm Optimized",
    icon: <Brain className="w-3 h-3" />,
    className: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  psychology_focused: {
    label: "Psychology Focused",
    icon: <Users className="w-3 h-3" />,
    className: "bg-pink-500/20 text-pink-400 border-pink-500/30",
  },
  identity_builder: {
    label: "Identity Builder",
    icon: <Sparkles className="w-3 h-3" />,
    className: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  },
  discovery_play: {
    label: "Discovery Play",
    icon: <TrendingUp className="w-3 h-3" />,
    className: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
};

export const StrategyBadges: React.FC<StrategyBadgesProps> = ({
  assessment,
  className,
  maxBadges = 3,
}) => {
  const badges = getStrategyBadges(assessment).slice(0, maxBadges);

  if (badges.length === 0) return null;

  return (
    <div className={cn("flex items-center gap-1.5 flex-wrap", className)}>
      {badges.map((badge) => {
        const config = BADGE_CONFIG[badge];
        return (
          <Badge 
            key={badge} 
            className={cn("gap-1 text-xs", config.className)}
          >
            {config.icon}
            {config.label}
          </Badge>
        );
      })}
    </div>
  );
};

export default StrategyBadges;
