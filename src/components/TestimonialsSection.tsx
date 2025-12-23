import { Star } from "lucide-react";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    name: "Alex Chen",
    role: "Tech Reviewer • 2.1M Subscribers",
    content: "ZaynIQ completely transformed how I approach my content strategy. The AI suggestions alone helped me increase my CTR by 40%.",
    avatar: "AC",
  },
  {
    name: "Sarah Mitchell",
    role: "Lifestyle Creator • 850K Subscribers",
    content: "Finally, analytics that actually make sense! I can now see exactly what's working and double down on it. My growth has been exponential.",
    avatar: "SM",
  },
  {
    name: "Marcus Johnson",
    role: "Gaming Channel • 3.5M Subscribers",
    content: "The competitor tracking feature is a game-changer. I can spot trends before they blow up and stay ahead of the curve.",
    avatar: "MJ",
  },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,hsl(262,83%,58%,0.15),transparent)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <ScrollAnimation>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by
              <span className="gradient-text"> top creators</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of successful YouTubers who trust ZaynIQ to grow their channels.
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {testimonials.map((testimonial, index) => (
            <ScrollAnimation key={index} delay={index * 150}>
              <div className="glass-card p-8 h-full hover:border-primary/30 transition-all duration-300">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                  ))}
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
