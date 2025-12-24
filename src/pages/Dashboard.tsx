import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { BarChart3, TrendingUp, Users, Video } from "lucide-react";

const Dashboard = () => {
  const stats = [
    { label: "Total Views", value: "1.2M", change: "+12.5%", icon: BarChart3, positive: true },
    { label: "Subscribers", value: "45.2K", change: "+8.3%", icon: Users, positive: true },
    { label: "Watch Time", value: "892h", change: "+15.2%", icon: TrendingUp, positive: true },
    { label: "Videos", value: "156", change: "+3", icon: Video, positive: true },
  ];

  const recentVideos = [
    { title: "How to Grow Your Channel in 2024", views: "125K", likes: "8.2K", date: "2 days ago" },
    { title: "YouTube Algorithm Secrets Revealed", views: "98K", likes: "6.5K", date: "5 days ago" },
    { title: "Content Strategy That Works", views: "76K", likes: "4.1K", date: "1 week ago" },
  ];

  return (
    <DashboardLayout title="Dashboard">
      {/* Welcome */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">Welcome back, Creator!</h2>
        <p className="text-muted-foreground">
          Here's what's happening with your channel today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <span className={`text-sm font-medium ${stat.positive ? "text-green-500" : "text-destructive"}`}>
                {stat.change}
              </span>
            </div>
            <div className="text-2xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent Videos */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <h3 className="text-xl font-bold mb-4">Recent Videos</h3>
        <div className="space-y-4">
          {recentVideos.map((video, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-4 border-b border-border last:border-0"
            >
              <div className="flex items-center gap-4">
                <div className="w-16 h-10 bg-muted rounded-lg flex-shrink-0" />
                <div>
                  <div className="font-medium">{video.title}</div>
                  <div className="text-sm text-muted-foreground">{video.date}</div>
                </div>
              </div>
              <div className="flex items-center gap-8 text-sm">
                <div className="text-right">
                  <div className="font-medium">{video.views}</div>
                  <div className="text-muted-foreground">Views</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{video.likes}</div>
                  <div className="text-muted-foreground">Likes</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
