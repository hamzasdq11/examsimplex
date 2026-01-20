import { Star } from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const testimonials = [
  {
    name: "Aditya Mishra",
    role: "B.Tech CSE, AKTU",
    score: "Maths-1",
    quote: "The exam pack covered almost all repeated questions. I didn't waste time on low-weight chapters and could revise properly in the last week.",
  },
  {
    name: "Sneha Reddy",
    role: "B.Sc Physics, Osmania University",
    score: "Mechanics",
    quote: "Questions came very similar to what was highlighted. Felt like studying from the examiner's point of view.",
  },
  {
    name: "Kavya Nair",
    role: "B.Com, Christ University",
    score: "Accounting",
    quote: "I stopped reading random PDFs and focused only on what mattered. The important topics list was spot on for our paper pattern.",
  },
  {
    name: "Rohit Agarwal",
    role: "BBA, IP University",
    score: "Business Law",
    quote: "The answer templates helped me structure 10-mark answers properly. I usually lose marks for presentation, but this time it was clean.",
  },
  {
    name: "Meera Iyer",
    role: "B.Tech ECE, Anna University",
    score: "Signals & Systems",
    quote: "Our professor focuses heavily on derivations from Unit 3 & 4. The platform highlighted those units clearly, which helped me score better.",
  },
  {
    name: "Arjun Singh",
    role: "BA Economics, Delhi University",
    score: "Microeconomics",
    quote: "Before the exam, I knew I had covered all high-weight topics. No more guessing what's important - the roadmap was crystal clear.",
  },
];

const Testimonials = () => {
  return (
    <section id="testimonials" className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
            Student Success Stories
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how our students achieved their dream scores with our comprehensive prep programs.
          </p>
        </AnimatedSection>
      </div>

      <div className="relative">
        <div className="flex animate-scroll gap-6 w-max hover:[animation-play-state:paused]">
          {[...testimonials, ...testimonials].map((testimonial, index) => (
            <div
              key={index}
              className="bg-card rounded-2xl p-8 shadow-sm border border-border/50 min-w-[350px] max-w-[350px] transition-all duration-500 hover:shadow-xl hover:-translate-y-2 hover:border-primary/20"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400 transition-transform duration-300 hover:scale-125" />
                ))}
              </div>
              
              <p className="text-foreground mb-6 leading-relaxed">"{testimonial.quote}"</p>
              
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-primary/20">
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
