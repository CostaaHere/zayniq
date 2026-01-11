import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { logger } from "@/lib/logger";

export interface YouTubeChannel {
  id: string;
  name: string;
  description: string | null;
  thumbnail: string | null;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  lastSyncedAt: string | null;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string | null;
  tags: string[];
}

export interface YouTubeAnalyticsData {
  channel: YouTubeChannel | null;
  videos: YouTubeVideo[];
  hasData: boolean;
  needsYouTubeAuth: boolean;
}

export interface UseYouTubeAnalyticsReturn {
  data: YouTubeAnalyticsData;
  loading: boolean;
  syncing: boolean;
  error: string | null;
  syncData: () => Promise<void>;
  refetch: () => Promise<void>;
  formatViewCount: (count: number) => string;
  formatSubscriberCount: (count: number) => string;
  formatDuration: (duration: string) => string;
}

export const useYouTubeAnalytics = (): UseYouTubeAnalyticsReturn => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  
  const [data, setData] = useState<YouTubeAnalyticsData>({
    channel: null,
    videos: [],
    hasData: false,
    needsYouTubeAuth: false,
  });
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Check if user has YouTube OAuth token
   */
  const hasYouTubeToken = useCallback((): boolean => {
    return !!session?.provider_token;
  }, [session]);

  /**
   * Invoke the youtube-oauth edge function
   */
  const invokeYouTubeOAuth = async (action: string, params: Record<string, any> = {}) => {
    const { data, error } = await supabase.functions.invoke("youtube-oauth", {
      body: { action, ...params },
    });

    if (error) {
      logger.error("YouTube OAuth function error:", error);
      throw new Error(error.message || "Failed to call YouTube API");
    }

    if (data?.error) {
      throw new Error(data.error);
    }

    return data;
  };

  /**
   * Fetch stored data from database (fast, no API calls)
   */
  const fetchStoredData = useCallback(async () => {
    if (!user) {
      setData({ channel: null, videos: [], hasData: false, needsYouTubeAuth: false });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await invokeYouTubeOAuth("getStoredData", { limit: 20 });
      
      setData({
        channel: result.channel,
        videos: result.videos || [],
        hasData: result.hasData,
        needsYouTubeAuth: !hasYouTubeToken(),
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch analytics";
      logger.error("Error fetching stored data:", err);
      
      // Check if it's an auth-related error
      if (errorMessage.includes("NO_YOUTUBE_TOKEN") || errorMessage.includes("AUTH_ERROR")) {
        setData(prev => ({ ...prev, needsYouTubeAuth: true }));
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }, [user, hasYouTubeToken]);

  /**
   * Sync fresh data from YouTube API and store in database
   */
  const syncData = useCallback(async () => {
    if (!user) {
      toast({
        title: "Not signed in",
        description: "Please sign in to sync your YouTube data.",
        variant: "destructive",
      });
      return;
    }

    if (!hasYouTubeToken()) {
      toast({
        title: "YouTube access required",
        description: "Please sign in with Google and grant YouTube permissions.",
        variant: "destructive",
      });
      setData(prev => ({ ...prev, needsYouTubeAuth: true }));
      return;
    }

    setSyncing(true);
    setError(null);

    try {
      const result = await invokeYouTubeOAuth("syncMyData", { maxResults: 50 });
      
      setData({
        channel: {
          id: result.channel.id,
          name: result.channel.name,
          description: result.channel.description,
          thumbnail: result.channel.thumbnail,
          subscriberCount: result.channel.subscriberCount,
          videoCount: result.channel.videoCount,
          viewCount: result.channel.viewCount,
          lastSyncedAt: new Date().toISOString(),
        },
        videos: result.videos || [],
        hasData: true,
        needsYouTubeAuth: false,
      });

      toast({
        title: "Sync complete!",
        description: `Synced ${result.videos?.length || 0} videos from your channel.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to sync data";
      logger.error("Error syncing YouTube data:", err);
      
      if (errorMessage.includes("NO_YOUTUBE_TOKEN") || errorMessage.includes("YOUTUBE_AUTH_EXPIRED")) {
        setData(prev => ({ ...prev, needsYouTubeAuth: true }));
        toast({
          title: "YouTube access expired",
          description: "Please sign in again with Google to refresh YouTube access.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("YOUTUBE_NO_CHANNEL")) {
        toast({
          title: "No YouTube channel",
          description: "No YouTube channel found for this Google account.",
          variant: "destructive",
        });
      } else if (errorMessage.includes("QUOTA_EXCEEDED")) {
        toast({
          title: "API limit reached",
          description: "YouTube API quota exceeded. Please try again later.",
          variant: "destructive",
        });
      } else {
        setError(errorMessage);
        toast({
          title: "Sync failed",
          description: "Failed to sync YouTube data. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setSyncing(false);
    }
  }, [user, hasYouTubeToken, toast]);

  /**
   * Format large numbers for display
   */
  const formatViewCount = (count: number): string => {
    if (count >= 1000000000) {
      return `${(count / 1000000000).toFixed(1)}B`;
    }
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  const formatSubscriberCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(2)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toLocaleString();
  };

  /**
   * Parse ISO 8601 duration to human-readable format
   */
  const formatDuration = (duration: string): string => {
    if (!duration) return "0:00";
    
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  // Fetch stored data on mount and when user changes
  useEffect(() => {
    fetchStoredData();
  }, [fetchStoredData]);

  return {
    data,
    loading,
    syncing,
    error,
    syncData,
    refetch: fetchStoredData,
    formatViewCount,
    formatSubscriberCount,
    formatDuration,
  };
};
