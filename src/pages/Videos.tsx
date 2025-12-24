import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Grid3X3,
  List,
  Eye,
  ThumbsUp,
  MessageCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Video,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoItem {
  id: string;
  thumbnail: string;
  title: string;
  publishedAt: string;
  views: number;
  likes: number;
  comments: number;
  seoScore: number;
}

// Mock data for demonstration
const mockVideos: VideoItem[] = [
  {
    id: "1",
    thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=320&h=180&fit=crop",
    title: "How to Grow Your YouTube Channel in 2024 - Complete Guide",
    publishedAt: "2024-01-15",
    views: 125000,
    likes: 8500,
    comments: 342,
    seoScore: 85,
  },
  {
    id: "2",
    thumbnail: "https://images.unsplash.com/photo-1626785774625-ddcddc3445e9?w=320&h=180&fit=crop",
    title: "YouTube SEO Tips That Actually Work",
    publishedAt: "2024-01-10",
    views: 89000,
    likes: 5200,
    comments: 198,
    seoScore: 72,
  },
  {
    id: "3",
    thumbnail: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?w=320&h=180&fit=crop",
    title: "Best Camera Settings for YouTube Videos",
    publishedAt: "2024-01-05",
    views: 45000,
    likes: 3100,
    comments: 156,
    seoScore: 45,
  },
  {
    id: "4",
    thumbnail: "https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=320&h=180&fit=crop",
    title: "Editing Workflow for Faster Video Production",
    publishedAt: "2024-01-02",
    views: 67000,
    likes: 4300,
    comments: 221,
    seoScore: 68,
  },
  {
    id: "5",
    thumbnail: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=320&h=180&fit=crop",
    title: "How I Edit My YouTube Videos - Full Tutorial",
    publishedAt: "2023-12-28",
    views: 112000,
    likes: 7800,
    comments: 445,
    seoScore: 91,
  },
  {
    id: "6",
    thumbnail: "https://images.unsplash.com/photo-1551817958-20204d6ab212?w=320&h=180&fit=crop",
    title: "YouTube Algorithm Explained 2024",
    publishedAt: "2023-12-20",
    views: 234000,
    likes: 15600,
    comments: 892,
    seoScore: 88,
  },
];

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const getSeoScoreColor = (score: number): string => {
  if (score >= 75) return "bg-green-500/10 text-green-500 border-green-500/20";
  if (score >= 50) return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
  return "bg-red-500/10 text-red-500 border-red-500/20";
};

const Videos = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [dateFilter, setDateFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter and sort videos
  const filteredVideos = mockVideos
    .filter((video) =>
      video.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((video) => {
      if (dateFilter === "all") return true;
      const videoDate = new Date(video.publishedAt);
      const now = new Date();
      const diffDays = Math.floor(
        (now.getTime() - videoDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (dateFilter === "7days") return diffDays <= 7;
      if (dateFilter === "30days") return diffDays <= 30;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "views":
          return b.views - a.views;
        case "likes":
          return b.likes - a.likes;
        case "seo":
          return b.seoScore - a.seoScore;
        default:
          return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
    });

  const totalPages = Math.ceil(filteredVideos.length / itemsPerPage);
  const paginatedVideos = filteredVideos.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <DashboardLayout title="Videos">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-muted-foreground">
            Manage and analyze your YouTube videos
          </p>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Add Video by URL
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-card rounded-xl border border-border">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Sort */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="views">Views</SelectItem>
              <SelectItem value="likes">Likes</SelectItem>
              <SelectItem value="seo">SEO Score</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Filter */}
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Date range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>

          {/* View Toggle */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "grid"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-md transition-colors",
                viewMode === "list"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Videos Grid/List */}
        {paginatedVideos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 bg-card rounded-xl border border-border">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No videos found</h3>
            <p className="text-muted-foreground text-center max-w-md mb-6">
              {searchQuery
                ? "No videos match your search. Try adjusting your filters."
                : "You haven't added any videos yet. Add your first video to get started."}
            </p>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Video by URL
            </Button>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginatedVideos.map((video) => (
              <div
                key={video.id}
                className="bg-card rounded-xl border border-border overflow-hidden hover:border-primary/50 transition-colors group"
              >
                {/* Thumbnail */}
                <div className="relative aspect-video overflow-hidden">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge
                    className={cn(
                      "absolute top-2 right-2 border",
                      getSeoScoreColor(video.seoScore)
                    )}
                  >
                    SEO: {video.seoScore}
                  </Badge>
                </div>

                {/* Content */}
                <div className="p-4 space-y-3">
                  <h3 className="font-medium line-clamp-2 leading-snug">
                    {video.title}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    {new Date(video.publishedAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatNumber(video.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {formatNumber(video.likes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {formatNumber(video.comments)}
                    </span>
                  </div>

                  <Button variant="outline" size="sm" className="w-full">
                    Analyze
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {paginatedVideos.map((video) => (
              <div
                key={video.id}
                className="flex gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
              >
                {/* Thumbnail */}
                <div className="relative w-40 aspect-video rounded-lg overflow-hidden flex-shrink-0">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h3 className="font-medium line-clamp-1">{video.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {new Date(video.publishedAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {formatNumber(video.views)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {formatNumber(video.likes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {formatNumber(video.comments)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Badge
                    className={cn(
                      "border",
                      getSeoScoreColor(video.seoScore)
                    )}
                  >
                    SEO: {video.seoScore}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Analyze
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Videos;
