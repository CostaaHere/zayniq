import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  TrendingUp,
  TrendingDown,
  Download,
  ThumbsUp,
  MessageCircle,
  Share2,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Mock data
const channelData = {
  name: "TechCreator Pro",
  handle: "@techcreatorpro",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop",
  banner: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=300&fit=crop",
  subscribers: 125000,
  totalViews: 8500000,
  videoCount: 156,
  joinedDate: "2020-03-15",
  lastSynced: "2024-01-20T14:30:00",
};

const statsData = {
  subscribersGained: { value: 2340, change: 12.5, isPositive: true },
  viewsGained: { value: 185000, change: -3.2, isPositive: false },
  newVideos: { value: 8, change: 33.3, isPositive: true },
  engagementRate: { value: 4.8, change: 0.5, isPositive: true },
};

const subscriberGrowthData = [
  { date: "Jan 1", subscribers: 120000, views: 250000 },
  { date: "Jan 5", subscribers: 121200, views: 280000 },
  { date: "Jan 10", subscribers: 122000, views: 320000 },
  { date: "Jan 15", subscribers: 123500, views: 290000 },
  { date: "Jan 20", subscribers: 125000, views: 350000 },
];

const engagementData = [
  { name: "Likes", value: 45000, color: "hsl(var(--primary))" },
  { name: "Comments", value: 12000, color: "hsl(var(--accent))" },
  { name: "Shares", value: 8500, color: "hsl(142, 76%, 36%)" },
];

const topVideos = [
  {
    id: "1",
    thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=160&h=90&fit=crop",
    title: "Complete YouTube SEO Guide 2024",
    views: 450000,
    likes: 28000,
    comments: 1200,
    publishedAt: "2024-01-10",
  },
  {
    id: "2",
    thumbnail: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=160&h=90&fit=crop",
    title: "How I Grew to 100K Subscribers",
    views: 320000,
    likes: 21000,
    comments: 890,
    publishedAt: "2024-01-05",
  },
  {
    id: "3",
    thumbnail: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=160&h=90&fit=crop",
    title: "Best Camera for YouTube in 2024",
    views: 280000,
    likes: 18500,
    comments: 756,
    publishedAt: "2023-12-28",
  },
];

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const formatLastSynced = (dateStr: string): string => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);

  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  return formatDate(dateStr);
};

interface StatCardProps {
  title: string;
  value: string | number;
  change: number;
  isPositive: boolean;
  icon: React.ReactNode;
  suffix?: string;
}

const StatCard = ({ title, value, change, isPositive, icon, suffix = "" }: StatCardProps) => (
  <div className="bg-card rounded-xl border border-border p-5">
    <div className="flex items-start justify-between mb-3">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        {icon}
      </div>
      <Badge
        variant="outline"
        className={cn(
          "text-xs",
          isPositive
            ? "bg-green-500/10 text-green-500 border-green-500/20"
            : "bg-red-500/10 text-red-500 border-red-500/20"
        )}
      >
        {isPositive ? <TrendingUp className="w-3 h-3 mr-1" /> : <TrendingDown className="w-3 h-3 mr-1" />}
        {isPositive ? "+" : ""}{change}%
      </Badge>
    </div>
    <div className="text-2xl font-bold">{typeof value === "number" ? formatNumber(value) : value}{suffix}</div>
    <div className="text-sm text-muted-foreground">{title}</div>
  </div>
);

