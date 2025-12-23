import { BarChart3, Sparkles, Search, Users, Gauge, Zap, TrendingUp, Video, Bell, FileText } from "lucide-react";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const MiniChart = () => (
  <div className="flex items-end gap-1 h-16 mt-4">
    {[40, 65, 45, 80, 55, 90, 70, 95, 60, 85, 75, 100].map((height, i) => (
      <div
        key={i}
        className="flex-1 rounded-sm bg-gradient-to-t from-primary to-accent opacity-80"
        style={{ height: `${height}%` }}
      />
    ))}
  </div>
);

const featureTags = [
  "Thumbnail A/B Testing",
  "Upload Scheduler",
  "Revenue Tracking",
  "Audience Insights",
  "Trend Alerts",
  "Export Reports",
];

const FeaturesSection = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_50%_at_50%_50%,hsl(199,89%,48%,0.08),transparent)]" />
      
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

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          
          {/* Large Card - Real-Time Analytics (2 columns) */}
          <ScrollAnimation delay={0} className="md:col-span-2 lg:col-span-2">
            <div className="group h-full p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_hsl(262,83%,58%,0.15)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Real-Time Analytics</h3>
              <p className="text-muted-foreground leading-relaxed">
                Track views, subscribers, watch time, and revenue as they happen. Get instant insights with beautiful visualizations.
              </p>
              <MiniChart />
            </div>
          </ScrollAnimation>

          {/* Medium Card - AI-Powered Tools */}
          <ScrollAnimation delay={100} className="lg:row-span-2">
            <div className="group h-full p-8 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-500 hover:border-accent/50 hover:shadow-[0_0_40px_hsl(199,89%,48%,0.15)] hover:-translate-y-1">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="w-7 h-7 text-accent" />
              </div>
              <h3 className="text-2xl font-bold mb-2">AI-Powered Tools</h3>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Generate click-worthy thumbnails, optimize titles, and get script suggestions powered by AI trained on viral content.
              </p>
              <div className="space-y-3">
                {["Thumbnail Generator", "Title Optimizer", "Script Assistant"].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-accent" />
                    <span className="text-muted-foreground">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </ScrollAnimation>

          {/* Standard Card - Keyword Research */}
          <ScrollAnimation delay={150}>
            <div className="group h-full p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_hsl(262,83%,58%,0.15)] hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Search className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Keyword Research</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Discover high-ranking keywords and optimize for search.
              </p>
            </div>
          </ScrollAnimation>

          {/* Standard Card - Competitor Tracking */}
          <ScrollAnimation delay={200}>
            <div className="group h-full p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-[0_0_40px_hsl(262,83%,58%,0.15)] hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold mb-2">Competitor Tracking</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Monitor rivals and spot trends before they go viral.
              </p>
            </div>
          </ScrollAnimation>

          {/* Standard Card - SEO Scoring */}
          <ScrollAnimation delay={250}>
            <div className="group h-full p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-sm transition-all duration-500 hover:border-accent/50 hover:shadow-[0_0_40px_hsl(199,89%,48%,0.15)] hover:-translate-y-1">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <Gauge className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold mb-2">SEO Scoring</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Get actionable scores to improve discoverability.
              </p>
            </div>
          </ScrollAnimation>

          {/* Wide Card - And more... (3 columns) */}
          <ScrollAnimation delay={300} className="md:col-span-2 lg:col-span-3">
            <div className="group h-full p-8 rounded-2xl bg-gradient-to-br from-card/80 to-card/40 border border-border/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/30 hover:shadow-[0_0_40px_hsl(262,83%,58%,0.1)] hover:-translate-y-1">
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">And so much more...</h3>
                  <p className="text-muted-foreground max-w-md">
                    Discover all the powerful tools designed to supercharge your YouTube growth.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 max-w-sm">
                  {featureTags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-full text-xs font-medium bg-secondary/50 border border-border/50 text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors cursor-default"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </ScrollAnimation>

        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
