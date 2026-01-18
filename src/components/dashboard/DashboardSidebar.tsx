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
  ChevronLeft,
  ChevronRight,
  Bot,
} from "lucide-react";

const SIDEBAR_STORAGE_KEY = "sidebarCollapsed";

const navItems = [
  { icon: LayoutDashboard, label: "Home", href: "/dashboard" },
  { icon: PlayCircle, label: "Channel", href: "/dashboard/channel" },
  { icon: Film, label: "Videos", href: "/dashboard/videos" },
  { icon: Bot, label: "AI Coach", href: "/dashboard/coach" },
  { icon: Sparkles, label: "AI Studio", href: "/dashboard/ai-tools" },
  { icon: Search, label: "Discovery", href: "/dashboard/keywords" },
  { icon: Users, label: "Competitors", href: "/dashboard/competitors" },
];

const DashboardSidebar = () => {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const location = useLocation();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const handleToggle = () => setIsCollapsed((prev) => !prev);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen flex flex-col z-40",
        "bg-background border-r border-border/50",
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-56"
      )}
    >
      {/* Toggle */}
      <button
        type="button"
        onClick={handleToggle}
        className={cn(
          "absolute -right-3 top-6 z-50",
          "w-6 h-6 rounded-full",
          "flex items-center justify-center",
          "bg-muted hover:bg-muted/80",
          "border border-border",
          "text-muted-foreground hover:text-foreground",
          "transition-all duration-200 cursor-pointer"
        )}
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo */}
      <div
        className={cn(
          "flex items-center h-14 border-b border-border/50",
          "transition-all duration-300",
          isCollapsed ? "px-3 justify-center" : "px-4"
        )}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-primary-foreground">Z</span>
          </div>
          <span
            className={cn(
              "text-lg font-semibold gradient-text",
              "transition-all duration-300",
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}
          >
            ZainIQ
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto overflow-x-hidden">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href || 
            (item.href !== "/dashboard" && location.pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <div key={item.href} className="relative group">
              <NavLink
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg",
                  "text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                  isCollapsed && "justify-center px-0"
                )}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                <span
                  className={cn(
                    "whitespace-nowrap transition-all duration-300",
                    isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                  )}
                >
                  {item.label}
                </span>
              </NavLink>

              {/* Tooltip */}
              {isCollapsed && (
                <div
                  className={cn(
                    "absolute left-full top-1/2 -translate-y-1/2 ml-2",
                    "px-2 py-1 rounded-md",
                    "bg-popover border border-border",
                    "text-xs font-medium text-foreground",
                    "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                    "transition-all duration-150 pointer-events-none z-50"
                  )}
                >
                  {item.label}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t border-border/50 p-2 space-y-1">
        {/* Settings */}
        <div className="relative group">
          <NavLink
            to="/dashboard/settings"
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg",
              "text-sm font-medium transition-all duration-200",
              location.pathname === "/dashboard/settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
              isCollapsed && "justify-center px-0"
            )}
          >
            <Settings className="w-[18px] h-[18px] shrink-0" />
            <span
              className={cn(
                "whitespace-nowrap transition-all duration-300",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}
            >
              Settings
            </span>
          </NavLink>
          {isCollapsed && (
            <div
              className={cn(
                "absolute left-full top-1/2 -translate-y-1/2 ml-2",
                "px-2 py-1 rounded-md bg-popover border border-border",
                "text-xs font-medium text-foreground",
                "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                "transition-all duration-150 pointer-events-none z-50"
              )}
            >
              Settings
            </div>
          )}
        </div>

        {/* User */}
        <div
          className={cn(
            "flex items-center gap-3 px-3 py-2 rounded-lg",
            isCollapsed && "justify-center px-0"
          )}
        >
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0 overflow-hidden">
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              user?.email?.charAt(0).toUpperCase() || "U"
            )}
          </div>
          <div
            className={cn(
              "flex-1 min-w-0 transition-all duration-300",
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
            )}
          >
            <div className="text-sm font-medium truncate">
              {profile?.full_name || "User"}
            </div>
          </div>
        </div>

        {/* Sign out */}
        <div className="relative group">
          <Button
            variant="ghost"
            onClick={signOut}
            className={cn(
              "w-full text-muted-foreground hover:text-foreground hover:bg-muted/50",
              isCollapsed ? "px-0 justify-center" : "justify-start gap-3"
            )}
            size="sm"
          >
            <LogOut className="w-[18px] h-[18px] shrink-0" />
            <span
              className={cn(
                "transition-all duration-300",
                isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
              )}
            >
              Sign out
            </span>
          </Button>
          {isCollapsed && (
            <div
              className={cn(
                "absolute left-full top-1/2 -translate-y-1/2 ml-2",
                "px-2 py-1 rounded-md bg-popover border border-border",
                "text-xs font-medium text-foreground",
                "opacity-0 invisible group-hover:opacity-100 group-hover:visible",
                "transition-all duration-150 pointer-events-none z-50"
              )}
            >
              Sign out
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
