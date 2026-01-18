import { cn } from "@/lib/utils";
import { Bot, Sparkles, TrendingUp, Target, Lightbulb } from "lucide-react";

const CoachWelcome = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
      {/* Coach Avatar */}
      <div className={cn(
        "relative w-20 h-20 rounded-2xl",
        "bg-gradient-to-br from-primary to-accent",
        "flex items-center justify-center",
        "shadow-lg shadow-primary/20"
      )}>
        <Bot className="w-10 h-10 text-primary-foreground" />
        <div className={cn(
          "absolute -bottom-1 -right-1",
          "w-6 h-6 rounded-full",
          "bg-accent flex items-center justify-center",
          "border-2 border-background"
        )}>
          <Sparkles className="w-3 h-3 text-accent-foreground" />
        </div>
      </div>

      {/* Welcome Text */}
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-bold text-foreground">
          Your YouTube Growth Strategist
        </h2>
        <p className="text-muted-foreground">
          Get diagnostic, honest, and tactical advice based on your actual channel data. 
          No generic tips – only insights specific to your content.
        </p>
      </div>

      {/* Capabilities */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-lg mt-4">
        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-sm text-muted-foreground text-center">Diagnose growth blockers</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Target className="w-5 h-5" />
          </div>
          <span className="text-sm text-muted-foreground text-center">Identify weak points</span>
        </div>
        <div className="flex flex-col items-center gap-2 p-3 rounded-lg bg-muted/30 border border-border/30">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Lightbulb className="w-5 h-5" />
          </div>
          <span className="text-sm text-muted-foreground text-center">Strategic content plans</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground/60 mt-4">
        Select a quick action above or ask a custom question below
      </p>
    </div>
  );
};

export default CoachWelcome;
