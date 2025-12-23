import { BarChart3, Search, Brain, Users } from "lucide-react";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const features = [
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Deep dive into your channel performance with real-time metrics, audience insights, and revenue tracking.",
  },
  {
    icon: Search,
    title: "SEO Optimization",
    description: "Discover high-ranking keywords, optimize titles and descriptions, and improve your video discoverability.",
  },
  {
    icon: Brain,
    title: "AI-Powered Tools",
    description: "Generate thumbnails, titles, and scripts with our AI assistant trained on viral content patterns.",
  },
  {
    icon: Users,
    title: "Competitor Tracking",
    description: "Monitor your competitors' strategies, track their growth, and identify opportunities to outperform them.",
  },
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,hsl(199,89%,48%,0.1),transparent)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <ScrollAnimation>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Everything you need to
              <span className="gradient-text"> dominate YouTube</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help creators understand, optimize, and grow their channels.
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <ScrollAnimation key={index} delay={index * 100}>
              <div className="glass-card p-8 h-full hover:border-primary/50 transition-all duration-500 hover:scale-105 group">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
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
