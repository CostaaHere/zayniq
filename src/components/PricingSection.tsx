import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const plans = [
  {
    name: "Starter",
    price: 0,
    description: "Explore the platform",
    features: [
      "Channel intelligence dashboard",
      "3 content analyses per month",
      "Basic discovery insights",
      "Community support",
    ],
    cta: "Get started",
    popular: false,
  },
  {
    name: "Growth",
    monthlyPrice: 19,
    yearlyPrice: 15,
    description: "For serious creators",
    features: [
      "Everything in Starter",
      "Unlimited content analyses",
      "Full AI Studio access",
      "Competitor intelligence (5 channels)",
      "Advanced discovery optimization",
      "Priority support",
    ],
    cta: "Start free trial",
    popular: true,
  },
  {
    name: "Scale",
    monthlyPrice: 49,
    yearlyPrice: 39,
    description: "For teams and agencies",
    features: [
      "Everything in Growth",
      "Unlimited competitor intelligence",
      "Team collaboration (5 seats)",
      "White-label reports",
      "API access",
      "Dedicated success manager",
    ],
    cta: "Contact sales",
    popular: false,
  },
];

const PricingSection = () => {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section id="pricing" className="py-32">
      <div className="container">
        <ScrollAnimation>
          <div className="text-center mb-16">
            <h2 className="text-title md:text-display font-semibold mb-4">
              Simple pricing
            </h2>
            <p className="text-lg text-muted-foreground mb-10">
              Start free, upgrade when you're ready.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-3 p-1 rounded-lg bg-muted">
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
                className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${
                  isYearly
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Yearly
                <span className="text-xs text-accent font-semibold">-20%</span>
              </button>
            </div>
          </div>
        </ScrollAnimation>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollAnimation key={index} delay={index * 100}>
              <div
                className={`relative p-8 rounded-xl transition-all ${
                  plan.popular
                    ? "bg-muted ring-1 ring-primary/20"
                    : "bg-card hover:bg-muted/50"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                    Popular
                  </div>
                )}

                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-1">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-semibold">
                      ${plan.price !== undefined 
                        ? plan.price 
                        : isYearly 
                          ? plan.yearlyPrice 
                          : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3 text-sm">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.popular
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                  asChild
                >
                  <Link to="/signup">{plan.cta}</Link>
                </Button>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
