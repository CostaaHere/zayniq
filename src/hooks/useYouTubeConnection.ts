import { useState, useCallback, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface YouTubeChannel {
  id: string;
  name: string;
  description?: string;
  thumbnail?: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  lastSyncedAt?: string;
}

export interface YouTubeConnectionState {
  isConnected: boolean;
  isLoading: boolean;
  isSyncing: boolean;
  channel: YouTubeChannel | null;
  error: string | null;
  hasProviderToken: boolean;
}

export function useYouTubeConnection() {
  const { user, session, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  
  const [state, setState] = useState<YouTubeConnectionState>({
    isConnected: false,
    isLoading: true,
    isSyncing: false,
    channel: null,
    error: null,
    hasProviderToken: false,
  });

  // Check for provider token
  const checkProviderToken = useCallback(async () => {
    if (!session) return false;
    
    // Check if we have a Google identity with provider token
    const googleIdentity = user?.identities?.find(
      (identity) => identity.provider === "google"
    );
    
    // Provider token is available in session
    const providerToken = session.provider_token;
    
    return !!googleIdentity && !!providerToken;
  }, [session, user]);

  // Fetch stored channel data
  const fetchStoredData = useCallback(async () => {
    if (!session?.access_token) return null;

    try {
      const response = await supabase.functions.invoke("youtube-oauth", {
        body: { action: "getStoredData" },
      });

      if (response.error) {
        console.error("Error fetching stored data:", response.error);
        return null;
      }

      return response.data;
    } catch (error) {
      console.error("Error fetching stored data:", error);
      return null;
    }
  }, [session]);

  // Sync YouTube data using provider token
  const syncYouTubeData = useCallback(async () => {
    if (!session?.provider_token) {
      setState((prev) => ({
        ...prev,
        error: "YouTube access not available. Please reconnect with Google.",
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const response = await supabase.functions.invoke("youtube-oauth", {
        body: {
          action: "syncMyData",
          providerToken: session.provider_token,
          maxResults: 50,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to sync YouTube data");
      }

      const { channel } = response.data;

      setState((prev) => ({
        ...prev,
        isConnected: true,
        isSyncing: false,
        channel: {
          id: channel.id,
          name: channel.name,
          description: channel.description,
          thumbnail: channel.thumbnail,
          subscriberCount: channel.subscriberCount,
          videoCount: channel.videoCount,
          viewCount: channel.viewCount,
        },
        error: null,
      }));

      toast({
        title: "Channel synced!",
        description: `Successfully connected ${channel.name}`,
      });

      return true;
    } catch (error: any) {
      console.error("Sync error:", error);
      
      const errorMessage = error.message || "Failed to sync YouTube data";
      
      setState((prev) => ({
        ...prev,
        isSyncing: false,
        error: errorMessage,
      }));

      toast({
        title: "Sync failed",
        description: errorMessage,
        variant: "destructive",
      });

      return false;
    }
  }, [session, toast]);

  // Connect YouTube channel via Google OAuth
  const connectYouTube = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await signInWithGoogle();

      if (error) {
        throw error;
      }

      // OAuth flow initiated - user will be redirected
      // State will be updated when they return
    } catch (error: any) {
      console.error("Connect error:", error);
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to connect YouTube",
      }));

      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect with Google",
        variant: "destructive",
      });
    }
  }, [signInWithGoogle, toast]);

  // Disconnect YouTube (remove stored data, not Google identity)
  const disconnectYouTube = useCallback(async () => {
    if (!user?.id) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Delete channel data
      const { error: channelError } = await supabase
        .from("channels")
        .delete()
        .eq("user_id", user.id);

      if (channelError) {
        throw channelError;
      }

      // Delete video data
      await supabase
        .from("youtube_videos")
        .delete()
        .eq("user_id", user.id);

      setState({
        isConnected: false,
        isLoading: false,
        isSyncing: false,
        channel: null,
        error: null,
        hasProviderToken: false,
      });

      toast({
        title: "Disconnected",
        description: "Your YouTube channel has been disconnected",
      });
    } catch (error: any) {
      console.error("Disconnect error:", error);
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error.message || "Failed to disconnect",
      }));

      toast({
        title: "Error",
        description: "Failed to disconnect channel",
        variant: "destructive",
      });
    }
  }, [user, toast]);

  // Initialize state on mount and session changes
  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      if (!user || !session) {
        setState({
          isConnected: false,
          isLoading: false,
          isSyncing: false,
          channel: null,
          error: null,
          hasProviderToken: false,
        });
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      // Check for provider token
      const hasToken = await checkProviderToken();
      
      // Fetch stored channel data
      const storedData = await fetchStoredData();

      if (cancelled) return;

      if (storedData?.hasData && storedData.channel) {
        setState({
          isConnected: true,
          isLoading: false,
          isSyncing: false,
          channel: storedData.channel,
          error: null,
          hasProviderToken: hasToken,
        });

        // If we have a provider token but data might be stale, sync in background
        if (hasToken && session.provider_token) {
          // Check if last sync was more than 1 hour ago
          const lastSync = storedData.channel.lastSyncedAt;
          if (lastSync) {
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            if (new Date(lastSync) < hourAgo) {
              syncYouTubeData();
            }
          }
        }
      } else if (hasToken && session.provider_token) {
        // Have token but no stored data - sync now
        setState((prev) => ({ ...prev, isLoading: false, hasProviderToken: true }));
        syncYouTubeData();
      } else {
        setState({
          isConnected: false,
          isLoading: false,
          isSyncing: false,
          channel: null,
          error: null,
          hasProviderToken: false,
        });
      }
    };

    initialize();

    return () => {
      cancelled = true;
    };
  }, [user, session, checkProviderToken, fetchStoredData, syncYouTubeData]);

  return {
    ...state,
    connectYouTube,
    disconnectYouTube,
    syncYouTubeData,
    refresh: fetchStoredData,
  };
}
