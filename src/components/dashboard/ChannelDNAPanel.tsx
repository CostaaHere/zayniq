import { cn } from "@/lib/utils";
import { useChannelDNA } from "@/hooks/useChannelDNA";
import { getDNALevelColor, getEmotionalGravityColor } from "@/types/channelDNA";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dna,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Zap,
  Target,
  Brain,
  TrendingUp,
  XCircle,
  Heart,
  Lightbulb,
} from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

interface ChannelDNAPanelProps {
  className?: string;
  compact?: boolean;
}

export const ChannelDNAPanel = ({ className, compact = false }: ChannelDNAPanelProps) => {
  const { dna, loading, analyzing, hasDNA, analyzeDNA, error } = useChannelDNA();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className={cn("animate-pulse", className)}>
        <div className="h-24 bg-muted/50 rounded-lg" />
      </div>
    );
  }

  // No DNA yet - show CTA to analyze
  if (!hasDNA) {
    return (
      <div className={cn(
        "relative overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6",
        className
      )}>
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Dna className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1">Channel DNA Not Extracted</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Extract your channel's psychological DNA to unlock personalized AI that truly understands your content.
            </p>
            
            <Button 
              onClick={analyzeDNA} 
              disabled={analyzing}
              className="gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Extracting DNA...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Extract My Channel DNA
                </>
              )}
            </Button>
          </div>
        </div>

        {error && (
          <div className="mt-4 flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}
      </div>
    );
  }

  // Compact view for sidebar/header
  if (compact) {
    return (
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/5 border border-primary/20",
        className
      )}>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Dna className="w-4 h-4 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium truncate">{dna?.core_archetype || "DNA Active"}</span>
            <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Locked
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate">
            {dna?.videos_analyzed} videos analyzed
          </p>
        </div>
        <Button 
          variant="ghost" 
          size="icon"
          onClick={analyzeDNA}
          disabled={analyzing}
          className="h-8 w-8"
        >
          {analyzing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </Button>
      </div>
    );
  }

  // Full DNA panel with psychological insights
  return (
    <div className={cn(
      "rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden",
      className
    )}>
      {/* Header with Archetype */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Dna className="w-6 h-6 text-primary" />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-lg font-semibold">Channel DNA</h3>
                {dna?.core_archetype && (
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {dna.core_archetype}
                  </Badge>
                )}
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Locked
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {dna?.videos_analyzed} videos analyzed • {dna?.analyzed_at ? format(new Date(dna.analyzed_at), "MMM d, yyyy") : "N/A"}
              </p>
            </div>
          </div>

          <Button 
            variant="outline" 
            size="sm"
            onClick={analyzeDNA}
            disabled={analyzing}
            className="gap-2"
          >
            {analyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Extracting...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Re-extract
              </>
            )}
          </Button>
        </div>

        {/* DNA Summary - Human feel */}
        {dna?.dna_summary && (
          <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm text-foreground/80 italic leading-relaxed">"{dna.dna_summary}"</p>
          </div>
        )}
      </div>

      {/* Core DNA Metrics */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Emotional Gravity */}
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-xs">Emotional Weight</span>
            </div>
            <p className={cn("text-lg font-bold", getEmotionalGravityColor(dna?.emotional_gravity_score || null))}>
              {dna?.emotional_gravity_score ?? "—"}/100
            </p>
          </div>
          
          {/* Curiosity Level */}
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Lightbulb className="w-4 h-4" />
              <span className="text-xs">Curiosity Hook</span>
            </div>
            <Badge className={cn("capitalize", getDNALevelColor(dna?.curiosity_dependency_level || null))}>
              {dna?.curiosity_dependency_level || "—"}
            </Badge>
          </div>
          
          {/* Risk Tolerance */}
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Risk Tolerance</span>
            </div>
            <Badge className={cn("capitalize", getDNALevelColor(dna?.risk_tolerance_level || null))}>
              {dna?.risk_tolerance_level || "—"}
            </Badge>
          </div>
          
          {/* Engagement */}
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs">Engagement</span>
            </div>
            <p className="text-sm font-medium">
              {dna?.avg_engagement_rate?.toFixed(1) || "0"}%
            </p>
          </div>
        </div>
      </div>

      {/* What Works vs Kill Zones - Quick View */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* What Works */}
          {dna?.performance_signature?.whatSpikes && dna.performance_signature.whatSpikes.length > 0 && (
            <div className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">What Spikes</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {dna.performance_signature.whatSpikes.slice(0, 3).map((item, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-green-500/10 border-green-500/30 text-green-600">
                    {item}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Kill Zones */}
          {dna?.kill_zones && dna.kill_zones.length > 0 && (
            <div className="p-3 rounded-lg bg-red-500/5 border border-red-500/20">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-medium uppercase">Kill Zones</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {dna.kill_zones.slice(0, 3).map((zone, i) => (
                  <Badge key={i} variant="outline" className="text-xs bg-red-500/10 border-red-500/30 text-red-500">
                    {zone.avoid}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expandable Details */}
      <div className="border-t border-border/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-3 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
        >
          <span>View Full DNA Profile</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="px-6 pb-6 space-y-6">
            {/* Content Psychology */}
            {dna?.content_psychology && Object.keys(dna.content_psychology).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Brain className="w-4 h-4 text-primary" />
                  Content Psychology
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dna.content_psychology.dominantEmotion && (
                    <div className="p-3 rounded-lg bg-muted/30">
                      <span className="text-xs text-muted-foreground">Dominant Emotion</span>
                      <p className="text-sm font-medium capitalize">{dna.content_psychology.dominantEmotion}</p>
                    </div>
                  )}
                  {dna.content_psychology.fearVsCuriosityRatio && (
                    <div className="p-3 rounded-lg bg-muted/30">
                      <span className="text-xs text-muted-foreground">Emotional Mix</span>
                      <p className="text-sm font-medium">{dna.content_psychology.fearVsCuriosityRatio}</p>
                    </div>
                  )}
                </div>
                {dna.content_psychology.clickTriggers && dna.content_psychology.clickTriggers.length > 0 && (
                  <div className="mt-3">
                    <span className="text-xs text-muted-foreground">Click Triggers</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {dna.content_psychology.clickTriggers.map((trigger, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Creator Fingerprint */}
            {dna?.creator_fingerprint && Object.keys(dna.creator_fingerprint).length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Creator Fingerprint
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {dna.creator_fingerprint.tone && (
                    <div className="p-3 rounded-lg bg-muted/30">
                      <span className="text-xs text-muted-foreground">Tone</span>
                      <p className="text-sm font-medium capitalize">{dna.creator_fingerprint.tone}</p>
                    </div>
                  )}
                  {dna.creator_fingerprint.complexityLevel && (
                    <div className="p-3 rounded-lg bg-muted/30">
                      <span className="text-xs text-muted-foreground">Complexity</span>
                      <p className="text-sm font-medium capitalize">{dna.creator_fingerprint.complexityLevel}</p>
                    </div>
                  )}
                  {dna.creator_fingerprint.authorityVsRelatability && (
                    <div className="p-3 rounded-lg bg-muted/30">
                      <span className="text-xs text-muted-foreground">Authority Balance</span>
                      <p className="text-sm font-medium">{dna.creator_fingerprint.authorityVsRelatability}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Format Sweet Spots */}
            {dna?.format_sweet_spots && dna.format_sweet_spots.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Format Sweet Spots</h4>
                <div className="space-y-2">
                  {dna.format_sweet_spots.slice(0, 4).map((spot, i) => (
                    <div key={i} className="p-3 rounded-lg bg-green-500/5 border border-green-500/20">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-green-600">{spot.format}</span>
                        <Badge className={cn("text-xs", getDNALevelColor(spot.performanceLevel as "high" | "medium" | "low"))}>
                          {spot.performanceLevel}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{spot.whyItWorks}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Title Formulas */}
            {dna?.title_formulas && dna.title_formulas.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Your Title Formulas</h4>
                <div className="space-y-2">
                  {dna.title_formulas.slice(0, 3).map((f, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 text-sm">
                      <p className="font-medium text-primary">{f.formula}</p>
                      <p className="text-muted-foreground mt-1">e.g., "{f.example}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Power Words */}
            {dna?.power_words && dna.power_words.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Your Power Words</h4>
                <div className="flex flex-wrap gap-2">
                  {dna.power_words.map((word, i) => (
                    <Badge key={i} className="bg-accent/20 text-accent-foreground capitalize">
                      {word}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Audience */}
            {dna?.audience_intelligence_level && (
              <div>
                <h4 className="text-sm font-medium mb-2">Audience Profile</h4>
                <div className="p-3 rounded-lg bg-muted/30">
                  <p className="text-sm">{dna.audience_intelligence_level}</p>
                  {dna.audience_demographics?.interests && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {dna.audience_demographics.interests.map((interest, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
