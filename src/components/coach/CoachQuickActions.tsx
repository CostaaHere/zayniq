import { cn } from "@/lib/utils";
import { Stethoscope, Target, AlertTriangle, Calendar, MessageSquare, Sparkles } from "lucide-react";
import type { CoachType } from "@/hooks/useYouTubeCoach";

interface CoachQuickActionProps {
  type: CoachType;
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}

const CoachQuickAction = ({ title, description, icon, onClick, disabled }: CoachQuickActionProps) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "flex flex-col items-start gap-2 p-4 rounded-xl",
      "bg-card border border-border/50",
      "text-left transition-all duration-200",
      "hover:border-primary/30 hover:bg-card/80",
      "disabled:opacity-50 disabled:cursor-not-allowed",
      "group"
    )}
  >
    <div className={cn(
      "p-2 rounded-lg bg-primary/10 text-primary",
      "group-hover:bg-primary/20 transition-colors"
    )}>
      {icon}
    </div>
    <div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
    </div>
  </button>
);

interface CoachQuickActionsProps {
  onSelect: (type: CoachType) => void;
  disabled?: boolean;
}

const CoachQuickActions = ({ onSelect, disabled }: CoachQuickActionsProps) => {
  const actions = [
    {
      type: "diagnosis" as CoachType,
      title: "Channel Diagnosis",
      description: "Find out why your channel is stuck",
      icon: <Stethoscope className="w-5 h-5" />,
    },
    {
      type: "weakPoints" as CoachType,
      title: "Weak Points Analysis",
      description: "Identify what's hurting your growth",
      icon: <AlertTriangle className="w-5 h-5" />,
    },
    {
      type: "nextContent" as CoachType,
      title: "Next Week's Content",
      description: "Get strategic video recommendations",
      icon: <Calendar className="w-5 h-5" />,
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Sparkles className="w-4 h-4" />
        <span>Quick Actions</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {actions.map((action) => (
          <CoachQuickAction
            key={action.type}
            {...action}
            onClick={() => onSelect(action.type)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};

export default CoachQuickActions;
