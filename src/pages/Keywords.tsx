import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Bookmark,
  BookmarkCheck,
  Clock,
  Download,
  Target,
  BarChart3,
  Zap,
  X,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import AIKeywordGenerator from "@/components/keywords/AIKeywordGenerator";

interface KeywordResult {
  keyword: string;
  monthlySearches: number;
  competition: "Low" | "Medium" | "High";
  trend: "up" | "down" | "stable";
  cpc: number;
}

const Keywords = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "youtube seo tips",
    "how to grow youtube channel",
    "video editing tutorial",
  ]);
  const [savedKeywords, setSavedKeywords] = useState<KeywordResult[]>([]);

  // Mock search results
  const [mainKeyword, setMainKeyword] = useState("");
  const [metrics, setMetrics] = useState({
    searchVolume: 0,
    competition: 0,
    opportunityScore: 0,
  });
  const [relatedKeywords, setRelatedKeywords] = useState<KeywordResult[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Add to recent searches
    if (!recentSearches.includes(searchQuery)) {
      setRecentSearches((prev) => [searchQuery, ...prev.slice(0, 4)]);
    }

    // Mock data
    setMainKeyword(searchQuery);
    setMetrics({
      searchVolume: Math.floor(Math.random() * 100000) + 10000,
      competition: Math.floor(Math.random() * 100),
      opportunityScore: Math.floor(Math.random() * 100),
    });

    setRelatedKeywords([
      {
        keyword: `${searchQuery} tutorial`,
        monthlySearches: 45000,
        competition: "Medium",
        trend: "up",
        cpc: 1.25,
      },
      {
        keyword: `${searchQuery} for beginners`,
        monthlySearches: 32000,
        competition: "Low",
        trend: "up",
        cpc: 0.85,
      },
      {
        keyword: `best ${searchQuery}`,
        monthlySearches: 28000,
        competition: "High",
        trend: "stable",
        cpc: 2.1,
      },
      {
        keyword: `${searchQuery} tips`,
        monthlySearches: 22000,
        competition: "Low",
        trend: "up",
        cpc: 0.65,
      },
      {
        keyword: `${searchQuery} guide`,
        monthlySearches: 18000,
        competition: "Medium",
        trend: "down",
        cpc: 1.45,
      },
      {
        keyword: `how to ${searchQuery}`,
        monthlySearches: 15000,
        competition: "Low",
        trend: "up",
        cpc: 0.55,
      },
      {
        keyword: `${searchQuery} examples`,
        monthlySearches: 12000,
        competition: "Medium",
        trend: "stable",
        cpc: 1.15,
      },
      {
        keyword: `${searchQuery} 2024`,
        monthlySearches: 9500,
        competition: "Low",
        trend: "up",
        cpc: 0.95,
      },
    ]);

    setIsLoading(false);
  };

  const handleSaveKeyword = (keyword: KeywordResult) => {
    const isAlreadySaved = savedKeywords.some((k) => k.keyword === keyword.keyword);
    if (isAlreadySaved) {
      setSavedKeywords((prev) => prev.filter((k) => k.keyword !== keyword.keyword));
      toast.success("Keyword removed from saved list");
    } else {
      setSavedKeywords((prev) => [...prev, keyword]);
      toast.success("Keyword saved successfully");
    }
  };

  const exportSavedKeywords = () => {
    if (savedKeywords.length === 0) {
      toast.error("No saved keywords to export");
      return;
    }

    const headers = ["Keyword", "Monthly Searches", "Competition", "Trend", "CPC"];
    const csvContent = [
      headers.join(","),
      ...savedKeywords.map((k) =>
        [k.keyword, k.monthlySearches, k.competition, k.trend, `$${k.cpc}`].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "saved-keywords.csv";
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success("Keywords exported successfully");
  };

  const getCompetitionColor = (competition: string) => {
    switch (competition) {
      case "Low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "Medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "High":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const isKeywordSaved = (keyword: string) => {
    return savedKeywords.some((k) => k.keyword === keyword);
  };

  const handleSaveFromAI = (keyword: string) => {
    const isAlreadySaved = savedKeywords.some((k) => k.keyword === keyword);
    if (isAlreadySaved) {
      setSavedKeywords((prev) => prev.filter((k) => k.keyword !== keyword));
      toast.success("Keyword removed from saved list");
    } else {
      const newKeyword: KeywordResult = {
        keyword,
        monthlySearches: Math.floor(Math.random() * 50000) + 5000,
        competition: ["Low", "Medium", "High"][Math.floor(Math.random() * 3)] as "Low" | "Medium" | "High",
        trend: ["up", "down", "stable"][Math.floor(Math.random() * 3)] as "up" | "down" | "stable",
        cpc: parseFloat((Math.random() * 2 + 0.5).toFixed(2)),
      };
      setSavedKeywords((prev) => [...prev, newKeyword]);
      toast.success("Keyword saved successfully");
    }
  };

  return (
    <DashboardLayout title="Keyword Research">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Tabs for Search vs AI */}
          <Tabs defaultValue="search" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="search" className="gap-2">
                <Search className="w-4 h-4" />
                Keyword Search
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="w-4 h-4" />
                AI Suggestions
              </TabsTrigger>
            </TabsList>

            <TabsContent value="search" className="space-y-6">
              {/* Search Section */}
          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter a keyword or topic..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-12 h-12 text-lg bg-background border-border"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  disabled={isLoading || !searchQuery.trim()}
                  className="h-12 px-8 bg-primary hover:bg-primary/90"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {/* Recent Searches */}
              {recentSearches.length > 0 && !hasSearched && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Recent Searches
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((search, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted transition-colors"
                        onClick={() => {
                          setSearchQuery(search);
                          handleSearch();
                        }}
                      >
                        {search}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-card border-border">
                    <CardContent className="pt-6">
                      <Skeleton className="h-4 w-24 mb-2" />
                      <Skeleton className="h-8 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
              <Card className="bg-card border-border">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results */}
          {hasSearched && !isLoading && (
            <div className="space-y-6">
              {/* Main Keyword Heading */}
              <div>
                <h2 className="text-2xl font-bold text-foreground">"{mainKeyword}"</h2>
                <p className="text-muted-foreground">
                  Showing keyword analysis and related terms
                </p>
              </div>

              {/* Metrics Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Search Volume</p>
                        <p className="text-2xl font-bold text-foreground">
                          {metrics.searchVolume.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                        <Target className="w-5 h-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Competition</p>
                        <p className="text-2xl font-bold text-foreground">
                          {metrics.competition}%
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                        <Zap className="w-5 h-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Opportunity Score</p>
                        <p className="text-2xl font-bold text-foreground">
                          {metrics.opportunityScore}/100
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Related Keywords Table */}
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="text-foreground">Related Keywords</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Keyword</TableHead>
                        <TableHead className="text-muted-foreground text-right">
                          Monthly Searches
                        </TableHead>
                        <TableHead className="text-muted-foreground">Competition</TableHead>
                        <TableHead className="text-muted-foreground">Trend</TableHead>
                        <TableHead className="text-muted-foreground text-right">CPC</TableHead>
                        <TableHead className="text-muted-foreground w-[80px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {relatedKeywords.map((keyword, index) => (
                        <TableRow key={index} className="border-border">
                          <TableCell className="font-medium text-foreground">
                            {keyword.keyword}
                          </TableCell>
                          <TableCell className="text-right text-foreground">
                            {keyword.monthlySearches.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={cn(getCompetitionColor(keyword.competition))}
                            >
                              {keyword.competition}
                            </Badge>
                          </TableCell>
                          <TableCell>{getTrendIcon(keyword.trend)}</TableCell>
                          <TableCell className="text-right text-foreground">
                            ${keyword.cpc.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleSaveKeyword(keyword)}
                              className={cn(
                                "hover:bg-muted",
                                isKeywordSaved(keyword.keyword) && "text-primary"
                              )}
                            >
                              {isKeywordSaved(keyword.keyword) ? (
                                <BookmarkCheck className="w-4 h-4" />
                              ) : (
                                <Bookmark className="w-4 h-4" />
                              )}
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Empty State */}
          {!hasSearched && !isLoading && (
            <Card className="bg-card border-border">
              <CardContent className="py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Start Your Keyword Research
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter a keyword or topic above to discover search volumes, competition
                  levels, and related keywords for your YouTube content.
                </p>
              </CardContent>
            </Card>
          )}
            </TabsContent>

            <TabsContent value="ai">
              <AIKeywordGenerator
                onSaveKeyword={handleSaveFromAI}
                savedKeywords={savedKeywords.map((k) => k.keyword)}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Saved Keywords Sidebar */}
        <div className="lg:col-span-1">
          <Card className="bg-card border-border sticky top-24">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-foreground flex items-center gap-2">
                <Bookmark className="w-5 h-5" />
                Saved Keywords
              </CardTitle>
              {savedKeywords.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportSavedKeywords}
                  className="border-border hover:bg-muted"
                >
                  <Download className="w-4 h-4 mr-1" />
                  CSV
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {savedKeywords.length === 0 ? (
                <div className="text-center py-8">
                  <BookmarkCheck className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No saved keywords yet. Click the bookmark icon to save keywords.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedKeywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50 group"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {keyword.keyword}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {keyword.monthlySearches.toLocaleString()} searches
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSaveKeyword(keyword)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-destructive/10 hover:text-destructive"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Keywords;
