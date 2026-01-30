import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { useYouTubeAnalytics } from "@/hooks/useYouTubeAnalytics";
import { useChannelDNA } from "@/hooks/useChannelDNA";
import { ChannelDNAPanel } from "@/components/dashboard/ChannelDNAPanel";
import { YouTubeConnectButton } from "@/components/youtube/YouTubeConnectButton";
import { 
  RefreshCw,
  Youtube,
  Loader2,
  TrendingUp,
  Zap,
  Target,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";

const Dashboard = () => {
  const { user } = useAuth();
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
  } = useYouTubeAnalytics();
  
  const { hasDNA } = useChannelDNA();

  const firstName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "Creator";

  // Format time of day
  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  // Intelligent next steps based on data state
  const getNextAction = () => {
    if (!youtubeData.hasData) {
      return {
        label: "Connect your channel",
        description: "Let ZainIQ learn your content patterns",
        action: () => syncData(),
        icon: Youtube,
      };
    }
    if (youtubeData.videos.length < 5) {
      return {
        label: "Sync more videos",
        description: "More data means smarter insights",
        action: () => syncData(),
        icon: RefreshCw,
      };
    }
    return {
      label: "Optimize your next video",
      description: "AI-powered title and description insights",
      action: () => navigate("/dashboard/ai-tools"),
      icon: Sparkles,
    };
  };

  const nextAction = getNextAction();

  return (
    <DashboardLayout title="">
      <div className="max-w-4xl">
        {/* Greeting - Personal, not generic */}
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2">
            Good {getTimeOfDay()}, {firstName}
          </h1>
          <p className="text-muted-foreground text-lg">
            {youtubeData.hasData 
              ? "Here's what ZainIQ learned about your channel."
              : "Let's set up your intelligence dashboard."
            }
          </p>
        </div>

        {/* YouTube Auth Required - Clean alert */}
        {youtubeData.needsYouTubeAuth && !youtubeLoading && (
          <Alert className="mb-8 border-primary/20 bg-primary/5 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Youtube className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold mb-1">Connect Your YouTube Channel</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  ZainIQ needs access to analyze your content and deliver personalized insights.
                </p>
                <YouTubeConnectButton showChannelPreview={false} />
              </div>
            </div>
          </Alert>
        )}

        {/* Error State */}
        {youtubeError && (
          <Alert className="mb-8 border-destructive/20 bg-destructive/5 p-6">
            <AlertDescription className="flex items-center gap-4">
              <span>{youtubeError}</span>
              <Button onClick={syncData} variant="outline" size="sm">
                Try again
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Loading State */}
        {youtubeLoading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
              <p className="text-muted-foreground">Analyzing your channel...</p>
            </div>
          </div>
        )}

        {/* Connected State - Intelligence Dashboard */}
        {!youtubeLoading && youtubeData.hasData && youtubeData.channel && (
          <>
            {/* Channel Overview - Minimal */}
            <div className="mb-12 p-6 rounded-2xl bg-muted/30">
              <div className="flex items-center gap-4 mb-6">
                {youtubeData.channel.thumbnail ? (
                  <img
                    src={youtubeData.channel.thumbnail}
                    alt={youtubeData.channel.name}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                    <Youtube className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1">
                  <h2 className="text-xl font-semibold">{youtubeData.channel.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {youtubeData.channel.lastSyncedAt && 
                      `Updated ${format(parseISO(youtubeData.channel.lastSyncedAt), "MMM d 'at' h:mm a")}`
                    }
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={syncData} 
                  disabled={syncing}
                  className="text-muted-foreground"
                >
                  {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                </Button>
              </div>

              {/* Key metrics - Large, scannable */}
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <div className="text-3xl font-semibold mb-1">
                    {formatSubscriberCount(youtubeData.channel.subscriberCount)}
                  </div>
                  <div className="text-sm text-muted-foreground">Subscribers</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold mb-1">
                    {formatViewCount(youtubeData.channel.viewCount)}
                  </div>
                  <div className="text-sm text-muted-foreground">Total views</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold mb-1">
                    {youtubeData.channel.videoCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Videos</div>
                </div>
              </div>
            </div>

            {/* Channel DNA Section */}
            <div className="mb-12">
              <ChannelDNAPanel />
            </div>

            {/* Intelligent Workflows - Not tool buttons */}
            <div className="mb-12">
              <h3 className="text-lg font-semibold mb-6">What would you like to do?</h3>
              
              <div className="space-y-3">
                {/* Primary workflow */}
                <button
                  onClick={() => navigate("/dashboard/ai-tools")}
                  className="w-full group flex items-center gap-4 p-5 rounded-xl bg-gradient-to-r from-primary/10 to-accent/5 hover:from-primary/15 hover:to-accent/10 transition-all text-left"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                    <Sparkles className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold mb-0.5 flex items-center gap-2">
                      Optimize my next video
                      {hasDNA && (
                        <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                          DNA-Powered
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {hasDNA 
                        ? "Get personalized titles, descriptions, and tags matched to your voice"
                        : "Get AI-powered titles, descriptions, and tags tailored to your audience"
                      }
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>

                {/* Secondary workflows */}
                <div className="grid md:grid-cols-2 gap-3">
                  <button
                    onClick={() => navigate("/dashboard/competitors")}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Target className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-0.5">Analyze competitors</div>
                      <div className="text-xs text-muted-foreground truncate">
                        See what's working in your niche
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate("/dashboard/keywords")}
                    className="group flex items-center gap-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all text-left"
                  >
                    <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <TrendingUp className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm mb-0.5">Discover trends</div>
                      <div className="text-xs text-muted-foreground truncate">
                        Keywords your audience is searching
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Performance - Quick glance */}
            {youtubeData.videos.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent videos</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => navigate("/dashboard/videos")}
                    className="text-muted-foreground text-sm"
                  >
                    View all
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>

                <div className="space-y-2">
                  {youtubeData.videos.slice(0, 3).map((video) => (
                    <div
                      key={video.id}
                      className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => navigate(`/dashboard/videos/${video.id}`)}
                    >
                      {video.thumbnail ? (
                        <img
                          src={video.thumbnail}
                          alt={video.title}
                          className="w-24 h-14 rounded-lg object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-24 h-14 rounded-lg bg-muted shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm line-clamp-1 mb-1">{video.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatViewCount(video.viewCount)} views
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* No Data Yet - Onboarding flow */}
        {!youtubeLoading && !youtubeData.hasData && !youtubeData.needsYouTubeAuth && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-6">
              <Zap className="w-10 h-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-semibold mb-3">Let's power up your channel</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              ZainIQ will analyze your content patterns, audience behavior, and growth opportunities.
            </p>
            <Button onClick={syncData} disabled={syncing} size="lg" className="gap-2">
              {syncing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <nextAction.icon className="w-4 h-4" />
                  {nextAction.label}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