const Channel = () => {
  const [dateRange, setDateRange] = useState("30d");
  const [activeTab, setActiveTab] = useState("overview");
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = () => {
    setIsSyncing(true);
    setTimeout(() => setIsSyncing(false), 2000);
  };

  const handleExport = () => {
    // Mock export functionality
    const data = "Channel,Subscribers,Views,Videos\nTechCreator Pro,125000,8500000,156";
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "channel-analytics.csv";
    a.click();
  };

  return (
    <DashboardLayout title="My Channel">
      <div className="space-y-6">
        {/* Channel Header */}
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          {/* Banner */}
          <div className="relative h-32 sm:h-48">
            <img
              src={channelData.banner}
              alt="Channel banner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          </div>

          {/* Channel Info */}
          <div className="relative px-4 sm:px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12 sm:-mt-16">
              {/* Avatar */}
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl border-4 border-card overflow-hidden flex-shrink-0">
                <img
                  src={channelData.avatar}
                  alt={channelData.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Name and Handle */}
              <div className="flex-1">
                <h1 className="text-xl sm:text-2xl font-bold">{channelData.name}</h1>
                <p className="text-muted-foreground">{channelData.handle}</p>
              </div>

              {/* Sync Button */}
              <div className="flex items-center gap-3">
                <div className="text-right text-sm text-muted-foreground hidden sm:block">
                  <div>Last synced</div>
                  <div>{formatLastSynced(channelData.lastSynced)}</div>
                </div>
                <Button onClick={handleSync} disabled={isSyncing} className="gap-2">
                  <RefreshCw className={cn("w-4 h-4", isSyncing && "animate-spin")} />
                  Sync Now
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
                <div className="text-lg font-semibold">{formatNumber(channelData.subscribers)}</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm mb-1">
                  <Eye className="w-4 h-4" />
                  Total Views
                </div>
                <div className="text-lg font-semibold">{formatNumber(channelData.totalViews)}</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm mb-1">
                  <Film className="w-4 h-4" />
                  Videos
                </div>
                <div className="text-lg font-semibold">{channelData.videoCount}</div>
              </div>
              <div className="text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm mb-1">
                  <Calendar className="w-4 h-4" />
                  Joined
                </div>
                <div className="text-lg font-semibold">{formatDate(channelData.joinedDate)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Subscribers Gained"
            value={statsData.subscribersGained.value}
            change={statsData.subscribersGained.change}
            isPositive={statsData.subscribersGained.isPositive}
            icon={<Users className="w-5 h-5" />}
          />
          <StatCard
            title="Views Gained"
            value={statsData.viewsGained.value}
            change={statsData.viewsGained.change}
            isPositive={statsData.viewsGained.isPositive}
            icon={<Eye className="w-5 h-5" />}
          />
          <StatCard
            title="New Videos"
            value={statsData.newVideos.value}
            change={statsData.newVideos.change}
            isPositive={statsData.newVideos.isPositive}
            icon={<Film className="w-5 h-5" />}
          />
          <StatCard
            title="Engagement Rate"
            value={statsData.engagementRate.value}
            change={statsData.engagementRate.change}
            isPositive={statsData.engagementRate.isPositive}
            icon={<TrendingUp className="w-5 h-5" />}
            suffix="%"
          />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="custom">Custom range</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
        </div>

        {/* Analytics Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="growth">Growth</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="top-videos">Top Videos</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Subscriber Growth Chart */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4">Subscriber Growth</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={subscriberGrowthData}>
                      <defs>
                        <linearGradient id="subGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="subscribers"
                        stroke="hsl(var(--primary))"
                        fill="url(#subGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Views Chart */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4">Views Over Time</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={subscriberGrowthData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                      />
                      <Bar dataKey="views" fill="hsl(var(--accent))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Growth Tab */}
          <TabsContent value="growth" className="space-y-6">
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4">Subscribers & Views Growth</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={subscriberGrowthData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis yAxisId="left" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <YAxis yAxisId="right" orientation="right" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                      }}
                    />
                    <Line yAxisId="left" type="monotone" dataKey="subscribers" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ fill: "hsl(var(--primary))" }} />
                    <Line yAxisId="right" type="monotone" dataKey="views" stroke="hsl(var(--accent))" strokeWidth={2} dot={{ fill: "hsl(var(--accent))" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm text-muted-foreground">Subscribers</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent" />
                  <span className="text-sm text-muted-foreground">Views</span>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Engagement Tab */}
          <TabsContent value="engagement" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Engagement Breakdown */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4">Engagement Breakdown</h3>
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
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  {engagementData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement Stats */}
              <div className="bg-card rounded-xl border border-border p-6">
                <h3 className="font-semibold mb-4">Engagement Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <ThumbsUp className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">Total Likes</div>
                        <div className="text-sm text-muted-foreground">Across all videos</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold">{formatNumber(45000)}</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent">
                        <MessageCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">Total Comments</div>
                        <div className="text-sm text-muted-foreground">Across all videos</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold">{formatNumber(12000)}</div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center text-green-500">
                        <Share2 className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-medium">Total Shares</div>
                        <div className="text-sm text-muted-foreground">Across all videos</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold">{formatNumber(8500)}</div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Top Videos Tab */}
          <TabsContent value="top-videos" className="space-y-6">
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="divide-y divide-border">
                {topVideos.map((video, index) => (
                  <div key={video.id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="text-2xl font-bold text-muted-foreground w-8 text-center">
                      {index + 1}
                    </div>
                    <div className="relative w-28 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="w-8 h-8 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium line-clamp-1">{video.title}</h4>
                      <p className="text-sm text-muted-foreground">{formatDate(video.publishedAt)}</p>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="text-center">
                        <div className="font-semibold text-foreground">{formatNumber(video.views)}</div>
                        <div>views</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-foreground">{formatNumber(video.likes)}</div>
                        <div>likes</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold text-foreground">{formatNumber(video.comments)}</div>
                        <div>comments</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Analyze
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Channel;
