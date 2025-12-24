import { useState } from "react";
import DashboardSidebar from "./DashboardSidebar";
import DashboardHeader from "./DashboardHeader";
import MainContentWrapper from "@/components/layout/MainContentWrapper";
import { cn } from "@/lib/utils";

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
      {/* Desktop Sidebar - Fixed */}
      <aside
        className={cn(
          "hidden lg:flex flex-col fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out",
          sidebarCollapsed ? "w-[72px]" : "w-[260px]"
        )}
      >
        <DashboardSidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 lg:hidden transition-transform duration-300 ease-in-out",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <DashboardSidebar
          collapsed={false}
          onToggle={handleSidebarToggle}
        />
      </aside>

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
