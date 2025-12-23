import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/useProfile";
import OnboardingProgress from "@/components/onboarding/OnboardingProgress";
import ProfileStep from "@/components/onboarding/ProfileStep";
import ConnectChannelStep from "@/components/onboarding/ConnectChannelStep";
import GoalsStep from "@/components/onboarding/GoalsStep";
import CompleteStep from "@/components/onboarding/CompleteStep";
import { Loader2 } from "lucide-react";

const TOTAL_STEPS = 4;

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Redirect to signin if not authenticated
    if (!authLoading && !user) {
      navigate("/signin");
      return;
    }

    // If profile is loaded and onboarding is completed, redirect to dashboard
    if (!profileLoading && profile?.onboarding_completed) {
      navigate("/dashboard");
      return;
    }

    // Resume from saved step
    if (profile?.onboarding_step) {
      setCurrentStep(Math.min(profile.onboarding_step, TOTAL_STEPS - 1));
    }
  }, [authLoading, user, profileLoading, profile, navigate]);

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[var(--gradient-hero)]" />
      <div className="absolute inset-0 bg-[var(--gradient-glow)]" />

      <div className="relative z-10 max-w-xl mx-auto px-4 py-12">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold gradient-text">ZaynIQ</h1>
        </div>

        {/* Progress */}
        <div className="mb-12">
          <OnboardingProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
        </div>

        {/* Step Content */}
        <div className="glass-card p-8">
          {currentStep === 0 && <ProfileStep onNext={nextStep} />}
          {currentStep === 1 && (
            <ConnectChannelStep onNext={nextStep} onBack={prevStep} />
          )}
          {currentStep === 2 && (
            <GoalsStep onNext={nextStep} onBack={prevStep} />
          )}
          {currentStep === 3 && <CompleteStep />}
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
