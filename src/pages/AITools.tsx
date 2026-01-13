import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Type,
  FileText,
  Hash,
  Image,
  Lightbulb,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const aiCapabilities = [
  {
    id: "titles",
    title: "Title Optimization",
    description: "AI-powered analysis to craft titles that resonate with your audience",
    icon: Type,
    path: "/dashboard/ai-tools/titles",
    gradient: "from-primary to-accent",
    features: ["Audience-tailored", "SEO analysis", "Engagement scoring"],
    isNew: true,
  },
  {
    id: "descriptions",
    title: "Description Intelligence",
    description: "Strategic descriptions that improve discoverability and viewer engagement",
    icon: FileText,
    path: "/dashboard/ai-tools/descriptions",
    gradient: "from-accent to-primary",
    features: ["SEO-optimized", "Smart CTAs", "Keyword integration"],
    isNew: true,
  },
  {
    id: "tags",
    title: "Tag Strategy",
    description: "Intelligent tag recommendations based on your content and competition",
    icon: Hash,
    path: "/dashboard/ai-tools/tags",
    gradient: "from-purple-500 to-pink-500",
    features: ["Competitive analysis", "Niche targeting", "Trend-aware"],
    isNew: true,
  },
  {
    id: "thumbnails",
    title: "Thumbnail Insights",
    description: "AI-driven concepts to maximize click-through rates",
    icon: Image,
    path: "/dashboard/ai-tools/thumbnails",
    gradient: "from-orange-500 to-red-500",
    features: ["Visual strategy", "Text guidance", "Color psychology"],
    isNew: true,
  },
  {
    id: "ideas",
    title: "Content Intelligence",
    description: "Discover what your audience wants before they know it",
    icon: Lightbulb,
    path: "/dashboard/ai-tools/content-ideas",
    gradient: "from-yellow-500 to-orange-500",
    features: ["Trend detection", "Audience demand", "Opportunity mapping"],
    isNew: true,
  },
  {
    id: "analytics",
    title: "Performance Prediction",
    description: "Forecast video performance with AI-powered analysis",
    icon: TrendingUp,
    path: "/dashboard/ai-tools/predictor",
    gradient: "from-green-500 to-teal-500",
    features: ["View forecasting", "Engagement prediction", "Optimal timing"],
    comingSoon: true,
  },
];

const AITools = () => {
  return (
    <DashboardLayout title="AI Studio">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">AI Studio</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Your intelligent content partner. AI that understands your channel and delivers 
            personalized insights to optimize every aspect of your content strategy.
          </p>
        </div>

        {/* Capabilities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiCapabilities.map((tool) => (
            <Card
              key={tool.id}
              className={`bg-card border-border relative overflow-hidden group transition-all duration-300 ${
                tool.comingSoon ? "opacity-60" : "hover:border-primary/50 hover:shadow-lg"
              }`}
            >
              {/* Gradient overlay */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${tool.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
              />

              <CardHeader className="relative">
                <div className="flex items-start justify-between">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center mb-3`}
                  >
                    <tool.icon className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex gap-2">
                    {tool.isNew && (
                      <Badge className="bg-primary/10 text-primary border-primary/20">
                        New
                      </Badge>
                    )}
                    {tool.comingSoon && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Coming Soon
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="text-lg">{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>

              <CardContent className="relative space-y-4">
                {/* Features */}
                <div className="flex flex-wrap gap-2">
                  {tool.features.map((feature) => (
                    <Badge
                      key={feature}
                      variant="outline"
                      className="text-xs bg-muted/50"
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>

                {/* Action Button */}
                {tool.comingSoon ? (
                  <Button variant="outline" disabled className="w-full">
                    Coming Soon
                  </Button>
                ) : (
                  <Button asChild className="w-full group/btn gap-2">
                    <Link to={tool.path}>
                      Open
                      <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tips Section */}
        <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
          <CardContent className="py-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Lightbulb className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">How It Works</h3>
                <p className="text-sm text-muted-foreground">
                  ZainIQ learns from your channel's performance data, audience behavior, and competitive landscape.
                  The more you use it, the smarter your recommendations become—tailored specifically to your growth goals.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AITools;
