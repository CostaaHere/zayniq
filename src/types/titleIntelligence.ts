export interface TitleInsight {
  title: string;
  powerWords: string[];
  psychologyExplanation: string;
  algorithmExplanation: string;
  dnaAlignment: string;
  ctrPotential: "high" | "medium" | "low";
}

export interface TitleCategory {
  category: string;
  categoryDescription: string;
  icon: string;
  titles: TitleInsight[];
}

export interface ABTestCluster {
  clusterName: string;
  targetAudience: string;
  psychologicalTrigger: string;
  titles: TitleInsight[];
}

export interface TopPick {
  title: string;
  reason: string;
}

export interface TitleIntelligence {
  categories: TitleCategory[];
  abTestClusters: ABTestCluster[];
  topPick: TopPick;
}

export interface TitleIntelligenceResponse {
  intelligence: TitleIntelligence;
  personalizedWithDNA: boolean;
  generatedAt: string;
}

// Category icon mapping
export const categoryIcons: Record<string, string> = {
  "Curiosity-Driven": "help-circle",
  "Authority": "shield",
  "Emotional": "heart",
  "Short-Form Optimized": "smartphone",
  "A/B Test": "git-branch",
};

// CTR potential colors
export const ctrColors: Record<string, { bg: string; text: string }> = {
  high: { bg: "bg-green-500/10", text: "text-green-500" },
  medium: { bg: "bg-yellow-500/10", text: "text-yellow-500" },
  low: { bg: "bg-orange-500/10", text: "text-orange-500" },
};
