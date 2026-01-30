import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finishing sign-in…");
  const [status, setStatus] = useState<"loading" | "syncing" | "success" | "error">("loading");

  const hasCode = useMemo(() => {
    try {
      return new URL(window.location.href).searchParams.has("code");
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      try {
        // PKCE flow returns a `code` query param; exchange it for a session.
        if (hasCode) {
          const { error } = await supabase.auth.exchangeCodeForSession(window.location.href);
          if (error) throw error;
        }

        const { data } = await supabase.auth.getSession();
        if (cancelled) return;

        if (data.session?.user) {
          // Check if we have a provider token (from YouTube/Google OAuth)
          if (data.session.provider_token) {
            setStatus("syncing");
            setMessage("Syncing your YouTube channel…");

            try {
              // Auto-sync YouTube data
              const response = await supabase.functions.invoke("youtube-oauth", {
                body: {
                  action: "syncMyData",
                  providerToken: data.session.provider_token,
                  maxResults: 50,
                },
              });

              if (response.error) {
                console.error("YouTube sync error:", response.error);
                // Don't fail the auth flow, just log the error
              } else {
                console.log("YouTube data synced successfully");
              }
            } catch (syncError) {
              console.error("YouTube sync error:", syncError);
              // Continue with redirect even if sync fails
            }
          }

          setStatus("success");
          setMessage("Signed in successfully! Redirecting…");
          
          // Small delay to show success state
          setTimeout(() => {
            if (!cancelled) {
              // Check if user needs onboarding
              checkOnboardingAndRedirect(data.session.user.id);
            }
          }, 500);
          return;
        }

        setStatus("error");
        setMessage("Sign-in failed. Redirecting to sign in…");
        setTimeout(() => navigate("/signin", { replace: true }), 1500);
      } catch (e) {
        if (cancelled) return;
        console.error("Auth callback error:", e);
        setStatus("error");
        setMessage("Sign-in failed. Redirecting to sign in…");
        setTimeout(() => navigate("/signin", { replace: true }), 1500);
      }
    };

    const checkOnboardingAndRedirect = async (userId: string) => {
      try {
        const { data: profile } = await supabase
          .from("profiles")
          .select("onboarding_completed")
          .eq("id", userId)
          .single();

        if (profile?.onboarding_completed) {
          navigate("/dashboard", { replace: true });
        } else {
          navigate("/onboarding", { replace: true });
        }
      } catch {
        // If profile check fails, go to dashboard
        navigate("/dashboard", { replace: true });
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [hasCode, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mb-4">
          {status === "loading" || status === "syncing" ? (
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          ) : status === "success" ? (
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto" />
          ) : (
            <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          )}
        </div>
        <h1 className="text-lg font-semibold mb-2">
          {status === "loading" && "Authenticating"}
          {status === "syncing" && "Connecting YouTube"}
          {status === "success" && "Success!"}
          {status === "error" && "Authentication Failed"}
        </h1>
        <p className="text-sm text-muted-foreground">{message}</p>
      </section>
    </main>
  );
};

export default AuthCallback;
