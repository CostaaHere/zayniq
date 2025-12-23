import { Star } from "lucide-react";
import { ScrollAnimation } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    name: "Alex Chen",
    handle: "@alexchentech",
    subscribers: "2.1M",
    content: "ZaynIQ completely transformed how I approach my content strategy. The AI suggestions alone helped me increase my CTR by 40%.",
    avatar: "AC",
    category: "Tech",
  },
  {
    name: "Sarah Mitchell",
    handle: "@sarahfitlife",
    subscribers: "850K",
    content: "Finally, analytics that actually make sense! I can now see exactly what's working and double down on it. My growth has been exponential.",
    avatar: "SM",
    category: "Fitness",
  },
  {
    name: "Marcus Johnson",
    handle: "@marcusgaming",
    subscribers: "3.5M",
    content: "The competitor tracking feature is a game-changer. I can spot trends before they blow up and stay ahead of the curve.",
    avatar: "MJ",
    category: "Gaming",
  },
  {
    name: "Emily Rodriguez",
    handle: "@emilycooks",
    subscribers: "1.2M",
    content: "I was skeptical at first, but the SEO scoring helped me rank my videos higher than ever. 10x worth the investment.",
    avatar: "ER",
    category: "Cooking",
  },
  {
    name: "David Park",
    handle: "@davidfinance",
    subscribers: "920K",
    content: "The keyword research tool alone saved me hours of work. Now I know exactly what my audience wants to watch.",
    avatar: "DP",
    category: "Finance",
  },
  {
    name: "Jessica Williams",
    handle: "@jessbeauty",
    subscribers: "1.8M",
    content: "Best investment I've made for my channel. The real-time analytics help me understand my audience on a whole new level.",
    avatar: "JW",
    category: "Beauty",
  },
];

const featuredLogos = [
  { name: "YouTube", text: "YouTube" },
  { name: "Forbes", text: "Forbes" },
  { name: "TechCrunch", text: "TechCrunch" },
  { name: "The Verge", text: "The Verge" },
  { name: "Wired", text: "Wired" },
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-32 relative">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,hsl(var(--primary)/0.15),transparent)]" />
      
      <div className="container mx-auto px-6 relative z-10">
        <ScrollAnimation>
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Loved by
              <span className="gradient-text"> 50,000+ Creators</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of successful YouTubers who trust ZaynIQ to grow their channels.
            </p>
          </div>
        </ScrollAnimation>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
          {testimonials.map((testimonial, index) => (
            <ScrollAnimation key={index} delay={index * 100}>
              <div className="glass-card p-6 h-full hover:border-primary/30 transition-all duration-300 group hover:-translate-y-1 hover:shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
                {/* Header with Avatar and Info */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold shrink-0">
                    {testimonial.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{testimonial.handle}</div>
                  </div>
                  {/* Subscriber Badge */}
                  <div className="px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-medium text-primary shrink-0">
                    {testimonial.subscribers} subs
                  </div>
                </div>

                {/* Star Rating */}
                <div className="flex gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  "{testimonial.content}"
                </p>

                {/* Category Tag */}
                <div className="inline-flex px-3 py-1 rounded-full bg-secondary/50 border border-border text-xs font-medium text-muted-foreground">
                  {testimonial.category}
                </div>
              </div>
            </ScrollAnimation>
          ))}
        </div>

        {/* Featured In Section */}
        <ScrollAnimation>
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground uppercase tracking-wider mb-6">As featured in</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {featuredLogos.map((logo, index) => (
                <div 
                  key={index}
                  className="text-xl md:text-2xl font-bold text-muted-foreground/50 hover:text-muted-foreground transition-colors duration-300"
                >
                  {logo.text}
                </div>
              ))}
            </div>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
};

export default TestimonialsSection;
