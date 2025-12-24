import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Type,
  FileText,
  Tags,
  Lightbulb,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Power words that increase CTR
const POWER_WORDS = [
  "ultimate", "complete", "guide", "secret", "proven", "best", "top",
  "easy", "fast", "quick", "simple", "free", "new", "exclusive",
  "amazing", "incredible", "powerful", "essential", "beginner", "advanced",
  "pro", "master", "hack", "trick", "step-by-step", "tutorial", "how to",
];

interface SEOAnalyzerProps {
  title: string;
  description: string;
  tags: string[];
  onImproveTitle?: () => void;
  onImproveDescription?: () => void;
  onImproveTags?: () => void;
}

interface AnalysisResult {
  score: number;
  checks: {
    label: string;
    passed: boolean;
    message: string;
  }[];
}

interface FullAnalysis {
  title: AnalysisResult;
  description: AnalysisResult;
  tags: AnalysisResult;
  overallScore: number;
  recommendations: string[];
}

const analyzeTitle = (title: string, tags: string[]): AnalysisResult => {
  const checks: AnalysisResult["checks"] = [];
  let score = 0;

  // Length check (optimal 50-60 chars)
  const titleLength = title.length;
  if (titleLength >= 50 && titleLength <= 60) {
    checks.push({ label: "Length", passed: true, message: `Perfect length (${titleLength} chars)` });
    score += 30;
  } else if (titleLength >= 40 && titleLength <= 70) {
    checks.push({ label: "Length", passed: true, message: `Good length (${titleLength} chars), optimal is 50-60` });
    score += 20;
  } else if (titleLength < 40) {
    checks.push({ label: "Length", passed: false, message: `Too short (${titleLength} chars), aim for 50-60` });
    score += 10;
  } else {
    checks.push({ label: "Length", passed: false, message: `Too long (${titleLength} chars), may be truncated` });
    score += 5;
  }

  // Keyword presence (check if any tags appear in title)
  const titleLower = title.toLowerCase();
  const keywordsInTitle = tags.filter(tag => titleLower.includes(tag.toLowerCase()));
  if (keywordsInTitle.length >= 2) {
    checks.push({ label: "Keywords", passed: true, message: `${keywordsInTitle.length} keywords found in title` });
    score += 35;
  } else if (keywordsInTitle.length === 1) {
    checks.push({ label: "Keywords", passed: true, message: "1 keyword found, consider adding more" });
    score += 20;
  } else {
    checks.push({ label: "Keywords", passed: false, message: "No keywords from tags found in title" });
    score += 0;
  }

  // Power words detection
  const powerWordsFound = POWER_WORDS.filter(word => titleLower.includes(word));
  if (powerWordsFound.length >= 2) {
    checks.push({ label: "Power Words", passed: true, message: `Great! ${powerWordsFound.length} power words found` });
    score += 35;
  } else if (powerWordsFound.length === 1) {
    checks.push({ label: "Power Words", passed: true, message: `1 power word found: "${powerWordsFound[0]}"` });
    score += 20;
  } else {
    checks.push({ label: "Power Words", passed: false, message: "No power words found. Add words like 'Ultimate', 'Complete', 'Best'" });
    score += 0;
  }

  return { score: Math.min(100, score), checks };
};

const analyzeDescription = (description: string, tags: string[]): AnalysisResult => {
  const checks: AnalysisResult["checks"] = [];
  let score = 0;

  // Length check (optimal 200-500 chars for first part visible)
  const descLength = description.length;
  if (descLength >= 200 && descLength <= 500) {
    checks.push({ label: "Length", passed: true, message: `Good length (${descLength} chars)` });
    score += 25;
  } else if (descLength > 500) {
    checks.push({ label: "Length", passed: true, message: `Detailed description (${descLength} chars)` });
    score += 25;
  } else if (descLength >= 100) {
    checks.push({ label: "Length", passed: false, message: `Short (${descLength} chars), aim for 200+ chars` });
    score += 15;
  } else {
    checks.push({ label: "Length", passed: false, message: `Too short (${descLength} chars), needs more content` });
    score += 5;
  }

  // Keyword density
  const descLower = description.toLowerCase();
  const keywordsInDesc = tags.filter(tag => descLower.includes(tag.toLowerCase()));
  const keywordDensity = (keywordsInDesc.length / tags.length) * 100;
  if (keywordDensity >= 60) {
    checks.push({ label: "Keyword Density", passed: true, message: `${keywordsInDesc.length}/${tags.length} keywords included` });
    score += 25;
  } else if (keywordDensity >= 30) {
    checks.push({ label: "Keyword Density", passed: true, message: `${keywordsInDesc.length}/${tags.length} keywords, add more` });
    score += 15;
  } else {
    checks.push({ label: "Keyword Density", passed: false, message: `Only ${keywordsInDesc.length}/${tags.length} keywords found` });
    score += 5;
  }

  // Links present
  const hasLinks = /https?:\/\/[^\s]+/.test(description);
  if (hasLinks) {
    checks.push({ label: "Links", passed: true, message: "Contains links to resources" });
    score += 25;
  } else {
    checks.push({ label: "Links", passed: false, message: "No links found. Add relevant links" });
    score += 0;
  }

  // Chapters/timestamps
  const hasTimestamps = /\d{1,2}:\d{2}/.test(description);
  if (hasTimestamps) {
    checks.push({ label: "Timestamps", passed: true, message: "Contains video chapters/timestamps" });
    score += 25;
  } else {
    checks.push({ label: "Timestamps", passed: false, message: "No timestamps. Add chapters for better UX" });
    score += 0;
  }

  return { score: Math.min(100, score), checks };
};

