import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";
import { Link } from "react-router-dom";

const CTASection = () => {
  return (
    <section className="py-32 relative">
      {/* Subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/3 to-transparent" />
      
      <div className="container relative">
        <ScrollAnimation>
          <div className="max-w-xl mx-auto text-center">
            {/* Single emotional promise */}
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6 leading-tight">
              Stop guessing.
              <br />
              <span className="text-muted-foreground">Start growing.</span>
            </h2>
            
            {/* Single primary action */}
            <div className="mt-10">
              <Button 
                size="xl" 
                className="bg-foreground text-background hover:bg-foreground/90 h-14 px-10 text-base font-medium" 
                asChild
              >
                <Link to="/signup">
                  Connect your channel
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>

            <p className="mt-5 text-sm text-muted-foreground/60">
              Free to start · No credit card required
            </p>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default CTASection;
