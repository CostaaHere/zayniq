import { supabase } from "@/integrations/supabase/client";

export interface YouTubeChannel {
  id: string;
  name: string;
  description: string;
  thumbnail: string;
  bannerUrl: string | null;
  customUrl: string;
  subscriberCount: number;
  videoCount: number;
  viewCount: number;
  publishedAt: string;
  country: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration?: string;
  channelId?: string;
  channelTitle?: string;
  tags?: string[];
  categoryId?: string;
}

export interface YouTubeSearchResult {
  id: string;
  type: "video" | "channel" | "playlist";
  title: string;
  description: string;
  thumbnail: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
}

interface YouTubeApiError {
  error: string;
  isQuotaError?: boolean;
}

class YouTubeApiService {
  private async invokeFunction<T>(action: string, params: Record<string, any>): Promise<T> {
    const { data, error } = await supabase.functions.invoke("youtube-api", {
      body: { action, ...params },
    });

    if (error) {
      console.error("YouTube API error:", error);
      throw new Error(error.message || "Failed to call YouTube API");
    }

    if (data?.error) {
      const apiError = data as YouTubeApiError;
      if (apiError.isQuotaError) {
        throw new Error("YouTube API quota exceeded. Please try again later.");
      }
      throw new Error(apiError.error);
    }

    return data as T;
  }

  /**
   * Fetch channel details by URL or handle
   * Supports formats: @handle, youtube.com/@handle, youtube.com/channel/UC..., youtube.com/c/name
   */
  async fetchChannelByUrl(url: string): Promise<YouTubeChannel> {
    return this.invokeFunction<YouTubeChannel>("fetchChannelByUrl", { url });
  }

  /**
   * Fetch recent videos from a channel
   */
  async fetchChannelVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    return this.invokeFunction<YouTubeVideo[]>("fetchChannelVideos", { channelId, maxResults });
  }

  /**
   * Fetch detailed information about a specific video
   */
  async fetchVideoDetails(videoId: string): Promise<YouTubeVideo> {
    return this.invokeFunction<YouTubeVideo>("fetchVideoDetails", { videoId });
  }

  /**
   * Search YouTube for videos, channels, or playlists
   */
  async searchYouTube(
    query: string,
    maxResults: number = 10,
    type: "video" | "channel" | "playlist" = "video"
  ): Promise<YouTubeSearchResult[]> {
    return this.invokeFunction<YouTubeSearchResult[]>("searchYouTube", {
      query,
      maxResults,
      type,
    });
  }

  /**
   * Parse a YouTube video URL to extract the video ID
   */
  parseVideoUrl(url: string): string | null {
    try {
      const urlObj = new URL(url);
      
      // youtube.com/watch?v=VIDEO_ID
      if (urlObj.hostname.includes("youtube.com")) {
        const videoId = urlObj.searchParams.get("v");
        if (videoId) return videoId;
        
        // youtube.com/embed/VIDEO_ID
        if (urlObj.pathname.startsWith("/embed/")) {
          return urlObj.pathname.replace("/embed/", "");
        }
        
        // youtube.com/v/VIDEO_ID
        if (urlObj.pathname.startsWith("/v/")) {
          return urlObj.pathname.replace("/v/", "");
        }
      }
      
      // youtu.be/VIDEO_ID
      if (urlObj.hostname === "youtu.be") {
        return urlObj.pathname.slice(1);
      }
      
      return null;
    } catch {
      // Not a valid URL, might be just a video ID
      if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
        return url;
      }
      return null;
    }
  }

  /**
   * Format view count to human-readable string
   */
  formatViewCount(count: number): string {
    if (count >= 1000000000) {
      return `${(count / 1000000000).toFixed(1)}B`;
    }
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    }
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  }

  /**
   * Parse ISO 8601 duration to human-readable format
   */
  parseDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return duration;

    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
}

export const youtubeApi = new YouTubeApiService();
