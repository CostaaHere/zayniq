import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
  Type,
  FileText,
  Hash,
  Image,
  Lightbulb,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const workflows = [
  {
    id: "titles",
    title: "Title Optimization",
    description: "Craft titles that resonate with your specific audience",
    icon: Type,
    path: "/dashboard/ai-tools/titles",
  },
  {
    id: "descriptions",
    title: "Description Intelligence",
    description: "SEO-optimized descriptions that improve discoverability",
    icon: FileText,
    path: "/dashboard/ai-tools/descriptions",
  },
  {
    id: "tags",
    title: "Tag Strategy",
    description: "Smart tags based on your content and competition",
    icon: Hash,
    path: "/dashboard/ai-tools/tags",
  },
  {
    id: "thumbnails",
    title: "Thumbnail Insights",
    description: "Visual concepts to maximize click-through rates",
    icon: Image,
    path: "/dashboard/ai-tools/thumbnails",
  },
  {
    id: "ideas",
    title: "Content Intelligence",
    description: "Discover what your audience wants next",
    icon: Lightbulb,
    path: "/dashboard/ai-tools/content-ideas",
  },
];

const AITools = () => {
  return (
    <DashboardLayout title="">
      <div className="max-w-3xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold">AI Studio</h1>
          </div>
          <p className="text-muted-foreground">
            Intelligence trained on your channel. Choose a workflow to get started.
          </p>
        </div>

        {/* Workflows - Clean list, not cards */}
        <div className="space-y-2">
          {workflows.map((workflow) => (
            <Link
              key={workflow.id}
              to={workflow.path}
              className="group flex items-center gap-4 p-5 rounded-xl bg-muted/20 hover:bg-muted/40 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                <workflow.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium mb-0.5">{workflow.title}</div>
                <div className="text-sm text-muted-foreground">
                  {workflow.description}
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-muted-foreground/50 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>

        {/* Context note */}
        <div className="mt-10 p-5 rounded-xl bg-gradient-to-r from-primary/5 to-accent/5">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h3 className="font-medium text-sm mb-1">Personalized to your channel</h3>
              <p className="text-sm text-muted-foreground">
                ZainIQ analyzes your content patterns, audience behavior, and performance data to deliver recommendations unique to you.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AITools;
