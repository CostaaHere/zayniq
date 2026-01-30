import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

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

// Helper to check if we have a cached response
async function getCachedResponse(supabase: any, cacheKey: string, maxAgeMinutes: number = 60) {
  try {
    const { data } = await supabase
      .from("youtube_cache")
      .select("*")
      .eq("cache_key", cacheKey)
      .single();

    if (data) {
      const cachedAt = new Date(data.cached_at);
      const now = new Date();
      const ageMinutes = (now.getTime() - cachedAt.getTime()) / (1000 * 60);

      if (ageMinutes < maxAgeMinutes) {
        console.log(`Cache hit for ${cacheKey}`);
        return data.response_data;
      }
    }
  } catch (e) {
    // Cache miss or error - proceed without cache
    console.log(`Cache miss for ${cacheKey}`);
  }
  return null;
}

// Helper to set cached response
async function setCachedResponse(supabase: any, cacheKey: string, data: any) {
  try {
    await supabase
      .from("youtube_cache")
      .upsert({
        cache_key: cacheKey,
        response_data: data,
        cached_at: new Date().toISOString(),
      }, { onConflict: "cache_key" });
    console.log(`Cached response for ${cacheKey}`);
  } catch (e) {
    console.error("Failed to cache response:", e);
  }
}

// Parse channel URL to get channel ID or handle
function parseChannelUrl(url: string): { type: "id" | "handle" | "username" | "custom"; value: string } | null {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;

    // Handle @username format
    if (pathname.startsWith("/@")) {
      return { type: "handle", value: pathname.slice(2) };
    }

    // Handle /channel/UC... format
    if (pathname.startsWith("/channel/")) {
      return { type: "id", value: pathname.replace("/channel/", "") };
    }

    // Handle /c/customname format
    if (pathname.startsWith("/c/")) {
      return { type: "custom", value: pathname.replace("/c/", "") };
    }

    // Handle /user/username format
    if (pathname.startsWith("/user/")) {
      return { type: "username", value: pathname.replace("/user/", "") };
    }

    return null;
  } catch {
    // Not a valid URL, might be just a handle or ID
    if (url.startsWith("@")) {
      return { type: "handle", value: url.slice(1) };
    }
    if (url.startsWith("UC") && url.length > 20) {
      return { type: "id", value: url };
    }
    return { type: "handle", value: url };
  }
}

