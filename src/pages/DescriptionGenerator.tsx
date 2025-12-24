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
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
  RefreshCw,
  Plus,
  X,
  Loader2,
  Hash,
  MessageSquare,
  Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface GeneratedResult {
  description: string;
  hashtags: string[];
  callToAction: string;
  characterCount: number;
}

const DescriptionGenerator = () => {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [keyPoints, setKeyPoints] = useState<string[]>([]);
  const [newKeyPoint, setNewKeyPoint] = useState("");
  const [links, setLinks] = useState<string[]>([]);
  const [newLink, setNewLink] = useState("");
  const [includeTimestamps, setIncludeTimestamps] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const addKeyPoint = () => {
    if (newKeyPoint.trim()) {
      setKeyPoints([...keyPoints, newKeyPoint.trim()]);
      setNewKeyPoint("");
    }
  };

  const removeKeyPoint = (index: number) => {
    setKeyPoints(keyPoints.filter((_, i) => i !== index));
  };

  const addLink = () => {
    if (newLink.trim()) {
      setLinks([...links, newLink.trim()]);
      setNewLink("");
    }
  };

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      toast.error("Please enter a video title");
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-description", {
        body: { title, summary, keyPoints, links, includeTimestamps },
      });

      if (error) throw error;

      if (data.error) {
        toast.error(data.error);
        return;
      }

      setResult(data);
      setEditedDescription(data.description || "");
      toast.success("Description generated successfully!");
    } catch (err) {
      console.error("Error generating description:", err);
      toast.error("Failed to generate description. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, type: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    toast.success(`${type} copied to clipboard!`);
    setTimeout(() => setCopied(null), 2000);
  };

  const getCharacterCountColor = (count: number) => {
    if (count < 200) return "text-yellow-500";
    if (count <= 500) return "text-green-500";
    return "text-orange-500";
  };

  const formatForYouTube = (text: string) => {
    return text.replace(/\\n/g, "\n");
  };

  return (
    <DashboardLayout title="AI Description Generator">
      <div className="space-y-6">
        {/* Back Navigation */}
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link to="/dashboard/ai-tools">
            <ArrowLeft className="w-4 h-4" />
            Back to AI Tools
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Generate Description
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Video Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Video Title *</Label>
                  <Input
                    id="title"
                    placeholder="Enter your video title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-background"
                  />
                </div>

                {/* Brief Summary */}
                <div className="space-y-2">
                  <Label htmlFor="summary">Brief Summary</Label>
                  <Textarea
                    id="summary"
                    placeholder="What is this video about? Key topics covered..."
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    className="min-h-[80px] bg-background"
                  />
                </div>

                {/* Key Points */}
                <div className="space-y-2">
                  <Label>Key Points to Mention</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a key point..."
                      value={newKeyPoint}
                      onChange={(e) => setNewKeyPoint(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyPoint())}
                      className="bg-background"
                    />
                    <Button variant="outline" size="icon" onClick={addKeyPoint}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {keyPoints.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {keyPoints.map((point, i) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="gap-1 pr-1"
                        >
                          {point}
                          <button
                            onClick={() => removeKeyPoint(i)}
                            className="ml-1 hover:text-destructive"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Links */}
                <div className="space-y-2">
                  <Label>Links to Include</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a link..."
                      value={newLink}
                      onChange={(e) => setNewLink(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addLink())}
                      className="bg-background"
                    />
                    <Button variant="outline" size="icon" onClick={addLink}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {links.length > 0 && (
                    <div className="space-y-1 mt-2">
                      {links.map((link, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded-lg"
                        >
                          <span className="flex-1 truncate text-muted-foreground">{link}</span>
                          <button
                            onClick={() => removeLink(i)}
                            className="hover:text-destructive"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Include Timestamps Toggle */}
                <div className="flex items-center justify-between">
                  <Label htmlFor="timestamps">Include Timestamps</Label>
                  <Switch
                    id="timestamps"
                    checked={includeTimestamps}
                    onCheckedChange={setIncludeTimestamps}
                  />
                </div>

                {/* Generate Button */}
                <Button
                  onClick={handleGenerate}
                  disabled={isLoading || !title.trim()}
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
                      Generate Description
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {/* Description Output */}
            <Card className="bg-card border-border">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Generated Description</CardTitle>
                {result && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={cn(getCharacterCountColor(editedDescription.length))}
                    >
                      {editedDescription.length} chars
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(editedDescription, "Description")}
                      className="gap-2"
                    >
                      {copied === "Description" ? (
                        <Check className="w-3 h-3 text-green-500" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                      Copy
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleGenerate}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <RefreshCw className={cn("w-3 h-3", isLoading && "animate-spin")} />
                      Regenerate
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 animate-pulse">
                      <Sparkles className="w-8 h-8 text-primary" />
                    </div>
                    <p className="text-muted-foreground">Crafting your description...</p>
                  </div>
                ) : result ? (
                  <Textarea
                    value={editedDescription}
                    onChange={(e) => setEditedDescription(e.target.value)}
                    className="min-h-[200px] bg-background font-mono text-sm"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                      <Sparkles className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Description Yet</h3>
                    <p className="text-muted-foreground max-w-md">
                      Enter your video details and click "Generate" to create an optimized
                      YouTube description.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Suggestions */}
            {result && (
              <>
                {/* Hashtags */}
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Hash className="w-4 h-4 text-accent" />
                      Recommended Hashtags
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(result.hashtags.map(h => `#${h}`).join(" "), "Hashtags")}
                    >
                      {copied === "Hashtags" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {result.hashtags?.map((tag, i) => (
                        <Badge key={i} variant="secondary" className="text-sm">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Call to Action */}
                <Card className="bg-card border-border">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-primary" />
                      Subscribe Reminder
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(result.callToAction, "CTA")}
                    >
                      {copied === "CTA" ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{result.callToAction}</p>
                  </CardContent>
                </Card>

                {/* YouTube Preview */}
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-500" />
                      YouTube Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="bg-background rounded-lg p-4 border border-border">
                      {/* Simulated YouTube description look */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium">{title}</p>
                        <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {formatForYouTube(editedDescription).split("\n").slice(0, 3).join("\n")}
                          {editedDescription.split("\n").length > 3 && (
                            <span className="text-primary cursor-pointer">...more</span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1 pt-2">
                          {result.hashtags?.slice(0, 3).map((tag, i) => (
                            <span key={i} className="text-sm text-primary">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DescriptionGenerator;
