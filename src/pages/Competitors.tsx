import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Users,
  Plus,
  Trash2,
  Eye,
  Film,
  Calendar,
  TrendingUp,
  TrendingDown,
  UserPlus,
  BarChart3,
  LineChart,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import CompetitorDetailModal from "@/components/competitors/CompetitorDetailModal";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Competitor {
  id: string;
  channel_name: string;
  channel_url: string;
  thumbnail_url: string | null;
  banner_url: string | null;
  subscriber_count: number;
  video_count: number;
  total_views: number;
  upload_frequency: string | null;
  last_video_date: string | null;
  notes: string | null;
}

const PLAN_LIMITS = {
  free: 3,
  pro: 10,
  agency: 25,
};

// Mock comparison data
const generateComparisonData = (competitors: Competitor[]) => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
  return months.map((month, i) => {
    const data: Record<string, string | number> = { month };
    data["Your Channel"] = 10000 + i * 2000 + Math.floor(Math.random() * 1000);
    competitors.forEach((comp) => {
      data[comp.channel_name] = comp.subscriber_count * (0.7 + i * 0.05) + Math.floor(Math.random() * 1000);
    });
    return data;
  });
};

const CHART_COLORS = [
  "hsl(var(--primary))",
  "#f97316",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
];

const Competitors = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [channelUrl, setChannelUrl] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [selectedCompetitor, setSelectedCompetitor] = useState<Competitor | null>(null);
  const [chartMetric, setChartMetric] = useState<"subscribers" | "views" | "videos">("subscribers");

  const tier = profile?.subscription_tier || "free";
  const limit = PLAN_LIMITS[tier as keyof typeof PLAN_LIMITS] || 3;
  const canAddMore = competitors.length < limit;

  useEffect(() => {
    fetchCompetitors();
  }, [user]);

  const fetchCompetitors = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("competitors")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCompetitors(data || []);
    } catch (err) {
      console.error("Error fetching competitors:", err);
      toast.error("Failed to load competitors");
    } finally {
      setIsLoading(false);
    }
  };

  const validateYouTubeUrl = (url: string) => {
    const patterns = [
      /^https?:\/\/(www\.)?youtube\.com\/(c|channel|user|@)[\w-]+/,
      /^https?:\/\/(www\.)?youtube\.com\/[\w-]+$/,
      /^@[\w-]+$/,
    ];
    return patterns.some((pattern) => pattern.test(url.trim()));
  };

  const handleAddCompetitor = async () => {
    if (!channelUrl.trim()) {
      toast.error("Please enter a YouTube channel URL");
      return;
    }

    if (!validateYouTubeUrl(channelUrl)) {
      toast.error("Please enter a valid YouTube channel URL");
      return;
    }

    if (!canAddMore) {
      toast.error(`You've reached the limit of ${limit} competitors for your plan`);
      return;
    }

    setIsAdding(true);
    try {
      // Generate mock data for the competitor
      const mockName = channelUrl.includes("@")
        ? channelUrl.replace("@", "")
        : channelUrl.split("/").pop() || "Channel";

      const { error } = await supabase.from("competitors").insert({
        user_id: user?.id,
        channel_url: channelUrl.startsWith("http") ? channelUrl : `https://youtube.com/${channelUrl}`,
        channel_name: mockName.charAt(0).toUpperCase() + mockName.slice(1),
        subscriber_count: Math.floor(Math.random() * 500000) + 10000,
        video_count: Math.floor(Math.random() * 200) + 20,
        total_views: Math.floor(Math.random() * 10000000) + 100000,
        upload_frequency: ["Weekly", "2x Weekly", "Daily", "3x Weekly"][Math.floor(Math.random() * 4)],
        last_video_date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
      });

      if (error) throw error;

      toast.success("Competitor added successfully");
      setChannelUrl("");
      fetchCompetitors();
    } catch (err) {
      console.error("Error adding competitor:", err);
      toast.error("Failed to add competitor");
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveCompetitor = async (id: string) => {
    try {
      const { error } = await supabase.from("competitors").delete().eq("id", id);
      if (error) throw error;
      toast.success("Competitor removed");
      fetchCompetitors();
    } catch (err) {
      toast.error("Failed to remove competitor");
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const userStats = {
    subscribers: 12500,
    views: 450000,
    videos: 45,
  };

  const comparisonData = generateComparisonData(competitors);

  return (
    <DashboardLayout title="Competitors">
      <div className="space-y-6">
        {/* Add Competitor Section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center justify-between">
              <span className="flex items-center gap-2">
                <UserPlus className="w-5 h-5" />
                Add Competitor
              </span>
              <Badge variant="outline" className="text-xs">
                {competitors.length}/{limit} competitors
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Input
                placeholder="Enter YouTube channel URL (e.g., https://youtube.com/@channelname)"
                value={channelUrl}
                onChange={(e) => setChannelUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddCompetitor()}
                className="flex-1 bg-background border-border"
                disabled={!canAddMore}
              />
              <Button
                onClick={handleAddCompetitor}
                disabled={isAdding || !canAddMore}
                className="bg-primary hover:bg-primary/90 gap-2"
              >
                {isAdding ? (
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Competitor
              </Button>
            </div>
            {!canAddMore && (
              <p className="text-sm text-muted-foreground mt-2">
                Upgrade to Pro to track up to 10 competitors
              </p>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Skeleton className="w-12 h-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-16 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && competitors.length === 0 && (
          <Card className="bg-card border-border">
            <CardContent className="py-16 text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                No Competitors Added
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start tracking your competitors by adding their YouTube channel URL above.
                You can add up to {limit} competitors on your current plan.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Competitor Cards */}
        {!isLoading && competitors.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {competitors.map((competitor) => (
                <Card key={competitor.id} className="bg-card border-border hover:border-primary/50 transition-colors">
                  <CardContent className="pt-6">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xl font-bold text-primary-foreground overflow-hidden">
                        {competitor.thumbnail_url ? (
                          <img
                            src={competitor.thumbnail_url}
                            alt={competitor.channel_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          competitor.channel_name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">
                          {competitor.channel_name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Users className="w-3 h-3" />
                          {formatNumber(competitor.subscriber_count)}
                          <span className="text-green-500 flex items-center ml-1">
                            <TrendingUp className="w-3 h-3" />
                            +3.2%
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Film className="w-3 h-3" />
                          Videos
                        </div>
                        <p className="text-lg font-semibold text-foreground">
                          {competitor.video_count}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Eye className="w-3 h-3" />
                          Views
                        </div>
                        <p className="text-lg font-semibold text-foreground">
                          {formatNumber(competitor.total_views)}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <BarChart3 className="w-3 h-3" />
                          Frequency
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {competitor.upload_frequency || "Unknown"}
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/50">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                          <Calendar className="w-3 h-3" />
                          Last Video
                        </div>
                        <p className="text-sm font-semibold text-foreground">
                          {formatDate(competitor.last_video_date)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setSelectedCompetitor(competitor)}
                      >
                        View Details
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleRemoveCompetitor(competitor.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Comparison Chart */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground flex items-center gap-2">
                    <LineChart className="w-5 h-5" />
                    Channel Comparison
                  </CardTitle>
                  <Select value={chartMetric} onValueChange={(v) => setChartMetric(v as typeof chartMetric)}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="subscribers">Subscribers</SelectItem>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="videos">Videos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsLineChart data={comparisonData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                      <YAxis stroke="hsl(var(--muted-foreground))" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="Your Channel"
                        stroke={CHART_COLORS[0]}
                        strokeWidth={2}
                        dot={{ fill: CHART_COLORS[0] }}
                      />
                      {competitors.map((comp, index) => (
                        <Line
                          key={comp.id}
                          type="monotone"
                          dataKey={comp.channel_name}
                          stroke={CHART_COLORS[(index + 1) % CHART_COLORS.length]}
                          strokeWidth={2}
                          dot={{ fill: CHART_COLORS[(index + 1) % CHART_COLORS.length] }}
                        />
                      ))}
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Detail Modal */}
        <CompetitorDetailModal
          competitor={selectedCompetitor}
          isOpen={!!selectedCompetitor}
          onClose={() => setSelectedCompetitor(null)}
          userStats={userStats}
          onUpdate={fetchCompetitors}
        />
      </div>
    </DashboardLayout>
  );
};

export default Competitors;
