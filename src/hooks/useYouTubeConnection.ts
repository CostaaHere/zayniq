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
  const { user, session, connectYouTube: authConnectYouTube } = useAuth();
  const { toast } = useToast();
  
  const [state, setState] = useState<YouTubeConnectionState>({
    isConnected: false,
    isLoading: true,
    isSyncing: false,
    channel: null,
    error: null,
    hasProviderToken: false,
  });

  // Check for provider token in session
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

  // Check for stored OAuth tokens using the secure view (doesn't expose raw tokens)
  const checkStoredTokens = useCallback(async () => {
    if (!user?.id) return null;

    try {
      // Use the secure view that only exposes connection status, not raw tokens
      const { data, error } = await supabase
        .from("youtube_connection_status")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error checking connection status:", error);
        return null;
      }

      // Return in a format compatible with the rest of the hook
      return data ? {
        ...data,
        // The view provides is_token_valid instead of raw access_token
        access_token: data.is_token_valid ? "valid" : null,
      } : null;
    } catch (error) {
      console.error("Error checking connection status:", error);
      return null;
    }
  }, [user]);

  // Fetch stored channel data from database
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
      // Check for stored tokens as fallback
      const storedTokens = await checkStoredTokens();
      if (!storedTokens?.access_token) {
        setState((prev) => ({
          ...prev,
          error: "YouTube access not available. Please reconnect with YouTube.",
        }));
        return false;
      }
    }

    setState((prev) => ({ ...prev, isSyncing: true, error: null }));

    try {
      const tokenToUse = session?.provider_token;
      
      if (!tokenToUse) {
        throw new Error("No YouTube access token available");
      }

      const response = await supabase.functions.invoke("youtube-oauth", {
        body: {
          action: "syncMyData",
          providerToken: tokenToUse,
          maxResults: 50,
        },
      });

      if (response.error) {
        throw new Error(response.error.message || "Failed to sync YouTube data");
      }

      const { channel } = response.data;

      // Store the token for future use
      if (user?.id && session?.provider_token) {
        await supabase.from("youtube_oauth_tokens").upsert({
          user_id: user.id,
          access_token: session.provider_token,
          refresh_token: session.provider_refresh_token || null,
          youtube_channel_id: channel.id,
          channel_name: channel.name,
          channel_thumbnail: channel.thumbnail,
          scopes: ["youtube.readonly"],
        }, { onConflict: "user_id" });
      }

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
        hasProviderToken: true,
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
  }, [session, user, toast, checkStoredTokens]);

  // Connect YouTube channel via Google OAuth
  const connectYouTube = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const { error } = await authConnectYouTube();

      if (error) {
        throw error;
      }

      // OAuth flow initiated - user will be redirected
      // State will be updated when they return
      toast({
        title: "Connecting...",
        description: "You'll be redirected to Google to authorize YouTube access",
      });
    } catch (error: any) {
      console.error("Connect error:", error);
      
      // Check for the specific "Manual linking" error
      const errorMessage = error.message || "Failed to connect YouTube";
      const isLinkingError = errorMessage.includes("Manual linking is disabled");
      
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: isLinkingError 
          ? "Please sign in with Google to connect your YouTube channel." 
          : errorMessage,
      }));

      toast({
        title: "Connection failed",
        description: isLinkingError 
          ? "Sign in with Google to connect your YouTube channel"
          : errorMessage,
        variant: "destructive",
      });
    }
  }, [authConnectYouTube, toast]);

  // Disconnect YouTube (remove stored data and tokens)
  const disconnectYouTube = useCallback(async () => {
    if (!user?.id) return;

    setState((prev) => ({ ...prev, isLoading: true }));

    try {
      // Delete OAuth tokens
      await supabase
        .from("youtube_oauth_tokens")
        .delete()
        .eq("user_id", user.id);

      // Delete channel data
      await supabase
        .from("channels")
        .delete()
        .eq("user_id", user.id);

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

      // Check for provider token from current session
      const hasToken = await checkProviderToken();
      
      // Check for stored OAuth tokens
      const storedTokens = await checkStoredTokens();
      
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
          hasProviderToken: hasToken || !!storedTokens,
        });

        // If we have a fresh provider token, sync in background
        if (hasToken && session.provider_token) {
          const lastSync = storedData.channel.lastSyncedAt;
          if (lastSync) {
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            if (new Date(lastSync) < hourAgo) {
              syncYouTubeData();
            }
          }
        }
      } else if ((hasToken && session.provider_token) || storedTokens?.access_token) {
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
  }, [user, session, checkProviderToken, checkStoredTokens, fetchStoredData, syncYouTubeData]);

  return {
    ...state,
    connectYouTube,
    disconnectYouTube,
    syncYouTubeData,
    refresh: fetchStoredData,
  };
}
