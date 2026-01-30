import { cn } from "@/lib/utils";
import { Bot } from "lucide-react";

interface CoachThinkingIndicatorProps {
  className?: string;
}

const CoachThinkingIndicator = ({ className }: CoachThinkingIndicatorProps) => {
  return (
    <div className={cn("flex items-start gap-3", className)}>
      {/* Coach Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg",
        "bg-gradient-to-br from-primary to-accent",
        "flex items-center justify-center",
        "shadow-md shadow-primary/20"
      )}>
        <Bot className="w-4 h-4 text-primary-foreground" />
      </div>

      {/* Thinking Bubble */}
      <div className={cn(
        "max-w-[65%] px-4 py-3 rounded-2xl rounded-tl-md",
        "bg-card/80 border border-border/30",
        "backdrop-blur-sm"
      )}>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">ZainIQ Coach is thinking</span>
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoachThinkingIndicator;
