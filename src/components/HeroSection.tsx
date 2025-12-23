import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, Shield, Clock } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(262,83%,58%,0.3),transparent)]" />
      
      {/* Floating blurred circles */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl animate-float opacity-60" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-accent/25 rounded-full blur-3xl animate-float" style={{ animationDelay: "2s" }} />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "4s" }} />
      <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-accent/30 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse-glow" />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(217,33%,17%,0.3)_1px,transparent_1px),linear-gradient(to_bottom,hsl(217,33%,17%,0.3)_1px,transparent_1px)] bg-[size:60px_60px]" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-8">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary">Now with AI-powered insights</span>
          </div>

          {/* Headline */}
          <h1 className="animate-fade-up-delay-1 text-5xl md:text-7xl font-bold leading-tight mb-6">
            Grow Your YouTube
            <br />
            <span className="gradient-text">Channel Faster</span>
          </h1>

          {/* Subheadline */}
          <p className="animate-fade-up-delay-2 text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Unlock powerful analytics, AI-driven SEO tools, and competitor insights 
            to skyrocket your channel's growth and engagement.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Button variant="hero" size="xl" asChild>
              <Link to="/signup">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="glass" size="xl">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Trust badges */}
          <div className="animate-fade-up-delay-3 flex flex-wrap items-center justify-center gap-6 mb-16">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4 text-primary" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4 text-accent" />
              <span>14-day free trial</span>
            </div>
          </div>

          {/* Stats */}
          <div className="animate-fade-up-delay-3 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
            {[
              { value: "50,000+", label: "Active Creators" },
              { value: "2M+", label: "Videos Analyzed" },
              { value: "500M+", label: "Views Tracked" },
              { value: "35%", label: "Avg Growth" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
