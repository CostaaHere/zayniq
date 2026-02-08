import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Copy,
  Target,
  Zap,
  ShoppingCart,
  Megaphone,
  Calendar,
  ChevronDown,
  ChevronUp,
  Clock,
  Play,
  ArrowRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface YRDEResult {
  monetization_health: number;
  phase1_rpm_diagnosis: {
    expected_rpm_range: string;
    estimated_actual_rpm: string;
    monetization_efficiency: number;
    low_paying_signals: string[];
    low_intent_keywords: string[];
    entertainment_trap: boolean;
    diagnosis: string;
  };
  phase2_ad_auction: {
    viewer_intent_stage: 'passive' | 'curious' | 'buying';
    high_bid_keywords: string[];
    title_rpm_boost: string;
    description_rpm_boost: string;
    safe_high_value_phrases: string[];
    analysis: string;
  };
  phase3_content_structure: {
    optimal_ad_count: number;
    ad_placements: Array<{ timestamp_seconds: number; reason: string }>;
    retention_vs_revenue: string;
    mid_roll_eligible: boolean;
    emotional_spike_alignment: string;
  };
  phase4_shorts_long_funnel: {
    monetization_ceiling: string;
    funnel_strategy: string;
    cta_wording: string;
    pin_comment: string;
    bridge_video_ideas: string[];
  };
  phase5_alternative_monetization: {
    affiliate_opportunities: string[];
    brand_deal_readiness: number;
    product_opportunities: string[];
    revenue_per_1000: string;
    scale_without_uploads: string;
  };
  why_underpaid: string;
  next_30_day_plan: Array<{ week: string; action: string; expected_impact: string }>;
  input_context?: {
    videoType: string;
    durationSeconds: number;
    views: number;
  };
}

interface YRDEPanelProps {
  result: YRDEResult;
}

const copyText = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast.success(`${label} copied!`);
};

