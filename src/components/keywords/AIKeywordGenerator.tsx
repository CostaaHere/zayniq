import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Copy,
  Bookmark,
  BookmarkCheck,
  Lightbulb,
  HelpCircle,
  TrendingUp,
  Target,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface KeywordItem {
  keyword: string;
  difficulty: "low" | "medium" | "high";
}

interface GeneratedKeywords {
  primary_keywords: KeywordItem[];
  longtail_keywords: KeywordItem[];
  question_keywords: KeywordItem[];
  trending_topics: KeywordItem[];
}

const niches = [
  "Gaming",
  "Tech & Gadgets",
  "Beauty & Fashion",
  "Health & Fitness",
  "Food & Cooking",
  "Travel & Lifestyle",
  "Education & Tutorials",
  "Entertainment",
  "Business & Finance",
  "Music",
  "Sports",
  "DIY & Crafts",
  "Vlogs",
  "News & Politics",
  "Science",
  "Other",
];

interface AIKeywordGeneratorProps {
  onSaveKeyword: (keyword: string) => void;
  savedKeywords: string[];
}

const AIKeywordGenerator = ({ onSaveKeyword, savedKeywords }: AIKeywordGeneratorProps) => {
  const [topic, setTopic] = useState("");
  const [niche, setNiche] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GeneratedKeywords | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please describe your video topic");
      return;
    }

    setIsLoading(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-keywords", {
        body: { topic: topic.trim(), niche: niche || undefined },
      });

      if (error) {
        console.error("Error generating keywords:", error);
        toast.error(error.message || "Failed to generate keywords");
        return;
      }

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResults(data);
      toast.success("Keywords generated successfully!");
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to generate keywords. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const isKeywordSaved = (keyword: string) => savedKeywords.includes(keyword);

  const KeywordList = ({
    title,
    icon: Icon,
    keywords,
    iconColor,
  }: {
    title: string;
    icon: React.ElementType;
    keywords: KeywordItem[];
    iconColor: string;
  }) => (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
          <Icon className={cn("w-4 h-4", iconColor)} />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {keywords.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <span className="text-sm text-foreground flex-1 truncate">
              {item.keyword}
            </span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Badge
                variant="outline"
                className={cn("text-xs capitalize", getDifficultyColor(item.difficulty))}
              >
                {item.difficulty}
              </Badge>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => copyToClipboard(item.keyword)}
              >
                <Copy className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-7 w-7",
                  isKeywordSaved(item.keyword) && "text-primary"
                )}
                onClick={() => onSaveKeyword(item.keyword)}
              >
                {isKeywordSaved(item.keyword) ? (
                  <BookmarkCheck className="w-3.5 h-3.5" />
                ) : (
                  <Bookmark className="w-3.5 h-3.5" />
                )}
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          AI Keyword Ideas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Section */}
        <div className="space-y-3">
          <Textarea
            placeholder="Describe your video topic... (e.g., 'beginner photography tips for smartphone users')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="min-h-[100px] bg-background border-border resize-none"
          />
          <div className="flex gap-3">
            <Select value={niche} onValueChange={setNiche}>
              <SelectTrigger className="flex-1 bg-background border-border">
                <SelectValue placeholder="Select niche (optional)" />
              </SelectTrigger>
              <SelectContent>
                {niches.map((n) => (
                  <SelectItem key={n} value={n}>
                    {n}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={handleGenerate}
              disabled={isLoading || !topic.trim()}
              className="bg-primary hover:bg-primary/90 gap-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              Generate Ideas
            </Button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-card border-border">
                <CardHeader className="pb-3">
                  <Skeleton className="h-5 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-10 w-full" />
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Results */}
        {results && !isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <KeywordList
              title="Primary Keywords"
              icon={Target}
              keywords={results.primary_keywords || []}
              iconColor="text-blue-500"
            />
            <KeywordList
              title="Long-tail Variations"
              icon={Lightbulb}
              keywords={results.longtail_keywords || []}
              iconColor="text-yellow-500"
            />
            <KeywordList
              title="Question Keywords"
              icon={HelpCircle}
              keywords={results.question_keywords || []}
              iconColor="text-purple-500"
            />
            <KeywordList
              title="Trending Topics"
              icon={TrendingUp}
              keywords={results.trending_topics || []}
              iconColor="text-green-500"
            />
          </div>
        )}

        {/* Empty State */}
        {!results && !isLoading && (
          <div className="text-center py-8 text-muted-foreground">
            <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">
              Describe your video topic above to get AI-powered keyword suggestions
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIKeywordGenerator;
