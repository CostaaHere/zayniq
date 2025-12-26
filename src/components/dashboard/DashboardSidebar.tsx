import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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

// Storage key for persisting sidebar state
const SIDEBAR_STORAGE_KEY = "sidebarCollapsed";

// Navigation items configuration
const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: PlayCircle, label: "My Channel", href: "/dashboard/channel" },
  { icon: Film, label: "Videos", href: "/dashboard/videos" },
  { icon: Search, label: "Keywords", href: "/dashboard/keywords" },
  { icon: Users, label: "Competitors", href: "/dashboard/competitors" },
  { icon: Sparkles, label: "AI Tools", href: "/dashboard/ai-tools" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

const DashboardSidebar = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  // Initialize state from localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });

  // Persist state to localStorage
  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  // Toggle handler
  const handleToggle = () => {
    setIsCollapsed((prev) => !prev);
  };

  const isFreeTier = profile?.subscription_tier === "free";

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-40",
        "bg-gradient-to-b from-[#0f0f1a] via-[#121220] to-[#0a0a14]",
        "border-r border-white/5",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle Button - Positioned at top right edge */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "absolute -right-3 top-6 z-50",
          "w-6 h-6 rounded-full",
          "flex items-center justify-center",
          "bg-[#252542] hover:bg-[#2D2D4A]",
          "border border-[#2D2D4A]",
          "text-muted-foreground hover:text-foreground",
          "transition-all duration-200",
          "cursor-pointer shadow-lg"
        )}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Logo Section */}
      <div
        className={cn(
          "flex items-center h-16 border-b border-white/5",
          "transition-all duration-300",
          isCollapsed ? "px-3 justify-center" : "px-4"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold text-primary-foreground">Z</span>
          </div>
          <span
            className={cn(
              "text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent",
              "transition-all duration-300",
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}
          >
            ZainIQ
          </span>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;

          return (
            <div key={item.href} className="relative group">
              <NavLink
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl",
                  "text-sm font-medium",
                  "transition-all duration-200",
                  "cursor-pointer",
                  isActive
                    ? "bg-primary/15 text-primary shadow-[0_0_15px_rgba(124,58,237,0.15)]"
                    : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300",
                    isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                  )}
                >
                  {item.label}
                </span>
              </NavLink>

              {/* Tooltip - Only visible when collapsed */}
              {isCollapsed && (
                <div
                  className={cn(
                    "absolute left-full top-1/2 -translate-y-1/2 ml-3",
                    "px-2.5 py-1.5 rounded-md",
                    "bg-[#1a1a2e] border border-white/10",
                    "text-sm font-medium text-foreground",
                    "whitespace-nowrap",
                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                    "transition-all duration-200",
                    "pointer-events-none",
                    "shadow-xl z-50"
                  )}
                >
                  {item.label}
                  {/* Tooltip arrow */}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a2e] border-l border-b border-white/10 rotate-45" />
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Upgrade Button for Free Users */}
      {isFreeTier && (
        <div className={cn("px-2 mb-3", isCollapsed && "px-1")}>
          <div className="relative group">
            <Button
              className={cn(
                "w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground",
                isCollapsed ? "px-0" : "gap-2"
              )}
              size={isCollapsed ? "icon" : "default"}
            >
              <Crown className="w-4 h-4 flex-shrink-0" />
              <span
                className={cn(
                  "transition-all duration-300",
                  isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                )}
              >
                Upgrade to Pro
              </span>
            </Button>

            {/* Tooltip for upgrade button when collapsed */}
            {isCollapsed && (
              <div
                className={cn(
                  "absolute left-full top-1/2 -translate-y-1/2 ml-3",
                  "px-2.5 py-1.5 rounded-md",
                  "bg-[#1a1a2e] border border-white/10",
                  "text-sm font-medium text-foreground",
                  "whitespace-nowrap",
                  "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                  "transition-all duration-200",
                  "pointer-events-none",
                  "shadow-xl z-50"
                )}
              >
                Upgrade to Pro
                <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a2e] border-l border-b border-white/10 rotate-45" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Section */}
      <div className="border-t border-white/5 p-3">
        {/* User Info */}
        <div className="relative group mb-3">
          <div
            className={cn(
              "flex items-center gap-3 p-2 rounded-xl",
              "transition-all duration-200",
              isCollapsed && "justify-center p-0"
            )}
          >
            {/* Avatar */}
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

            {/* User details - hidden when collapsed */}
            <div
              className={cn(
                "flex-1 min-w-0 transition-all duration-300",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}
            >
              <div className="font-medium text-sm text-foreground truncate">
                {profile?.full_name || "User"}
              </div>
              <div className="text-xs text-muted-foreground truncate">
                {user?.email}
              </div>
            </div>
          </div>

          {/* Tooltip for user info when collapsed */}
          {isCollapsed && (
            <div
              className={cn(
                "absolute left-full top-1/2 -translate-y-1/2 ml-3",
                "px-2.5 py-1.5 rounded-md",
                "bg-[#1a1a2e] border border-white/10",
                "text-sm text-foreground",
                "whitespace-nowrap",
                "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                "transition-all duration-200",
                "pointer-events-none",
                "shadow-xl z-50"
              )}
            >
              <div className="font-medium">{profile?.full_name || "User"}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a2e] border-l border-b border-white/10 rotate-45" />
            </div>
          )}
        </div>

        {/* Sign Out Button */}
        <div className="relative group">
          <Button
            variant="ghost"
            onClick={signOut}
            className={cn(
              "w-full text-muted-foreground hover:text-foreground hover:bg-white/5",
              isCollapsed ? "px-0" : "justify-start gap-3"
            )}
            size={isCollapsed ? "icon" : "default"}
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            <span
              className={cn(
                "transition-all duration-300",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}
            >
              Sign Out
            </span>
          </Button>

          {/* Tooltip for sign out when collapsed */}
          {isCollapsed && (
            <div
              className={cn(
                "absolute left-full top-1/2 -translate-y-1/2 ml-3",
                "px-2.5 py-1.5 rounded-md",
                "bg-[#1a1a2e] border border-white/10",
                "text-sm font-medium text-foreground",
                "whitespace-nowrap",
                "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                "transition-all duration-200",
                "pointer-events-none",
                "shadow-xl z-50"
              )}
            >
              Sign Out
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a2e] border-l border-b border-white/10 rotate-45" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
