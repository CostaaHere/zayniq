import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-32 relative">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      
      <div className="container relative">
        <ScrollAnimation>
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-title md:text-display font-semibold mb-6">
              Ready to grow smarter?
            </h2>
            
            <p className="text-lg text-muted-foreground mb-10">
              Join 50,000+ creators who trust ZainIQ to understand their channel and unlock their full potential.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button 
                size="xl" 
                className="bg-foreground text-background hover:bg-foreground/90 h-14 px-8 text-base" 
                asChild
              >
                <Link to="/signup">
                  Get started for free
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <p className="mt-6 text-sm text-muted-foreground">
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default CTASection;
