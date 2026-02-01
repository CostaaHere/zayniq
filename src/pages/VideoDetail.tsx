import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AVOEAnalysisPanel from "@/components/video/AVOEAnalysisPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
  ExternalLink,
  Target,
  Loader2,
  RefreshCw,
  Video,
  AlertCircle,
  Bug,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { analyzeWithAVOE } from "@/services/aiApi";
import type { AVOEAnalysis, AVOEInput } from "@/types/avoe";
import { format, parseISO } from "date-fns";

// Types for database video
interface VideoData {
  id: string;
  youtube_video_id: string;
  title: string;
  description: string | null;
  thumbnail_url: string | null;
  published_at: string | null;
  duration: string | null;
  view_count: number | null;
  like_count: number | null;
  comment_count: number | null;
  tags: string[] | null;
}

interface StoredAnalysis {
  id: string;
  youtube_video_id: string;
  status: string;
  overall_score: number | null;
  title_score: number | null;
  description_score: number | null;
  tags_score: number | null;
  hashtags_score: number | null;
  thumbnail_score: number | null;
  virality_score: number | null;
  confidence_score: number | null;
  improved_title: string | null;
  improved_description: string | null;
  improved_tags: string[] | null;
  improved_hashtags: string[] | null;
  priority_actions: any[] | null;
  packaging_audit: any | null;
  graph_optimization: any | null;
  retention_engineering: any | null;
  confidence_factors: string[] | null;
  data_warnings: string[] | null;
  title_breakdown: any | null;
  description_breakdown: any | null;
  tags_breakdown: any | null;
  hashtags_breakdown: any | null;
  thumbnail_breakdown: any | null;
  virality_breakdown: any | null;
  error_message: string | null;
  format_type: string | null;
  created_at: string;
}

const formatNumber = (num: number | null): string => {
  if (num === null || num === undefined) return "0";
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "Unknown";
  try {
    return format(parseISO(dateStr), "MMM d, yyyy");
  } catch {
    return dateStr;
  }
};

const formatDuration = (duration: string | null): string => {
  if (!duration) return "0:00";
  
  // Handle ISO 8601 duration (PT#H#M#S)
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (match) {
    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }
  
  return duration;
};

const getDurationSeconds = (duration: string | null): number => {
  if (!duration) return 0;
  
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (match) {
    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");
    return hours * 3600 + minutes * 60 + seconds;
  }
  
  return 0;
};

