import { useState } from "react";
import { cn } from "@/lib/utils";
import { 
  Bot,
  Stethoscope, 
  AlertTriangle, 
  Calendar, 
  MessageSquare,
  Dna
} from "lucide-react";
import type { CoachResponse, CoachType } from "@/hooks/useYouTubeCoach";
import { format } from "date-fns";
import StreamingText from "./StreamingText";

interface CoachMessageProps {
  response: CoachResponse;
  isNew?: boolean; // Whether this is a newly added message (should stream)
}

const getCoachIcon = (type: CoachType) => {
  switch (type) {
    case "diagnosis":
      return <Stethoscope className="w-3.5 h-3.5" />;
    case "weakPoints":
      return <AlertTriangle className="w-3.5 h-3.5" />;
    case "nextContent":
      return <Calendar className="w-3.5 h-3.5" />;
    case "custom":
      return <MessageSquare className="w-3.5 h-3.5" />;
  }
};

const getCoachLabel = (type: CoachType) => {
  switch (type) {
    case "diagnosis":
      return "Channel Diagnosis";
    case "weakPoints":
      return "Growth Opportunities";
    case "nextContent":
      return "Content Strategy";
    case "custom":
      return "Your Question";
  }
};

const CoachMessage = ({ response, isNew = false }: CoachMessageProps) => {
  const [streamComplete, setStreamComplete] = useState(!isNew);

  return (
    <div className="flex items-start gap-3">
      {/* Coach Avatar */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg",
        "bg-gradient-to-br from-primary to-accent",
        "flex items-center justify-center",
        "shadow-md shadow-primary/20"
      )}>
        <Bot className="w-4 h-4 text-primary-foreground" />
      </div>

      {/* Message Bubble */}
      <div className={cn(
        "max-w-[70%] space-y-3",
        "animate-in fade-in-0 slide-in-from-left-2 duration-300"
      )}>
        {/* Header with type and meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className={cn(
            "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full",
            "bg-primary/10 text-primary text-xs font-medium"
          )}>
            {getCoachIcon(response.coachType)}
            {getCoachLabel(response.coachType)}
          </div>
          
          {response.metrics.hasDNA && (
            <span className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-full",
              "bg-accent/10 text-accent text-xs"
            )}>
              <Dna className="w-3 h-3" />
              DNA-Enhanced
            </span>
          )}
          
          <span className="text-xs text-muted-foreground/60">
            {format(response.timestamp, "h:mm a")}
          </span>
        </div>

        {/* Message Content Bubble */}
        <div className={cn(
          "px-4 py-3.5 rounded-2xl rounded-tl-md",
          "bg-card/80 border border-border/30",
          "backdrop-blur-sm",
          "shadow-sm"
        )}>
          {isNew && !streamComplete ? (
            <StreamingText 
              content={response.response}
              speed={6}
              onComplete={() => setStreamComplete(true)}
            />
          ) : (
            <StreamingText 
              content={response.response}
              speed={999} // Instant for already-shown messages
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CoachMessage;
