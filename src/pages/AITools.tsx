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

const aiTools = [
  {
    id: "titles",
    title: "Title Generator",
    description: "Generate click-worthy titles optimized for engagement and SEO",
    icon: Type,
    path: "/dashboard/ai-tools/titles",
    gradient: "from-primary to-accent",
    features: ["10 title options", "Power word analysis", "Character count"],
    isNew: true,
  },
  {
    id: "descriptions",
    title: "Description Generator",
    description: "Create optimized descriptions with hashtags and CTAs",
    icon: FileText,
    path: "/dashboard/ai-tools/descriptions",
    gradient: "from-accent to-primary",
    features: ["SEO optimized", "Hashtag suggestions", "YouTube preview"],
    isNew: true,
  },
  {
    id: "tags",
    title: "Tag Generator",
    description: "Generate relevant tags to improve video discoverability",
    icon: Hash,
    path: "/dashboard/ai-tools/tags",
    gradient: "from-purple-500 to-pink-500",
    features: ["Trending tags", "Competitor analysis", "Relevance score"],
    comingSoon: true,
  },
  {
    id: "thumbnails",
    title: "Thumbnail Ideas",
    description: "Get AI-powered thumbnail concepts and text overlays",
    icon: Image,
    path: "/dashboard/ai-tools/thumbnails",
    gradient: "from-orange-500 to-red-500",
    features: ["Text suggestions", "Color palettes", "Layout ideas"],
    comingSoon: true,
  },
  {
    id: "ideas",
    title: "Content Ideas",
    description: "Discover trending topics and video ideas for your niche",
    icon: Lightbulb,
    path: "/dashboard/ai-tools/ideas",
    gradient: "from-yellow-500 to-orange-500",
    features: ["Niche analysis", "Trend detection", "Gap finder"],
    comingSoon: true,
  },
  {
    id: "analytics",
    title: "Performance Predictor",
    description: "Predict how your video might perform before publishing",
    icon: TrendingUp,
    path: "/dashboard/ai-tools/predictor",
    gradient: "from-green-500 to-teal-500",
    features: ["View estimates", "Engagement score", "Best time to post"],
    comingSoon: true,
  },
];

const AITools = () => {
  return (
    <DashboardLayout title="AI Tools">
      <div className="space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">AI-Powered Tools</h2>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Supercharge your YouTube workflow with our AI tools designed to help you create
            better content, optimize for search, and grow your channel faster.
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {aiTools.map((tool) => (
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
                      Get Started
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
                <h3 className="font-semibold mb-1">Pro Tips</h3>
                <p className="text-sm text-muted-foreground">
                  For best results, be specific with your inputs. Include your target keyword,
                  niche, and desired tone to get more relevant and optimized outputs. The AI
                  learns from YouTube best practices and trending patterns.
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
