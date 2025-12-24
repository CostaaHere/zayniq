import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import SEOAnalysisPanel from "@/components/video/SEOAnalysisPanel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  Calendar,
  Clock,
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { toast } from "sonner";

// Mock data for demonstration
const mockVideo = {
  id: "1",
  thumbnail: "https://images.unsplash.com/photo-1611162616475-46b635cb6868?w=800&h=450&fit=crop",
  title: "Complete YouTube SEO Guide 2024 - Rank #1 on YouTube",
  description: `In this comprehensive guide, I'll show you exactly how to optimize your YouTube videos for maximum visibility and growth.

We'll cover:
- Keyword research techniques
- Title optimization strategies
- Description best practices
- Tag optimization
- Thumbnail design tips
- Engagement tactics

This video is perfect for beginners and experienced creators alike who want to improve their YouTube SEO game.

🔗 Resources mentioned:
- TubeBuddy: https://tubebuddy.com
- VidIQ: https://vidiq.com

📱 Follow me:
Twitter: @techcreatorpro
Instagram: @techcreatorpro`,
  publishedAt: "2024-01-15T14:30:00",
  duration: "15:42",
  tags: ["YouTube SEO", "YouTube Tips", "Grow YouTube Channel", "Video Marketing", "SEO Tutorial"],
  views: 450000,
  likes: 28000,
  comments: 1200,
  shares: 3500,
  youtubeUrl: "https://youtube.com/watch?v=example",
};

const viewsOverTime = [
  { date: "Day 1", views: 45000 },
  { date: "Day 2", views: 85000 },
  { date: "Day 3", views: 120000 },
  { date: "Day 7", views: 220000 },
  { date: "Day 14", views: 320000 },
  { date: "Day 30", views: 450000 },
];

const trafficSources = [
  { name: "Search", value: 45, color: "hsl(var(--primary))" },
  { name: "Suggested", value: 30, color: "hsl(var(--accent))" },
  { name: "Browse", value: 15, color: "hsl(142, 76%, 36%)" },
  { name: "External", value: 10, color: "hsl(48, 96%, 53%)" },
];

const seoData = {
  overallScore: 72,
  titleScore: 85,
  titleFeedback: "Good use of keywords. Consider adding a power word for higher CTR.",
  descriptionScore: 65,
  descriptionFeedback: "Description could be longer. Add more keywords in the first 150 characters.",
  tagsScore: 58,
  tagsFeedback: "Add more long-tail keywords. Current tags are too competitive.",
  recommendations: [
    "Add timestamps to improve watch time and user experience",
    "Include a call-to-action in the first 100 characters of description",
    "Add 3-5 more specific long-tail keyword tags",
    "Consider A/B testing a different thumbnail with text overlay",
  ],
};

const formatNumber = (num: number): string => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const VideoDetail = () => {
  const { id } = useParams();
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const handleImproveWithAI = (section: string) => {
    toast.info(`AI improvement for ${section} coming soon!`);
  };

  // In a real app, fetch video by id
  const video = mockVideo;

  return (
    <DashboardLayout title="Video Details">
      <div className="space-y-6">
        {/* Back Button */}
        <Link
          to="/dashboard/videos"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Videos
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center hover:bg-red-700 transition-colors"
                  >
                    <Play className="w-8 h-8 text-white fill-white ml-1" />
                  </a>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Title */}
                <div className="flex items-start justify-between gap-4">
                  <h1 className="text-xl font-bold">{video.title}</h1>
                  <Button variant="ghost" size="sm" className="gap-1.5 flex-shrink-0" onClick={() => handleImproveWithAI("title")}>
                    <Sparkles className="w-4 h-4" />
                    Improve
                  </Button>
                </div>

                {/* Meta */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {formatDate(video.publishedAt)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {video.duration}
                  </span>
                  <a
                    href={video.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-primary hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on YouTube
                  </a>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-border">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                      <Eye className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold">{formatNumber(video.views)}</div>
                    <div className="text-xs text-muted-foreground">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                      <ThumbsUp className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold">{formatNumber(video.likes)}</div>
                    <div className="text-xs text-muted-foreground">Likes</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold">{formatNumber(video.comments)}</div>
                    <div className="text-xs text-muted-foreground">Comments</div>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1.5 text-muted-foreground mb-1">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div className="text-lg font-bold">{formatNumber(video.shares)}</div>
                    <div className="text-xs text-muted-foreground">Shares</div>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Description</h3>
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => handleImproveWithAI("description")}>
                      <Sparkles className="w-4 h-4" />
                      Improve
                    </Button>
                  </div>
                  <div
                    className={cn(
                      "text-sm text-muted-foreground whitespace-pre-wrap",
                      !descriptionExpanded && "line-clamp-4"
                    )}
                  >
                    {video.description}
                  </div>
                  <button
                    onClick={() => setDescriptionExpanded(!descriptionExpanded)}
                    className="flex items-center gap-1 text-sm text-primary hover:underline mt-2"
                  >
                    {descriptionExpanded ? (
                      <>
                        Show less <ChevronUp className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Show more <ChevronDown className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium">Tags</h3>
                    <Button variant="ghost" size="sm" className="gap-1.5" onClick={() => handleImproveWithAI("tags")}>
                      <Sparkles className="w-4 h-4" />
                      Improve
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {video.tags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-6">
              <h3 className="text-lg font-semibold">Performance Metrics</h3>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">4.2%</div>
                  <div className="text-sm text-muted-foreground">Engagement Rate</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">6:24</div>
                  <div className="text-sm text-muted-foreground">Avg View Duration</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">42%</div>
                  <div className="text-sm text-muted-foreground">Retention Rate</div>
                </div>
                <div className="p-4 bg-muted/30 rounded-lg text-center">
                  <div className="text-2xl font-bold text-primary">8.5%</div>
                  <div className="text-sm text-muted-foreground">CTR</div>
                </div>
              </div>

              {/* Views Over Time Chart */}
              <div>
                <h4 className="font-medium mb-4">Views Over Time</h4>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={viewsOverTime}>
                      <defs>
                        <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                      <XAxis dataKey="date" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "8px",
                        }}
                        formatter={(value: number) => [formatNumber(value), "Views"]}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--primary))"
                        fill="url(#viewsGradient)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Traffic Sources */}
              <div>
                <h4 className="font-medium mb-4">Traffic Sources</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={trafficSources}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {trafficSources.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                          formatter={(value: number) => [`${value}%`, ""]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-3">
                    {trafficSources.map((source) => (
                      <div key={source.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: source.color }}
                          />
                          <span className="text-sm">{source.name}</span>
                        </div>
                        <span className="text-sm font-medium">{source.value}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - SEO Analysis */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <SEOAnalysisPanel
                overallScore={seoData.overallScore}
                titleScore={seoData.titleScore}
                titleFeedback={seoData.titleFeedback}
                descriptionScore={seoData.descriptionScore}
                descriptionFeedback={seoData.descriptionFeedback}
                tagsScore={seoData.tagsScore}
                tagsFeedback={seoData.tagsFeedback}
                recommendations={seoData.recommendations}
                onImproveTitle={() => handleImproveWithAI("title")}
                onImproveDescription={() => handleImproveWithAI("description")}
                onImproveTags={() => handleImproveWithAI("tags")}
              />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default VideoDetail;
