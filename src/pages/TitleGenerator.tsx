import React, { useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Loader2,
  Brain,
  Dna,
  Heart,
  Copy,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";
import { useChannelDNA } from "@/hooks/useChannelDNA";
import { TitleIntelligence } from "@/types/titleIntelligence";
import TitleCategorySection from "@/components/titles/TitleCategorySection";
import ABTestSection from "@/components/titles/ABTestSection";
import TopPickCard from "@/components/titles/TopPickCard";
import TSELandscapePanel from "@/components/titles/TSELandscapePanel";
import TSEScoreTable from "@/components/titles/TSEScoreTable";
import TSEFinalPickCard from "@/components/titles/TSEFinalPickCard";

const TitleGenerator = () => {
  const [topic, setTopic] = useState("");
  const [keyword, setKeyword] = useState("");
  const [tone, setTone] = useState("educational");
  const [includeEmoji, setIncludeEmoji] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [intelligence, setIntelligence] = useState<TitleIntelligence | null>(null);
  const [personalizedWithDNA, setPersonalizedWithDNA] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);

  const { dna: channelDNA, getDNAForPrompt, loading: dnaLoading } = useChannelDNA();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error("Please enter a video topic");
      return;
    }

    setIsLoading(true);
    setIntelligence(null);

    try {
      const dnaPrompt = getDNAForPrompt();
      
      const { data, error } = await supabase.functions.invoke("generate-titles", {
        body: { topic, keyword, tone, includeEmoji, channelDNA: dnaPrompt },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setIntelligence(data.intelligence);
      setPersonalizedWithDNA(data.personalizedWithDNA || false);
      
      const totalTitles = data.intelligence?.categories?.reduce(
        (acc: number, cat: { titles: unknown[] }) => acc + (cat.titles?.length || 0), 
        0
      ) || 0;
      
      toast.success(
        personalizedWithDNA 
          ? `Generated ${totalTitles} DNA-personalized titles!`
          : `Generated ${totalTitles} strategic titles!`
      );
    } catch (err) {
      logger.error("Error generating titles:", err);
      toast.error("Failed to generate titles. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (title: string) => {
    await navigator.clipboard.writeText(title);
    setCopiedTitle(title);
    toast.success("Title copied to clipboard!");
    setTimeout(() => setCopiedTitle(null), 2000);
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

  return (
    <DashboardLayout title="Title Intelligence">
      <div className="space-y-6">
        {/* Back Navigation */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" asChild className="gap-2">
            <Link to="/dashboard/ai-tools">
              <ArrowLeft className="w-4 h-4" />
              Back to AI Studio
            </Link>
          </Button>
          {channelDNA && (
            <Badge className="bg-purple-500/10 text-purple-500 gap-1.5">
              <Dna className="w-3.5 h-3.5" />
              Channel DNA Active
            </Badge>
          )}
        </div>

        {/* Page Header */}
        <div className="mb-2">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-7 h-7 text-primary" />
            Intent-Based Title Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Psychological, algorithmic, and strategic title generation — personalized to your channel
          </p>
        </div>

        {/* DNA Warning */}
        {!channelDNA && !dnaLoading && (
          <Card className="bg-amber-500/5 border-amber-500/20">
            <CardContent className="flex items-start gap-3 py-4">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-amber-500">Channel DNA Not Analyzed</p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  For truly personalized titles that match your channel's voice, analyze your Channel DNA first.
                  <Link to="/dashboard/channel" className="text-primary ml-1 hover:underline">
                    Go to Channel →
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Input Form - Sticky on desktop */}
          <div className="xl:col-span-1">
            <div className="sticky top-6 space-y-6">
              <Card className="bg-card border-border">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Generate Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Topic Input */}
                  <div className="space-y-2">
                    <Label htmlFor="topic">Video Topic *</Label>
                    <Textarea
                      id="topic"
                      placeholder="Describe your video idea in detail..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="min-h-[100px] bg-background resize-none"
                    />
                  </div>

                  {/* Target Keyword */}
                  <div className="space-y-2">
                    <Label htmlFor="keyword">Target Keyword</Label>
                    <Input
                      id="keyword"
                      placeholder="E.g., video editing tips"
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
                        <SelectItem value="inspirational">Inspirational</SelectItem>
                        <SelectItem value="controversial">Controversial</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Include Emoji Toggle */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="emoji" className="text-sm">Include Emojis</Label>
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
                    size="lg"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4" />
                        Generate Intelligence
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Favorites */}
              {favorites.length > 0 && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm">
                      <Heart className="w-4 h-4 text-red-500" />
                      Saved ({favorites.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <ScrollArea className="max-h-[200px]">
                      {favorites.map((fav, i) => (
                        <div
                          key={i}
                          className="p-2 rounded-lg bg-muted/50 text-sm flex items-start justify-between gap-2 mb-2"
                        >
                          <span className="line-clamp-2 text-xs">{fav}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 flex-shrink-0"
                            onClick={() => handleCopy(fav)}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </ScrollArea>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Results Section */}
          <div className="xl:col-span-3 space-y-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="bg-card border-border animate-pulse">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-muted" />
                        <div className="space-y-2">
                          <div className="h-5 w-32 bg-muted rounded" />
                          <div className="h-4 w-48 bg-muted rounded" />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {[...Array(2)].map((_, j) => (
                        <div key={j} className="p-4 rounded-xl bg-muted/30">
                          <div className="h-6 w-full bg-muted/50 rounded mb-3" />
                          <div className="flex gap-2">
                            <div className="h-5 w-16 bg-muted/50 rounded-full" />
                            <div className="h-5 w-20 bg-muted/50 rounded-full" />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !intelligence ? (
              <Card className="bg-card border-border min-h-[400px]">
                <CardContent className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                    <Brain className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Title Intelligence Awaits</h3>
                  <p className="text-muted-foreground max-w-md mb-4">
                    Enter your video topic to generate a comprehensive title intelligence report with
                    psychological insights, algorithm analysis, and A/B test variations.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Badge variant="outline">Landscape Analysis</Badge>
                    <Badge variant="outline">10 Scored Titles</Badge>
                    <Badge variant="outline">5-Dimension Scoring</Badge>
                    <Badge variant="outline">Final Supremacy Pick</Badge>
                    {channelDNA && (
                      <Badge className="bg-purple-500/10 text-purple-500">DNA-Personalized</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* TSE Landscape Analysis */}
                {intelligence.tse?.landscape && (
                  <TSELandscapePanel landscape={intelligence.tse.landscape} />
                )}

                {/* TSE Strategy + Final Pick */}
                {intelligence.tse?.strategy && intelligence.tse?.finalPick && (
                  <TSEFinalPickCard
                    strategy={intelligence.tse.strategy}
                    finalPick={intelligence.tse.finalPick}
                    onCopy={handleCopy}
                    copiedTitle={copiedTitle}
                    hasDNA={personalizedWithDNA}
                  />
                )}

                {/* TSE Score Table */}
                {intelligence.tse?.scoredTitles?.length > 0 && (
                  <TSEScoreTable
                    titles={intelligence.tse.scoredTitles}
                    onCopy={handleCopy}
                    copiedTitle={copiedTitle}
                  />
                )}

                {/* Legacy Top Pick (fallback if no TSE) */}
                {!intelligence.tse?.finalPick && intelligence.topPick && (
                  <TopPickCard
                    topPick={intelligence.topPick}
                    onCopy={handleCopy}
                    isCopied={copiedTitle === intelligence.topPick.title}
                    hasDNA={personalizedWithDNA}
                  />
                )}

                {/* Categories */}
                {intelligence.categories?.map((category, index) => (
                  <TitleCategorySection
                    key={index}
                    category={category}
                    onCopy={handleCopy}
                    onFavorite={toggleFavorite}
                    copiedTitle={copiedTitle}
                    favorites={favorites}
                    hasDNA={personalizedWithDNA}
                  />
                ))}

                {/* A/B Test Clusters */}
                {intelligence.abTestClusters?.length > 0 && (
                  <ABTestSection
                    clusters={intelligence.abTestClusters}
                    onCopy={handleCopy}
                    onFavorite={toggleFavorite}
                    copiedTitle={copiedTitle}
                    favorites={favorites}
                    hasDNA={personalizedWithDNA}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TitleGenerator;
