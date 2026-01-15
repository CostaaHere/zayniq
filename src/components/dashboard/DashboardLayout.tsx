import { useState, useEffect } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const SIDEBAR_STORAGE_KEY = "sidebarCollapsed";

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
      setSidebarCollapsed(stored === "true");
    };

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
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar />
      </div>

      {/* Mobile Overlay */}
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

      {/* Main Content */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-16" : "lg:ml-56"
        )}
      >
        <DashboardHeader
          title={title}
          onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
        />

        <main className="flex-1 px-4 md:px-6 lg:px-8 py-6 lg:py-8">
          <div className="max-w-[1200px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
