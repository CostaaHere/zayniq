import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    name: "Alex Chen",
    role: "Tech Creator",
    subscribers: "2.1M subscribers",
    content: "ZainIQ completely transformed how I approach content strategy. The intelligence it provides helped me increase CTR by 40%.",
  },
  {
    name: "Sarah Mitchell",
    role: "Fitness Creator",
    subscribers: "850K subscribers",
    content: "Finally, analytics that actually make sense. I can see exactly what's working and double down on it. Growth has been exponential.",
  },
  {
    name: "Marcus Johnson",
    role: "Gaming Creator",
    subscribers: "3.5M subscribers",
    content: "The competitor intelligence is a game-changer. I spot trends before they blow up and stay ahead of the curve.",
  },
];

const logos = ["YouTube", "Forbes", "TechCrunch", "The Verge", "Wired"];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-32">
      <div className="container">
        <ScrollAnimation>
          <div className="text-center mb-20">
            <h2 className="text-title md:text-display font-semibold mb-4">
              Trusted by 50,000+ creators
            </h2>
            <p className="text-lg text-muted-foreground">
              Join the creators who grow smarter with ZainIQ.
            </p>
          </div>
        </ScrollAnimation>

        {/* Testimonials - clean layout */}
        <div className="grid md:grid-cols-3 gap-8 mb-24">
          {testimonials.map((testimonial, index) => (
            <ScrollAnimation key={index} delay={index * 100}>
              <div className="group">
                <p className="text-lg text-foreground leading-relaxed mb-8">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-medium">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {testimonial.role} · {testimonial.subscribers}
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Featured logos - minimal */}
        <ScrollAnimation>
          <div className="pt-16 border-t border-border">
            <p className="text-sm text-muted-foreground text-center mb-8">As featured in</p>
            <div className="flex flex-wrap items-center justify-center gap-12">
              {logos.map((logo, index) => (
                <span
                  key={index}
                  className="text-lg font-medium text-muted-foreground/40 hover:text-muted-foreground transition-colors"
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