// Fetch channel by URL/handle
async function fetchChannelByUrl(apiKey: string, url: string, supabase: any) {
  const parsed = parseChannelUrl(url);
  if (!parsed) {
    throw new Error("Invalid channel URL format");
  }

  console.log(`Fetching channel: type=${parsed.type}, value=${parsed.value}`);

  let endpoint = "";
  const cacheKey = `channel_${parsed.type}_${parsed.value}`;

  // Check cache first
  const cached = await getCachedResponse(supabase, cacheKey, 60);
  if (cached) return cached;

  if (parsed.type === "id") {
    endpoint = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&id=${parsed.value}&key=${apiKey}`;
  } else if (parsed.type === "handle") {
    endpoint = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&forHandle=${parsed.value}&key=${apiKey}`;
  } else if (parsed.type === "username") {
    endpoint = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&forUsername=${parsed.value}&key=${apiKey}`;
  } else {
    // For custom URLs, try search first
    const searchEndpoint = `${YOUTUBE_API_BASE}/search?part=snippet&type=channel&q=${parsed.value}&key=${apiKey}`;
    const searchResponse = await fetch(searchEndpoint);
    const searchData = await searchResponse.json();

    if (searchData.items && searchData.items.length > 0) {
      const channelId = searchData.items[0].snippet.channelId;
      endpoint = `${YOUTUBE_API_BASE}/channels?part=snippet,statistics,brandingSettings&id=${channelId}&key=${apiKey}`;
    } else {
      throw new Error("Channel not found");
    }
  }

  const response = await fetch(endpoint);
  const data = await response.json();

  if (data.error) {
    const apiError = data as YouTubeApiError;
    const quotaExceeded = apiError.error.errors?.some(e => e.reason === "quotaExceeded");
    if (quotaExceeded) {
      throw new Error("YouTube API quota exceeded. Please try again later.");
    }
    throw new Error(apiError.error.message || "Failed to fetch channel");
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("Channel not found");
  }

  const channel = data.items[0];
  const result = {
    id: channel.id,
    name: channel.snippet.title,
    description: channel.snippet.description,
    thumbnail: channel.snippet.thumbnails?.high?.url || channel.snippet.thumbnails?.default?.url,
    bannerUrl: channel.brandingSettings?.image?.bannerExternalUrl || null,
    customUrl: channel.snippet.customUrl,
    subscriberCount: parseInt(channel.statistics.subscriberCount) || 0,
    videoCount: parseInt(channel.statistics.videoCount) || 0,
    viewCount: parseInt(channel.statistics.viewCount) || 0,
    publishedAt: channel.snippet.publishedAt,
    country: channel.snippet.country,
  };

  // Cache the result
  await setCachedResponse(supabase, cacheKey, result);

  return result;
}

// Fetch channel videos
async function fetchChannelVideos(apiKey: string, channelId: string, maxResults: number = 10, supabase: any) {
  console.log(`Fetching videos for channel: ${channelId}, max: ${maxResults}`);

  const cacheKey = `videos_${channelId}_${maxResults}`;
  const cached = await getCachedResponse(supabase, cacheKey, 30); // 30 min cache for videos
  if (cached) return cached;

  // First get the uploads playlist ID
  const channelEndpoint = `${YOUTUBE_API_BASE}/channels?part=contentDetails&id=${channelId}&key=${apiKey}`;
  const channelResponse = await fetch(channelEndpoint);
  const channelData = await channelResponse.json();

  if (channelData.error) {
    const apiError = channelData as YouTubeApiError;
    const quotaExceeded = apiError.error.errors?.some(e => e.reason === "quotaExceeded");
    if (quotaExceeded) {
      throw new Error("YouTube API quota exceeded. Please try again later.");
    }
    throw new Error(apiError.error.message || "Failed to fetch channel");
  }

  if (!channelData.items || channelData.items.length === 0) {
    throw new Error("Channel not found");
  }

  const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

  // Fetch videos from uploads playlist
  const videosEndpoint = `${YOUTUBE_API_BASE}/playlistItems?part=snippet,contentDetails&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`;
  const videosResponse = await fetch(videosEndpoint);
  const videosData = await videosResponse.json();

  if (videosData.error) {
    const apiError = videosData as YouTubeApiError;
    const quotaExceeded = apiError.error.errors?.some(e => e.reason === "quotaExceeded");
    if (quotaExceeded) {
      throw new Error("YouTube API quota exceeded. Please try again later.");
    }
    throw new Error(apiError.error.message || "Failed to fetch videos");
  }

  const videoIds = videosData.items?.map((item: any) => item.contentDetails.videoId).join(",");

  // Get detailed stats for each video
  const statsEndpoint = `${YOUTUBE_API_BASE}/videos?part=statistics,contentDetails&id=${videoIds}&key=${apiKey}`;
  const statsResponse = await fetch(statsEndpoint);
  const statsData = await statsResponse.json();

  const statsMap = new Map();
  statsData.items?.forEach((item: any) => {
    statsMap.set(item.id, {
      viewCount: parseInt(item.statistics.viewCount) || 0,
      likeCount: parseInt(item.statistics.likeCount) || 0,
      commentCount: parseInt(item.statistics.commentCount) || 0,
      duration: item.contentDetails.duration,
    });
  });

  const result = videosData.items?.map((item: any) => {
    const stats = statsMap.get(item.contentDetails.videoId) || {};
    return {
      id: item.contentDetails.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt,
      ...stats,
    };
  }) || [];

  await setCachedResponse(supabase, cacheKey, result);

  return result;
}

// Fetch single video details
async function fetchVideoDetails(apiKey: string, videoId: string, supabase: any) {
  console.log(`Fetching video details: ${videoId}`);

  const cacheKey = `video_${videoId}`;
  const cached = await getCachedResponse(supabase, cacheKey, 60);
  if (cached) return cached;

  const endpoint = `${YOUTUBE_API_BASE}/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;
  const response = await fetch(endpoint);
  const data = await response.json();

  if (data.error) {
    const apiError = data as YouTubeApiError;
    const quotaExceeded = apiError.error.errors?.some(e => e.reason === "quotaExceeded");
    if (quotaExceeded) {
      throw new Error("YouTube API quota exceeded. Please try again later.");
    }
    throw new Error(apiError.error.message || "Failed to fetch video");
  }

  if (!data.items || data.items.length === 0) {
    throw new Error("Video not found");
  }

  const video = data.items[0];
  const result = {
    id: video.id,
    title: video.snippet.title,
    description: video.snippet.description,
    thumbnail: video.snippet.thumbnails?.maxres?.url || video.snippet.thumbnails?.high?.url,
    channelId: video.snippet.channelId,
    channelTitle: video.snippet.channelTitle,
    publishedAt: video.snippet.publishedAt,
    tags: video.snippet.tags || [],
    categoryId: video.snippet.categoryId,
    duration: video.contentDetails.duration,
    viewCount: parseInt(video.statistics.viewCount) || 0,
    likeCount: parseInt(video.statistics.likeCount) || 0,
    commentCount: parseInt(video.statistics.commentCount) || 0,
  };

  await setCachedResponse(supabase, cacheKey, result);

  return result;
}

// Search YouTube
async function searchYouTube(apiKey: string, query: string, maxResults: number = 10, type: string = "video", supabase: any) {
  console.log(`Searching YouTube: query=${query}, type=${type}`);

  const cacheKey = `search_${query}_${type}_${maxResults}`;
  const cached = await getCachedResponse(supabase, cacheKey, 15); // 15 min cache for search
  if (cached) return cached;

  const endpoint = `${YOUTUBE_API_BASE}/search?part=snippet&q=${encodeURIComponent(query)}&type=${type}&maxResults=${maxResults}&key=${apiKey}`;
  const response = await fetch(endpoint);
  const data = await response.json();

  if (data.error) {
    const apiError = data as YouTubeApiError;
    const quotaExceeded = apiError.error.errors?.some(e => e.reason === "quotaExceeded");
    if (quotaExceeded) {
      throw new Error("YouTube API quota exceeded. Please try again later.");
    }
    throw new Error(apiError.error.message || "Search failed");
  }

  const result = data.items?.map((item: any) => ({
    id: item.id.videoId || item.id.channelId || item.id.playlistId,
    type: item.id.kind.split("#")[1],
    title: item.snippet.title,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.default?.url,
    channelId: item.snippet.channelId,
    channelTitle: item.snippet.channelTitle,
    publishedAt: item.snippet.publishedAt,
  })) || [];

  await setCachedResponse(supabase, cacheKey, result);

  return result;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify authentication - require valid user session
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Authentication required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    // Create client with user's auth token
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Validate the user's JWT
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authentication" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("YOUTUBE_API_KEY");
    if (!apiKey) {
      console.error("YOUTUBE_API_KEY not configured");
      throw new Error("YouTube API key not configured");
    }
    
    // Use service role for cache operations
    let supabase = null;
    if (supabaseUrl && supabaseServiceKey) {
      supabase = createClient(supabaseUrl, supabaseServiceKey);
    }

    const { action, ...params } = await req.json();

    console.log(`YouTube API action: ${action} for user: ${user.id}`, params);

    let result;

    switch (action) {
      case "fetchChannelByUrl":
        if (!params.url) throw new Error("URL is required");
        result = await fetchChannelByUrl(apiKey, params.url, supabase);
        break;

      case "fetchChannelVideos":
        if (!params.channelId) throw new Error("Channel ID is required");
        result = await fetchChannelVideos(apiKey, params.channelId, params.maxResults || 10, supabase);
        break;

      case "fetchVideoDetails":
        if (!params.videoId) throw new Error("Video ID is required");
        result = await fetchVideoDetails(apiKey, params.videoId, supabase);
        break;

      case "searchYouTube":
        if (!params.query) throw new Error("Query is required");
        result = await searchYouTube(apiKey, params.query, params.maxResults || 10, params.type || "video", supabase);
        break;

      default:
        throw new Error(`Unknown action: ${action}`);
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("YouTube API error:", error);

    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    const isQuotaError = errorMessage.includes("quota");
    const status = isQuotaError ? 429 : 400;

    return new Response(
      JSON.stringify({
        error: errorMessage,
        isQuotaError,
      }),
      {
        status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
