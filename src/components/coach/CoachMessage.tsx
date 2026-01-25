import { cn } from "@/lib/utils";
import DOMPurify from "dompurify";
import { 
  Stethoscope, 
  AlertTriangle, 
  Calendar, 
  MessageSquare,
  Dna
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
      return "Growth Opportunities";
    case "nextContent":
      return "Content Strategy";
    case "custom":
      return "Your Question";
  }
};

const formatMarkdown = (text: string): string => {
  // Clean up any remaining system artifacts that shouldn't be shown
  let cleaned = text
    // Remove any internal assessment blocks that slipped through
    .replace(/<!--[\s\S]*?-->/g, '')
    // Remove any JSON blocks
    .replace(/```json[\s\S]*?```/g, '')
    .replace(/```[\s\S]*?```/g, '')
    // Remove metric-style lines
    .replace(/^(Risk Level|Confidence|Strategy Type|Bottleneck):.*$/gm, '')
    .trim();

  // Natural markdown formatting for conversational text
  let formatted = cleaned
    // Bold text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
    // Italic text
    .replace(/\*(.*?)\*/g, '<em class="text-foreground/90">$1</em>')
    // Headers - styled naturally
    .replace(/^## (.*?)$/gm, '<h2 class="text-lg font-semibold text-foreground mt-6 mb-3">$1</h2>')
    .replace(/^### (.*?)$/gm, '<h3 class="text-base font-medium text-foreground mt-5 mb-2">$1</h3>')
    // Unordered lists
    .replace(/^- (.*?)$/gm, '<li class="ml-4 list-disc text-muted-foreground leading-relaxed">$1</li>')
    // Ordered lists
    .replace(/^(\d+)\. (.*?)$/gm, '<li class="ml-4 list-decimal text-muted-foreground leading-relaxed">$2</li>')
    // Paragraphs with good spacing
    .replace(/\n\n/g, '</p><p class="mb-4 text-muted-foreground leading-relaxed">')
    .replace(/\n/g, '<br />');
  
  const html = `<p class="mb-4 text-muted-foreground leading-relaxed">${formatted}</p>`;
  
  // Sanitize the output to prevent XSS attacks
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'h2', 'h3', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['class'],
  });
};

const CoachMessage = ({ response }: CoachMessageProps) => {
  return (
    <div className="space-y-4">
      {/* Simple, clean header */}
      <div className="flex items-center justify-between">
        <div className={cn(
          "inline-flex items-center gap-2 px-3 py-1.5 rounded-full",
          "bg-primary/10 text-primary text-sm font-medium"
        )}>
          {getCoachIcon(response.coachType)}
          {getCoachLabel(response.coachType)}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          {response.metrics.hasDNA && (
            <span className="inline-flex items-center gap-1 text-accent">
              <Dna className="w-3 h-3" />
              DNA-Enhanced
            </span>
          )}
          <span>{format(response.timestamp, "h:mm a")}</span>
        </div>
      </div>

      {/* Clean, human-readable response */}
      <div 
        className="prose prose-invert prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: formatMarkdown(response.response) }}
      />
    </div>
  );
};

export default CoachMessage;
