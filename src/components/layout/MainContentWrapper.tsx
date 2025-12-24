import { cn } from "@/lib/utils";

interface MainContentWrapperProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * MainContentWrapper - Global container for all page content
 * Provides consistent max-width, centering, and responsive padding
 * across all dashboard pages.
 */
const MainContentWrapper = ({ children, className }: MainContentWrapperProps) => {
  return (
    <div
      className={cn(
        "w-full max-w-[1280px] mx-auto",
        "px-4 md:px-5 lg:px-6",
        className
      )}
    >
      {children}
    </div>
  );
};

export default MainContentWrapper;
