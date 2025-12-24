import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  Users,
  Eye,
  Film,
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  Tag,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Competitor {
  id: string;
  channel_name: string;
  channel_url: string;
  thumbnail_url: string | null;
  banner_url: string | null;
  subscriber_count: number;
  video_count: number;
  total_views: number;
  upload_frequency: string | null;
  last_video_date: string | null;
  notes: string | null;
}

interface CompetitorDetailModalProps {
  competitor: Competitor | null;
  isOpen: boolean;
  onClose: () => void;
  userStats: {
    subscribers: number;
    views: number;
    videos: number;
  };
  onUpdate: () => void;
}

// Mock data for recent videos
const mockRecentVideos = [
  { title: "10 Tips for Better Content", views: 125000, date: "2024-01-15", performance: "high" },
  { title: "My Journey as a Creator", views: 89000, date: "2024-01-12", performance: "medium" },
  { title: "Behind the Scenes", views: 67000, date: "2024-01-10", performance: "medium" },
  { title: "Q&A Session", views: 45000, date: "2024-01-08", performance: "low" },
  { title: "Tutorial: Getting Started", views: 156000, date: "2024-01-05", performance: "high" },
];

const mockKeywords = [
  "tutorial", "tips", "guide", "how to", "review", "best", "top 10",
  "gaming", "tech", "lifestyle", "vlog", "challenge", "reaction"
];

const CompetitorDetailModal = ({
  competitor,
  isOpen,
  onClose,
  userStats,
  onUpdate,
}: CompetitorDetailModalProps) => {
  const [notes, setNotes] = useState(competitor?.notes || "");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setNotes(competitor?.notes || "");
  }, [competitor]);

  const saveNotes = async () => {
    if (!competitor) return;
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("competitors")
        .update({ notes })
        .eq("id", competitor.id);

      if (error) throw error;
      toast.success("Notes saved");
      onUpdate();
    } catch (err) {
      toast.error("Failed to save notes");
    } finally {
      setIsSaving(false);
    }
  };

  // Auto-save notes after 2 seconds of inactivity
  useEffect(() => {
    if (!competitor || notes === competitor.notes) return;
    const timer = setTimeout(() => {
      saveNotes();
    }, 2000);
    return () => clearTimeout(timer);
  }, [notes]);

  if (!competitor) return null;

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getPerformanceColor = (perf: string) => {
    switch (perf) {
      case "high": return "text-green-500";
      case "medium": return "text-yellow-500";
      case "low": return "text-red-500";
      default: return "text-muted-foreground";
    }
  };

  const avgViews = competitor.video_count > 0 
    ? Math.floor(competitor.total_views / competitor.video_count) 
    : 0;
  const userAvgViews = userStats.videos > 0 
    ? Math.floor(userStats.views / userStats.videos) 
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          {/* Banner */}
          <div className="relative h-32 -mx-6 -mt-6 mb-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-t-lg overflow-hidden">
            {competitor.banner_url && (
              <img
                src={competitor.banner_url}
                alt="Channel banner"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
          </div>

          {/* Channel Info */}
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground overflow-hidden flex-shrink-0 -mt-10 border-4 border-background">
              {competitor.thumbnail_url ? (
                <img
                  src={competitor.thumbnail_url}
                  alt={competitor.channel_name}
                  className="w-full h-full object-cover"
                />
              ) : (
                competitor.channel_name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-bold text-foreground">
                {competitor.channel_name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                <Users className="w-4 h-4" />
                {formatNumber(competitor.subscriber_count)} subscribers
                <span className="text-green-500 flex items-center">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  +2.5%
                </span>
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a
                href={competitor.channel_url}
                target="_blank"
                rel="noopener noreferrer"
                className="gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                View on YouTube
              </a>
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="comparison" className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="comparison">Comparison</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          {/* Comparison Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Stats Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {/* Headers */}
                  <div className="text-center p-3 rounded-lg bg-primary/10">
                    <p className="text-sm font-medium text-primary">Your Channel</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted">
                    <p className="text-sm font-medium text-foreground">{competitor.channel_name}</p>
                  </div>

                  {/* Subscribers */}
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Users className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold text-foreground">{formatNumber(userStats.subscribers)}</p>
                    <p className="text-xs text-muted-foreground">Subscribers</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Users className="w-5 h-5 mx-auto mb-2 text-blue-500" />
                    <p className="text-2xl font-bold text-foreground">{formatNumber(competitor.subscriber_count)}</p>
                    <p className="text-xs text-muted-foreground">Subscribers</p>
                  </div>

                  {/* Views */}
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Eye className="w-5 h-5 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold text-foreground">{formatNumber(userStats.views)}</p>
                    <p className="text-xs text-muted-foreground">Total Views</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Eye className="w-5 h-5 mx-auto mb-2 text-green-500" />
                    <p className="text-2xl font-bold text-foreground">{formatNumber(competitor.total_views)}</p>
                    <p className="text-xs text-muted-foreground">Total Views</p>
                  </div>

                  {/* Videos */}
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Film className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold text-foreground">{userStats.videos}</p>
                    <p className="text-xs text-muted-foreground">Videos</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <Film className="w-5 h-5 mx-auto mb-2 text-purple-500" />
                    <p className="text-2xl font-bold text-foreground">{competitor.video_count}</p>
                    <p className="text-xs text-muted-foreground">Videos</p>
                  </div>

                  {/* Avg Views */}
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <TrendingUp className="w-5 h-5 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold text-foreground">{formatNumber(userAvgViews)}</p>
                    <p className="text-xs text-muted-foreground">Avg Views/Video</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-muted/50">
                    <TrendingUp className="w-5 h-5 mx-auto mb-2 text-orange-500" />
                    <p className="text-2xl font-bold text-foreground">{formatNumber(avgViews)}</p>
                    <p className="text-xs text-muted-foreground">Avg Views/Video</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Analysis Tab */}
          <TabsContent value="content" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Most Used Keywords
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {mockKeywords.map((keyword, index) => (
                    <Badge
                      key={index}
                      variant="outline"
                      className="text-sm"
                      style={{
                        fontSize: `${Math.max(12, 18 - index)}px`,
                        opacity: 1 - index * 0.05,
                      }}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2 text-base">
                    <Calendar className="w-5 h-5" />
                    Upload Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">
                    {competitor.upload_frequency || "~2 videos/week"}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Typical upload days: Tue, Fri
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground flex items-center gap-2 text-base">
                    <Clock className="w-5 h-5" />
                    Avg Video Length
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-foreground">12:45</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Range: 8min - 25min
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Videos Tab */}
          <TabsContent value="videos" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground">Recent Videos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockRecentVideos.map((video, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-24 h-14 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <Play className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{video.title}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>{formatNumber(video.views)} views</span>
                        <span>{video.date}</span>
                      </div>
                    </div>
                    <div className={cn("text-sm font-medium", getPerformanceColor(video.performance))}>
                      {video.performance === "high" && <TrendingUp className="w-5 h-5" />}
                      {video.performance === "medium" && <span>~</span>}
                      {video.performance === "low" && <TrendingDown className="w-5 h-5" />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center justify-between">
                  <span>Your Notes</span>
                  {isSaving && (
                    <span className="text-xs text-muted-foreground">Saving...</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add notes about this competitor's strategy, content style, what you can learn from them..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="min-h-[200px] bg-background border-border resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Notes auto-save after you stop typing
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default CompetitorDetailModal;