const analyzeTags = (tags: string[], title: string): AnalysisResult => {
  const checks: AnalysisResult["checks"] = [];
  let score = 0;

  // Number of tags (optimal 8-15)
  const tagCount = tags.length;
  if (tagCount >= 8 && tagCount <= 15) {
    checks.push({ label: "Tag Count", passed: true, message: `Optimal count (${tagCount} tags)` });
    score += 35;
  } else if (tagCount >= 5 && tagCount < 8) {
    checks.push({ label: "Tag Count", passed: true, message: `${tagCount} tags, consider adding more (8-15 optimal)` });
    score += 20;
  } else if (tagCount > 15) {
    checks.push({ label: "Tag Count", passed: true, message: `${tagCount} tags, slightly over optimal` });
    score += 25;
  } else {
    checks.push({ label: "Tag Count", passed: false, message: `Only ${tagCount} tags, add more (8-15 optimal)` });
    score += 10;
  }

  // Relevance to title
  const titleLower = title.toLowerCase();
  const relevantTags = tags.filter(tag => {
    const tagWords = tag.toLowerCase().split(" ");
    return tagWords.some(word => titleLower.includes(word) && word.length > 3);
  });
  const relevancePercent = tags.length > 0 ? (relevantTags.length / tags.length) * 100 : 0;
  if (relevancePercent >= 50) {
    checks.push({ label: "Relevance", passed: true, message: `${relevantTags.length}/${tags.length} tags match title keywords` });
    score += 35;
  } else if (relevancePercent >= 25) {
    checks.push({ label: "Relevance", passed: true, message: `${relevantTags.length}/${tags.length} relevant, add more matching tags` });
    score += 20;
  } else {
    checks.push({ label: "Relevance", passed: false, message: "Tags don't match title keywords well" });
    score += 5;
  }

  // Mix of broad and specific (check word count in tags)
  const broadTags = tags.filter(tag => tag.split(" ").length <= 2);
  const specificTags = tags.filter(tag => tag.split(" ").length >= 3);
  const hasGoodMix = broadTags.length >= 2 && specificTags.length >= 2;
  if (hasGoodMix) {
    checks.push({ label: "Variety", passed: true, message: `Good mix: ${broadTags.length} broad, ${specificTags.length} specific` });
    score += 30;
  } else if (broadTags.length > 0 && specificTags.length > 0) {
    checks.push({ label: "Variety", passed: true, message: `Mix could be better: ${broadTags.length} broad, ${specificTags.length} specific` });
    score += 20;
  } else {
    checks.push({ label: "Variety", passed: false, message: "Add a mix of broad and long-tail keywords" });
    score += 5;
  }

  return { score: Math.min(100, score), checks };
};

const generateRecommendations = (analysis: Omit<FullAnalysis, "recommendations">): string[] => {
  const recommendations: { priority: number; text: string }[] = [];

  // Title recommendations
  analysis.title.checks.forEach(check => {
    if (!check.passed) {
      if (check.label === "Length") {
        recommendations.push({ priority: 1, text: "Optimize title length to 50-60 characters for better visibility" });
      } else if (check.label === "Keywords") {
        recommendations.push({ priority: 2, text: "Include your main keyword in the video title" });
      } else if (check.label === "Power Words") {
        recommendations.push({ priority: 3, text: "Add power words like 'Ultimate', 'Complete', or 'Easy' to increase CTR" });
      }
    }
  });

  // Description recommendations
  analysis.description.checks.forEach(check => {
    if (!check.passed) {
      if (check.label === "Length") {
        recommendations.push({ priority: 2, text: "Expand description to at least 200 characters with relevant information" });
      } else if (check.label === "Keyword Density") {
        recommendations.push({ priority: 2, text: "Include more target keywords naturally in the description" });
      } else if (check.label === "Links") {
        recommendations.push({ priority: 4, text: "Add relevant links to resources, social media, or related content" });
      } else if (check.label === "Timestamps") {
        recommendations.push({ priority: 3, text: "Add timestamps/chapters to improve user experience and watch time" });
      }
    }
  });

  // Tags recommendations
  analysis.tags.checks.forEach(check => {
    if (!check.passed) {
      if (check.label === "Tag Count") {
        recommendations.push({ priority: 2, text: "Add more tags (aim for 8-15) to improve discoverability" });
      } else if (check.label === "Relevance") {
        recommendations.push({ priority: 1, text: "Use tags that directly relate to your title and content" });
      } else if (check.label === "Variety") {
        recommendations.push({ priority: 3, text: "Mix broad keywords with specific long-tail phrases" });
      }
    }
  });

  // Sort by priority and return top recommendations
  return recommendations
    .sort((a, b) => a.priority - b.priority)
    .slice(0, 5)
    .map(r => r.text);
};

