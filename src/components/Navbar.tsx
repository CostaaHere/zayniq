import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

const Navbar = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Play className="w-4 h-4 text-primary-foreground fill-current" />
          </div>
          <span className="text-xl font-bold gradient-text">ZaynIQ</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("features")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Features
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection("testimonials")}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Testimonials
          </button>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button variant="hero" size="sm" asChild>
            <Link to="/signup">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
