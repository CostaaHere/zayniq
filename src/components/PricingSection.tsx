import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";
import { useState } from "react";

const plans = [
  {
    name: "Starter",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Explore the platform",
    features: [
      { name: "Channel intelligence dashboard", included: true },
      { name: "3 content analyses per month", included: true },
      { name: "Basic discovery insights", included: true },
      { name: "Community support", included: true },
      { name: "AI Studio access", included: false },
      { name: "Competitor intelligence", included: false },
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Growth",
    monthlyPrice: 19,
    yearlyPrice: 15,
    description: "For serious creators",
    features: [
      { name: "Everything in Starter", included: true },
      { name: "Unlimited content analyses", included: true },
      { name: "Full AI Studio access", included: true },
      { name: "Competitor intelligence (5 channels)", included: true },
      { name: "Advanced discovery optimization", included: true },
      { name: "Priority support", included: true },
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Scale",
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: "For teams and agencies",
    features: [
      { name: "Everything in Growth", included: true },
      { name: "Unlimited competitor intelligence", included: true },
      { name: "Team collaboration (5 seats)", included: true },
      { name: "White-label reports", included: true },
      { name: "API access", included: true },
      { name: "Dedicated success manager", included: true },
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" className="py-32 relative">
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent
            <span className="gradient-text"> pricing</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-4 p-1.5 rounded-full bg-secondary/50 border border-border">
            <button
              onClick={() => setIsYearly(false)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                !isYearly
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsYearly(true)}
              className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center gap-2 ${
                isYearly
                  ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yearly
              <span className="px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-semibold">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative rounded-2xl p-8 transition-all duration-500 hover:scale-105 ${
                plan.popular
                  ? "bg-gradient-to-b from-primary/20 to-accent/10 border-2 border-transparent bg-clip-padding"
                  : "glass-card"
              }`}
              style={
                plan.popular
                  ? {
                      background: "linear-gradient(hsl(222, 47%, 8%), hsl(222, 47%, 8%)) padding-box, linear-gradient(135deg, hsl(262, 83%, 58%), hsl(199, 89%, 48%)) border-box",
                      border: "2px solid transparent",
                    }
                  : undefined
              }
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-gradient-to-r from-primary to-accent rounded-full text-sm font-semibold shadow-lg shadow-primary/25">
                  Most Popular
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold gradient-text">
                    ${isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                  </span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                {isYearly && plan.monthlyPrice > 0 && (
                  <p className="text-sm text-accent mt-2">
                    Billed ${plan.yearlyPrice * 12}/year
                  </p>
                )}
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        feature.included
                          ? "bg-primary/20"
                          : "bg-muted"
                      }`}
                    >
                      {feature.included ? (
                        <Check className="w-3 h-3 text-primary" />
                      ) : (
                        <X className="w-3 h-3 text-muted-foreground" />
                      )}
                    </div>
                    <span
                      className={
                        feature.included
                          ? "text-muted-foreground"
                          : "text-muted-foreground/50 line-through"
                      }
                    >
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                variant={plan.popular ? "hero" : "glass"}
                className="w-full"
                size="lg"
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
