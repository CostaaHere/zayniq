import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import MainContentWrapper from "@/components/layout/MainContentWrapper";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
}

const DashboardLayout = ({ children, title }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSidebarToggle = () => setSidebarCollapsed((v) => !v);

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <DashboardSidebar collapsed={sidebarCollapsed} />
      </div>

      {/* Desktop collapse toggle (always clickable) */}
      <button
        type="button"
        onClick={handleSidebarToggle}
        className={cn(
          "hidden lg:flex fixed top-20 w-8 h-8 bg-primary text-primary-foreground border-2 border-background rounded-full items-center justify-center hover:bg-primary/90 transition-all duration-300 ease-in-out shadow-lg hover:scale-110 z-50",
          sidebarCollapsed ? "left-[56px]" : "left-[244px]"
        )}
        aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {sidebarCollapsed ? (
          <ChevronRight className="w-4 h-4" />
        ) : (
          <ChevronLeft className="w-4 h-4" />
        )}
      </button>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <DashboardSidebar collapsed={false} />
      </div>

      {/* Main Content Area - Flex grow with margin for sidebar */}
      <div
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "lg:ml-[72px]" : "lg:ml-[260px]"
        )}
      >
        <DashboardHeader
          title={title}
          onMobileMenuToggle={() => setMobileMenuOpen((v) => !v)}
        />
        
        {/* Content container with centered wrapper */}
        <main className="flex-1 flex justify-center py-4 lg:py-6">
          <MainContentWrapper>
            {children}
          </MainContentWrapper>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
