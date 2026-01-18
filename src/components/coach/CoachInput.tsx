import { useState, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface CoachInputProps {
  onSubmit: (question: string) => void;
  loading?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const CoachInput = forwardRef<HTMLFormElement, CoachInputProps>(
  ({ onSubmit, loading, placeholder, disabled }, ref) => {
    const [question, setQuestion] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (question.trim() && !loading && !disabled) {
        onSubmit(question.trim());
        setQuestion("");
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="relative" ref={ref}>
        <Textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask your coach a specific question about your channel..."}
          disabled={loading || disabled}
          className={cn(
            "min-h-[80px] resize-none pr-14",
            "bg-card border-border/50 focus:border-primary/50",
            "placeholder:text-muted-foreground/50"
          )}
          rows={2}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!question.trim() || loading || disabled}
          className={cn(
            "absolute right-2 bottom-2",
            "bg-primary hover:bg-primary/90",
            "disabled:opacity-50"
          )}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </form>
    );
  }
);

CoachInput.displayName = "CoachInput";

export default CoachInput;
