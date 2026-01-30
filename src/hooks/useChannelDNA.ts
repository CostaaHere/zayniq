import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import type { ChannelDNA } from "@/types/channelDNA";

export type { ChannelDNA } from "@/types/channelDNA";

export interface UseChannelDNAReturn {
  dna: ChannelDNA | null;
  loading: boolean;
  analyzing: boolean;
  error: string | null;
  hasDNA: boolean;
  analyzeDNA: () => Promise<void>;
  refetch: () => Promise<void>;
  getDNAForPrompt: () => string;
}

export const useChannelDNA = (): UseChannelDNAReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [dna, setDNA] = useState<ChannelDNA | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch stored Channel DNA from database
   */
  const fetchDNA = useCallback(async () => {
    if (!user) {
      setDNA(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("channel_dna")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (data) {
        // Parse JSONB fields properly with proper type casting
        setDNA({
          ...data,
          content_categories: (data.content_categories as unknown as string[]) || [],
          top_performing_topics: (data.top_performing_topics as unknown as ChannelDNA['top_performing_topics']) || [],
          title_patterns: (data.title_patterns as unknown as ChannelDNA['title_patterns']) || {},
          title_formulas: (data.title_formulas as unknown as ChannelDNA['title_formulas']) || [],
          power_words: (data.power_words as unknown as string[]) || [],
          tone_profile: (data.tone_profile as unknown as ChannelDNA['tone_profile']) || {},
          audience_demographics: (data.audience_demographics as unknown as ChannelDNA['audience_demographics']) || {},
          peak_engagement_times: (data.peak_engagement_times as unknown as string[]) || [],
          // New DNA fields
          format_sweet_spots: (data.format_sweet_spots as unknown as ChannelDNA['format_sweet_spots']) || [],
          kill_zones: (data.kill_zones as unknown as ChannelDNA['kill_zones']) || [],
          content_psychology: (data.content_psychology as unknown as ChannelDNA['content_psychology']) || {},
          performance_signature: (data.performance_signature as unknown as ChannelDNA['performance_signature']) || {},
          creator_fingerprint: (data.creator_fingerprint as unknown as ChannelDNA['creator_fingerprint']) || {},
          core_archetype: data.core_archetype || null,
          emotional_gravity_score: data.emotional_gravity_score || null,
          curiosity_dependency_level: (data.curiosity_dependency_level as ChannelDNA['curiosity_dependency_level']) || null,
          risk_tolerance_level: (data.risk_tolerance_level as ChannelDNA['risk_tolerance_level']) || null,
          audience_intelligence_level: data.audience_intelligence_level || null,
          emoji_usage: (data.emoji_usage as ChannelDNA['emoji_usage']) || "minimal",
        });
      } else {
        setDNA(null);
      }
    } catch (err) {
      logger.error("Error fetching Channel DNA:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch channel DNA");
    } finally {
      setLoading(false);
    }
  }, [user]);

  /**
   * Trigger DNA analysis via edge function
   */
  const analyzeDNA = useCallback(async () => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Please sign in to analyze your channel.",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("analyze-channel-dna");

      if (invokeError) {
        throw invokeError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (data?.dna) {
        // Refresh DNA from response
        setDNA({
          ...data.dna,
          content_categories: data.dna.content_categories || [],
          top_performing_topics: data.dna.top_performing_topics || [],
          title_patterns: data.dna.title_patterns || {},
          title_formulas: data.dna.title_formulas || [],
          power_words: data.dna.power_words || [],
          tone_profile: data.dna.tone_profile || {},
          audience_demographics: data.dna.audience_demographics || {},
          peak_engagement_times: data.dna.peak_engagement_times || [],
          format_sweet_spots: data.dna.format_sweet_spots || [],
          kill_zones: data.dna.kill_zones || [],
          content_psychology: data.dna.content_psychology || {},
          performance_signature: data.dna.performance_signature || {},
          creator_fingerprint: data.dna.creator_fingerprint || {},
        });
      }

      toast({
        title: "🧬 Channel DNA Extracted",
        description: `Analyzed ${data?.analysis?.videosAnalyzed || 0} videos to understand your channel's soul.`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to extract channel DNA";
      logger.error("Error extracting Channel DNA:", err);
      setError(errorMessage);
      
      toast({
        title: "DNA Extraction Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  }, [user, toast]);

  /**
   * Generate a condensed DNA string for use in AI prompts
   * This is the DNA that ALL AI outputs must align with
   */
  const getDNAForPrompt = useCallback((): string => {
    if (!dna) {
      return "";
    }

    const parts: string[] = [];

    // Core archetype (most important)
    if (dna.core_archetype) {
      parts.push(`🧬 CHANNEL ARCHETYPE: ${dna.core_archetype}`);
    }

    // DNA summary
    if (dna.dna_summary) {
      parts.push(`CHANNEL SOUL: ${dna.dna_summary}`);
    }

    // Psychological profile
    if (dna.content_psychology?.dominantEmotion) {
      parts.push(`EMOTIONAL TRIGGER: ${dna.content_psychology.dominantEmotion}`);
    }

    // What works
    if (dna.performance_signature?.whatSpikes?.length) {
      parts.push(`✅ WHAT SPIKES: ${dna.performance_signature.whatSpikes.join(", ")}`);
    }

    // Kill zones (CRITICAL for alignment)
    if (dna.kill_zones?.length) {
      parts.push(`🚫 KILL ZONES: ${dna.kill_zones.map(k => k.avoid).join(", ")}`);
    }

    // Creator fingerprint
    if (dna.creator_fingerprint?.tone) {
      parts.push(`TONE: ${dna.creator_fingerprint.tone}, ${dna.creator_fingerprint.complexityLevel || "moderate"} complexity`);
    }

    // Power words
    if (dna.power_words.length > 0) {
      parts.push(`POWER WORDS: ${dna.power_words.slice(0, 6).join(", ")}`);
    }

    // Title patterns
    if (dna.title_patterns.commonStructures?.length) {
      parts.push(`TITLE FORMULAS: ${dna.title_patterns.commonStructures.slice(0, 3).join(", ")}`);
    }

    // Audience
    if (dna.audience_intelligence_level) {
      parts.push(`AUDIENCE: ${dna.audience_intelligence_level}`);
    }

    // Viewing intent
    if (dna.performance_signature?.viewingIntent) {
      parts.push(`VIEWING INTENT: ${dna.performance_signature.viewingIntent}`);
    }

    return parts.join("\n");
  }, [dna]);

  // Fetch DNA on mount
  useEffect(() => {
    fetchDNA();
  }, [fetchDNA]);

  return {
    dna,
    loading,
    analyzing,
    error,
    hasDNA: !!dna,
    analyzeDNA,
    refetch: fetchDNA,
    getDNAForPrompt,
  };
};
