import { useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";
import heroMeme from "@/assets/hero-meme.jpg";

const Hero = () => {
  const [revealed, setRevealed] = useState(false);

  const avatars = [
    { src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", bg: "bg-muted" },
    { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", bg: "bg-muted" },
    { src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", bg: "bg-muted" },
    { src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", bg: "bg-muted" },
    { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face", bg: "bg-muted" },
  ];

  return (
    <section className="relative overflow-hidden bg-background pt-6 pb-10 md:pt-6 md:pb-12">
      <div className="container max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-6 items-center">
          {/* Left Content */}
          <div className="space-y-5 md:space-y-6 text-center lg:text-left">
            <AnimatedSection animation="fade-up" delay={0}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-6">
                <div className="flex -space-x-2">
                  {avatars.map((avatar, index) => (
                    <div
                      key={index}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${avatar.bg} p-0.5 -ml-2 first:ml-0 ring-2 ring-background transition-transform duration-300 hover:scale-110 hover:z-10`}
                    >
                      <img
                        src={avatar.src}
                        alt={`Student ${index + 1}`}
                        className="w-full h-full rounded-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex items-center gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400 transition-transform duration-300 hover:scale-125" />
                    ))}
                  </div>
                  <span className="text-xs sm:text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">500+</span> students served
                  </span>
                </div>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={100}>
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
                  Smarter Prep for<br />Every Step
                </h1>
                <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
                  Expert-led lessons, course-specific practice, and guarantees where it counts.
                </p>
              </div>
            </AnimatedSection>

            <AnimatedSection animation="fade-up" delay={200}>
              <div className="flex justify-center lg:justify-start">
                <Button
                  asChild
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-medium shadow-lg shadow-primary/25 btn-glow transition-all duration-300 hover:scale-105"
                >
                  <Link to="/dashboard">Go to My Dashboard</Link>
                </Button>
              </div>
            </AnimatedSection>
          </div>

          {/* Right Content - Envelope Reveal */}
          <AnimatedSection animation="scale" delay={150} className="relative mt-4 lg:mt-0 flex justify-center">
            <div
              className="relative w-52 sm:w-60 md:w-72 select-none"
              style={{ perspective: '1200px' }}
              onMouseEnter={() => setRevealed(true)}
              onMouseLeave={() => setRevealed(false)}
              onClick={() => setRevealed((r) => !r)}
            >
              <div style={{ transform: 'rotateX(4deg) rotateY(-12deg)', transformStyle: 'preserve-3d' }}>
                {/* Image sliding out */}
                <div className="relative z-10 flex justify-center">
                  <img
                    src={heroMeme}
                    alt="Let's get this degree"
                    className="w-[85%] rounded-xl shadow-xl"
                    style={{
                      transform: revealed ? 'translateY(-30%)' : 'translateY(40%)',
                      transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  />
                </div>

                {/* Envelope */}
                <div className="relative z-20 -mt-4">
                  {/* Envelope flap */}
                  <div
                    className="w-full aspect-[2/0.6] relative z-30"
                    style={{
                      clipPath: 'polygon(0 0, 50% 100%, 100% 0, 100% 100%, 0 100%)',
                      background: 'hsl(35, 30%, 82%)',
                    }}
                  />
                  {/* Envelope body */}
                  <div
                    className="w-full aspect-[2/1.2] rounded-b-2xl relative z-20 -mt-px"
                    style={{
                      background: 'linear-gradient(180deg, hsl(35, 35%, 88%) 0%, hsl(30, 25%, 80%) 100%)',
                      boxShadow: '0 8px 32px -8px hsl(var(--foreground) / 0.15)',
                    }}
                  >
                    <div className="absolute inset-x-4 top-0 h-px bg-foreground/5" />
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-3/5 space-y-1.5">
                      <div className="h-1 w-full bg-foreground/5 rounded-full" />
                      <div className="h-1 w-2/3 bg-foreground/5 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Hero;
