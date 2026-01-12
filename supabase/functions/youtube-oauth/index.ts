import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { decode } from "https://deno.land/std@0.208.0/encoding/base64url.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeApiError {
  error: {
    code: number;
    message: string;
    errors: Array<{ reason: string; message: string }>;
  };
}

/**
 * Fetch the authenticated user's own YouTube channel using their OAuth token
 * This uses the "mine=true" parameter which returns the channel for the authenticated user
 */
async function fetchMyChannel(accessToken: string) {
  console.log("Fetching user's own YouTube channel...");

  const endpoint = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings,contentDetails&mine=true`;
  
  const response = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const data = await response.json();

  if (data.error) {
    const apiError = data as YouTubeApiError;
    console.error("YouTube API error:", apiError.error);
    
    if (apiError.error.code === 401) {
      throw new Error("YOUTUBE_AUTH_EXPIRED: YouTube access has expired. Please reconnect your Google account.");
    }
    if (apiError.error.code === 403) {
      const quotaExceeded = apiError.error.errors?.some((e) => e.reason === "quotaExceeded");
      if (quotaExceeded) {
        throw new Error("YOUTUBE_QUOTA_EXCEEDED: YouTube API quota exceeded. Please try again later.");
      }
      throw new Error("YOUTUBE_NO_PERMISSION: YouTube access denied. Please grant YouTube permissions when signing in.");
    }
    throw new Error(`YOUTUBE_API_ERROR: ${apiError.error.message}`);
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("YOUTUBE_NO_CHANNEL: No YouTube channel found for this account. Please create a channel first.");
  }

  const channel = data.items[0];
  return {
    id: channel.id,
    name: channel.snippet.title,
    description: channel.snippet.description,
    thumbnail: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
    bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || null,
    customUrl: channel.snippet.customUrl,
    subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
    videoCount: parseInt(channel.statistics.videoCount) || 0,
    viewCount: parseInt(channel.statistics.viewCount) || 0,
    hiddenSubscriberCount: channel.statistics.hiddenSubscriberCount || false,
    publishedAt: channel.snippet.publishedAt,
    country: channel.snippet.country || null,
    uploadsPlaylistId: channel.contentDetails?.relatedPlaylists?.uploads || null,
  };
}

/**
 * Fetch the authenticated user's latest videos
 */
async function fetchMyVideos(accessToken: string, maxResults: number = 10) {
  console.log(`Fetching user's latest ${maxResults} videos...`);

  // First get the channel to find the uploads playlist
  const channel = await fetchMyChannel(accessToken);
  
  if (!channel.uploadsPlaylistId) {
    throw new Error("YOUTUBE_NO_UPLOADS: Could not find uploads playlist for this channel.");
  }

  // Fetch videos from uploads playlist
  const videosEndpoint = `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${channel.uploadsPlaylistId}&maxResults=${maxResults}`;
  
  const videosResponse = await fetch(videosEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const videosData = await videosResponse.json();

  if (videosData.error) {
    const apiError = videosData as YouTubeApiError;
    console.error("YouTube API error fetching videos:", apiError.error);
    throw new Error(`YOUTUBE_API_ERROR: ${apiError.error.message}`);
  }

  if (!videosData.items || videosData.items.length === 0) {
    return { channel, videos: [] };
  }

  const videoIds = videosData.items.map((item: any) => item.contentDetails.videoId).join(",");

  // Get detailed stats for each video
  const statsEndpoint = `${YOUTUBE_API_BASE}/videos?part=statistics,contentDetails,snippet&id=${videoIds}`;
  
  const statsResponse = await fetch(statsEndpoint, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
  });

  const statsData = await statsResponse.json();

  if (statsData.error) {
    const apiError = statsData as YouTubeApiError;
    console.error("YouTube API error fetching video stats:", apiError.error);
    throw new Error(`YOUTUBE_API_ERROR: ${apiError.error.message}`);
  }

  const videos = statsData.items?.map((item: any) => ({
    id: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.maxres?.url || 
               item.snippet.thumbnails?.high?.url || 
               item.snippet.thumbnails?.medium?.url ||
               item.snippet.thumbnails?.default?.url,
    publishedAt: item.snippet.publishedAt,
    duration: item.contentDetails.duration,
    viewCount: parseInt(item.statistics.viewCount) || 0,
    likeCount: parseInt(item.statistics.likeCount) || 0,
    commentCount: parseInt(item.statistics.commentCount) || 0,
    favoriteCount: parseInt(item.statistics.favoriteCount) || 0,
    tags: item.snippet.tags || [],
    categoryId: item.snippet.categoryId,
    privacyStatus: item.status?.privacyStatus || "public",
  })) || [];

  return { channel, videos };
}

/**
 * Sync the user's YouTube channel and videos to the database
 */
