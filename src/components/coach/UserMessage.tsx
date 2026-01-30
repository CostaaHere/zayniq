import { cn } from "@/lib/utils";
import { User } from "lucide-react";

interface UserMessageProps {
  content: string;
  className?: string;
}

const UserMessage = ({ content, className }: UserMessageProps) => {
  return (
    <div className={cn("flex items-start gap-3 justify-end", className)}>
      {/* Message Bubble */}
      <div className={cn(
        "max-w-[70%] px-4 py-3 rounded-2xl rounded-tr-md",
        "bg-primary/15 border border-primary/20",
        "text-foreground",
        "animate-in fade-in-0 slide-in-from-right-2 duration-300"
      )}>
        <p className="text-sm leading-relaxed">{content}</p>
      </div>

      {/* User Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg",
        "bg-muted/50 border border-border/50",
        "flex items-center justify-center"
      )}>
        <User className="w-4 h-4 text-muted-foreground" />
      </div>
    </div>
  );
};

export default UserMessage;
