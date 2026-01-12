import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState("Finishing sign-in…");

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
          setMessage("Signed in. Redirecting…");
          navigate("/dashboard", { replace: true });
          return;
        }

        setMessage("Sign-in failed. Redirecting to sign in…");
        navigate("/signin", { replace: true });
      } catch (e) {
        if (cancelled) return;
        setMessage("Sign-in failed. Redirecting to sign in…");
        navigate("/signin", { replace: true });
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [hasCode, navigate]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <section className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold">Authenticating</h1>
        <p className="mt-2 text-sm text-muted-foreground">{message}</p>
      </section>
    </main>
  );
};

export default AuthCallback;
