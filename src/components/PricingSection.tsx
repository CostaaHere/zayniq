import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="py-32">
      <div className="container">
        <ScrollAnimation>
          <div className="text-center mb-20">
            <p className="text-sm text-muted-foreground/60 uppercase tracking-widest mb-4">
              Pricing
            </p>
            <h2 className="text-3xl md:text-4xl font-semibold mb-4">
              Start free. Grow when ready.
            </h2>
            <p className="text-muted-foreground">
              No surprises. Cancel anytime.
            </p>
          </div>
        </ScrollAnimation>

        {/* Billing toggle - subtle */}
        <ScrollAnimation>
          <div className="flex justify-center mb-16">
            <div className="inline-flex items-center gap-3 p-1 rounded-lg bg-muted/50">
              <button
                onClick={() => setIsYearly(false)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  !isYearly
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsYearly(true)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                  isYearly
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly <span className="text-accent text-xs ml-1">-20%</span>
              </button>
            </div>
          </div>
        </ScrollAnimation>

        {/* Pricing - Growth highlighted as primary path */}
        <div className="max-w-4xl mx-auto">
          <ScrollAnimation>
            {/* Primary choice - Growth plan */}
            <div className="relative p-10 rounded-2xl bg-gradient-to-b from-muted/80 to-muted/40 mb-8">
              <div className="absolute -top-3 left-8 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                Most popular
              </div>
              
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-1">Growth</h3>
                  <p className="text-muted-foreground mb-4">For serious creators</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-semibold">
                      ${isYearly ? 15 : 19}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <div className="flex-1 md:max-w-sm">
                  <ul className="grid grid-cols-1 gap-2 mb-6">
                    {[
                      "Unlimited content analyses",
                      "Full AI Studio access",
                      "Competitor intelligence",
                      "Advanced discovery optimization",
                    ].map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>

                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
                  asChild
                >
                  <Link to="/signup">
                    Start free trial
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </ScrollAnimation>

          {/* Secondary options - de-emphasized */}
          <ScrollAnimation delay={100}>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Starter */}
              <div className="p-6 rounded-xl bg-card/50">
                <h3 className="text-lg font-semibold mb-1">Starter</h3>
                <p className="text-sm text-muted-foreground mb-4">Explore the platform</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-semibold">$0</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/signup">Get started</Link>
                </Button>
              </div>

              {/* Scale */}
              <div className="p-6 rounded-xl bg-card/50">
                <h3 className="text-lg font-semibold mb-1">Scale</h3>
                <p className="text-sm text-muted-foreground mb-4">For teams and agencies</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-semibold">${isYearly ? 39 : 49}</span>
                  <span className="text-muted-foreground text-sm">/month</span>
                </div>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to="/signup">Contact sales</Link>
                </Button>
              </div>
            </div>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
