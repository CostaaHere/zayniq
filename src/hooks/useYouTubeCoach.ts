import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";
import { RiskRewardAssessment } from "@/types/intelligence";

export type CoachType = "diagnosis" | "weakPoints" | "nextContent" | "custom";

export interface CoachMetrics {
  videosAnalyzed: number;
  avgViews: number;
  avgEngagement: string;
  uploadFrequency: string;
  hasDNA: boolean;
  hasHistory: boolean;
  activeBottlenecks: number;
}

export interface CoachResponse {
  coachType: CoachType;
  response: string;
  assessment: RiskRewardAssessment | null;
  strategicRationale: string;
  metrics: CoachMetrics;
  timestamp: Date;
}

export interface UseYouTubeCoachReturn {
  responses: CoachResponse[];
  loading: boolean;
  error: string | null;
  askCoach: (coachType: CoachType, question?: string) => Promise<void>;
  clearHistory: () => void;
}

export const useYouTubeCoach = (): UseYouTubeCoachReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [responses, setResponses] = useState<CoachResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const askCoach = useCallback(async (coachType: CoachType, question?: string) => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Please sign in to use the YouTube Coach.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: invokeError } = await supabase.functions.invoke("youtube-coach", {
        body: { coachType, question },
      });

      if (invokeError) {
        throw invokeError;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      const newResponse: CoachResponse = {
        coachType: data.coachType,
        response: data.response,
        assessment: data.assessment || null,
        strategicRationale: data.strategicRationale || "",
        metrics: {
          videosAnalyzed: data.metrics?.videosAnalyzed || 0,
          avgViews: data.metrics?.avgViews || 0,
          avgEngagement: data.metrics?.avgEngagement || "0",
          uploadFrequency: data.metrics?.uploadFrequency || "0",
          hasDNA: data.metrics?.hasDNA || false,
          hasHistory: data.metrics?.hasHistory || false,
          activeBottlenecks: data.metrics?.activeBottlenecks || 0,
        },
        timestamp: new Date(),
      };

      setResponses(prev => [...prev, newResponse]);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get coaching advice";
      logger.error("YouTube Coach error:", err);
      setError(errorMessage);
      
      toast({
        title: "Coach Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  const clearHistory = useCallback(() => {
    setResponses([]);
  }, []);

  return {
    responses,
    loading,
    error,
    askCoach,
    clearHistory,
  };
};
