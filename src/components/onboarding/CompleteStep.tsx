import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Rocket, BarChart3, Lightbulb, Sparkles } from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import confetti from "canvas-confetti";

const quickActions = [
  {
    icon: BarChart3,
    label: "View Analytics",
    description: "See your channel performance",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Lightbulb,
    label: "Get Content Ideas",
    description: "AI-powered suggestions",
    gradient: "from-yellow-500 to-orange-500",
  },
  {
    icon: Sparkles,
    label: "Optimize SEO",
    description: "Improve discoverability",
    gradient: "from-purple-500 to-pink-500",
  },
];

const CompleteStep = () => {
  const navigate = useNavigate();
  const { updateProfile } = useProfile();
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    // Trigger confetti animation
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: ["#8b5cf6", "#06b6d4", "#f59e0b"],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: ["#8b5cf6", "#06b6d4", "#f59e0b"],
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  const handleComplete = async () => {
    setCompleting(true);
    await updateProfile({
      onboarding_completed: true,
      onboarding_step: 4,
    });
    navigate("/dashboard");
  };

  return (
    <div className="space-y-8 animate-fade-up text-center">
      {/* Success Animation */}
      <div className="relative">
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-primary to-accent flex items-center justify-center animate-pulse-glow glow-effect">
          <Rocket className="w-16 h-16 text-white animate-bounce" />
        </div>
        <div className="absolute inset-0 w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-primary to-accent opacity-20 animate-ping" />
      </div>

      <div>
        <h2 className="text-3xl font-bold gradient-text mb-2">You're all set! 🎉</h2>
        <p className="text-muted-foreground">
          Your ZaynIQ account is ready. Let's start growing your channel!
        </p>
      </div>

      {/* Quick Start Actions */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground font-medium">Quick Start</p>
        {quickActions.map((action, index) => (
          <button
            key={action.label}
            onClick={handleComplete}
            className={cn(
              "w-full p-4 rounded-xl border border-border",
              "flex items-center gap-4 text-left",
              "hover:border-primary/50 transition-all duration-200",
              "animate-fade-up"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                `bg-gradient-to-r ${action.gradient}`
              )}
            >
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-semibold">{action.label}</div>
              <div className="text-sm text-muted-foreground">{action.description}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Go to Dashboard Button */}
      <Button
        onClick={handleComplete}
        disabled={completing}
        className="w-full h-14 text-lg bg-gradient-to-r from-primary to-accent hover:opacity-90"
      >
        {completing ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <Rocket className="w-5 h-5 mr-2" />
        )}
        Go to Dashboard
      </Button>
    </div>
  );
};

export default CompleteStep;
