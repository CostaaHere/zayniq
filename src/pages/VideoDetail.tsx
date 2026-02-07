import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import AVOEAnalysisPanel from "@/components/video/AVOEAnalysisPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  History,
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronUp,
  Zap,
  FileText,
  MessageSquare,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { AVOEAnalysis, AVOEInput } from "@/types/avoe";
import { format, parseISO, differenceInMinutes } from "date-fns";

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

interface AnalysisRun {
  id: string;
  youtube_video_id: string;
  status: string;
  format_type: string | null;
  started_at: string;
  completed_at: string | null;
  input_hash: string | null;
  overall_score: number | null;
  seo_score: number | null;
  hook_score: number | null;
  retention_score: number | null;
  confidence_score: number | null;
  output: any;
  evidence: any;
  title_breakdown: any;
  description_breakdown: any;
  tags_breakdown: any;
  hashtags_breakdown: any;
  thumbnail_breakdown: any;
  virality_breakdown: any;
  improved_title: string | null;
  improved_description: string | null;
  improved_tags: string[] | null;
  improved_hashtags: string[] | null;
  packaging_audit: any;
  graph_optimization: any;
  retention_engineering: any;
  competitive_strategy: any | null;
  priority_actions: any[];
  confidence_factors: string[];
  data_warnings: string[];
  error_message: string | null;
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

const formatDateTime = (dateStr: string | null): string => {
  if (!dateStr) return "Unknown";
  try {
    return format(parseISO(dateStr), "MMM d, yyyy 'at' h:mm a");
  } catch {
    return dateStr;
  }
};

const formatDuration = (duration: string | null): string => {
  if (!duration) return "0:00";
  
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

  // Analysis runs state
  const [analysisRuns, setAnalysisRuns] = useState<AnalysisRun[]>([]);
  const [selectedRun, setSelectedRun] = useState<AnalysisRun | null>(null);
  const [avoeAnalysis, setAvoeAnalysis] = useState<AVOEAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Rerun confirmation dialog
  const [showRerunDialog, setShowRerunDialog] = useState(false);
  const [lastRunAge, setLastRunAge] = useState<number>(0);

  // UI state
  const [showDebug, setShowDebug] = useState(false);
  const [showEvidence, setShowEvidence] = useState(false);
  const [showRunHistory, setShowRunHistory] = useState(false);

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
        await fetchAnalysisRuns(youtubeVideoId);
      } catch (err) {
        console.error("Error:", err);
        setError("An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchVideo();
  }, [youtubeVideoId, user]);

