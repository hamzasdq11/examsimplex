import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "MCAT Student",
    score: "519",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    quote: "The structured approach and expert instructors helped me exceed my target score. I couldn't have done it without this platform!",
  },
  {
    name: "Michael Rodriguez",
    role: "LSAT Student",
    score: "172",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote: "The practice questions were incredibly similar to the actual test. The score guarantee gave me confidence throughout my prep.",
  },
  {
    name: "Emily Thompson",
    role: "DAT Student",
    score: "24",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    quote: "I improved my score by 5 points in just 8 weeks. The video lessons made complex topics easy to understand.",
  },
  {
    name: "Priya Sharma",
    role: "University Student",
    score: "A+",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    quote: "Finally understood organic chemistry thanks to the clear explanations. Went from struggling to top of my class!",
  },
  {
    name: "David Kim",
    role: "High School Student",
    score: "5",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    quote: "Got a 5 on my AP Calculus exam! The practice problems were exactly what I needed.",
  },
  {
    name: "Jessica Patel",
    role: "Pre-Med Student",
    score: "521",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    quote: "Best investment I made for my medical school journey. The MCAT prep was comprehensive and effective.",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
            Student Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how our students achieved their dream scores with our comprehensive prep programs.
          </p>
        </div>
      </div>

      <div className="relative">
        <div className="flex animate-scroll gap-6 w-max">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 min-w-[350px] max-w-[350px]"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              
              <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
              
              <div className="flex items-center gap-4">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} • Score: <span className="font-semibold text-primary">{testimonial.score}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
