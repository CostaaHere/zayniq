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
        <div className="max-w-4xl mx-auto text-center">
          {/* Minimal badge - secondary importance */}
          <div className="animate-fade-up inline-flex items-center gap-2 px-3 py-1.5 mb-10 text-sm text-muted-foreground/70">
            <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
            <span>Trusted by 50,000+ creators</span>
          </div>

          {/* HERO MESSAGE - Primary focus, outcome-first */}
          <h1 className="animate-fade-up-delay-1 text-[3.5rem] md:text-[5rem] lg:text-[6rem] font-semibold leading-[1.02] tracking-tight mb-8">
            <span className="text-foreground">Your YouTube</span>
            <br />
            <span className="gradient-text">Growth Partner</span>
          </h1>

          {/* Emotional promise - single line */}
          <p className="animate-fade-up-delay-2 text-xl md:text-2xl text-muted-foreground font-light max-w-xl mx-auto mb-14">
            Trained on <span className="text-foreground font-medium">your</span> channel, not the internet.
          </p>

          {/* Single primary CTA */}
          <div className="animate-fade-up-delay-3">
            <Button 
              variant="hero" 
              size="xl" 
              className="btn-glow text-base px-10 h-14 font-medium" 
              asChild
            >
              <Link to="/signup">
                Start Growing for Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            
            {/* Friction reducer - tertiary */}
            <p className="mt-5 text-sm text-muted-foreground/60">
              No credit card · Connect in 30 seconds
            </p>
          </div>
        </div>
      </div>

      {/* Single powerful proof point - positioned at bottom */}
      <div className="absolute bottom-12 left-0 right-0">
        <div className="container">
          <div className="animate-fade-up-delay-3 flex items-center justify-center gap-16 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-semibold text-foreground">35%</div>
              <div className="text-sm text-muted-foreground/60">avg. growth increase</div>
            </div>
            <div className="w-px h-10 bg-border" />
            <div>
              <div className="text-3xl md:text-4xl font-semibold text-foreground">2M+</div>
              <div className="text-sm text-muted-foreground/60">videos analyzed</div>
            </div>
            <div className="w-px h-10 bg-border hidden sm:block" />
            <div className="hidden sm:block">
              <div className="text-3xl md:text-4xl font-semibold text-foreground">500M+</div>
              <div className="text-sm text-muted-foreground/60">views tracked</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
