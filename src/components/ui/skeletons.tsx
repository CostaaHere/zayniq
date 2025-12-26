import { cn } from "@/lib/utils";
import { CSSProperties } from "react";

interface SkeletonProps {
  className?: string;
  style?: CSSProperties;
}

// Base skeleton with pulse animation
const SkeletonPulse = ({ className, style }: SkeletonProps) => (
  <div 
    className={cn(
      "animate-pulse rounded-lg bg-muted/50",
      className
    )}
    style={style}
  />
);

// Stat Card Skeleton - matches dashboard stat cards
export const StatCardSkeleton = () => (
  <div className="bg-card border border-border rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <SkeletonPulse className="w-10 h-10 rounded-xl" />
      <SkeletonPulse className="w-14 h-5" />
    </div>
    <SkeletonPulse className="h-8 w-24 mb-2" />
    <SkeletonPulse className="h-4 w-32" />
  </div>
);

// Video Card Skeleton - matches video grid cards
export const VideoCardSkeleton = () => (
  <div className="bg-card rounded-xl border border-border overflow-hidden">
    {/* Thumbnail */}
    <SkeletonPulse className="aspect-video w-full rounded-none" />
    
    {/* Content */}
    <div className="p-4 space-y-3">
      <SkeletonPulse className="h-5 w-full" />
      <SkeletonPulse className="h-5 w-3/4" />
      <SkeletonPulse className="h-4 w-24" />
      
      {/* Stats */}
      <div className="flex items-center gap-4">
        <SkeletonPulse className="h-4 w-12" />
        <SkeletonPulse className="h-4 w-12" />
        <SkeletonPulse className="h-4 w-12" />
      </div>
      
      <SkeletonPulse className="h-9 w-full" />
    </div>
  </div>
);

// Video List Item Skeleton - for list view
export const VideoListSkeleton = () => (
  <div className="flex gap-4 p-4 bg-card rounded-xl border border-border">
    {/* Thumbnail */}
    <SkeletonPulse className="w-40 aspect-video rounded-lg flex-shrink-0" />
    
    {/* Content */}
    <div className="flex-1 min-w-0 flex flex-col justify-between">
      <div>
        <SkeletonPulse className="h-5 w-3/4 mb-2" />
        <SkeletonPulse className="h-4 w-24" />
      </div>
      
      {/* Stats */}
      <div className="flex items-center gap-4">
        <SkeletonPulse className="h-4 w-12" />
        <SkeletonPulse className="h-4 w-12" />
        <SkeletonPulse className="h-4 w-12" />
      </div>
    </div>
    
    {/* Actions */}
    <div className="flex items-center gap-3">
      <SkeletonPulse className="h-6 w-16 rounded-full" />
      <SkeletonPulse className="h-9 w-20" />
    </div>
  </div>
);

// Table Row Skeleton - for tables like keywords
export const TableRowSkeleton = () => (
  <tr className="border-b border-border/50">
    <td className="py-4">
      <SkeletonPulse className="h-5 w-40" />
    </td>
    <td className="py-4 text-right">
      <SkeletonPulse className="h-5 w-16 ml-auto" />
    </td>
    <td className="py-4">
      <SkeletonPulse className="h-6 w-16 rounded-full" />
    </td>
    <td className="py-4">
      <SkeletonPulse className="h-4 w-4" />
    </td>
    <td className="py-4 text-right">
      <SkeletonPulse className="h-5 w-12 ml-auto" />
    </td>
    <td className="py-4">
      <SkeletonPulse className="h-8 w-8 rounded" />
    </td>
  </tr>
);

// Dashboard Table Row Skeleton - for recent videos table
export const DashboardTableRowSkeleton = () => (
  <tr className="border-b border-border/50">
    <td className="py-4">
      <div className="flex items-center gap-3">
        <SkeletonPulse className="w-20 h-12 rounded-lg flex-shrink-0" />
        <SkeletonPulse className="h-5 w-48" />
      </div>
    </td>
    <td className="py-4">
      <SkeletonPulse className="h-5 w-12" />
    </td>
    <td className="py-4">
      <SkeletonPulse className="h-5 w-10" />
    </td>
    <td className="py-4">
      <SkeletonPulse className="h-5 w-24" />
    </td>
    <td className="py-4">
      <SkeletonPulse className="h-6 w-12 rounded-full" />
    </td>
  </tr>
);

// Chart Skeleton - for recharts containers
export const ChartSkeleton = ({ className }: SkeletonProps) => (
  <div className={cn("bg-card border border-border rounded-2xl p-6", className)}>
    <SkeletonPulse className="h-6 w-40 mb-2" />
    <SkeletonPulse className="h-4 w-24 mb-4" />
    <div className="h-64 relative">
      {/* Grid lines simulation */}
      <div className="absolute inset-0 flex flex-col justify-between">
        {[...Array(5)].map((_, i) => (
          <SkeletonPulse key={i} className="h-px w-full opacity-30" />
        ))}
      </div>
      {/* Bar/line simulation */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around h-56 px-4">
        {[...Array(7)].map((_, i) => (
          <SkeletonPulse
            key={i}
            className="w-8 rounded-t"
            style={{ height: `${30 + Math.random() * 60}%` }}
          />
        ))}
      </div>
    </div>
  </div>
);

// Metric Card Skeleton - for keyword metrics
export const MetricCardSkeleton = () => (
  <div className="bg-card border border-border rounded-xl p-6">
    <div className="flex items-center gap-3">
      <SkeletonPulse className="w-10 h-10 rounded-lg" />
      <div className="flex-1">
        <SkeletonPulse className="h-4 w-24 mb-2" />
        <SkeletonPulse className="h-7 w-20" />
      </div>
    </div>
  </div>
);

// Full Page Loading Skeleton
export const PageLoadingSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 rounded-full border-4 border-muted animate-pulse" />
        <div className="absolute inset-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin" />
      </div>
      <div className="text-muted-foreground animate-pulse">Loading...</div>
    </div>
  </div>
);

