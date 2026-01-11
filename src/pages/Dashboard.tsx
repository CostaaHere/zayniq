import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useYouTubeAnalytics } from "@/hooks/useYouTubeAnalytics";
import { 
  Users, 
  Eye, 
  Video, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  Sparkles,
  Search,
  FileText,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Youtube,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { format, parseISO, subDays } from "date-fns";

const Dashboard = () => {
  const { user, signInWithGoogle } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();
  const {
    data: youtubeData,
    loading: youtubeLoading,
    syncing,
    error: youtubeError,
    syncData,
    formatViewCount,
    formatSubscriberCount,
    formatDuration,
  } = useYouTubeAnalytics();

  const firstName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "Creator";

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Build stats from real data
  const stats = youtubeData.channel ? [
    { 
      label: "Total Subscribers", 
      value: formatSubscriberCount(youtubeData.channel.subscriberCount), 
      change: null,
      trend: null,
      icon: Users 
    },
    { 
      label: "Total Views", 
      value: formatViewCount(youtubeData.channel.viewCount), 
      change: null,
      trend: null,
      icon: Eye 
    },
    { 
      label: "Videos Published", 
      value: youtubeData.channel.videoCount.toLocaleString(), 
      change: null,
      trend: null,
      icon: Video 
    },
    { 
      label: "Avg. Views/Video", 
      value: youtubeData.channel.videoCount > 0 
        ? formatViewCount(Math.round(youtubeData.channel.viewCount / youtubeData.channel.videoCount))
        : "0", 
      change: null,
      trend: null,
      icon: TrendingUp 
    },
  ] : [];

  // Generate views per video data from real videos
  const viewsData = youtubeData.videos.slice(0, 10).map((video, index) => ({
    video: `V${index + 1}`,
    views: video.viewCount,
    title: video.title,
  }));

  // Generate subscriber growth placeholder (YouTube API doesn't provide historical data without Analytics API)
  // For now, show a message that this requires YouTube Analytics API
  const subscriberData = youtubeData.channel ? [
    { day: "Now", value: youtubeData.channel.subscriberCount },
  ] : [];

  const quickActions = [
    { icon: Sparkles, label: "Analyze Video", color: "from-primary to-accent", path: "/dashboard/ai-tools" },
    { icon: Search, label: "Research Keywords", color: "from-accent to-primary", path: "/dashboard/keywords" },
    { icon: FileText, label: "Generate Title", color: "from-primary to-purple-500", path: "/dashboard/ai-tools/titles" },
  ];

  const getSeoScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 70) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  const formatPublishedDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), "MMM d, yyyy");
    } catch {
      return dateStr;
    }
  };

  // Handle reconnect with YouTube
  const handleReconnectYouTube = async () => {
    await signInWithGoogle();
  };

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">
            Welcome back, {firstName}! 👋
          </h2>
          <p className="text-muted-foreground">{currentDate}</p>
        </div>
        
        {youtubeData.hasData && (
          <Button
            onClick={syncData}
            disabled={syncing}
            variant="outline"
            className="gap-2"
          >
            {syncing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            {syncing ? "Syncing..." : "Sync YouTube Data"}
          </Button>
        )}
      </div>

      {/* YouTube Auth Required Alert */}
      {youtubeData.needsYouTubeAuth && !youtubeLoading && (
        <Alert className="mb-6 border-yellow-500/50 bg-yellow-500/10">
          <Youtube className="h-4 w-4 text-yellow-500" />
          <AlertTitle>Connect Your YouTube Channel</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              Sign in with Google and grant YouTube access to see your real channel analytics.
            </p>
            <Button onClick={handleReconnectYouTube} variant="outline" size="sm" className="gap-2">
              <Youtube className="w-4 h-4" />
              Connect YouTube
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Error Alert */}
      {youtubeError && (
        <Alert className="mb-6 border-destructive/50 bg-destructive/10">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertTitle>Error Loading Analytics</AlertTitle>
          <AlertDescription>
            {youtubeError}
            <Button onClick={syncData} variant="link" className="p-0 h-auto ml-2">
              Try again
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* No Data State - First Time User */}
      {!youtubeLoading && !youtubeData.hasData && !youtubeData.needsYouTubeAuth && (
        <div className="bg-card border border-border rounded-2xl p-8 mb-8 text-center">
          <Youtube className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No YouTube Data Yet</h3>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Sync your YouTube channel to see real analytics data from your videos.
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

      {/* Loading State */}
      {youtubeLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card border border-border rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <Skeleton className="w-16 h-5" />
              </div>
              <Skeleton className="h-8 w-24 mb-1" />
              <Skeleton className="h-4 w-32" />
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid - Only show when we have data */}
      {!youtubeLoading && youtubeData.hasData && stats.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <stat.icon className="w-5 h-5 text-primary" />
                </div>
                {stat.change && stat.trend && (
                  <div className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === "up" ? "text-green-400" : "text-red-400"
                  }`}>
                    {stat.trend === "up" ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Section - Only show when we have data */}
      {!youtubeLoading && youtubeData.hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Info about Subscriber Growth */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Subscriber Growth</h3>
            <p className="text-sm text-muted-foreground mb-4">Current subscribers</p>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">
                  {formatSubscriberCount(youtubeData.channel?.subscriberCount || 0)}
                </div>
                <p className="text-sm text-muted-foreground">
                  Historical growth data requires YouTube Analytics API integration.
                </p>
              </div>
            </div>
          </div>

          {/* Views Per Video Chart */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-lg font-semibold mb-4">Views Per Video</h3>
            <p className="text-sm text-muted-foreground mb-4">Last {viewsData.length} videos</p>
            {viewsData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={viewsData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="video" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => formatViewCount(value)}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                      labelStyle={{ color: "hsl(var(--foreground))" }}
                      formatter={(value: number, name: string, props: any) => [
                        formatViewCount(value),
                        props.payload.title?.substring(0, 30) + "..." || "Views"
                      ]}
                    />
                    <Bar 
                      dataKey="views" 
                      fill="hsl(var(--accent))"
                      radius={[4, 4, 0, 0]}
                    />
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
      )}

      {/* Recent Videos - Only show when we have data */}
      {!youtubeLoading && youtubeData.hasData && youtubeData.videos.length > 0 && (
        <div className="bg-card border border-border rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Recent Videos</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-primary hover:text-primary/80"
              onClick={() => navigate("/dashboard/videos")}
            >
              View all
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-sm text-muted-foreground border-b border-border">
                  <th className="pb-3 font-medium">Video</th>
                  <th className="pb-3 font-medium">Views</th>
                  <th className="pb-3 font-medium">Likes</th>
                  <th className="pb-3 font-medium">Published</th>
                  <th className="pb-3 font-medium">Duration</th>
                </tr>
              </thead>
              <tbody>
                {youtubeData.videos.slice(0, 5).map((video) => (
                  <tr key={video.id} className="border-b border-border/50 last:border-0">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        {video.thumbnail ? (
                          <img 
                            src={video.thumbnail} 
                            alt={video.title}
                            className="w-20 h-12 object-cover rounded-lg flex-shrink-0"
                          />
                        ) : (
                          <div className="w-20 h-12 bg-muted rounded-lg flex-shrink-0" />
                        )}
                        <span className="font-medium line-clamp-2 max-w-xs">{video.title}</span>
                      </div>
                    </td>
                    <td className="py-4 text-muted-foreground">{formatViewCount(video.viewCount)}</td>
                    <td className="py-4 text-muted-foreground">{formatViewCount(video.likeCount)}</td>
                    <td className="py-4 text-muted-foreground">{formatPublishedDate(video.publishedAt)}</td>
                    <td className="py-4 text-muted-foreground">
                      {video.duration ? formatDuration(video.duration) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Last Synced Info */}
      {youtubeData.channel?.lastSyncedAt && (
        <p className="text-xs text-muted-foreground text-center mb-6">
          Last synced: {format(parseISO(youtubeData.channel.lastSyncedAt), "MMM d, yyyy 'at' h:mm a")}
        </p>
      )}

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-muted/50 transition-all"
              onClick={() => navigate(action.path)}
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center`}>
                <action.icon className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-medium">{action.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
