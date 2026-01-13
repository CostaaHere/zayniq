import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl">
      <div className="container h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <span className="text-sm font-bold text-primary-foreground">Z</span>
          </div>
          <span className="text-lg font-semibold text-foreground">ZainIQ</span>
        </Link>

        {/* Center nav */}
        <div className="hidden md:flex items-center gap-8">
          <button
            onClick={() => scrollToSection("features")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Platform
          </button>
          <button
            onClick={() => scrollToSection("pricing")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => scrollToSection("testimonials")}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Creators
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" asChild>
            <Link to="/signin">Sign in</Link>
          </Button>
          <Button size="sm" className="bg-foreground text-background hover:bg-foreground/90" asChild>
            <Link to="/signup">Get started</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
