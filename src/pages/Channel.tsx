import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RefreshCw,
  Users,
  Eye,
  Film,
  Calendar,
  Download,
  ThumbsUp,
  MessageCircle,
  Play,
  Youtube,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useYouTubeAnalytics } from "@/hooks/useYouTubeAnalytics";
import { YouTubeConnectButton } from "@/components/youtube/YouTubeConnectButton";
import { format, parseISO } from "date-fns";

const Channel = () => {
  const {
    data: youtubeData,
    loading,
    syncing,
    error,
    syncData,
    formatViewCount,
    formatSubscriberCount,
    formatDuration,
  } = useYouTubeAnalytics();

  const [activeTab, setActiveTab] = useState("overview");

  const formatDate = (dateStr: string): string => {
    try {
      return format(parseISO(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  const formatLastSynced = (dateStr: string | null): string => {
    if (!dateStr) return "Never";
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);

      if (diffMins < 60) return `${diffMins} minutes ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      return formatDate(dateStr);
    } catch {
      return "Unknown";
    }
  };

  // Generate engagement data from videos
  const engagementData = youtubeData.videos.length > 0 ? [
    { 
      name: "Likes", 
      value: youtubeData.videos.reduce((sum, v) => sum + v.likeCount, 0), 
      color: "hsl(var(--primary))" 
    },
    { 
      name: "Comments", 
      value: youtubeData.videos.reduce((sum, v) => sum + v.commentCount, 0), 
      color: "hsl(var(--accent))" 
    },
  ] : [];

  // Views per video chart data
  const viewsData = youtubeData.videos.slice(0, 10).map((video, index) => ({
    name: `V${index + 1}`,
    views: video.viewCount,
    title: video.title,
  }));

  // Top videos by views
  const topVideos = [...youtubeData.videos]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, 5);

  return (
    <DashboardLayout title="My Channel">
      <div className="space-y-6">
        {/* YouTube Auth Required Alert */}
        {youtubeData.needsYouTubeAuth && !loading && (
          <Alert className="border-primary/50 bg-primary/10">
            <Youtube className="h-4 w-4 text-primary" />
            <AlertTitle>Connect Your YouTube Channel</AlertTitle>
            <AlertDescription className="mt-2">
              <p className="mb-3">
                Sign in with Google and grant YouTube access to see your real channel data.
              </p>
              <YouTubeConnectButton showChannelPreview={false} />
            </AlertDescription>
          </Alert>
        )}

        {/* Error Alert */}
        {error && (
          <Alert className="border-destructive/50 bg-destructive/10">
            <AlertCircle className="h-4 w-4 text-destructive" />
            <AlertTitle>Error Loading Channel</AlertTitle>
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
          <>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <Skeleton className="h-32 sm:h-48 w-full" />
              <div className="px-4 sm:px-6 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16">
                  <Skeleton className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i}>
                      <Skeleton className="h-4 w-20 mb-2" />
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* No Data State */}
        {!loading && !youtubeData.hasData && !youtubeData.needsYouTubeAuth && (
          <div className="bg-card rounded-xl border border-border p-8 text-center">
            <Youtube className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Channel Data Yet</h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              Sync your YouTube channel to see your real analytics data.
            </p>
            <Button onClick={syncData} disabled={syncing} className="gap-2">
              {syncing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              {syncing ? "Syncing..." : "Sync My Channel"}
            </Button>
          </div>
        )}

        {/* Channel Content - Only show when we have data */}
        {!loading && youtubeData.hasData && youtubeData.channel && (
          <>
            {/* Channel Header */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Banner Placeholder */}
              <div className="relative h-32 sm:h-48 bg-gradient-to-r from-primary/20 to-accent/20">
                <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
              </div>

              {/* Channel Info */}
              <div className="relative px-4 sm:px-6 pb-6">
                <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16">
                  {/* Avatar */}
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-card overflow-hidden flex-shrink-0 bg-muted">
                    {youtubeData.channel.thumbnail ? (
                      <img
                        src={youtubeData.channel.thumbnail}
                        alt={youtubeData.channel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Youtube className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>

                  {/* Name */}
                  <div className="flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold">{youtubeData.channel.name}</h1>
                    <p className="text-muted-foreground">YouTube Channel</p>
                  </div>

                  {/* Sync Button */}
                  <div className="flex items-center gap-3">
                    <div className="text-right text-sm text-muted-foreground hidden sm:block">
                      <div>Last synced</div>
                      <div>{formatLastSynced(youtubeData.channel.lastSyncedAt)}</div>
                    </div>
                    <Button onClick={syncData} disabled={syncing} className="gap-2">
                      {syncing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4" />
                      )}
                      {syncing ? "Syncing..." : "Sync Now"}
                    </Button>
                  </div>
                </div>

                {/* Key Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm mb-1">
                      <Users className="w-4 h-4" />
                      Subscribers
                    </div>
                    <div className="text-lg font-semibold">
                      {formatSubscriberCount(youtubeData.channel.subscriberCount)}
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm mb-1">
                      <Eye className="w-4 h-4" />
                      Total Views
                    </div>
                    <div className="text-lg font-semibold">
                      {formatViewCount(youtubeData.channel.viewCount)}
                    </div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm mb-1">
                      <Film className="w-4 h-4" />
                      Videos
                    </div>
                    <div className="text-lg font-semibold">{youtubeData.channel.videoCount}</div>
                  </div>
                  <div className="text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm mb-1">
                      <Calendar className="w-4 h-4" />
                      Videos Synced
                    </div>
                    <div className="text-lg font-semibold">{youtubeData.videos.length}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="bg-muted/50 p-1">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="engagement">Engagement</TabsTrigger>
                <TabsTrigger value="top-videos">Top Videos</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Channel Stats */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold mb-4">Channel Statistics</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">Total Subscribers</span>
                        <span className="font-semibold">{formatSubscriberCount(youtubeData.channel.subscriberCount)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">Total Views</span>
                        <span className="font-semibold">{formatViewCount(youtubeData.channel.viewCount)}</span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <span className="text-muted-foreground">Total Videos</span>
                        <span className="font-semibold">{youtubeData.channel.videoCount}</span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <span className="text-muted-foreground">Avg. Views per Video</span>
                        <span className="font-semibold">
                          {youtubeData.channel.videoCount > 0
                            ? formatViewCount(Math.round(youtubeData.channel.viewCount / youtubeData.channel.videoCount))
                            : "0"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Views Per Video Chart */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold mb-4">Views per Recent Video</h3>
                    {viewsData.length > 0 ? (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={viewsData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis 
                              dataKey="name" 
                              className="text-xs" 
                              tick={{ fill: "hsl(var(--muted-foreground))" }} 
                            />
                            <YAxis 
                              className="text-xs" 
                              tick={{ fill: "hsl(var(--muted-foreground))" }}
                              tickFormatter={(value) => formatViewCount(value)}
                            />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                              formatter={(value: number, name: string, props: any) => [
                                formatViewCount(value),
                                props.payload.title?.substring(0, 40) + "..." || "Views"
                              ]}
                            />
                            <Bar dataKey="views" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        No video data available
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Engagement Tab */}
              <TabsContent value="engagement" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Engagement Breakdown */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold mb-4">Total Engagement (from synced videos)</h3>
                    {engagementData.length > 0 ? (
                      <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={engagementData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={100}
                              paddingAngle={5}
                              dataKey="value"
                            >
                              {engagementData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: "hsl(var(--card))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "8px",
                              }}
                              formatter={(value: number) => formatViewCount(value)}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        No engagement data available
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-6 mt-4">
                      {engagementData.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-muted-foreground">
                            {item.name}: {formatViewCount(item.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="bg-card rounded-xl border border-border p-6">
                    <h3 className="font-semibold mb-4">Engagement Summary</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="w-4 h-4 text-primary" />
                          <span className="text-muted-foreground">Total Likes</span>
                        </div>
                        <span className="font-semibold">
                          {formatViewCount(youtubeData.videos.reduce((sum, v) => sum + v.likeCount, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 border-b border-border">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-accent" />
                          <span className="text-muted-foreground">Total Comments</span>
                        </div>
                        <span className="font-semibold">
                          {formatViewCount(youtubeData.videos.reduce((sum, v) => sum + v.commentCount, 0))}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4 text-green-500" />
                          <span className="text-muted-foreground">Total Views (synced)</span>
                        </div>
                        <span className="font-semibold">
                          {formatViewCount(youtubeData.videos.reduce((sum, v) => sum + v.viewCount, 0))}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Top Videos Tab */}
              <TabsContent value="top-videos" className="space-y-6">
                <div className="bg-card rounded-xl border border-border p-6">
                  <h3 className="font-semibold mb-4">Top Performing Videos</h3>
                  {topVideos.length > 0 ? (
                    <div className="space-y-4">
                      {topVideos.map((video, index) => (
                        <div
                          key={video.id}
                          className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors"
                        >
                          {/* Rank */}
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                            {index + 1}
                          </div>

                          {/* Thumbnail */}
                          <div className="w-24 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                            {video.thumbnail ? (
                              <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Play className="w-6 h-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium line-clamp-1">{video.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(video.publishedAt)}
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <Eye className="w-4 h-4" />
                              {formatViewCount(video.viewCount)}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <ThumbsUp className="w-4 h-4" />
                              {formatViewCount(video.likeCount)}
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground">
                              <MessageCircle className="w-4 h-4" />
                              {formatViewCount(video.commentCount)}
                            </div>
                          </div>

                          {/* Action */}
                          <Button variant="outline" size="sm" asChild>
                            <a 
                              href={`https://www.youtube.com/watch?v=${video.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View
                            </a>
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      No videos available. Sync your channel to see top videos.
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Channel;
