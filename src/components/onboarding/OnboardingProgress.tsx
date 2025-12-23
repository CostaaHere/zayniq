import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { label: "Profile", icon: "👤" },
  { label: "Channel", icon: "📺" },
  { label: "Goals", icon: "🎯" },
  { label: "Complete", icon: "🚀" },
];

const OnboardingProgress = ({ currentStep, totalSteps }: OnboardingProgressProps) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="relative h-2 bg-secondary rounded-full overflow-hidden mb-6">
        <div
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>

      {/* Step Indicators */}
      <div className="flex justify-between">
        {steps.map((step, index) => (
          <div key={index} className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-lg transition-all duration-300",
                index < currentStep
                  ? "bg-primary text-primary-foreground"
                  : index === currentStep
                  ? "bg-gradient-to-r from-primary to-accent text-white ring-4 ring-primary/20"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {index < currentStep ? (
                <Check className="w-5 h-5" />
              ) : (
                step.icon
              )}
            </div>
            <span
              className={cn(
                "mt-2 text-sm font-medium transition-colors",
                index <= currentStep ? "text-foreground" : "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OnboardingProgress;