const VideoDetail = () => {
  const { youtubeVideoId } = useParams<{ youtubeVideoId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Video state
  const [video, setVideo] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Analysis state
  const [storedAnalysis, setStoredAnalysis] = useState<StoredAnalysis | null>(null);
  const [avoeAnalysis, setAvoeAnalysis] = useState<AVOEAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Debug mode
  const [showDebug, setShowDebug] = useState(false);

  // Calculate if video is a short (≤60 seconds)
  const isShort = video ? getDurationSeconds(video.duration) <= 60 : false;

  // Fetch video data from database
  useEffect(() => {
    const fetchVideo = async () => {
      if (!youtubeVideoId || !user) {
        setLoading(false);
        setError("Missing video ID or not authenticated");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch video by youtube_video_id (not by database id)
        const { data, error: fetchError } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("user_id", user.id)
          .eq("youtube_video_id", youtubeVideoId)
          .maybeSingle();

        if (fetchError) {
          console.error("Error fetching video:", fetchError);
          setError("Failed to fetch video data");
          return;
        }

        if (!data) {
          setError("VIDEO_NOT_FOUND");
          return;
        }

        // Map the database columns to our interface
        const videoData: VideoData = {
          id: data.id,
          youtube_video_id: data.youtube_video_id,
          title: data.title,
          description: data.description,
          thumbnail_url: data.thumbnail_url,
          published_at: data.published_at,
          duration: data.duration,
          view_count: data.view_count ? Number(data.view_count) : null,
          like_count: data.like_count ? Number(data.like_count) : null,
          comment_count: data.comment_count ? Number(data.comment_count) : null,
          tags: Array.isArray(data.tags) ? (data.tags as string[]) : null,
        };

        setVideo(videoData);

        // Fetch existing analysis
        await fetchExistingAnalysis(youtubeVideoId);
      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [youtubeVideoId, user]);

  // Fetch existing analysis from database
  const fetchExistingAnalysis = async (videoId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("video_analyses")
        .select("*")
        .eq("user_id", user.id)
        .eq("youtube_video_id", videoId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error fetching analysis:", error);
        return;
      }

      if (data && data.status === "completed") {
        setStoredAnalysis(data as StoredAnalysis);
        
        // Convert stored analysis to AVOEAnalysis format for display
        const converted = convertStoredToAVOE(data as StoredAnalysis);
        setAvoeAnalysis(converted);
      } else if (data && data.status === "running") {
        setIsAnalyzing(true);
        // Poll for completion
        pollAnalysisStatus(data.id);
      } else if (data && data.status === "failed") {
        setAnalysisError(data.error_message || "Analysis failed");
      }
    } catch (err) {
      console.error("Error fetching analysis:", err);
    }
  };

  // Poll for analysis completion
  const pollAnalysisStatus = async (analysisId: string) => {
    const maxAttempts = 60; // 2 minutes max
    let attempts = 0;

    const poll = async () => {
      attempts++;
      
      const { data, error } = await supabase
        .from("video_analyses")
        .select("*")
        .eq("id", analysisId)
        .single();

      if (error || !data) {
        setIsAnalyzing(false);
        setAnalysisError("Failed to check analysis status");
        return;
      }

      if (data.status === "completed") {
        setIsAnalyzing(false);
        setStoredAnalysis(data as StoredAnalysis);
        const converted = convertStoredToAVOE(data as StoredAnalysis);
        setAvoeAnalysis(converted);
        toast.success("AVOE Analysis complete!");
        return;
      }

      if (data.status === "failed") {
        setIsAnalyzing(false);
        setAnalysisError(data.error_message || "Analysis failed");
        return;
      }

      if (attempts < maxAttempts) {
        setTimeout(poll, 2000);
      } else {
        setIsAnalyzing(false);
        setAnalysisError("Analysis timed out. Please try again.");
      }
    };

    poll();
  };

  // Convert stored analysis to AVOE format
  const convertStoredToAVOE = (stored: StoredAnalysis): AVOEAnalysis => {
    return {
      titleScore: stored.title_breakdown || { total: stored.title_score || 0, breakdown: [], issues: [], suggestions: [] },
      descriptionScore: stored.description_breakdown || { total: stored.description_score || 0, breakdown: [], issues: [], suggestions: [] },
      tagsScore: stored.tags_breakdown || { total: stored.tags_score || 0, breakdown: [], issues: [], suggestions: [] },
      hashtagsScore: stored.hashtags_breakdown || { total: stored.hashtags_score || 0, breakdown: [], issues: [], suggestions: [] },
      thumbnailScore: stored.thumbnail_breakdown || { total: stored.thumbnail_score || 0, breakdown: [], issues: [], suggestions: [] },
      viralityScore: stored.virality_breakdown || { total: stored.virality_score || 0, breakdown: [], issues: [], suggestions: [] },
      overallScore: stored.overall_score || 0,
      confidenceScore: stored.confidence_score || 0,
      confidenceFactors: stored.confidence_factors || [],
      dataWarnings: stored.data_warnings || [],
      packagingAudit: stored.packaging_audit || {
        titleAnalysis: "",
        descriptionAnalysis: "",
        tagsAnalysis: "",
        hashtagsAnalysis: "",
        thumbnailAnalysis: "",
        topicPositioning: "",
        brandAlignment: "",
        promisePayoff: "",
      },
      graphOptimization: stored.graph_optimization || {
        adjacentTopics: [],
        bridgeKeywords: [],
        watchNextFunnel: [],
      },
      retentionEngineering: stored.retention_engineering || {
        openingHookRewrite: "",
        retentionInterrupts: [],
      },
      improvedTitle: stored.improved_title || "",
      improvedDescription: stored.improved_description || "",
      improvedTags: stored.improved_tags || [],
      improvedHashtags: stored.improved_hashtags || [],
      priorityActions: stored.priority_actions || [],
    };
  };

  // Run AVOE analysis
  const handleAVOEAnalysis = async () => {
    if (!video || !user || !youtubeVideoId) {
      toast.error("Cannot analyze: Missing video data");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Create analysis record in database
      const { data: analysisRecord, error: insertError } = await supabase
        .from("video_analyses")
        .insert({
          user_id: user.id,
          youtube_video_id: youtubeVideoId,
          status: "running",
          format_type: isShort ? "short" : "long",
        })
        .select()
        .single();

      if (insertError) {
        throw new Error("Failed to start analysis");
      }

      // Prepare input for AVOE
      const input: AVOEInput = {
        title: video.title,
        description: video.description || undefined,
        tags: video.tags || undefined,
        thumbnailUrl: video.thumbnail_url || `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`,
        videoLength: video.duration || undefined,
      };

      // Call AVOE analysis
      const result = await analyzeWithAVOE(input);

      // Update analysis record with results
      await supabase
        .from("video_analyses")
        .update({
          status: "completed",
          overall_score: result.overallScore,
          title_score: result.titleScore.total,
          description_score: result.descriptionScore.total,
          tags_score: result.tagsScore.total,
          hashtags_score: result.hashtagsScore.total,
          thumbnail_score: result.thumbnailScore.total,
          virality_score: result.viralityScore.total,
          confidence_score: result.confidenceScore,
          title_breakdown: JSON.parse(JSON.stringify(result.titleScore)),
          description_breakdown: JSON.parse(JSON.stringify(result.descriptionScore)),
          tags_breakdown: JSON.parse(JSON.stringify(result.tagsScore)),
          hashtags_breakdown: JSON.parse(JSON.stringify(result.hashtagsScore)),
          thumbnail_breakdown: JSON.parse(JSON.stringify(result.thumbnailScore)),
          virality_breakdown: JSON.parse(JSON.stringify(result.viralityScore)),
          packaging_audit: JSON.parse(JSON.stringify(result.packagingAudit)),
          graph_optimization: JSON.parse(JSON.stringify(result.graphOptimization)),
          retention_engineering: JSON.parse(JSON.stringify(result.retentionEngineering)),
          competitive_strategy: result.competitiveStrategy ? JSON.parse(JSON.stringify(result.competitiveStrategy)) : null,
          improved_title: result.improvedTitle,
          improved_description: result.improvedDescription,
          improved_tags: result.improvedTags,
          improved_hashtags: result.improvedHashtags,
          priority_actions: JSON.parse(JSON.stringify(result.priorityActions)),
          confidence_factors: result.confidenceFactors,
          data_warnings: result.dataWarnings,
        })
        .eq("id", analysisRecord.id);

      setAvoeAnalysis(result);
      setStoredAnalysis({
        ...analysisRecord,
        status: "completed",
        overall_score: result.overallScore,
      } as StoredAnalysis);
      
      toast.success("AVOE Analysis complete!");
    } catch (err) {
      console.error("AVOE analysis error:", err);
      const errorMessage = err instanceof Error ? err.message : "Analysis failed";
      setAnalysisError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleApplyImprovement = (type: 'title' | 'description' | 'tags' | 'hashtags', value: string | string[]) => {
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} improvement copied!`);
    // Copy to clipboard
    const textValue = Array.isArray(value) ? value.join(", ") : value;
    navigator.clipboard.writeText(textValue);
  };

  // Handle sync videos
  const handleSyncVideos = () => {
    navigate("/dashboard/videos");
    toast.info("Please sync your videos from the Videos page");
  };

  // Loading state
  if (loading) {
    return (
      <DashboardLayout title="Video Details">
        <div className="space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <div className="grid grid-cols-4 gap-4">
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                  <Skeleton className="h-20" />
                </div>
              </div>
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-96" />
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Error state - Video not found
  if (error === "VIDEO_NOT_FOUND") {
    return (
      <DashboardLayout title="Video Not Found">
        <div className="space-y-6">
          <Link
            to="/dashboard/videos"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Videos
          </Link>

          <div className="flex flex-col items-center justify-center py-16 px-4 bg-card rounded-xl border border-border">
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mb-6">
              <Video className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Video Not Found</h2>
            <p className="text-muted-foreground text-center max-w-md mb-2">
              This video ({youtubeVideoId}) is not synced to your account.
            </p>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Please sync your YouTube videos first to analyze them.
            </p>
            <div className="flex gap-4">
              <Button onClick={handleSyncVideos} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Sync Videos
              </Button>
              <Button variant="outline" asChild>
                <Link to="/dashboard/videos">Back to Videos</Link>
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Generic error state
  if (error) {
    return (
      <DashboardLayout title="Error">
        <div className="space-y-6">
          <Link
            to="/dashboard/videos"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Videos
          </Link>

          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error Loading Video</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </DashboardLayout>
    );
  }

  // No video loaded (shouldn't happen, but safety check)
  if (!video) {
    return null;
  }

  // Thumbnail URL with fallback
  const thumbnailUrl = video.thumbnail_url || `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;

  return (
    <DashboardLayout title="Video Details">
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          to="/dashboard/videos"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Videos
        </Link>

        {/* Debug Toggle (hidden by default) */}
        <div className="flex justify-end">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            <Bug className="w-3 h-3" />
            {showDebug ? "Hide Debug" : "Debug"}
          </button>
        </div>

        {/* Debug Panel */}
        {showDebug && (
          <Alert className="border-amber-500/50 bg-amber-500/10">
            <Bug className="h-4 w-4 text-amber-500" />
            <AlertTitle>Debug Info</AlertTitle>
            <AlertDescription className="font-mono text-xs space-y-1">
              <div>Route youtubeVideoId: <span className="text-primary">{youtubeVideoId}</span></div>
              <div>Fetched video.youtube_video_id: <span className="text-primary">{video?.youtube_video_id}</span></div>
              <div>Stored analysis.youtube_video_id: <span className="text-primary">{storedAnalysis?.youtube_video_id || "N/A"}</span></div>
              {youtubeVideoId !== video?.youtube_video_id && (
                <div className="text-destructive font-bold">⚠️ ID MISMATCH BUG DETECTED!</div>
              )}
              {storedAnalysis && storedAnalysis.youtube_video_id !== youtubeVideoId && (
                <div className="text-destructive font-bold">⚠️ ANALYSIS ID MISMATCH!</div>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* YouTube Embed */}
              <div className="relative aspect-video bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${youtubeVideoId}`}
                  title={video.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>

              <div className="p-6 space-y-4">
                {/* Title & Badge */}
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-xl font-bold">{video.title}</h1>
                  <Badge variant={isShort ? "default" : "secondary"} className="flex-shrink-0">
                    {isShort ? "Short" : "Long"}
                  </Badge>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(video.published_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {formatDuration(video.duration)}
                  </span>
                  <a
                    href={`https://www.youtube.com/watch?v=${youtubeVideoId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on YouTube
                  </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4 border-y border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold">{formatNumber(video.view_count)}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold">{formatNumber(video.like_count)}</div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold">{formatNumber(video.comment_count)}</div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                  </div>
                </div>

                {/* Description */}
                {video.description && (
                  <div>
                    <h3 className="font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap line-clamp-4">
                      {video.description}
                    </p>
                  </div>
                )}

                {/* Tags */}
                {video.tags && video.tags.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {video.tags.slice(0, 10).map((tag, index) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                      {video.tags.length > 10 && (
                        <Badge variant="outline">+{video.tags.length - 10} more</Badge>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar - Analysis */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* AVOE Analysis Button */}
              <Button
                onClick={handleAVOEAnalysis}
                disabled={isAnalyzing}
                className="w-full gap-2"
                size="lg"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Target className="w-4 h-4" />
                )}
                {isAnalyzing ? `Analyzing ${youtubeVideoId}...` : "Analyze with AVOE"}
              </Button>

              {/* Format Type Indicator */}
              <div className="text-center text-sm text-muted-foreground">
                {isShort ? "🎬 Short Video Analysis Mode" : "📺 Long Video Analysis Mode"}
              </div>

              {/* Analysis Error */}
              {analysisError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Analysis Failed</AlertTitle>
                  <AlertDescription>
                    {analysisError}
                    <Button 
                      variant="link" 
                      className="p-0 h-auto ml-2"
                      onClick={handleAVOEAnalysis}
                    >
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {/* Loading State */}
              {isAnalyzing && (
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                    <span className="text-sm font-medium">Analyzing video...</span>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <p className="text-xs text-muted-foreground">
                    Video ID: {youtubeVideoId}
                  </p>
                </div>
              )}

              {/* AVOE Analysis Results */}
              {!isAnalyzing && avoeAnalysis && (
                <AVOEAnalysisPanel 
                  analysis={avoeAnalysis} 
                  onApplyImprovement={handleApplyImprovement}
                />
              )}

              {/* No Analysis Yet */}
              {!isAnalyzing && !avoeAnalysis && !analysisError && (
                <div className="bg-card rounded-xl border border-border p-6 text-center">
                  <Target className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-medium mb-2">No Analysis Yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Click "Analyze with AVOE" to get AI-powered optimization recommendations for this video.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoDetail;