  // Fetch analysis runs from database
  const fetchAnalysisRuns = async (videoId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("analysis_runs")
        .select("*")
        .eq("user_id", user.id)
        .eq("youtube_video_id", videoId)
        .order("started_at", { ascending: false })
        .limit(10);

      if (error) {
        console.error("Error fetching analysis runs:", error);
        return;
      }

      if (data && data.length > 0) {
        setAnalysisRuns(data as AnalysisRun[]);
        
        // Select the latest completed run
        const latestCompleted = data.find(r => r.status === "completed");
        if (latestCompleted) {
          setSelectedRun(latestCompleted as AnalysisRun);
          const converted = convertRunToAVOE(latestCompleted as AnalysisRun);
          setAvoeAnalysis(converted);
        }
        
        // Check if there's a running analysis
        const runningAnalysis = data.find(r => r.status === "running");
        if (runningAnalysis) {
          setIsAnalyzing(true);
          pollAnalysisStatus(runningAnalysis.id);
        }
      }
    } catch (err) {
      console.error("Error fetching runs:", err);
    }
  };

  // Poll for analysis completion
  const pollAnalysisStatus = async (runId: string) => {
    const maxAttempts = 90; // 3 minutes max
    let attempts = 0;

    const poll = async () => {
      attempts++;
      
      const { data, error } = await supabase
        .from("analysis_runs")
        .select("*")
        .eq("id", runId)
        .single();

      if (error || !data) {
        setIsAnalyzing(false);
        setAnalysisError("Failed to check analysis status");
        return;
      }

      if (data.status === "completed") {
        setIsAnalyzing(false);
        const run = data as AnalysisRun;
        setSelectedRun(run);
        const converted = convertRunToAVOE(run);
        setAvoeAnalysis(converted);
        setAnalysisRuns(prev => [run, ...prev.filter(r => r.id !== run.id)]);
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

  // Convert analysis run to AVOE format
  const convertRunToAVOE = (run: AnalysisRun): AVOEAnalysis => {
    return {
      titleScore: run.title_breakdown || { total: 0, breakdown: [], issues: [], suggestions: [] },
      descriptionScore: run.description_breakdown || { total: 0, breakdown: [], issues: [], suggestions: [] },
      tagsScore: run.tags_breakdown || { total: 0, breakdown: [], issues: [], suggestions: [] },
      hashtagsScore: run.hashtags_breakdown || { total: 0, breakdown: [], issues: [], suggestions: [] },
      thumbnailScore: run.thumbnail_breakdown || { total: 0, breakdown: [], issues: [], suggestions: [] },
      viralityScore: run.virality_breakdown || { total: 0, breakdown: [], issues: [], suggestions: [] },
      overallScore: run.overall_score || 0,
      confidenceScore: run.confidence_score || 0,
      confidenceFactors: run.confidence_factors || [],
      dataWarnings: run.data_warnings || [],
      packagingAudit: run.packaging_audit || {
        titleAnalysis: "",
        descriptionAnalysis: "",
        tagsAnalysis: "",
        hashtagsAnalysis: "",
        thumbnailAnalysis: "",
        topicPositioning: "",
        brandAlignment: "",
        promisePayoff: "",
      },
      graphOptimization: run.graph_optimization || {
        adjacentTopics: [],
        bridgeKeywords: [],
        watchNextFunnel: [],
      },
      retentionEngineering: run.retention_engineering || {
        openingHookRewrite: "",
        retentionInterrupts: [],
      },
      competitiveStrategy: run.competitive_strategy,
      improvedTitle: run.improved_title || "",
      improvedDescription: run.improved_description || "",
      improvedTags: run.improved_tags || [],
      improvedHashtags: run.improved_hashtags || [],
      priorityActions: run.priority_actions || [],
    };
  };

  // Check if we should prompt for rerun
  const handleAnalyzeClick = useCallback(() => {
    if (analysisRuns.length > 0) {
      const latestRun = analysisRuns[0];
      const ageMinutes = differenceInMinutes(new Date(), parseISO(latestRun.started_at));
      setLastRunAge(ageMinutes);
      
      if (ageMinutes < 10) {
        setShowRerunDialog(true);
        return;
      }
    }
    
    runAnalysis();
  }, [analysisRuns]);

  // Run AVOE analysis
  const runAnalysis = async () => {
    if (!user || !youtubeVideoId) {
      toast.error("Cannot analyze: Missing video ID or not authenticated");
      return;
    }

    setShowRerunDialog(false);
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      // Ensure we have complete video data - re-fetch from DB if needed
      let videoData = video;
      if (!videoData || !videoData.title || !videoData.description) {
        console.log("[AVOE] Video data incomplete, re-fetching from DB...");
        const { data: freshVideo, error: fetchErr } = await supabase
          .from("youtube_videos")
          .select("*")
          .eq("user_id", user.id)
          .eq("youtube_video_id", youtubeVideoId)
          .maybeSingle();

        if (fetchErr || !freshVideo) {
          toast.error("Video not found in database. Please sync your videos first.");
          setIsAnalyzing(false);
          return;
        }

        videoData = {
          id: freshVideo.id,
          youtube_video_id: freshVideo.youtube_video_id,
          title: freshVideo.title,
          description: freshVideo.description,
          thumbnail_url: freshVideo.thumbnail_url,
          published_at: freshVideo.published_at,
          duration: freshVideo.duration,
          view_count: freshVideo.view_count ? Number(freshVideo.view_count) : null,
          like_count: freshVideo.like_count ? Number(freshVideo.like_count) : null,
          comment_count: freshVideo.comment_count ? Number(freshVideo.comment_count) : null,
          tags: Array.isArray(freshVideo.tags) ? (freshVideo.tags as string[]) : null,
        };
        setVideo(videoData);
      }

      const currentIsShort = getDurationSeconds(videoData.duration) <= 60;

      // Create analysis run record
      const { data: runRecord, error: insertError } = await supabase
        .from("analysis_runs")
        .insert({
          user_id: user.id,
          youtube_video_id: youtubeVideoId,
          status: "running",
          format_type: currentIsShort ? "short" : "long",
          input_snapshot: {
            title: videoData.title,
            description: videoData.description,
            tags: videoData.tags || [],
            viewCount: videoData.view_count,
            likeCount: videoData.like_count,
            commentCount: videoData.comment_count,
            duration: videoData.duration,
            publishedAt: videoData.published_at,
          },
        })
        .select()
        .single();

      if (insertError) {
        throw new Error("Failed to start analysis");
      }

      // Prepare FULL payload for AVOE - every field explicitly included
      const input = {
        youtubeVideoId,
        title: videoData.title,
        description: videoData.description || "",
        tags: videoData.tags || [],
        thumbnailUrl: videoData.thumbnail_url || `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`,
        videoLength: videoData.duration || undefined,
        durationSeconds: getDurationSeconds(videoData.duration),
        viewCount: videoData.view_count ?? undefined,
        likeCount: videoData.like_count ?? undefined,
        commentCount: videoData.comment_count ?? undefined,
        publishedAt: videoData.published_at || undefined,
      };

      // Call AVOE analysis
      const { data: result, error: fnError } = await supabase.functions.invoke('avoe-analyze', {
        body: input
      });

      if (fnError) {
        throw new Error(fnError.message || 'Analysis failed');
      }

      // Update analysis run with results
      await supabase
        .from("analysis_runs")
        .update({
          status: "completed",
          completed_at: new Date().toISOString(),
          overall_score: result.overallScore,
          hook_score: result.hookScore?.total,
          confidence_score: result.confidenceScore,
          input_hash: result.inputHash,
          output: result,
          evidence: result.evidence,
          title_breakdown: result.titleScore,
          description_breakdown: result.descriptionScore,
          tags_breakdown: result.tagsScore,
          hashtags_breakdown: result.hashtagsScore,
          thumbnail_breakdown: result.thumbnailScore,
          virality_breakdown: result.viralityScore,
          packaging_audit: result.packagingAudit,
          graph_optimization: result.graphOptimization,
          retention_engineering: result.retentionEngineering,
          competitive_strategy: result.competitiveStrategy,
          improved_title: result.improvedTitle,
          improved_description: result.improvedDescription,
          improved_tags: result.improvedTags,
          improved_hashtags: result.improvedHashtags,
          priority_actions: result.priorityActions,
          confidence_factors: result.confidenceFactors,
          data_warnings: result.dataWarnings,
        })
        .eq("id", runRecord.id);

      const updatedRun = {
        ...runRecord,
        status: "completed",
        overall_score: result.overallScore,
        ...result,
      } as AnalysisRun;

      setSelectedRun(updatedRun);
      setAvoeAnalysis(result);
      setAnalysisRuns(prev => [updatedRun, ...prev]);
      
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
    const textValue = Array.isArray(value) ? value.join(", ") : value;
    navigator.clipboard.writeText(textValue);
    toast.success(`${type.charAt(0).toUpperCase() + type.slice(1)} copied to clipboard!`);
  };

  const handleSelectRun = (run: AnalysisRun) => {
    setSelectedRun(run);
    const converted = convertRunToAVOE(run);
    setAvoeAnalysis(converted);
    setShowRunHistory(false);
  };

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

  if (!video) return null;

  const thumbnailUrl = video.thumbnail_url || `https://i.ytimg.com/vi/${youtubeVideoId}/hqdefault.jpg`;

  return (
    <DashboardLayout title="Video Details">
      {/* Rerun Confirmation Dialog */}
      <AlertDialog open={showRerunDialog} onOpenChange={setShowRerunDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reuse or Rerun Analysis?</AlertDialogTitle>
            <AlertDialogDescription>
              You ran an analysis {lastRunAge} minute{lastRunAge !== 1 ? 's' : ''} ago. 
              Would you like to reuse the existing results or run a fresh analysis?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                setShowRerunDialog(false);
                // Just use existing
              }}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Use Existing
            </AlertDialogAction>
            <AlertDialogAction onClick={runAnalysis}>
              Run Fresh Analysis
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard/videos"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Videos
          </Link>
          
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
              <div>Selected run.youtube_video_id: <span className="text-primary">{selectedRun?.youtube_video_id || "N/A"}</span></div>
              <div>Total runs: <span className="text-primary">{analysisRuns.length}</span></div>
              {youtubeVideoId !== video?.youtube_video_id && (
                <div className="text-destructive font-bold">⚠️ VIDEO ID MISMATCH BUG!</div>
              )}
              {selectedRun && selectedRun.youtube_video_id !== youtubeVideoId && (
                <div className="text-destructive font-bold">⚠️ ANALYSIS RUN ID MISMATCH!</div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
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
                    <h3 className="font-medium mb-2">Tags ({video.tags.length})</h3>
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

            {/* Analysis Results Section (Below Video) */}
            {avoeAnalysis && selectedRun && (
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                {/* Run Header */}
                <div className="p-4 border-b border-border bg-muted/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Analysis Run</span>
                          <Badge variant="outline" className="text-xs">
                            #{analysisRuns.findIndex(r => r.id === selectedRun.id) + 1}
                          </Badge>
                          <Badge variant={isShort ? "default" : "secondary"} className="text-xs">
                            {isShort ? "Short Mode" : "Long Mode"}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDateTime(selectedRun.started_at)}
                        </div>
                      </div>
                    </div>
                    
                    {analysisRuns.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowRunHistory(!showRunHistory)}
                        className="gap-1"
                      >
                        <History className="w-4 h-4" />
                        History ({analysisRuns.length})
                        {showRunHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </Button>
                    )}
                  </div>

                  {/* Run History Dropdown */}
                  {showRunHistory && (
                    <div className="mt-4 space-y-2">
                      {analysisRuns.map((run, index) => (
                        <button
                          key={run.id}
                          onClick={() => handleSelectRun(run)}
                          className={`w-full p-3 rounded-lg border text-left transition-colors ${
                            selectedRun.id === run.id
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50 hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Run #{index + 1}</span>
                              {run.status === "completed" && (
                                <CheckCircle2 className="w-4 h-4 text-primary" />
                              )}
                              {run.status === "failed" && (
                                <AlertCircle className="w-4 h-4 text-destructive" />
                              )}
                            </div>
                            <span className="text-sm font-bold text-primary">
                              {run.overall_score || 0}/100
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(run.started_at)}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Confidence Meter */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Confidence Score</span>
                    <span className="text-sm font-bold">{avoeAnalysis.confidenceScore}/100</span>
                  </div>
                  <Progress value={avoeAnalysis.confidenceScore} className="h-2" />
                  
                  {/* Inputs Checklist */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="secondary" className="gap-1">
                      <FileText className="w-3 h-3" />
                      Metadata ✅
                    </Badge>
                    <Badge 
                      variant={selectedRun.evidence?.inputsAvailable?.transcript ? "secondary" : "outline"} 
                      className="gap-1"
                    >
                      <MessageSquare className="w-3 h-3" />
                      Transcript {selectedRun.evidence?.inputsAvailable?.transcript ? '✅' : '❌'}
                    </Badge>
                    <Badge 
                      variant={selectedRun.evidence?.inputsAvailable?.comments ? "secondary" : "outline"} 
                      className="gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      Comments {selectedRun.evidence?.inputsAvailable?.comments ? '✅' : '❌'}
                    </Badge>
                    <Badge 
                      variant={selectedRun.evidence?.inputsAvailable?.channelBaseline ? "secondary" : "outline"} 
                      className="gap-1"
                    >
                      <BarChart3 className="w-3 h-3" />
                      Channel Baseline {selectedRun.evidence?.inputsAvailable?.channelBaseline ? '✅' : '❌'}
                    </Badge>
                  </div>
                </div>

                {/* Evidence Section */}
                {selectedRun.evidence && (
                  <div className="p-4 border-b border-border">
                    <button
                      onClick={() => setShowEvidence(!showEvidence)}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <span className="font-medium">Evidence & Detected Patterns</span>
                      {showEvidence ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    
                    {showEvidence && (
                      <div className="mt-4 space-y-4">
                        {/* Keywords */}
                        {selectedRun.evidence.titleKeywords?.length > 0 && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Detected Keywords from Title</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedRun.evidence.titleKeywords.join(', '));
                                  toast.success("Keywords copied!");
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {selectedRun.evidence.titleKeywords.map((kw: string, i: number) => (
                                <Badge key={i} variant="outline">{kw}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Word Frequency */}
                        {selectedRun.evidence.wordFrequency && Object.keys(selectedRun.evidence.wordFrequency).length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">Most Frequent Words in Transcript</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {Object.entries(selectedRun.evidence.wordFrequency as Record<string, number>).map(([word, count]) => (
                                <Badge key={word} variant="secondary">{word} ({count})</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Hook Excerpt */}
                        {selectedRun.evidence.hookExcerpt && (
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm text-muted-foreground">Hook Excerpt (first 10 seconds)</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  navigator.clipboard.writeText(selectedRun.evidence.hookExcerpt);
                                  toast.success("Hook copied!");
                                }}
                              >
                                <Copy className="w-3 h-3" />
                              </Button>
                            </div>
                            <p className="text-sm bg-muted/50 p-3 rounded-lg italic">
                              "{selectedRun.evidence.hookExcerpt.slice(0, 300)}..."
                            </p>
                          </div>
                        )}

                        {/* Pattern Interrupts */}
                        {selectedRun.evidence.detectedPatternInterrupts?.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">Detected Pattern Interrupts</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedRun.evidence.detectedPatternInterrupts.map((p: string, i: number) => (
                                <Badge key={i} className="bg-primary/10 text-primary border-primary/20">{p}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Comment Themes */}
                        {selectedRun.evidence.topCommentThemes?.length > 0 && (
                          <div>
                            <span className="text-sm text-muted-foreground">Top Comment Themes</span>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {selectedRun.evidence.topCommentThemes.map((theme: string, i: number) => (
                                <Badge key={i} variant="outline">{theme}</Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* No transcript warning */}
                        {!selectedRun.evidence.inputsAvailable?.transcript && (
                          <Alert>
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Transcript Not Available</AlertTitle>
                            <AlertDescription>
                              Hook and retention analysis confidence is reduced. Add captions to your video for better analysis.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Data Warnings */}
                {avoeAnalysis.dataWarnings.length > 0 && (
                  <div className="p-4 border-b border-border">
                    <Alert variant="default" className="border-amber-500/30 bg-amber-500/5">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <AlertTitle className="text-amber-500">Data Warnings</AlertTitle>
                      <AlertDescription>
                        <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                          {avoeAnalysis.dataWarnings.map((warning, i) => (
                            <li key={i}>{warning}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>
                )}

                {/* Full Analysis Panel */}
                <div className="p-4">
                  <AVOEAnalysisPanel 
                    analysis={avoeAnalysis} 
                    onApplyImprovement={handleApplyImprovement}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* AVOE Analysis Button */}
              <Button
                onClick={handleAnalyzeClick}
                disabled={isAnalyzing}
                className="w-full gap-2"
                size="lg"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Target className="w-4 h-4" />
                )}
                {isAnalyzing 
                  ? `Analyzing ${youtubeVideoId.slice(0, 8)}...` 
                  : analysisRuns.length > 0 
                    ? "Rerun AVOE Analysis" 
                    : "Analyze with AVOE"
                }
              </Button>

              {/* Format Indicator */}
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
                      onClick={runAnalysis}
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
                    <span className="text-sm font-medium">Running Analysis...</span>
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <p className="text-xs text-muted-foreground">
                    Video: {youtubeVideoId}
                  </p>
                </div>
              )}

              {/* Quick Score Summary (when analysis exists) */}
              {!isAnalyzing && avoeAnalysis && (
                <div className="bg-card rounded-xl border border-border p-6 space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-1">
                      {avoeAnalysis.overallScore}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Score</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Title</span>
                      <span className="font-medium">{avoeAnalysis.titleScore.total}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Description</span>
                      <span className="font-medium">{avoeAnalysis.descriptionScore.total}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Tags</span>
                      <span className="font-medium">{avoeAnalysis.tagsScore.total}/100</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Virality</span>
                      <span className="font-medium">{avoeAnalysis.viralityScore.total}/100</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Confidence</span>
                      <span className="font-medium">{avoeAnalysis.confidenceScore}/100</span>
                    </div>
                  </div>
                </div>
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
