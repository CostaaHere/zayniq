import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PlayCircle,
  Film,
  Search,
  Users,
  Sparkles,
  Settings,
  LogOut,
  Crown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
  { icon: PlayCircle, label: "My Channel", path: "/dashboard/channel" },
  { icon: Film, label: "Videos", path: "/dashboard/videos" },
  { icon: Search, label: "Keywords", path: "/dashboard/keywords" },
  { icon: Users, label: "Competitors", path: "/dashboard/competitors" },
  { icon: Sparkles, label: "AI Tools", path: "/dashboard/ai-tools" },
  { icon: Settings, label: "Settings", path: "/dashboard/settings" },
];

const DashboardSidebar = ({ collapsed, onToggle }: DashboardSidebarProps) => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  const isFreeTier = profile?.subscription_tier === "free";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
          <span className="text-xl font-bold text-primary-foreground">T</span>
        </div>
        {!collapsed && (
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            TubeBoost
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* Upgrade Button for Free Users */}
      {isFreeTier && (
        <div className={cn("px-3 mb-3", collapsed && "px-2")}>
          <Button
            className={cn(
              "w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground",
              collapsed ? "px-2" : "gap-2"
            )}
            size={collapsed ? "icon" : "default"}
          >
            <Crown className="w-4 h-4" />
            {!collapsed && <span>Upgrade to Pro</span>}
          </Button>
        </div>
      )}

      {/* User Section */}
      <div className="border-t border-border p-3">
        <div
          className={cn(
            "flex items-center gap-3 mb-3",
            collapsed && "justify-center"
          )}
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              user?.email?.charAt(0).toUpperCase() || "U"
            )}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {profile?.full_name || "User"}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user?.email}
              </div>
            </div>
          )}
        </div>

        <Button
          variant="ghost"
          size={collapsed ? "icon" : "default"}
          className={cn(
            "w-full text-muted-foreground hover:text-foreground",
            !collapsed && "justify-start gap-3"
          )}
          onClick={signOut}
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </Button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-muted transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>
    </aside>
  );
};

export default DashboardSidebar;
