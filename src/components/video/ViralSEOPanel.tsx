import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Copy, ChevronDown, ChevronUp, Zap, TrendingUp, Target, BarChart3, Tag, FileText, Image } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TagScore {
  tag: string;
  search_volume: 'high' | 'medium' | 'low';
  competition: 'high' | 'medium' | 'low';
  viral_probability: number;
}

interface TitleCandidate {
  title: string;
  seo_strength: number;
  ctr_probability: number;
  competition_dominance: number;
  algorithm_friendliness: number;
  total_score: number;
  reasoning: string;
}

export interface ViralSEOResult {
  applied_title: string;
  applied_description: string;
  applied_tags: TagScore[];
  title_candidates: TitleCandidate[];
  title_seo_score: number;
  description_seo_score: number;
  tags_seo_score: number;
  thumbnail_ctr_score: number;
  competition_advantage: number;
  final_seo_score: number;
  ctr_prediction: number;
  viral_probability: number;
  thumbnail_analysis: {
    title_alignment: number;
    curiosity_gap: number;
    emotion_clarity: number;
    mobile_readability: number;
    improvement_instructions: string[];
  };
  competitive_intel: {
    power_words: string[];
    emotional_hooks: string[];
    keyword_patterns: string[];
    emoji_trends: string[];
    avg_title_length: number;
  };
  optimization_loops: number;
  engine_version: string;
}

interface ViralSEOPanelProps {
  result: ViralSEOResult;
}

