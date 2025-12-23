import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(262,83%,58%,0.3),transparent)]" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />
      
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
          <p className="animate-fade-up-delay-2 text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Unlock powerful analytics, AI-driven SEO tools, and competitor insights 
            to skyrocket your channel's growth and engagement.
          </p>

          {/* CTAs */}
          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="hero" size="xl">
              Start Free Trial
              <ArrowRight className="w-5 h-5" />
            </Button>
            <Button variant="glass" size="xl">
              <Play className="w-5 h-5" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="animate-fade-up-delay-3 mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { value: "50K+", label: "Active Creators" },
              { value: "2.5B", label: "Views Analyzed" },
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
