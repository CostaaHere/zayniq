import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyRound, ArrowLeft, Mail, CheckCircle } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    setIsSuccess(true);
    setIsLoading(false);
  };

  const handleResend = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {!isSuccess ? (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg">
            {/* Key Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <KeyRound className="w-8 h-8 text-primary" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-foreground text-center mb-2">
              Forgot your password?
            </h1>
            <p className="text-muted-foreground text-center mb-8">
              No worries, we'll send you reset instructions.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full"
                  required
                />
              </div>

              {error && (
                <p className="text-destructive text-sm">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>

            {/* Back to Sign In */}
            <Link
              to="/signin"
              className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-8 shadow-lg text-center">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Success Message */}
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Check your email
            </h1>
            <p className="text-muted-foreground mb-6">
              We sent a password reset link to
              <br />
              <span className="font-medium text-foreground">{email}</span>
            </p>

            {/* Resend Option */}
            <p className="text-sm text-muted-foreground mb-4">
              Didn't receive the email?{" "}
              <button
                onClick={handleResend}
                className="text-primary hover:underline font-medium"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Click to resend"}
              </button>
            </p>

            {/* Back to Sign In */}
            <Link
              to="/signin"
              className="flex items-center justify-center gap-2 mt-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
