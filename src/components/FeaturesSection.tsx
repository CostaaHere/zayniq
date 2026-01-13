import { BarChart3, Brain, Eye, Users, Target, LineChart } from "lucide-react";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: BarChart3,
    title: "Channel Intelligence",
    description: "Deep insights into performance, audience behavior, and growth patterns updated in real-time.",
  },
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Personalized recommendations that understand your channel's DNA and maximize impact.",
  },
  {
    icon: Eye,
    title: "Audience Understanding",
    description: "Know who's watching, what they want, and when they engage most with your content.",
  },
  {
    icon: Users,
    title: "Competitor Intelligence",
    description: "Track rivals, spot opportunities, and stay ahead of trends in your niche.",
  },
  {
    icon: Target,
    title: "Discovery Optimization",
    description: "Maximize visibility with intelligent SEO analysis and keyword insights.",
  },
  {
    icon: LineChart,
    title: "Growth Forecasting",
    description: "Predict performance and identify the best strategies for sustainable growth.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="container">
        <ScrollAnimation>
          <div className="max-w-2xl mb-20">
            <h2 className="text-title md:text-display font-semibold mb-6">
              One platform.
              <br />
              <span className="text-muted-foreground">Complete channel mastery.</span>
            </h2>
            <p className="text-lg text-muted-foreground leading-relaxed">
              ZainIQ learns your channel inside and out—delivering actionable intelligence to accelerate your growth.
            </p>
          </div>
        </ScrollAnimation>

        {/* Clean grid layout */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-16">
          {features.map((feature, index) => (
            <ScrollAnimation key={index} delay={index * 50}>
              <div className="group">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-5 group-hover:bg-primary/10 transition-colors">
                  <feature.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