const getScoreColor = (score: number) => {
  if (score >= 75) return { text: "text-green-500", bg: "bg-green-500", bgLight: "bg-green-500/10" };
  if (score >= 50) return { text: "text-yellow-500", bg: "bg-yellow-500", bgLight: "bg-yellow-500/10" };
  return { text: "text-red-500", bg: "bg-red-500", bgLight: "bg-red-500/10" };
};

const getScoreIcon = (score: number) => {
  if (score >= 75) return <CheckCircle2 className="w-5 h-5 text-green-500" />;
  if (score >= 50) return <AlertCircle className="w-5 h-5 text-yellow-500" />;
  return <XCircle className="w-5 h-5 text-red-500" />;
};

const SEOAnalyzer = ({
  title,
  description,
  tags,
  onImproveTitle,
  onImproveDescription,
  onImproveTags,
}: SEOAnalyzerProps) => {
  const analysis = useMemo<FullAnalysis>(() => {
    const titleAnalysis = analyzeTitle(title, tags);
    const descriptionAnalysis = analyzeDescription(description, tags);
    const tagsAnalysis = analyzeTags(tags, title);

    // Weighted average: Title 35%, Description 35%, Tags 30%
    const overallScore = Math.round(
      titleAnalysis.score * 0.35 +
      descriptionAnalysis.score * 0.35 +
      tagsAnalysis.score * 0.30
    );

    const partial = { title: titleAnalysis, description: descriptionAnalysis, tags: tagsAnalysis, overallScore };
    const recommendations = generateRecommendations(partial);

    return { ...partial, recommendations };
  }, [title, description, tags]);

  const overallColors = getScoreColor(analysis.overallScore);
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference - (analysis.overallScore / 100) * circumference;

  const sections = [
    {
      key: "title",
      label: "Title Analysis",
      icon: <Type className="w-5 h-5" />,
      analysis: analysis.title,
      onImprove: onImproveTitle,
    },
    {
      key: "description",
      label: "Description Analysis",
      icon: <FileText className="w-5 h-5" />,
      analysis: analysis.description,
      onImprove: onImproveDescription,
    },
    {
      key: "tags",
      label: "Tags Analysis",
      icon: <Tags className="w-5 h-5" />,
      analysis: analysis.tags,
      onImprove: onImproveTags,
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">SEO Analysis</h3>
        <Badge
          variant="outline"
          className={cn("text-sm font-medium", overallColors.text)}
        >
          {analysis.overallScore >= 75 ? "Good" : analysis.overallScore >= 50 ? "Needs Work" : "Poor"}
        </Badge>
      </div>

      {/* Overall Score Circle */}
      <div className="flex justify-center py-4">
        <div className="relative w-32 h-32">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              className={overallColors.text.replace("text-", "stroke-")}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset,
                transition: "stroke-dashoffset 0.5s ease",
              }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-3xl font-bold", overallColors.text)}>
              {analysis.overallScore}
            </span>
            <span className="text-xs text-muted-foreground">Overall Score</span>
          </div>
        </div>
      </div>

      {/* Analysis Sections */}
      <div className="space-y-4">
        {sections.map(({ key, label, icon, analysis: sectionAnalysis, onImprove }) => {
          const colors = getScoreColor(sectionAnalysis.score);
          return (
            <div key={key} className="border border-border rounded-lg overflow-hidden">
              {/* Section Header */}
              <div className={cn("flex items-center justify-between p-4", colors.bgLight)}>
                <div className="flex items-center gap-3">
                  <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", colors.bgLight, colors.text)}>
                    {icon}
                  </div>
                  <div>
                    <div className="font-medium">{label}</div>
                    <div className={cn("text-sm font-semibold", colors.text)}>
                      {sectionAnalysis.score}/100
                    </div>
                  </div>
                </div>
                {onImprove && (
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={onImprove}>
                    <Sparkles className="w-4 h-4" />
                    Improve with AI
                  </Button>
                )}
              </div>

              {/* Checks */}
              <div className="p-4 space-y-2">
                {sectionAnalysis.checks.map((check, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    {check.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-medium">{check.label}:</span>{" "}
                      <span className="text-muted-foreground">{check.message}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {analysis.recommendations.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            <h4 className="font-medium">Recommendations</h4>
          </div>
          <ul className="space-y-2">
            {analysis.recommendations.map((rec, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs flex-shrink-0 mt-0.5">
                  {index + 1}
                </span>
                {rec}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SEOAnalyzer;
