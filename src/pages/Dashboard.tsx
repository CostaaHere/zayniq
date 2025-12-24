import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const Dashboard = () => {
  const { user } = useAuth();
  const { profile } = useProfile();

  const firstName = profile?.full_name?.split(" ")[0] || user?.user_metadata?.full_name?.split(" ")[0] || "Creator";

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const stats = [
    { 
      label: "Total Subscribers", 
      value: "45,231", 
      change: "+12.5%", 
      trend: "up",
      icon: Users 
    },
    { 
      label: "Total Views", 
      value: "1.2M", 
      change: "+8.3%", 
      trend: "up",
      icon: Eye 
    },
    { 
      label: "Videos Published", 
      value: "156", 
      change: "+3", 
      trend: "up",
      icon: Video 
    },
    { 
      label: "Avg. Views/Video", 
      value: "7.8K", 
      change: "-2.1%", 
      trend: "down",
      icon: TrendingUp 
    },
  ];

  const subscriberData = [
    { day: "1", value: 42100 },
    { day: "5", value: 42800 },
    { day: "10", value: 43200 },
    { day: "15", value: 43900 },
    { day: "20", value: 44500 },
    { day: "25", value: 44800 },
    { day: "30", value: 45231 },
  ];

  const viewsData = [
    { video: "Video 1", views: 12500 },
    { video: "Video 2", views: 8200 },
    { video: "Video 3", views: 15600 },
    { video: "Video 4", views: 9800 },
    { video: "Video 5", views: 11200 },
    { video: "Video 6", views: 7400 },
    { video: "Video 7", views: 13800 },
    { video: "Video 8", views: 10500 },
    { video: "Video 9", views: 16200 },
    { video: "Video 10", views: 8900 },
  ];

  const recentVideos = [
    { 
      title: "How to Grow Your Channel in 2024", 
      views: "125K", 
      likes: "8.2K", 
      date: "Dec 22, 2024",
      seoScore: 92
    },
    { 
      title: "YouTube Algorithm Secrets Revealed", 
      views: "98K", 
      likes: "6.5K", 
      date: "Dec 19, 2024",
      seoScore: 87
    },
    { 
      title: "Content Strategy That Works", 
      views: "76K", 
      likes: "4.1K", 
      date: "Dec 17, 2024",
      seoScore: 78
    },
    { 
      title: "10 Tips for Better Thumbnails", 
      views: "54K", 
      likes: "3.2K", 
      date: "Dec 15, 2024",
      seoScore: 95
    },
  ];

  const quickActions = [
    { icon: Sparkles, label: "Analyze Video", color: "from-primary to-accent" },
    { icon: Search, label: "Research Keywords", color: "from-accent to-primary" },
    { icon: FileText, label: "Generate Title", color: "from-primary to-purple-500" },
  ];

  const getSeoScoreColor = (score: number) => {
    if (score >= 90) return "bg-green-500/20 text-green-400 border-green-500/30";
    if (score >= 70) return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    return "bg-red-500/20 text-red-400 border-red-500/30";
  };

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-1">
          Welcome back, {firstName}! 👋
        </h2>
        <p className="text-muted-foreground">{currentDate}</p>
      </div>

      {/* Stats Grid */}
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
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Subscriber Growth Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Subscriber Growth</h3>
          <p className="text-sm text-muted-foreground mb-4">Last 30 days</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={subscriberData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="day" 
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
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Views Per Video Chart */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="text-lg font-semibold mb-4">Views Per Video</h3>
          <p className="text-sm text-muted-foreground mb-4">Last 10 videos</p>
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
                  tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Bar 
                  dataKey="views" 
                  fill="hsl(var(--accent))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Videos */}
      <div className="bg-card border border-border rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recent Videos</h3>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
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
                <th className="pb-3 font-medium">SEO Score</th>
              </tr>
            </thead>
            <tbody>
              {recentVideos.map((video, index) => (
                <tr key={index} className="border-b border-border/50 last:border-0">
                  <td className="py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-12 bg-muted rounded-lg flex-shrink-0" />
                      <span className="font-medium">{video.title}</span>
                    </div>
                  </td>
                  <td className="py-4 text-muted-foreground">{video.views}</td>
                  <td className="py-4 text-muted-foreground">{video.likes}</td>
                  <td className="py-4 text-muted-foreground">{video.date}</td>
                  <td className="py-4">
                    <Badge 
                      variant="outline" 
                      className={`${getSeoScoreColor(video.seoScore)} border`}
                    >
                      {video.seoScore}%
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant="outline"
              className="h-auto py-4 flex flex-col items-center gap-2 hover:bg-muted/50 transition-all"
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
