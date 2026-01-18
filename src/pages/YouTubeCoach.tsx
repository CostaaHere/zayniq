import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Bot, RefreshCw, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CoachQuickActions from "@/components/coach/CoachQuickActions";
import CoachWelcome from "@/components/coach/CoachWelcome";
import CoachMessage from "@/components/coach/CoachMessage";
import CoachInput from "@/components/coach/CoachInput";
import { useYouTubeCoach, CoachType } from "@/hooks/useYouTubeCoach";
import { useYouTubeAnalytics } from "@/hooks/useYouTubeAnalytics";
import { useChannelDNA } from "@/hooks/useChannelDNA";
import { Link } from "react-router-dom";

const YouTubeCoach = () => {
  const { responses, loading, error, askCoach, clearHistory } = useYouTubeCoach();
  const { data: ytData, loading: ytLoading } = useYouTubeAnalytics();
  const { hasDNA, analyzing: dnaAnalyzing } = useChannelDNA();
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (responses.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [responses]);

  const handleQuickAction = (type: CoachType) => {
    askCoach(type);
  };

  const handleCustomQuestion = (question: string) => {
    askCoach("custom", question);
  };

  const needsSetup = !ytData.hasData;

  return (
    <DashboardLayout title="AI YouTube Coach">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-xl",
              "bg-gradient-to-br from-primary to-accent",
              "shadow-lg shadow-primary/20"
            )}>
              <Bot className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">AI YouTube Coach</h1>
              <p className="text-sm text-muted-foreground">
                Strategic, diagnostic advice based on your channel data
              </p>
            </div>
          </div>
          {responses.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Session
            </Button>
          )}
        </div>

        {/* Setup Required Alert */}
        {needsSetup && !ytLoading && (
          <Alert className="border-amber-500/30 bg-amber-500/10">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <AlertDescription className="text-amber-200">
              Connect your YouTube channel to get personalized coaching advice.{" "}
              <Link to="/dashboard/channel" className="underline font-medium hover:text-amber-100">
                Connect Channel →
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* DNA Enhancement Notice */}
        {!hasDNA && ytData.hasData && !dnaAnalyzing && (
          <Alert className="border-primary/30 bg-primary/10">
            <Bot className="h-4 w-4 text-primary" />
            <AlertDescription className="text-muted-foreground">
              <span className="text-foreground font-medium">Pro tip:</span> Analyze your Channel DNA for even more personalized advice.{" "}
              <Link to="/dashboard" className="underline font-medium text-primary hover:text-primary/80">
                Analyze DNA →
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Quick Actions */}
        <CoachQuickActions 
          onSelect={handleQuickAction} 
          disabled={loading || needsSetup} 
        />

        {/* Chat Area */}
        <div className={cn(
          "min-h-[400px] rounded-xl",
          "bg-card/50 border border-border/50",
          "flex flex-col"
        )}>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {responses.length === 0 ? (
              <CoachWelcome />
            ) : (
              <>
                {responses.map((response, index) => (
                  <CoachMessage key={index} response={response} />
                ))}
                {loading && (
                  <div className="flex items-center gap-3 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Analyzing your channel data...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <div className="px-6 pb-4">
              <Alert className="border-amber-500/30 bg-amber-500/10">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                <AlertDescription className="text-amber-200">
                  {error.includes("No video data") ? (
                    <>
                      No video data found. Please{" "}
                      <Link to="/dashboard/channel" className="underline font-medium hover:text-amber-100">
                        sync your YouTube channel
                      </Link>{" "}
                      first to get coaching advice.
                    </>
                  ) : (
                    error
                  )}
                </AlertDescription>
              </Alert>
            </div>
          )}

          {/* Input Area */}
          <div className="p-4 border-t border-border/50">
            <CoachInput 
              onSubmit={handleCustomQuestion} 
              loading={loading}
              disabled={needsSetup}
              placeholder={
                needsSetup 
                  ? "Connect your channel first to ask questions..." 
                  : "Ask your coach a specific question..."
              }
            />
          </div>
        </div>

        {/* Footer Hint */}
        <p className="text-center text-xs text-muted-foreground/60">
          Your coach analyzes your actual video performance, not generic YouTube advice
        </p>
      </div>
    </DashboardLayout>
  );
};

export default YouTubeCoach;
