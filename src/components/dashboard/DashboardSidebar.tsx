import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { NavLink, useLocation } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = location.pathname === item.path;
    
    const linkContent = (
      <NavLink
        to={item.path}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
          isActive
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
          collapsed && "justify-center px-2"
        )}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            {linkContent}
          </TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return linkContent;
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col transition-all duration-300 ease-in-out z-40",
        collapsed ? "w-[72px]" : "w-[260px]"
      )}
    >
      {/* Logo + Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary-foreground">Z</span>
          </div>
          {!collapsed && (
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent truncate">
              ZainIQ
            </span>
          )}
        </div>
        
        {/* Toggle Button */}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
            "bg-[#252542] hover:bg-[#2D2D4A] border border-[#2D2D4A]",
            "text-muted-foreground hover:text-foreground",
            collapsed && "absolute -right-4 top-6 z-50 shadow-lg"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <div className={cn(
            "transition-transform duration-300",
            collapsed ? "rotate-0" : "rotate-0"
          )}>
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </div>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavItem key={item.path} item={item} />
        ))}
      </nav>

      {/* Upgrade Button for Free Users */}
      {isFreeTier && (
        <div className={cn("px-3 mb-3", collapsed && "px-2")}>
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <Button
                  className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground px-2"
                  size="icon"
                >
                  <Crown className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                Upgrade to Pro
              </TooltipContent>
            </Tooltip>
          ) : (
            <Button
              className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground gap-2"
            >
              <Crown className="w-4 h-4" />
              <span>Upgrade to Pro</span>
            </Button>
          )}
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
          {collapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0 cursor-pointer">
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
              </TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                <div>{profile?.full_name || "User"}</div>
                <div className="text-xs text-muted-foreground">{user?.email}</div>
              </TooltipContent>
            </Tooltip>
          ) : (
            <>
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
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {profile?.full_name || "User"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </div>
              </div>
            </>
          )}
        </div>

        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-full text-muted-foreground hover:text-foreground"
                onClick={signOut}
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              Sign Out
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            className="w-full text-muted-foreground hover:text-foreground justify-start gap-3"
            onClick={signOut}
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Button>
        )}
      </div>
    </aside>
  );
};

export default DashboardSidebar;
