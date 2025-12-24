import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Heart,
  Star,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedTitle {
  title: string;
  powerWords: string[];
}

const POWER_WORDS = [
  "ultimate", "essential", "secret", "proven", "amazing", "incredible",
  "simple", "easy", "fast", "complete", "free", "best", "top", "new",
  "exclusive", "powerful", "shocking", "guaranteed", "instant", "breakthrough"
];

const TitleGenerator = () => {
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [tone, setTone] = useState("educational");
  const [includeEmoji, setIncludeEmoji] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [titles, setTitles] = useState<GeneratedTitle[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a video topic");
      return;
    }

    setIsLoading(true);
    setTitles([]);

    try {
      const { data, error } = await supabase.functions.invoke("generate-titles", {
        body: { topic, keyword, tone, includeEmoji },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setTitles(data.titles || []);
      toast.success("Generated 10 title options!");
    } catch (err) {
      console.error("Error generating titles:", err);
      toast.error("Failed to generate titles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (title: string, index: number) => {
    await navigator.clipboard.writeText(title);
    setCopiedIndex(index);
    toast.success("Title copied to clipboard!");
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleUseThis = async (title: string, index: number) => {
    await navigator.clipboard.writeText(title);
    setCopiedIndex(index);
    toast.success("Title copied! Ready to use.");
  };

  const toggleFavorite = (title: string) => {
    if (favorites.includes(title)) {
      setFavorites(favorites.filter((f) => f !== title));
      toast.success("Removed from favorites");
    } else {
      setFavorites([...favorites, title]);
      toast.success("Added to favorites");
    }
  };

  const highlightPowerWords = (title: string, powerWords: string[]) => {
    let result = title;
    const allPowerWords = [...powerWords, ...POWER_WORDS];
    
    allPowerWords.forEach((word) => {
      const regex = new RegExp(`\\b(${word})\\b`, "gi");
      result = result.replace(
        regex,
        '<span class="text-primary font-semibold">$1</span>'
      );
    });
    
    return result;
  };

  const getKeywordIndicator = (title: string) => {
    if (!keyword) return null;
    const lowerTitle = title.toLowerCase();
    const lowerKeyword = keyword.toLowerCase();
    const position = lowerTitle.indexOf(lowerKeyword);
    
    if (position === -1) return { position: "none", color: "bg-muted text-muted-foreground" };
    if (position < 20) return { position: "start", color: "bg-green-500/10 text-green-500" };
    if (position < 40) return { position: "middle", color: "bg-yellow-500/10 text-yellow-500" };
    return { position: "end", color: "bg-orange-500/10 text-orange-500" };
  };

  return (
    <DashboardLayout title="AI Title Generator">
      <div className="space-y-6">
        {/* Back Navigation */}
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/dashboard/ai-tools">
            <ArrowLeft className="w-4 h-4" />
            Back to AI Tools
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Generate Titles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Topic Input */}
                <div className="space-y-2">
                  <Label htmlFor="topic">Video Topic/Description *</Label>
                  <Textarea
                    id="topic"
                    placeholder="E.g., A tutorial on how to edit videos like a pro using DaVinci Resolve..."
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="min-h-[100px] bg-background"
                  />
                </div>

                {/* Target Keyword */}
                <div className="space-y-2">
                  <Label htmlFor="keyword">Target Keyword (optional)</Label>
                  <Input
                    id="keyword"
                    placeholder="E.g., video editing"
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="bg-background"
                  />
                </div>

                {/* Tone Selector */}
                <div className="space-y-2">
                  <Label>Tone</Label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="educational">Educational</SelectItem>
                      <SelectItem value="entertaining">Entertaining</SelectItem>
                      <SelectItem value="dramatic">Dramatic</SelectItem>
                      <SelectItem value="clickbait">Clickbait</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Include Emoji Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="emoji">Include Emojis</Label>
                  <Switch
                    id="emoji"
                    checked={includeEmoji}
                    onCheckedChange={setIncludeEmoji}
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !topic.trim()}
                  className="w-full gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Titles
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Favorites */}
            {favorites.length > 0 && (
              <Card className="bg-card border-border">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Heart className="w-4 h-4 text-red-500" />
                    Saved Favorites ({favorites.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {favorites.map((fav, i) => (
                    <div
                      key={i}
                      className="p-2 rounded-lg bg-muted/50 text-sm flex items-start justify-between gap-2"
                    >
                      <span className="line-clamp-2">{fav}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 flex-shrink-0"
                        onClick={() => handleCopy(fav, -1)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Results Section */}
          <div className="lg:col-span-2">
            <Card className="bg-card border-border min-h-[400px]">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>
                  {titles.length > 0 ? "Generated Titles" : "Results"}
                </CardTitle>
                {titles.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="gap-2"
                  >
                    <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
                    Regenerate
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Generating creative titles...</p>
                  </div>
                ) : titles.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Titles Yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      Enter your video topic and click "Generate Titles" to get 10 AI-powered
                      title suggestions optimized for clicks and SEO.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {titles.map((item, index) => {
                      const keywordInfo = getKeywordIndicator(item.title);
                      const isCopied = copiedIndex === index;
                      const isFavorite = favorites.includes(item.title);

                      return (
                        <div
                          key={index}
                          className="p-4 rounded-xl bg-muted/30 border border-border hover:border-primary/30 transition-colors"
                        >
                          {/* Title with power words highlighted */}
                          <p
                            className="font-medium text-lg mb-3"
                            dangerouslySetInnerHTML={{
                              __html: highlightPowerWords(item.title, item.powerWords || []),
                            }}
                          />

                          {/* Meta info */}
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Badge variant="outline" className="text-xs">
                              {item.title.length} chars
                            </Badge>
                            {keywordInfo && keywordInfo.position !== "none" && (
                              <Badge className={cn("text-xs", keywordInfo.color)}>
                                Keyword: {keywordInfo.position}
                              </Badge>
                            )}
                            {item.powerWords?.length > 0 && (
                              <Badge className="text-xs bg-primary/10 text-primary">
                                {item.powerWords.length} power words
                              </Badge>
                            )}
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCopy(item.title, index)}
                              className="gap-2"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              Copy
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleUseThis(item.title, index)}
                              className="gap-2"
                            >
                              {isCopied ? (
                                <Check className="w-3 h-3" />
                              ) : (
                                <Star className="w-3 h-3" />
                              )}
                              Use This
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleFavorite(item.title)}
                              className={cn(
                                "h-8 w-8",
                                isFavorite && "text-red-500"
                              )}
                            >
                              <Heart
                                className={cn("w-4 h-4", isFavorite && "fill-current")}
                              />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TitleGenerator;
