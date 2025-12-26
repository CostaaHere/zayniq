import { useState, useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import MainContentWrapper from "@/components/layout/MainContentWrapper";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

// Storage key must match the one in DashboardSidebar
const SIDEBAR_STORAGE_KEY = "sidebarCollapsed";

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  // Read sidebar state to adjust main content margin
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen for localStorage changes to sync sidebar state
  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      setSidebarCollapsed(stored === "true");
    };

    // Also poll for changes since storage events don't fire in same tab
    const interval = setInterval(() => {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      setSidebarCollapsed(stored === "true");
    }, 100);

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar - Self-contained with its own state */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          mobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <DashboardSidebar />
      </div>

      {/* Main Content Area */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-64"
        )}
      >
        <DashboardHeader
          title={title}
          onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
        />

        {/* Content container with centered wrapper */}
        <main className="flex-1 flex justify-center py-4 lg:py-6">
          <MainContentWrapper>{children}</MainContentWrapper>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
