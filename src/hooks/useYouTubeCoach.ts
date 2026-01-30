import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export type CoachType = "diagnosis" | "weakPoints" | "nextContent" | "custom";

export interface CoachMetrics {
  videosAnalyzed: number;
  avgViews: number;
  avgEngagement: string;
  uploadFrequency: string;
  hasDNA: boolean;
}

export interface CoachResponse {
  coachType: CoachType;
  response: string;
  metrics: CoachMetrics;
  timestamp: Date;
  isNew?: boolean;
}

export interface UserMessage {
  content: string;
  timestamp: Date;
  coachType: CoachType;
}

export interface ChatMessage {
  type: "user" | "coach";
  content: string | CoachResponse;
  timestamp: Date;
  isNew?: boolean;
}

export interface UseYouTubeCoachReturn {
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  askCoach: (coachType: CoachType, question?: string) => Promise<void>;
  clearHistory: () => void;
}

export const useYouTubeCoach = (): UseYouTubeCoachReturn => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
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

    // Add user message to chat immediately
    const userMessage: ChatMessage = {
      type: "user",
      content: question || getQuickActionLabel(coachType),
      timestamp: new Date(),
    };
    
    setMessages(prev => [...prev, userMessage]);
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

      const coachResponse: CoachResponse = {
        coachType: data.coachType,
        response: data.response,
        metrics: {
          videosAnalyzed: data.metrics?.videosAnalyzed || 0,
          avgViews: data.metrics?.avgViews || 0,
          avgEngagement: data.metrics?.avgEngagement || "0",
          uploadFrequency: data.metrics?.uploadFrequency || "0",
          hasDNA: data.metrics?.hasDNA || false,
        },
        timestamp: new Date(),
        isNew: true,
      };

      const coachMessage: ChatMessage = {
        type: "coach",
        content: coachResponse,
        timestamp: new Date(),
        isNew: true,
      };

      setMessages(prev => [...prev, coachMessage]);

      // Mark as not new after a delay
      setTimeout(() => {
        setMessages(prev => prev.map(msg => ({ ...msg, isNew: false })));
      }, 100);

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
    setMessages([]);
  }, []);

  return {
    messages,
    loading,
    error,
    askCoach,
    clearHistory,
  };
};

function getQuickActionLabel(type: CoachType): string {
  switch (type) {
    case "diagnosis":
      return "Give me a full channel diagnosis";
    case "weakPoints":
      return "What are my channel's weak points?";
    case "nextContent":
      return "What content should I create next week?";
    case "custom":
      return "Custom question";
  }
}