const intentColors: Record<string, string> = {
  passive: 'bg-red-500/20 text-red-400 border-red-500/30',
  curious: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  buying: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const funnelLabels: Record<string, string> = {
  shorts_for_reach: '📱 Shorts for Reach → Long for Money',
  long_for_money: '💰 Focus on Long-form Revenue',
  hybrid: '🔄 Hybrid Strategy',
  pivot_to_long: '📺 Pivot to Long-form ASAP',
};

const formatTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const YRDEPanel: React.FC<YRDEPanelProps> = ({ result }) => {
  const [expandedPhase, setExpandedPhase] = React.useState<string | null>(null);
  const toggle = (p: string) => setExpandedPhase(prev => prev === p ? null : p);

  const healthColor = result.monetization_health >= 70 ? 'text-green-400' : result.monetization_health >= 40 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="space-y-4">
      {/* Hero: Monetization Health */}
      <Card className="border-2 border-emerald-500/30 bg-emerald-500/5">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Revenue Domination Engine</h2>
                <p className="text-sm text-muted-foreground">Monetization Intelligence Report</p>
              </div>
            </div>
            <div className="text-right">
              <div className={cn("text-4xl font-bold", healthColor)}>{result.monetization_health}%</div>
              <p className="text-xs text-muted-foreground">Monetization Health</p>
            </div>
          </div>
          <Progress value={result.monetization_health} className="h-3" />

          {/* RPM Quick Stats */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <div className="bg-card p-3 rounded-lg border border-border text-center">
              <span className="text-xs text-muted-foreground">Expected RPM</span>
              <div className="text-lg font-bold text-green-400">{result.phase1_rpm_diagnosis.expected_rpm_range}</div>
            </div>
            <div className="bg-card p-3 rounded-lg border border-border text-center">
              <span className="text-xs text-muted-foreground">Estimated Actual</span>
              <div className="text-lg font-bold text-amber-400">{result.phase1_rpm_diagnosis.estimated_actual_rpm}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why Underpaid */}
      <Card className="border-red-500/30 bg-red-500/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-red-400 mb-1">Why You Are Underpaid</h3>
              <p className="text-sm leading-relaxed">{result.why_underpaid}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phase 1: RPM Diagnosis */}
      <Card className="border-border/50">
        <button onClick={() => toggle('p1')} className="w-full">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              Phase 1: RPM Diagnosis
            </CardTitle>
            {expandedPhase === 'p1' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardHeader>
        </button>
        <CardContent className={cn("space-y-3", expandedPhase !== 'p1' && "hidden")}>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monetization Efficiency</span>
              <span className="font-bold">{result.phase1_rpm_diagnosis.monetization_efficiency}/100</span>
            </div>
            <Progress value={result.phase1_rpm_diagnosis.monetization_efficiency} className="h-2" />
          </div>

          {result.phase1_rpm_diagnosis.entertainment_trap && (
            <Badge className="bg-red-500/20 text-red-400 border-red-500/30">⚠️ Entertainment Trap Detected</Badge>
          )}

          <p className="text-sm text-muted-foreground">{result.phase1_rpm_diagnosis.diagnosis}</p>

          {result.phase1_rpm_diagnosis.low_paying_signals.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Low-Paying Signals</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.phase1_rpm_diagnosis.low_paying_signals.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-red-400 border-red-500/30">{s}</Badge>
                ))}
              </div>
            </div>
          )}

          {result.phase1_rpm_diagnosis.low_intent_keywords.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Low Intent Keywords</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.phase1_rpm_diagnosis.low_intent_keywords.map((k, i) => (
                  <Badge key={i} variant="secondary">{k}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 2: Ad Auction */}
      <Card className="border-border/50">
        <button onClick={() => toggle('p2')} className="w-full">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Phase 2: Ad Auction Optimization
            </CardTitle>
            {expandedPhase === 'p2' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardHeader>
        </button>
        <CardContent className={cn("space-y-3", expandedPhase !== 'p2' && "hidden")}>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Viewer Intent:</span>
            <Badge variant="outline" className={intentColors[result.phase2_ad_auction.viewer_intent_stage] || ''}>
              {result.phase2_ad_auction.viewer_intent_stage.toUpperCase()}
            </Badge>
          </div>

          <p className="text-sm text-muted-foreground">{result.phase2_ad_auction.analysis}</p>

          {/* RPM-boosting title */}
          <div className="bg-card p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">RPM-Boosting Title</span>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyText(result.phase2_ad_auction.title_rpm_boost, 'Title')}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm font-medium">{result.phase2_ad_auction.title_rpm_boost}</p>
          </div>

          {/* Description boost */}
          <div className="bg-card p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Description RPM Boost</span>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyText(result.phase2_ad_auction.description_rpm_boost, 'Description')}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm">{result.phase2_ad_auction.description_rpm_boost}</p>
          </div>

          {/* High-bid keywords */}
          {result.phase2_ad_auction.high_bid_keywords.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">High-CPM Keywords</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.phase2_ad_auction.high_bid_keywords.map((k, i) => (
                  <Badge key={i} className="bg-green-500/20 text-green-400 border-green-500/30 cursor-pointer" onClick={() => copyText(k, 'Keyword')}>
                    💰 {k}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {result.phase2_ad_auction.safe_high_value_phrases.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Safe High-Value Phrases</span>
              <div className="flex flex-wrap gap-1 mt-1">
                {result.phase2_ad_auction.safe_high_value_phrases.map((p, i) => (
                  <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => copyText(p, 'Phrase')}>
                    {p}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 3: Content Structure */}
      <Card className="border-border/50">
        <button onClick={() => toggle('p3')} className="w-full">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Play className="w-4 h-4 text-blue-400" />
              Phase 3: Ad Placement Strategy
            </CardTitle>
            {expandedPhase === 'p3' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardHeader>
        </button>
        <CardContent className={cn("space-y-3", expandedPhase !== 'p3' && "hidden")}>
          <div className="flex items-center gap-3">
            <Badge variant="outline">
              {result.phase3_content_structure.mid_roll_eligible ? '✅ Mid-Roll Eligible' : '❌ No Mid-Rolls'}
            </Badge>
            <Badge variant="outline">
              🎯 Optimal Ads: {result.phase3_content_structure.optimal_ad_count}
            </Badge>
          </div>

          {result.phase3_content_structure.ad_placements.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs text-muted-foreground">Recommended Ad Placements</span>
              {result.phase3_content_structure.ad_placements.map((p, i) => (
                <div key={i} className="flex items-start gap-2 bg-muted/30 p-2 rounded-lg">
                  <Badge variant="secondary" className="flex-shrink-0">
                    <Clock className="w-3 h-3 mr-1" />
                    {formatTime(p.timestamp_seconds)}
                  </Badge>
                  <span className="text-sm">{p.reason}</span>
                </div>
              ))}
            </div>
          )}

          <p className="text-sm text-muted-foreground">{result.phase3_content_structure.retention_vs_revenue}</p>
          <p className="text-sm text-muted-foreground italic">{result.phase3_content_structure.emotional_spike_alignment}</p>
        </CardContent>
      </Card>

      {/* Phase 4: Shorts → Long Funnel */}
      <Card className="border-border/50">
        <button onClick={() => toggle('p4')} className="w-full">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-purple-400" />
              Phase 4: Shorts → Long Funnel
            </CardTitle>
            {expandedPhase === 'p4' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardHeader>
        </button>
        <CardContent className={cn("space-y-3", expandedPhase !== 'p4' && "hidden")}>
          <Badge variant="outline">{funnelLabels[result.phase4_shorts_long_funnel.funnel_strategy] || result.phase4_shorts_long_funnel.funnel_strategy}</Badge>

          <div className="bg-muted/30 p-3 rounded-lg">
            <span className="text-xs text-muted-foreground">Monetization Ceiling</span>
            <p className="text-sm font-medium mt-1">{result.phase4_shorts_long_funnel.monetization_ceiling}</p>
          </div>

          <div className="bg-card p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">CTA Wording</span>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyText(result.phase4_shorts_long_funnel.cta_wording, 'CTA')}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm italic">"{result.phase4_shorts_long_funnel.cta_wording}"</p>
          </div>

          <div className="bg-card p-3 rounded-lg border border-border">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium text-muted-foreground">Pinned Comment</span>
              <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => copyText(result.phase4_shorts_long_funnel.pin_comment, 'Comment')}>
                <Copy className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm">"{result.phase4_shorts_long_funnel.pin_comment}"</p>
          </div>

          {result.phase4_shorts_long_funnel.bridge_video_ideas.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Bridge Video Ideas</span>
              <div className="space-y-1 mt-1">
                {result.phase4_shorts_long_funnel.bridge_video_ideas.map((idea, i) => (
                  <div key={i} className="text-sm bg-muted/30 p-2 rounded">• {idea}</div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phase 5: Alternative Monetization */}
      <Card className="border-border/50">
        <button onClick={() => toggle('p5')} className="w-full">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              Phase 5: Alternative Revenue
            </CardTitle>
            {expandedPhase === 'p5' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </CardHeader>
        </button>
        <CardContent className={cn("space-y-3", expandedPhase !== 'p5' && "hidden")}>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card p-3 rounded-lg border border-border text-center">
              <Megaphone className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <div className="text-lg font-bold">{result.phase5_alternative_monetization.brand_deal_readiness}/100</div>
              <div className="text-xs text-muted-foreground">Brand Deal Ready</div>
            </div>
            <div className="bg-card p-3 rounded-lg border border-border text-center">
              <DollarSign className="w-4 h-4 mx-auto text-muted-foreground mb-1" />
              <div className="text-lg font-bold text-green-400">{result.phase5_alternative_monetization.revenue_per_1000}</div>
              <div className="text-xs text-muted-foreground">Rev / 1K Viewers</div>
            </div>
          </div>

          {result.phase5_alternative_monetization.affiliate_opportunities.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Affiliate Opportunities</span>
              <div className="space-y-1 mt-1">
                {result.phase5_alternative_monetization.affiliate_opportunities.map((a, i) => (
                  <Badge key={i} variant="secondary" className="mr-1">{a}</Badge>
                ))}
              </div>
            </div>
          )}

          {result.phase5_alternative_monetization.product_opportunities.length > 0 && (
            <div>
              <span className="text-xs text-muted-foreground">Product Opportunities</span>
              <div className="space-y-1 mt-1">
                {result.phase5_alternative_monetization.product_opportunities.map((p, i) => (
                  <div key={i} className="text-sm bg-muted/30 p-2 rounded">💡 {p}</div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-muted/30 p-3 rounded-lg">
            <span className="text-xs text-muted-foreground">Scale Without More Uploads</span>
            <p className="text-sm mt-1">{result.phase5_alternative_monetization.scale_without_uploads}</p>
          </div>
        </CardContent>
      </Card>

      {/* 30-Day Plan */}
      {result.next_30_day_plan.length > 0 && (
        <Card className="border-primary/30 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              30-Day Revenue Plan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {result.next_30_day_plan.map((week, i) => (
                <div key={i} className="bg-card p-3 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline">{week.week}</Badge>
                    <span className="text-xs text-green-400">{week.expected_impact}</span>
                  </div>
                  <p className="text-sm">{week.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default YRDEPanel;
