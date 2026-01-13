import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative min-h-[100vh] flex flex-col items-center justify-center pt-20 pb-32">
      {/* Subtle gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/6 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: "2s" }} />
      
      <div className="container relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          {/* Minimal badge */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 mb-8 text-sm text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <span>AI-Powered Growth Intelligence</span>
          </div>

          {/* Bold headline */}
          <h1 className="animate-fade-up-delay-1 text-display-xl md:text-[5.5rem] font-semibold leading-[1.05] tracking-tight mb-8">
            Your channel's
            <br />
            <span className="gradient-text">intelligence partner</span>
          </h1>

          {/* Clean subheadline */}
          <p className="animate-fade-up-delay-2 text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-12">
            Understand your audience, outsmart competitors, and grow faster with AI that learns your channel.
          </p>

          {/* Single focused CTA */}
          <div className="animate-fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button 
              variant="hero" 
              size="xl" 
              className="btn-glow text-base px-8 h-14" 
              asChild
            >
              <Link to="/signup">
                Start for free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <span className="text-sm text-muted-foreground">
              No credit card required
            </span>
          </div>
        </div>

        {/* Stats row - minimal */}
        <div className="animate-fade-up-delay-3 mt-24 pt-12 border-t border-border/50">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-16 max-w-3xl mx-auto">
            {[
              { value: "50K+", label: "Creators" },
              { value: "2M+", label: "Videos analyzed" },
              { value: "500M+", label: "Views tracked" },
              { value: "35%", label: "Avg. growth" },
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-semibold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
