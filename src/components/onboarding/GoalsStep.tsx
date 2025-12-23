import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { ArrowRight, ArrowLeft, Loader2, Check } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";

interface GoalsStepProps {
  onNext: () => void;
  onBack: () => void;
}

const goals = [
  { id: "grow_subs", label: "Grow Subscribers", icon: "📈", description: "Increase channel reach" },
  { id: "improve_seo", label: "Improve SEO", icon: "🔍", description: "Rank higher in search" },
  { id: "save_time", label: "Save Time", icon: "⏰", description: "Automate repetitive tasks" },
  { id: "boost_views", label: "Boost Views", icon: "👁️", description: "Get more video plays" },
  { id: "better_thumbnails", label: "Better Thumbnails", icon: "🖼️", description: "Improve CTR" },
  { id: "content_ideas", label: "Content Ideas", icon: "💡", description: "Never run out of topics" },
  { id: "track_analytics", label: "Track Analytics", icon: "📊", description: "Monitor performance" },
  { id: "competitor_analysis", label: "Competitor Analysis", icon: "🎯", description: "Stay ahead" },
];

const milestones = [
  { value: 1000, label: "1K" },
  { value: 10000, label: "10K" },
  { value: 100000, label: "100K" },
  { value: 1000000, label: "1M" },
];

const GoalsStep = ({ onNext, onBack }: GoalsStepProps) => {
  const { profile, updateProfile } = useProfile();
  const { toast } = useToast();
  
  const [selectedGoals, setSelectedGoals] = useState<string[]>(profile?.goals || []);
  const [subscriberGoal, setSubscriberGoal] = useState(profile?.subscriber_goal || 10000);
  const [saving, setSaving] = useState(false);

  const toggleGoal = (goalId: string) => {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((g) => g !== goalId)
        : [...prev, goalId]
    );
  };

  const formatSubscriberGoal = (value: number): string => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
    return value.toString();
  };

  const handleNext = async () => {
    if (selectedGoals.length === 0) {
      toast({
        title: "Select at least one goal",
        description: "Choose what you want to achieve",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    const { error } = await updateProfile({
      goals: selectedGoals,
      subscriber_goal: subscriberGoal,
      onboarding_step: 3,
    });
    setSaving(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save goals",
        variant: "destructive",
      });
    } else {
      onNext();
    }
  };

  return (
    <div className="space-y-8 animate-fade-up">
      <div className="text-center">
        <h2 className="text-3xl font-bold gradient-text mb-2">What are your goals?</h2>
        <p className="text-muted-foreground">Select what you want to achieve with ZaynIQ</p>
      </div>

      {/* Goal Cards */}
      <div className="grid grid-cols-2 gap-3">
        {goals.map((goal) => (
          <button
            key={goal.id}
            onClick={() => toggleGoal(goal.id)}
            className={cn(
              "p-4 rounded-xl border-2 text-left transition-all duration-200 relative",
              selectedGoals.includes(goal.id)
                ? "border-primary bg-primary/10"
                : "border-border hover:border-muted-foreground/50"
            )}
          >
            {selectedGoals.includes(goal.id) && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
            <div className="text-2xl mb-2">{goal.icon}</div>
            <div className="font-medium text-sm">{goal.label}</div>
            <div className="text-xs text-muted-foreground">{goal.description}</div>
          </button>
        ))}
      </div>

      {/* Subscriber Goal */}
      <div className="space-y-4">
        <Label>Subscriber Milestone Goal</Label>
        <div className="glass-card p-6">
          <div className="text-center mb-6">
            <span className="text-4xl font-bold gradient-text">
              {formatSubscriberGoal(subscriberGoal)}
            </span>
            <span className="text-muted-foreground ml-2">subscribers</span>
          </div>
          <Slider
            value={[subscriberGoal]}
            onValueChange={(value) => setSubscriberGoal(value[0])}
            min={1000}
            max={1000000}
            step={1000}
            className="w-full"
          />
          <div className="flex justify-between mt-4">
            {milestones.map((m) => (
              <button
                key={m.value}
                onClick={() => setSubscriberGoal(m.value)}
                className={cn(
                  "px-3 py-1 rounded-full text-sm transition-all",
                  subscriberGoal === m.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                )}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={onBack}
          className="flex-1 h-12"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </Button>
        <Button
          onClick={handleNext}
          disabled={saving}
          className="flex-1 h-12 bg-gradient-to-r from-primary to-accent hover:opacity-90"
        >
          {saving ? (
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
          ) : null}
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default GoalsStep;
