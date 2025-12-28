import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Aditya Mishra",
    role: "B.Tech ECE, IIT Delhi",
    score: "9.2 CGPA",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    quote: "The structured approach and expert instructors helped me ace my semester exams. I couldn't have done it without this platform!",
  },
  {
    name: "Sneha Reddy",
    role: "MBBS, AIIMS Delhi",
    score: "AIR 156",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    quote: "The NEET preparation resources were incredibly similar to the actual test. This platform gave me confidence throughout my prep.",
  },
  {
    name: "Kavya Nair",
    role: "B.Sc Chemistry, Miranda House",
    score: "94%",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    quote: "Finally understood organic chemistry thanks to the clear explanations. Went from struggling to top of my class!",
  },
  {
    name: "Rohit Agarwal",
    role: "B.Com, SRCC Delhi",
    score: "95%",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    quote: "The accounting and economics lessons were exactly what I needed. Scored distinction in all my papers!",
  },
  {
    name: "Meera Iyer",
    role: "B.Tech CSE, NIT Trichy",
    score: "9.5 CGPA",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    quote: "I improved my grades significantly in just one semester. The video lessons made complex DSA topics easy to understand.",
  },
  {
    name: "Arjun Kapoor",
    role: "LLB, NLU Bangalore",
    score: "AIR 89",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    quote: "Best investment I made for my CLAT journey. The legal reasoning prep was comprehensive and effective.",
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
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-lg font-semibold text-primary">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">{testimonial.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {testimonial.role} • <span className="font-semibold text-primary">{testimonial.score}</span>
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
