import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle2, AlertCircle, Youtube } from "lucide-react";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState("Finishing sign-in…");
  const [status, setStatus] = useState<"loading" | "syncing" | "success" | "error">("loading");

  const hasCode = useMemo(() => {
    try {
      return new URL(window.location.href).searchParams.has("code");
    } catch {
      return false;
    }
  }, []);

  // Check if this is a YouTube connection flow
  const isYouTubeConnect = useMemo(() => {
    return searchParams.get("youtube") === "true";
  }, [searchParams]);

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
            setMessage(isYouTubeConnect 
              ? "Connecting your YouTube channel…" 
              : "Syncing your YouTube channel…"
            );

            try {
              // Sync YouTube data
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
                setMessage("Signed in! YouTube sync will retry later.");
              } else {
                console.log("YouTube data synced successfully");
                
                // Store OAuth tokens for future use
                const channel = response.data?.channel;
                if (channel) {
                  await supabase.from("youtube_oauth_tokens").upsert({
                    user_id: data.session.user.id,
                    access_token: data.session.provider_token,
                    refresh_token: data.session.provider_refresh_token || null,
                    youtube_channel_id: channel.id,
                    channel_name: channel.name,
                    channel_thumbnail: channel.thumbnail,
                    scopes: ["youtube.readonly"],
                  }, { onConflict: "user_id" });
                }
                
                setMessage(`Connected ${channel?.name || 'your channel'} successfully!`);
              }
            } catch (syncError) {
              console.error("YouTube sync error:", syncError);
              setMessage("Signed in! YouTube sync will retry later.");
            }
          }

          setStatus("success");
          if (!message.includes("Connected")) {
            setMessage("Signed in successfully! Redirecting…");
          }
          
          // Small delay to show success state
          setTimeout(() => {
            if (!cancelled) {
              checkOnboardingAndRedirect(data.session.user.id);
            }
          }, 1000);
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
          .select("onboarding_completed, onboarding_step")
          .eq("id", userId)
          .single();

        if (profile?.onboarding_completed) {
          navigate("/dashboard", { replace: true });
        } else if (isYouTubeConnect && profile?.onboarding_step === 1) {
          // If this was a YouTube connect during onboarding, update the step
          await supabase.from("profiles").update({ onboarding_step: 2 }).eq("id", userId);
          navigate("/onboarding", { replace: true });
        } else if (profile) {
          navigate("/onboarding", { replace: true });
        } else {
          navigate("/dashboard", { replace: true });
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
  }, [hasCode, navigate, isYouTubeConnect, message]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mb-4">
          {status === "loading" ? (
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
          ) : status === "syncing" ? (
            <div className="relative">
              <Youtube className="w-10 h-10 text-destructive mx-auto" />
              <Loader2 className="w-5 h-5 animate-spin text-primary absolute -bottom-1 -right-1 mx-auto" style={{ left: '50%', marginLeft: '10px' }} />
            </div>
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
