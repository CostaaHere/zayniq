import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export interface ChannelDNA {
  id: string;
  user_id: string;
  channel_id: string | null;
  analyzed_at: string;
  videos_analyzed: number;
  content_categories: string[];
  top_performing_topics: Array<{
    topic: string;
    avgViews: number;
    frequency: string;
  }>;
  title_patterns: {
    avgLength?: number;
    commonStructures?: string[];
    emotionalTriggers?: string[];
    numbersUsed?: boolean;
  };
  title_formulas: Array<{
    formula: string;
    example: string;
  }>;
  power_words: string[];
  tone_profile: {
    primary?: string;
    secondary?: string;
    formality?: string;
    energy?: string;
  };
  vocabulary_style: string | null;
  emoji_usage: string;
  audience_demographics: {
    interests?: string[];
    skillLevel?: string;
    contentPreferences?: string[];
  };
  peak_engagement_times: string[];
  avg_engagement_rate: number | null;
  avg_views: number | null;
  avg_likes: number | null;
  avg_comments: number | null;
  view_to_like_ratio: number | null;
  dna_summary: string | null;
  created_at: string;
  updated_at: string;
}

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
        // Parse JSONB fields properly
        setDNA({
          ...data,
          content_categories: data.content_categories as string[] || [],
          top_performing_topics: data.top_performing_topics as ChannelDNA['top_performing_topics'] || [],
          title_patterns: data.title_patterns as ChannelDNA['title_patterns'] || {},
          title_formulas: data.title_formulas as ChannelDNA['title_formulas'] || [],
          power_words: data.power_words as string[] || [],
          tone_profile: data.tone_profile as ChannelDNA['tone_profile'] || {},
          audience_demographics: data.audience_demographics as ChannelDNA['audience_demographics'] || {},
          peak_engagement_times: data.peak_engagement_times as string[] || [],
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
        });
      }

      toast({
        title: "Channel DNA Analyzed",
        description: `Analyzed ${data?.analysis?.videosAnalyzed || 0} videos to create your unique content fingerprint.`,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze channel";
      logger.error("Error analyzing Channel DNA:", err);
      setError(errorMessage);
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  }, [user, toast]);

  /**
   * Generate a condensed DNA string for use in AI prompts
   */
  const getDNAForPrompt = useCallback((): string => {
    if (!dna) {
      return "";
    }

    const parts: string[] = [];

    // Add DNA summary first (most important)
    if (dna.dna_summary) {
      parts.push(`CHANNEL DNA: ${dna.dna_summary}`);
    }

    // Add tone and style
    if (dna.tone_profile.primary) {
      parts.push(`TONE: ${dna.tone_profile.primary}${dna.tone_profile.secondary ? ` with ${dna.tone_profile.secondary} elements` : ""}, ${dna.tone_profile.formality || "casual"} formality, ${dna.tone_profile.energy || "medium"} energy`);
    }

    // Add content categories
    if (dna.content_categories.length > 0) {
      parts.push(`CONTENT FOCUS: ${dna.content_categories.slice(0, 3).join(", ")}`);
    }

    // Add title patterns
    if (dna.title_patterns.commonStructures?.length) {
      parts.push(`TITLE FORMULAS: ${dna.title_patterns.commonStructures.slice(0, 3).join(", ")}`);
    }

    // Add power words
    if (dna.power_words.length > 0) {
      parts.push(`POWER WORDS: ${dna.power_words.slice(0, 5).join(", ")}`);
    }

    // Add vocabulary style
    if (dna.vocabulary_style) {
      parts.push(`VOCABULARY: ${dna.vocabulary_style}`);
    }

    // Add emoji guidance
    if (dna.emoji_usage) {
      parts.push(`EMOJI USAGE: ${dna.emoji_usage}`);
    }

    // Add audience info
    if (dna.audience_demographics.skillLevel) {
      parts.push(`AUDIENCE: ${dna.audience_demographics.skillLevel}`);
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