async function syncToDatabase(
  supabase: any,
  userId: string,
  channel: any,
  videos: any[]
) {
  console.log(`Syncing data for user ${userId}...`);

  // Upsert channel
  const { data: channelData, error: channelError } = await supabase
    .from("channels")
    .upsert({
      user_id: userId,
      youtube_channel_id: channel.id,
      channel_name: channel.name,
      description: channel.description,
      thumbnail_url: channel.thumbnail,
      subscriber_count: channel.subscriberCount,
      video_count: channel.videoCount,
      total_view_count: channel.viewCount,
      last_synced_at: new Date().toISOString(),
    }, {
      onConflict: "user_id,youtube_channel_id",
    })
    .select()
    .single();

  if (channelError) {
    console.error("Error upserting channel:", channelError);
    // Try without conflict handling if first insert
    const { data: insertData, error: insertError } = await supabase
      .from("channels")
      .insert({
        user_id: userId,
        youtube_channel_id: channel.id,
        channel_name: channel.name,
        description: channel.description,
        thumbnail_url: channel.thumbnail,
        subscriber_count: channel.subscriberCount,
        video_count: channel.videoCount,
        total_view_count: channel.viewCount,
        last_synced_at: new Date().toISOString(),
      })
      .select()
      .single();
    
    if (insertError) {
      console.error("Error inserting channel:", insertError);
      throw new Error("Failed to save channel data");
    }
  }

  const channelRowId = channelData?.id;

  // Upsert videos if we have the channel row
  if (videos.length > 0) {
    for (const video of videos) {
      const { error: videoError } = await supabase
        .from("youtube_videos")
        .upsert({
          user_id: userId,
          channel_row_id: channelRowId,
          youtube_video_id: video.id,
          title: video.title,
          description: video.description,
          thumbnail_url: video.thumbnail,
          published_at: video.publishedAt,
          view_count: video.viewCount,
          like_count: video.likeCount,
          comment_count: video.commentCount,
          duration: video.duration,
          tags: video.tags,
          category_id: video.categoryId,
          raw: video,
        }, {
          onConflict: "user_id,youtube_video_id",
        });

      if (videoError) {
        console.error(`Error upserting video ${video.id}:`, videoError);
      }
    }
  }

  return { channelRowId };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      throw new Error("NO_AUTH: Authorization header is required");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("SUPABASE_CONFIG_ERROR: Missing Supabase configuration");
    }

    // Create client with auth header
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Decode JWT to get user ID (the signing is already verified by Supabase infrastructure)
    const token = authHeader.replace("Bearer ", "");
    let userId: string;
    
    try {
      const parts = token.split(".");
      if (parts.length !== 3) {
        throw new Error("Invalid JWT format");
      }
      const payload = JSON.parse(new TextDecoder().decode(decode(parts[1])));
      userId = payload.sub;
      
      if (!userId) {
        throw new Error("No user ID in token");
      }
      
      // Verify token is not expired
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        throw new Error("Token expired");
      }
      
      console.log("User authenticated:", userId);
    } catch (e) {
      console.error("JWT decode error:", e);
      throw new Error("AUTH_ERROR: Invalid or expired session. Please sign in again.");
    }

    // Parse request body
    const { action, providerToken, ...params } = await req.json();
    console.log(`YouTube OAuth action: ${action}`, { userId });

    // Create service role client for database operations
    const supabaseAdmin = supabaseServiceKey 
      ? createClient(supabaseUrl, supabaseServiceKey)
      : supabaseClient;

    let result;

    switch (action) {
      case "fetchMyChannel":
        if (!providerToken) {
          throw new Error("NO_YOUTUBE_TOKEN: YouTube access not granted. Please sign in with Google and grant YouTube permissions.");
        }
        result = await fetchMyChannel(providerToken);
        break;

      case "fetchMyVideos":
        if (!providerToken) {
          throw new Error("NO_YOUTUBE_TOKEN: YouTube access not granted. Please sign in with Google and grant YouTube permissions.");
        }
        result = await fetchMyVideos(providerToken, params.maxResults || 10);
        break;

      case "syncMyData":
        if (!providerToken) {
          throw new Error("NO_YOUTUBE_TOKEN: YouTube access not granted. Please sign in with Google and grant YouTube permissions.");
        }
        const { channel, videos } = await fetchMyVideos(providerToken, params.maxResults || 50);
        await syncToDatabase(supabaseAdmin, userId, channel, videos);
        result = { channel, videos, synced: true };
        break;

      case "getStoredData":
        // Fetch from database instead of API - no provider token needed
        const { data: storedChannel, error: channelFetchError } = await supabaseAdmin
          .from("channels")
          .select("*")
          .eq("user_id", userId)
          .maybeSingle();

        if (channelFetchError) {
          console.error("Error fetching stored channel:", channelFetchError);
        }

        const { data: storedVideos, error: videosFetchError } = await supabaseAdmin
          .from("youtube_videos")
          .select("*")
          .eq("user_id", userId)
          .order("published_at", { ascending: false })
          .limit(params.limit || 10);

        if (videosFetchError) {
          console.error("Error fetching stored videos:", videosFetchError);
        }

        result = {
          channel: storedChannel ? {
            id: storedChannel.youtube_channel_id,
            name: storedChannel.channel_name,
            description: storedChannel.description,
            thumbnail: storedChannel.thumbnail_url,
            subscriberCount: storedChannel.subscriber_count,
            videoCount: storedChannel.video_count,
            viewCount: storedChannel.total_view_count,
            lastSyncedAt: storedChannel.last_synced_at,
          } : null,
          videos: storedVideos?.map((v: any) => ({
            id: v.youtube_video_id,
            title: v.title,
            description: v.description,
            thumbnail: v.thumbnail_url,
            publishedAt: v.published_at,
            viewCount: v.view_count,
            likeCount: v.like_count,
            commentCount: v.comment_count,
            duration: v.duration,
            tags: v.tags,
          })) || [],
          hasData: !!storedChannel,
        };
        break;

      default:
        throw new Error(`UNKNOWN_ACTION: Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("YouTube OAuth error:", error);

    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    
    // Determine status code based on error type
    let status = 400;
    if (errorMessage.includes("AUTH_ERROR") || errorMessage.includes("NO_AUTH")) {
      status = 401;
    } else if (errorMessage.includes("QUOTA_EXCEEDED")) {
      status = 429;
    } else if (errorMessage.includes("NO_PERMISSION")) {
      status = 403;
    }

    return new Response(
      JSON.stringify({
        error: errorMessage,
        errorCode: errorMessage.split(":")[0],
      }),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
