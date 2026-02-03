import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const showcaseCards = [
  { 
    src: "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=300&fit=crop",
    alt: "Study notes",
    rotate: "-3deg",
    scale: 1,
    offsetY: 0
  },
  { 
    src: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
    alt: "Student studying",
    rotate: "2deg", 
    scale: 1.05,
    offsetY: -10
  },
  { 
    src: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=300&fit=crop",
    alt: "Library study",
    rotate: "-2deg",
    scale: 0.95,
    offsetY: 15
  },
  { 
    src: "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?w=400&h=300&fit=crop",
    alt: "Note taking",
    rotate: "3deg",
    scale: 1.02,
    offsetY: -5
  },
  { 
    src: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop",
    alt: "Group study",
    rotate: "-1deg",
    scale: 1,
    offsetY: 8
  },
  { 
    src: "https://images.unsplash.com/photo-1513258496099-48168024aec0?w=400&h=300&fit=crop",
    alt: "Laptop study",
    rotate: "2deg",
    scale: 1.03,
    offsetY: -12
  },
];

const Hero = () => {
  const avatars = [
    { src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", bg: "bg-muted" },
    { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", bg: "bg-muted" },
    { src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", bg: "bg-muted" },
    { src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", bg: "bg-muted" },
    { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face", bg: "bg-muted" },
  ];

  // Duplicate cards for seamless loop
  const duplicatedCards = [...showcaseCards, ...showcaseCards];

  return (
    <section className="relative overflow-hidden bg-background pt-6 pb-10 md:pt-6 md:pb-12">
      <div className="container max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-6 items-center">
          {/* Left Content */}
          <div className="space-y-5 md:space-y-6 text-center lg:text-left">
            {/* Social Proof - Mobile: stacked, Desktop: row */}
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

            {/* Main Headline */}
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

            {/* CTA Button */}
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

          {/* Right Content - Scrolling Showcase with Perspective */}
          <AnimatedSection animation="scale" delay={150} className="relative mt-4 lg:mt-0 hidden sm:block">
            <div 
              className="relative h-72 sm:h-96 md:h-[28rem] overflow-hidden"
              style={{ perspective: '1200px' }}
            >
              {/* Gradient fade on edges */}
              <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-background via-background/80 to-transparent z-10" />
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-background via-background/80 to-transparent z-10" />
              
              {/* Scrolling container with 3D transform */}
              <div 
                className="flex items-center h-full animate-scroll-showcase"
                style={{
                  transform: 'rotateY(-8deg) rotateX(5deg)',
                  transformStyle: 'preserve-3d',
                }}
              >
                {duplicatedCards.map((card, index) => (
                  <div
                    key={index}
                    className="flex-shrink-0 mx-4 transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                    style={{
                      transform: `rotate(${card.rotate}) scale(${card.scale}) translateY(${card.offsetY}px) translateZ(${index % 6 * 10}px)`,
                      transformStyle: 'preserve-3d',
                    }}
                  >
                    <div className="w-52 sm:w-60 md:w-72 rounded-2xl overflow-hidden shadow-2xl shadow-foreground/15 bg-card border border-border/50 backdrop-blur-sm">
                      <img
                        src={card.src}
                        alt={card.alt}
                        className="w-full h-36 sm:h-44 md:h-48 object-cover"
                        loading="lazy"
                      />
                      <div className="p-4 bg-card/95">
                        <div className="h-2.5 w-3/4 bg-muted rounded-full mb-2" />
                        <div className="h-2 w-1/2 bg-muted/70 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </AnimatedSection>

          {/* Mobile fallback - simple image */}
          <AnimatedSection animation="scale" delay={150} className="relative mt-4 sm:hidden flex justify-center">
            <div className="w-64 h-64 rounded-full bg-primary-soft flex items-center justify-center">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=500&fit=crop"
                alt="Student studying"
                className="w-56 h-56 rounded-full object-cover"
              />
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Hero;
