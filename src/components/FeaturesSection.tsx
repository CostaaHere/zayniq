import { Brain, Eye, Target } from "lucide-react";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="container">
        {/* Section header - clear hierarchy */}
        <ScrollAnimation>
          <div className="text-center max-w-2xl mx-auto mb-24">
            <p className="text-sm text-muted-foreground/60 uppercase tracking-widest mb-4">
              How it works
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold mb-5">
              Intelligence that learns your channel
            </h2>
            <p className="text-lg text-muted-foreground">
              Connect once. Get insights forever.
            </p>
          </div>
        </ScrollAnimation>

        {/* 3 Core differentiators - visual hierarchy through size */}
        <div className="max-w-4xl mx-auto">
          {/* Primary feature - largest */}
          <ScrollAnimation>
            <div className="text-center mb-20">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-3">Personalized to Your DNA</h3>
              <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                ZainIQ studies your content, audience, and performance patterns to deliver recommendations unique to your channel.
              </p>
            </div>
          </ScrollAnimation>

          {/* Secondary features - smaller, side by side */}
          <div className="grid md:grid-cols-2 gap-12 md:gap-16">
            <ScrollAnimation delay={100}>
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto md:mx-0 mb-5">
                  <Eye className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Know Your Audience</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Understand who's watching, what they want, and when they engage most.
                </p>
              </div>
            </ScrollAnimation>

            <ScrollAnimation delay={200}>
              <div className="text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mx-auto md:mx-0 mb-5">
                  <Target className="w-6 h-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Outsmart Competitors</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Track rivals, spot trends before they peak, and stay ahead in your niche.
                </p>
              </div>
            </ScrollAnimation>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