const ScoreBar = ({ label, score, icon: Icon }: { label: string; score: number; icon: React.ElementType }) => {
  const getColor = (s: number) => {
    if (s >= 80) return "text-green-500";
    if (s >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <Icon className="w-3.5 h-3.5" />
          {label}
        </span>
        <span className={cn("font-bold", getColor(score))}>{score}/100</span>
      </div>
      <Progress value={score} className="h-1.5" />
    </div>
  );
};

const CopyButton = ({ text, label }: { text: string; label: string }) => (
  <Button
    variant="ghost"
    size="sm"
    className="gap-1 text-xs h-7"
    onClick={() => {
      navigator.clipboard.writeText(text);
      toast.success(`${label} copied!`);
    }}
  >
    <Copy className="w-3 h-3" />
    Copy
  </Button>
);

const ViralSEOPanel = ({ result }: ViralSEOPanelProps) => {
  const [showTitles, setShowTitles] = useState(false);
  const [showDesc, setShowDesc] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [showThumbnail, setShowThumbnail] = useState(false);
  const [showIntel, setShowIntel] = useState(false);

  const seoColor = result.final_seo_score >= 80 ? "text-green-500" : result.final_seo_score >= 60 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="space-y-6">
      {/* Hero Score Section */}
      <div className="bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-xl border border-primary/20 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-bold">Viral SEO Engine</h3>
            <Badge variant="outline" className="text-xs">{result.engine_version}</Badge>
          </div>
        </div>

        {/* Big Score + Predictions */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <div className={cn("text-3xl font-black", seoColor)}>{result.final_seo_score}</div>
            <div className="text-xs text-muted-foreground mt-1">SEO Score</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <div className="text-3xl font-black text-primary">{result.ctr_prediction}%</div>
            <div className="text-xs text-muted-foreground mt-1">CTR Prediction</div>
          </div>
          <div className="text-center p-4 bg-card rounded-lg border border-border">
            <div className="text-3xl font-black text-primary">{result.viral_probability}%</div>
            <div className="text-xs text-muted-foreground mt-1">Viral Probability</div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="space-y-3">
          <ScoreBar label="Title SEO" score={result.title_seo_score} icon={Target} />
          <ScoreBar label="Description SEO" score={result.description_seo_score} icon={FileText} />
          <ScoreBar label="Tags SEO" score={result.tags_seo_score} icon={Tag} />
          <ScoreBar label="Thumbnail CTR" score={result.thumbnail_ctr_score} icon={Image} />
          <ScoreBar label="Competition Edge" score={result.competition_advantage} icon={BarChart3} />
        </div>
      </div>

      {/* Applied Title */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowTitles(!showTitles)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="font-medium">Optimized Title</span>
            <Badge variant="secondary" className="text-xs">{result.title_seo_score}/100</Badge>
          </div>
          {showTitles ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className="px-4 pb-4">
          <div className="flex items-center justify-between bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="font-medium text-sm flex-1">{result.applied_title}</p>
            <CopyButton text={result.applied_title} label="Title" />
          </div>
        </div>

        {showTitles && result.title_candidates.length > 0 && (
          <div className="px-4 pb-4 space-y-2">
            <p className="text-xs text-muted-foreground font-medium">All Candidates (ranked)</p>
            {result.title_candidates
              .sort((a, b) => b.total_score - a.total_score)
              .map((tc, i) => (
                <div key={i} className="p-3 bg-muted/30 rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium flex-1 pr-2">{tc.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{tc.total_score}/100</Badge>
                      <CopyButton text={tc.title} label="Title" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-xs">
                    <div><span className="text-muted-foreground">SEO:</span> {tc.seo_strength}</div>
                    <div><span className="text-muted-foreground">CTR:</span> {tc.ctr_probability}</div>
                    <div><span className="text-muted-foreground">Comp:</span> {tc.competition_dominance}</div>
                    <div><span className="text-muted-foreground">Algo:</span> {tc.algorithm_friendliness}</div>
                  </div>
                  {tc.reasoning && (
                    <p className="text-xs text-muted-foreground italic">{tc.reasoning}</p>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Applied Description */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowDesc(!showDesc)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-medium">Optimized Description</span>
            <Badge variant="secondary" className="text-xs">{result.description_seo_score}/100</Badge>
          </div>
          {showDesc ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showDesc && (
          <div className="px-4 pb-4">
            <div className="flex items-start justify-between bg-muted/30 rounded-lg p-3">
              <p className="text-sm whitespace-pre-wrap flex-1 max-h-60 overflow-auto">{result.applied_description}</p>
              <CopyButton text={result.applied_description} label="Description" />
            </div>
          </div>
        )}
      </div>

      {/* Applied Tags */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowTags(!showTags)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Tag className="w-4 h-4 text-primary" />
            <span className="font-medium">Optimized Tags ({result.applied_tags.length})</span>
            <Badge variant="secondary" className="text-xs">{result.tags_seo_score}/100</Badge>
          </div>
          {showTags ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showTags && (
          <div className="px-4 pb-4 space-y-3">
            <div className="flex justify-end">
              <CopyButton text={result.applied_tags.map(t => t.tag).join(', ')} label="All tags" />
            </div>
            <div className="flex flex-wrap gap-2">
              {result.applied_tags.map((t, i) => {
                const volColor = t.search_volume === 'high' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                  t.search_volume === 'medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' :
                  'bg-muted text-muted-foreground';
                return (
                  <Badge key={i} variant="outline" className={cn("text-xs", volColor)}>
                    {t.tag}
                    {t.viral_probability >= 70 && <TrendingUp className="w-3 h-3 ml-1" />}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Analysis */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowThumbnail(!showThumbnail)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Image className="w-4 h-4 text-primary" />
            <span className="font-medium">Thumbnail CTR Analysis</span>
            <Badge variant="secondary" className="text-xs">{result.thumbnail_ctr_score}/100</Badge>
          </div>
          {showThumbnail ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showThumbnail && (
          <div className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground">Title Alignment</div>
                <div className="text-lg font-bold">{result.thumbnail_analysis.title_alignment}%</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground">Curiosity Gap</div>
                <div className="text-lg font-bold">{result.thumbnail_analysis.curiosity_gap}%</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground">Emotion Clarity</div>
                <div className="text-lg font-bold">{result.thumbnail_analysis.emotion_clarity}%</div>
              </div>
              <div className="p-3 bg-muted/30 rounded-lg">
                <div className="text-xs text-muted-foreground">Mobile Readability</div>
                <div className="text-lg font-bold">{result.thumbnail_analysis.mobile_readability}%</div>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Improvement Instructions</p>
              {result.thumbnail_analysis.improvement_instructions.map((inst, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {inst}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Competitive Intelligence */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <button
          onClick={() => setShowIntel(!showIntel)}
          className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
        >
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="font-medium">Competitive Intelligence</span>
          </div>
          {showIntel ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        {showIntel && (
          <div className="px-4 pb-4 space-y-4">
            {result.competitive_intel.power_words.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Power Words</p>
                <div className="flex flex-wrap gap-1">
                  {result.competitive_intel.power_words.map((w, i) => (
                    <Badge key={i} className="bg-primary/10 text-primary border-primary/20">{w}</Badge>
                  ))}
                </div>
              </div>
            )}
            {result.competitive_intel.emotional_hooks.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Emotional Hooks</p>
                <div className="flex flex-wrap gap-1">
                  {result.competitive_intel.emotional_hooks.map((h, i) => (
                    <Badge key={i} variant="outline">{h}</Badge>
                  ))}
                </div>
              </div>
            )}
            {result.competitive_intel.keyword_patterns.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground mb-2">Keyword Patterns</p>
                <div className="flex flex-wrap gap-1">
                  {result.competitive_intel.keyword_patterns.map((p, i) => (
                    <Badge key={i} variant="secondary">{p}</Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              Avg title length in niche: <span className="font-medium">{result.competitive_intel.avg_title_length} chars</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViralSEOPanel;
