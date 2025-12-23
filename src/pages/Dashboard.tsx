import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  BarChart3, 
  TrendingUp, 
  Users, 
  Video, 
  Settings,
  LogOut,
  Bell,
  Search
} from "lucide-react";
import { Input } from "@/components/ui/input";

const Dashboard = () => {
  const { user, signOut } = useAuth();

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
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-card border-r border-border p-6 hidden lg:block">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-xl font-bold text-primary-foreground">Z</span>
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ZaynIQ
          </span>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {[
            { icon: LayoutDashboard, label: "Dashboard", active: true },
            { icon: BarChart3, label: "Analytics" },
            { icon: Video, label: "Videos" },
            { icon: Users, label: "Audience" },
            { icon: TrendingUp, label: "Growth" },
            { icon: Settings, label: "Settings" },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors ${
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Sign Out */}
        <div className="absolute bottom-6 left-6 right-6">
          <Button
            variant="outline"
            className="w-full justify-start gap-3"
            onClick={signOut}
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="relative max-w-md flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search videos, analytics..."
                  className="pl-10 bg-muted/50 border-border/50"
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold">
                  {user?.email?.charAt(0).toUpperCase() || "U"}
                </div>
                <div className="hidden md:block">
                  <div className="font-medium text-sm">{user?.user_metadata?.full_name || "User"}</div>
                  <div className="text-xs text-muted-foreground">{user?.email}</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-6">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.user_metadata?.full_name?.split(" ")[0] || "Creator"}!
            </h1>
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
                  <span className={`text-sm font-medium ${stat.positive ? "text-green-500" : "text-red-500"}`}>
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
            <h2 className="text-xl font-bold mb-4">Recent Videos</h2>
            <div className="space-y-4">
              {recentVideos.map((video, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-10 bg-muted rounded-lg" />
                    <div>
                      <div className="font-medium">{video.title}</div>
                      <div className="text-sm text-muted-foreground">{video.date}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8 text-sm">
                    <div>
                      <div className="font-medium">{video.views}</div>
                      <div className="text-muted-foreground">Views</div>
                    </div>
                    <div>
                      <div className="font-medium">{video.likes}</div>
                      <div className="text-muted-foreground">Likes</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
