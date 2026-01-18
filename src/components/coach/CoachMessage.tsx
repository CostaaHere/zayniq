import { cn } from "@/lib/utils";
import { 
  Stethoscope, 
  AlertTriangle, 
  Calendar, 
  MessageSquare,
  Bot,
  User,
  ChartBar,
  Dna,
  Clock
} from "lucide-react";
import type { CoachResponse, CoachType } from "@/hooks/useYouTubeCoach";
import { format } from "date-fns";

interface CoachMessageProps {
  response: CoachResponse;
}

const getCoachIcon = (type: CoachType) => {
  switch (type) {
    case "diagnosis":
      return <Stethoscope className="w-4 h-4" />;
    case "weakPoints":
      return <AlertTriangle className="w-4 h-4" />;
    case "nextContent":
      return <Calendar className="w-4 h-4" />;
    case "custom":
      return <MessageSquare className="w-4 h-4" />;
  }
};

const getCoachLabel = (type: CoachType) => {
  switch (type) {
    case "diagnosis":
      return "Channel Diagnosis";
    case "weakPoints":
      return "Weak Points Analysis";
    case "nextContent":
      return "Content Strategy";
    case "custom":
      return "Custom Question";
  }
};

const formatMarkdown = (text: string) => {
  // Simple markdown formatting
  let formatted = text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    // Headers
    .replace(/^## (.*?)$/gm, '<h2 class="text-lg font-bold text-foreground mt-6 mb-2 flex items-center gap-2">$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3 class="text-base font-semibold text-foreground mt-4 mb-2">$1</h3>')
    // Lists
    .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-muted-foreground">$1</li>')
    .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4 list-decimal text-muted-foreground">$2</li>')
    // Newlines
    .replace(/\n\n/g, '</p><p class="mb-3 text-muted-foreground">')
    .replace(/\n/g, '<br />');
  
  return `<p class="mb-3 text-muted-foreground">${formatted}</p>`;
};

const CoachMessage = ({ response }: CoachMessageProps) => {
  return (
    <div className="space-y-4">
      {/* Analysis Type Badge */}
      <div className="flex items-center justify-between">
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-primary/10 text-primary text-sm font-medium"
        )}>
          {getCoachIcon(response.coachType)}
          {getCoachLabel(response.coachType)}
        </div>
        <span className="text-xs text-muted-foreground">
          {format(response.timestamp, "h:mm a")}
        </span>
      </div>

      {/* Metrics Bar */}
      <div className="flex flex-wrap gap-4 p-3 rounded-lg bg-muted/30 border border-border/30">
        <div className="flex items-center gap-2 text-sm">
          <ChartBar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Videos:</span>
          <span className="font-medium text-foreground">{response.metrics.videosAnalyzed}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Avg Views:</span>
          <span className="font-medium text-foreground">{response.metrics.avgViews.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Engagement:</span>
          <span className="font-medium text-foreground">{response.metrics.avgEngagement}%</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Clock className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Upload freq:</span>
          <span className="font-medium text-foreground">Every {response.metrics.uploadFrequency} days</span>
        </div>
        {response.metrics.hasDNA && (
          <div className="flex items-center gap-1.5 text-sm text-accent">
            <Dna className="w-4 h-4" />
            <span className="font-medium">DNA-Powered</span>
          </div>
        )}
      </div>

      {/* Response Content */}
      <div 
        className="prose prose-invert prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(response.response) }}
      />
    </div>
  );
};

export default CoachMessage;
