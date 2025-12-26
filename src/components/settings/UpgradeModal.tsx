import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Check,
  X,
  Crown,
  Zap,
  Building2,
  Shield,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UpgradeModalProps {
  open: boolean;
  onClose: () => void;
  currentPlan: "free" | "pro" | "agency";
}

const plans = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    description: "Get started with basic features",
    features: {
      channels: 1,
      competitors: 3,
      keywordSearches: "10/day",
      aiGenerations: "5/day",
      analyticsHistory: "7 days",
      teamMembers: 1,
      prioritySupport: false,
    },
  },
  {
    id: "pro",
    name: "Pro",
    monthlyPrice: 19,
    yearlyPrice: 190,
    icon: Crown,
    description: "Perfect for growing creators",
    recommended: true,
    features: {
      channels: 3,
      competitors: 10,
      keywordSearches: "Unlimited",
      aiGenerations: "100/day",
      analyticsHistory: "1 year",
      teamMembers: 3,
      prioritySupport: true,
    },
  },
  {
    id: "agency",
    name: "Agency",
    monthlyPrice: 49,
    yearlyPrice: 490,
    icon: Building2,
    description: "For teams and agencies",
    features: {
      channels: 10,
      competitors: 50,
      keywordSearches: "Unlimited",
      aiGenerations: "Unlimited",
      analyticsHistory: "Unlimited",
      teamMembers: 10,
      prioritySupport: true,
    },
  },
];

const featureLabels = {
  channels: "Channels",
  competitors: "Competitors",
  keywordSearches: "Keyword Searches",
  aiGenerations: "AI Generations",
  analyticsHistory: "Analytics History",
  teamMembers: "Team Members",
  prioritySupport: "Priority Support",
};

const UpgradeModal = ({ open, onClose, currentPlan }: UpgradeModalProps) => {
  const [isYearly, setIsYearly] = useState(false);

  const getPrice = (plan: (typeof plans)[0]) => {
    if (plan.monthlyPrice === 0) return "Free";
    const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
    const period = isYearly ? "/year" : "/mo";
    return `$${price}${period}`;
  };

  const getSavings = (plan: (typeof plans)[0]) => {
    if (plan.monthlyPrice === 0) return null;
    const yearlyMonthly = plan.yearlyPrice / 12;
    const savings = Math.round(
      ((plan.monthlyPrice - yearlyMonthly) / plan.monthlyPrice) * 100
    );
    return savings;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl bg-card border-border p-0 overflow-hidden">
        <div className="relative">
          {/* Gradient header */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

          <DialogHeader className="p-6 pb-4 relative">
            <DialogTitle className="text-2xl font-bold text-center">
              Upgrade Your Plan
            </DialogTitle>
            <p className="text-center text-muted-foreground mt-2">
              Choose the perfect plan for your YouTube growth journey
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <Label
                htmlFor="billing-toggle"
                className={cn(
                  "text-sm transition-colors",
                  !isYearly ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Monthly
              </Label>
              <Switch
                id="billing-toggle"
                checked={isYearly}
                onCheckedChange={setIsYearly}
              />
              <Label
                htmlFor="billing-toggle"
                className={cn(
                  "text-sm transition-colors",
                  isYearly ? "text-foreground" : "text-muted-foreground"
                )}
              >
                Yearly
              </Label>
              {isYearly && (
                <Badge className="bg-accent/10 text-accent border-accent/20">
                  Save up to 17%
                </Badge>
              )}
            </div>
          </DialogHeader>

          {/* Plans grid */}
          <div className="grid md:grid-cols-3 gap-4 p-6 pt-2">
            {plans.map((plan) => {
              const Icon = plan.icon;
              const isCurrent = plan.id === currentPlan;
              const savings = isYearly ? getSavings(plan) : null;

              return (
                <div
                  key={plan.id}
                  className={cn(
                    "relative rounded-xl border p-5 transition-all",
                    plan.recommended
                      ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
                      : "border-border bg-background",
                    isCurrent && "ring-2 ring-primary/50"
                  )}
                >
                  {plan.recommended && (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Recommended
                    </Badge>
                  )}

                  {isCurrent && (
                    <Badge
                      variant="outline"
                      className="absolute -top-3 right-4 bg-background"
                    >
                      Current Plan
                    </Badge>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center",
                        plan.recommended
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {plan.description}
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold text-foreground">
                        {getPrice(plan).replace(/\/.*/, "")}
                      </span>
                      {plan.monthlyPrice > 0 && (
                        <span className="text-muted-foreground text-sm">
                          {isYearly ? "/year" : "/mo"}
                        </span>
                      )}
                    </div>
                    {savings && isYearly && (
                      <p className="text-xs text-accent mt-1">
                        Save {savings}% with yearly billing
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-6">
                    {Object.entries(plan.features).map(([key, value]) => (
                      <li key={key} className="flex items-center gap-2 text-sm">
                        {typeof value === "boolean" ? (
                          value ? (
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                          ) : (
                            <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                          )
                        ) : (
                          <Check className="w-4 h-4 text-accent flex-shrink-0" />
                        )}
                        <span
                          className={cn(
                            typeof value === "boolean" && !value
                              ? "text-muted-foreground/50"
                              : "text-muted-foreground"
                          )}
                        >
                          <span className="text-foreground font-medium">
                            {typeof value === "boolean"
                              ? ""
                              : `${value} `}
                          </span>
                          {featureLabels[key as keyof typeof featureLabels]}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button
                      variant="outline"
                      className="w-full"
                      disabled
                    >
                      Current Plan
                    </Button>
                  ) : plan.id === "agency" ? (
                    <Button
                      variant={plan.recommended ? "default" : "outline"}
                      className={cn(
                        "w-full",
                        plan.recommended && "bg-primary hover:bg-primary/90"
                      )}
                    >
                      Contact Sales
                    </Button>
                  ) : (
                    <Button
                      variant={plan.recommended ? "default" : "outline"}
                      className={cn(
                        "w-full",
                        plan.recommended && "bg-primary hover:bg-primary/90"
                      )}
                    >
                      {plan.id === "free"
                        ? "Downgrade"
                        : `Upgrade to ${plan.name}`}
                    </Button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="border-t border-border p-4 bg-muted/30 flex items-center justify-center gap-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-accent" />
              30-day money-back guarantee
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="w-4 h-4 text-accent" />
              Cancel anytime
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
