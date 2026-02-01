import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Grid3X3,
  List,
  Eye,
  ThumbsUp,
  MessageCircle,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Video,
  Youtube,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useYouTubeAnalytics } from "@/hooks/useYouTubeAnalytics";
import { YouTubeConnectButton } from "@/components/youtube/YouTubeConnectButton";
import { format, parseISO } from "date-fns";

const Videos = () => {
  const {
    data: youtubeData,
    loading,
    syncing,
    error,
    syncData,
    formatViewCount,
    formatDuration,
  } = useYouTubeAnalytics();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [dateFilter, setDateFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter and sort videos
  const filteredVideos = youtubeData.videos
    .filter((video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((video) => {
      if (dateFilter === "all") return true;
      const videoDate = new Date(video.publishedAt);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - videoDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (dateFilter === "7days") return diffDays <= 7;
      if (dateFilter === "30days") return diffDays <= 30;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "views":
          return b.viewCount - a.viewCount;
        case "likes":
          return b.likeCount - a.likeCount;
        default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatPublishedDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  return (
    <DashboardLayout title="Videos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-muted-foreground">
            Manage and analyze your YouTube videos
          </p>
          {youtubeData.hasData && (
            <Button 
              className="gap-2" 
              onClick={syncData}
              disabled={syncing}
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {syncing ? "Syncing..." : "Sync Videos"}
            </Button>
          )}
        </div>

        {/* YouTube Auth Required Alert */}
        {youtubeData.needsYouTubeAuth && !loading && (
          <Alert className="border-primary/50 bg-primary/10">
            <Youtube className="h-4 w-4 text-primary" />
            <AlertTitle>Connect Your YouTube Channel</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">
                Sign in with Google and grant YouTube access to see your real video data.
              </p>
              <YouTubeConnectButton showChannelPreview={false} />
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle>Error Loading Videos</AlertTitle>
            <AlertDescription>
              {error}
              <Button onClick={syncData} variant="link" className="p-0 h-auto ml-2">
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
                <Skeleton className="aspect-video w-full" />
                <div className="p-4 space-y-3">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Data State */}
        {!loading && !youtubeData.hasData && !youtubeData.needsYouTubeAuth && (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-card rounded-xl border border-border">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No videos synced yet</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              Sync your YouTube channel to see your real video data and analytics.
            </p>
            <Button className="gap-2" onClick={syncData} disabled={syncing}>
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {syncing ? "Syncing..." : "Sync My Videos"}
            </Button>
          </div>
        )}

        {/* Videos Content - Only show when we have data */}
        {!loading && youtubeData.hasData && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl border border-border">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search videos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Sort */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="views">Views</SelectItem>
                  <SelectItem value="likes">Likes</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-full sm:w-[150px]">
                  <SelectValue placeholder="Date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>

              {/* View Toggle */}
              <div className="flex bg-muted rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === "grid"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={cn(
                    "p-2 rounded-md transition-colors",
                    viewMode === "list"
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Videos Grid/List */}
            {paginatedVideos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-4 bg-card rounded-xl border border-border">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Video className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No videos found</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  {searchQuery
                    ? "No videos match your search. Try adjusting your filters."
                    : "No videos match the current filters."}
                </p>
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Video className="w-12 h-12 text-muted-foreground" />
                        </div>
                      )}
                      {video.duration && (
                        <Badge className="absolute bottom-2 right-2 bg-black/80 text-white border-0">
                          {formatDuration(video.duration)}
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-3">
                      <h3 className="font-medium line-clamp-2 leading-snug">
                        {video.title}
                      </h3>

                      <p className="text-sm text-muted-foreground">
                        {formatPublishedDate(video.publishedAt)}
                      </p>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {formatViewCount(video.viewCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {formatViewCount(video.likeCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {formatViewCount(video.commentCount)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="default" size="sm" className="flex-1" asChild>
                          <Link to={`/dashboard/videos/${video.id}`}>
                            Analyze
                          </Link>
                        </Button>
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={`https://www.youtube.com/watch?v=${video.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Youtube className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {paginatedVideos.map((video) => (
                  <div
                    key={video.id}
                    className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
                  >
                    {/* Thumbnail */}
                    <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Video className="w-8 h-8 text-muted-foreground" />
                        </div>
                      )}
                      {video.duration && (
                        <Badge className="absolute bottom-1 right-1 bg-black/80 text-white border-0 text-xs">
                          {formatDuration(video.duration)}
                        </Badge>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <h3 className="font-medium line-clamp-1">{video.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {formatPublishedDate(video.publishedAt)}
                        </p>
                      </div>

                      {/* Stats */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {formatViewCount(video.viewCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-4 h-4" />
                          {formatViewCount(video.likeCount)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {formatViewCount(video.commentCount)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button variant="default" size="sm" asChild>
                        <Link to={`/dashboard/videos/${video.id}`}>
                          Analyze
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm" asChild>
                        <a 
                          href={`https://www.youtube.com/watch?v=${video.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Youtube className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-muted-foreground px-4">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Videos;