// Auth Loading State
export const AuthLoadingSkeleton = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-accent opacity-20 animate-pulse" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        </div>
      </div>
      <div className="space-y-2 text-center">
        <SkeletonPulse className="h-6 w-40 mx-auto" />
        <SkeletonPulse className="h-4 w-56 mx-auto" />
      </div>
    </div>
  </div>
);

// Dashboard Page Skeleton
export const DashboardSkeleton = () => (
  <div className="space-y-8">
    {/* Welcome Section */}
    <div className="mb-8">
      <SkeletonPulse className="h-8 w-64 mb-2" />
      <SkeletonPulse className="h-5 w-48" />
    </div>

    {/* Stats Grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>

    {/* Charts */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>

    {/* Recent Videos Table */}
    <div className="bg-card border border-border rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <SkeletonPulse className="h-6 w-32" />
        <SkeletonPulse className="h-8 w-20" />
      </div>
      <table className="w-full">
        <thead>
          <tr className="text-left border-b border-border">
            <th className="pb-3"><SkeletonPulse className="h-4 w-16" /></th>
            <th className="pb-3"><SkeletonPulse className="h-4 w-12" /></th>
            <th className="pb-3"><SkeletonPulse className="h-4 w-10" /></th>
            <th className="pb-3"><SkeletonPulse className="h-4 w-20" /></th>
            <th className="pb-3"><SkeletonPulse className="h-4 w-20" /></th>
          </tr>
        </thead>
        <tbody>
          {[...Array(4)].map((_, i) => (
            <DashboardTableRowSkeleton key={i} />
          ))}
        </tbody>
      </table>
    </div>

    {/* Quick Actions */}
    <div className="bg-card border border-border rounded-2xl p-6">
      <SkeletonPulse className="h-6 w-32 mb-4" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <SkeletonPulse key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    </div>
  </div>
);

// Videos Page Skeleton
export const VideosSkeleton = () => (
  <div className="space-y-6">
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <SkeletonPulse className="h-5 w-64" />
      <SkeletonPulse className="h-10 w-36" />
    </div>

    {/* Filters */}
    <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl border border-border">
      <SkeletonPulse className="h-10 flex-1" />
      <SkeletonPulse className="h-10 w-32" />
      <SkeletonPulse className="h-10 w-36" />
      <SkeletonPulse className="h-10 w-20" />
    </div>

    {/* Video Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <VideoCardSkeleton key={i} />
      ))}
    </div>
  </div>
);

// Keywords Page Skeleton
export const KeywordsSkeleton = () => (
  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
    {/* Main Content */}
    <div className="lg:col-span-3 space-y-6">
      {/* Search Card */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex gap-3">
          <SkeletonPulse className="h-12 flex-1" />
          <SkeletonPulse className="h-12 w-28" />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <MetricCardSkeleton key={i} />
        ))}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl p-6">
        <SkeletonPulse className="h-6 w-40 mb-4" />
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="pb-3"><SkeletonPulse className="h-4 w-20" /></th>
              <th className="pb-3"><SkeletonPulse className="h-4 w-24" /></th>
              <th className="pb-3"><SkeletonPulse className="h-4 w-20" /></th>
              <th className="pb-3"><SkeletonPulse className="h-4 w-12" /></th>
              <th className="pb-3"><SkeletonPulse className="h-4 w-10" /></th>
              <th className="pb-3"><SkeletonPulse className="h-4 w-8" /></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <TableRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    </div>

    {/* Sidebar */}
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <SkeletonPulse className="h-6 w-32" />
          <SkeletonPulse className="h-8 w-8 rounded" />
        </div>
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => (
            <SkeletonPulse key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Content Generation Skeleton
export const GenerationSkeleton = () => (
  <div className="space-y-4">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-start gap-3">
          <SkeletonPulse className="w-6 h-6 rounded-full flex-shrink-0" />
          <div className="flex-1">
            <SkeletonPulse className="h-5 w-full mb-2" />
            <SkeletonPulse className="h-5 w-2/3" />
          </div>
          <SkeletonPulse className="w-8 h-8 rounded" />
        </div>
      </div>
    ))}
  </div>
);

// Inline Loading Spinner
export const LoadingSpinner = ({ size = "default" }: { size?: "sm" | "default" | "lg" }) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    default: "w-6 h-6 border-2",
    lg: "w-8 h-8 border-3",
  };

  return (
    <div
      className={cn(
        "rounded-full border-muted border-t-primary animate-spin",
        sizeClasses[size]
      )}
    />
  );
};
