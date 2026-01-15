import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-32">
      <div className="container">
        <ScrollAnimation>
          {/* Single featured testimonial - maximum impact */}
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground/60 uppercase tracking-widest mb-12">
              Creator stories
            </p>
            
            {/* Main quote - large and prominent */}
            <blockquote className="text-2xl md:text-3xl lg:text-4xl font-light leading-relaxed text-foreground mb-10">
              "ZainIQ completely transformed how I approach content. The intelligence it provides helped me{" "}
              <span className="text-primary font-medium">increase CTR by 40%</span>{" "}
              in just three months."
            </blockquote>

            {/* Attribution */}
            <div className="flex items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-full bg-muted" />
              <div className="text-left">
                <div className="font-medium">Alex Chen</div>
                <div className="text-sm text-muted-foreground">Tech Creator · 2.1M subscribers</div>
              </div>
            </div>
          </div>
        </ScrollAnimation>

        {/* Supporting social proof - secondary importance */}
        <ScrollAnimation>
          <div className="mt-24 pt-16 border-t border-border/50">
            <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6">
              {["YouTube", "Forbes", "TechCrunch", "The Verge", "Wired"].map((logo, index) => (
                <span
                  key={index}
                  className="text-sm font-medium text-muted-foreground/30"
                >
                  {logo}
                </span>
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default TestimonialsSection;
