import { cn } from "@/lib/utils";
import { useChannelDNA } from "@/hooks/useChannelDNA";
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
  MessageSquare,
  TrendingUp,
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
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Dna className="w-6 h-6 text-primary" />
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1">Channel DNA Not Analyzed</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Analyze your channel to unlock personalized AI outputs tailored to your unique content style.
            </p>
            
            <Button 
              onClick={analyzeDNA} 
              disabled={analyzing}
              className="gap-2"
            >
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing Channel...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze My Channel DNA
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
            <span className="text-sm font-medium">Channel DNA</span>
            <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Active
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

  // Full DNA panel with insights
  return (
    <div className={cn(
      "rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5 overflow-hidden",
      className
    )}>
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Dna className="w-6 h-6 text-primary" />
            </div>
            
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg font-semibold">Channel DNA</h3>
                <Badge variant="secondary" className="text-xs bg-green-500/10 text-green-500 border-green-500/20">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  Active
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {dna?.videos_analyzed} videos analyzed • Last updated {dna?.analyzed_at ? format(new Date(dna.analyzed_at), "MMM d, yyyy") : "N/A"}
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
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Re-analyze
              </>
            )}
          </Button>
        </div>

        {/* DNA Summary */}
        {dna?.dna_summary && (
          <div className="mt-4 p-4 rounded-lg bg-muted/30 border border-border/50">
            <p className="text-sm text-foreground/80 italic">"{dna.dna_summary}"</p>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <MessageSquare className="w-4 h-4" />
              <span className="text-xs">Tone</span>
            </div>
            <p className="text-sm font-medium capitalize">
              {dna?.tone_profile.primary || "Not analyzed"}
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Target className="w-4 h-4" />
              <span className="text-xs">Categories</span>
            </div>
            <p className="text-sm font-medium">
              {dna?.content_categories.length || 0} identified
            </p>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-xs">Power Words</span>
            </div>
            <p className="text-sm font-medium">
              {dna?.power_words.length || 0} found
            </p>
          </div>
          
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

      {/* Expandable Details */}
      <div className="border-t border-border/50">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full px-6 py-3 flex items-center justify-between text-sm text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
        >
          <span>View DNA Details</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {expanded && (
          <div className="px-6 pb-6 space-y-6">
            {/* Content Categories */}
            {dna?.content_categories.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Content Categories</h4>
                <div className="flex flex-wrap gap-2">
                  {dna.content_categories.map((cat, i) => (
                    <Badge key={i} variant="outline" className="capitalize">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Title Formulas */}
            {dna?.title_formulas.length > 0 && (
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
            {dna?.power_words.length > 0 && (
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

            {/* Tone Profile */}
            {dna?.tone_profile && (
              <div>
                <h4 className="text-sm font-medium mb-2">Communication Style</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground">Primary Tone</span>
                    <p className="text-sm font-medium capitalize">{dna.tone_profile.primary || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground">Secondary</span>
                    <p className="text-sm font-medium capitalize">{dna.tone_profile.secondary || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground">Formality</span>
                    <p className="text-sm font-medium capitalize">{dna.tone_profile.formality || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-lg bg-muted/30">
                    <span className="text-xs text-muted-foreground">Energy</span>
                    <p className="text-sm font-medium capitalize">{dna.tone_profile.energy || "N/A"}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Audience */}
            {dna?.audience_demographics?.skillLevel && (
              <div>
                <h4 className="text-sm font-medium mb-2">Audience Profile</h4>
                <div className="p-3 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground">Skill Level</span>
                  <p className="text-sm font-medium">{dna.audience_demographics.skillLevel}</p>
                  {dna.audience_demographics.interests && (
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
