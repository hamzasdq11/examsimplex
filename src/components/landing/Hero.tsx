import { Star, GraduationCap, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const avatars = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
  ];

  return (
    <section className="relative overflow-hidden bg-background py-12 md:py-20">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Social Proof */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex -space-x-2">
                {avatars.map((avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt={`Student ${index + 1}`}
                    className="w-9 h-9 rounded-full border-2 border-background object-cover"
                  />
                ))}
              </div>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                3,76,700+ students served
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-display font-semibold text-foreground leading-[1.1] tracking-tight">
                Smarter Prep for<br />Every Step
              </h1>
              <p className="text-base md:text-lg text-muted-foreground max-w-md leading-relaxed">
                Expert-led lessons, course-specific practice, and guarantees where it counts.
              </p>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 py-6 text-base font-medium shadow-md"
              >
                Create a Free Account
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Background Circles */}
            <div className="relative">
              {/* Outer light blue circle */}
              <div className="w-[320px] h-[320px] md:w-[420px] md:h-[420px] rounded-full bg-[hsl(210,70%,94%)] flex items-center justify-center">
                {/* Inner medium blue circle */}
                <div className="w-[260px] h-[260px] md:w-[340px] md:h-[340px] rounded-full bg-[hsl(210,60%,88%)] flex items-end justify-center overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&h=600&fit=crop&crop=top"
                    alt="Student studying with laptop"
                    className="w-full h-auto object-cover object-top"
                  />
                </div>
              </div>

              {/* Floating Icons */}
              {/* Top right - Graduation cap (filled blue circle) */}
              <div className="absolute -top-2 right-4 md:right-8 w-12 h-12 md:w-14 md:h-14 bg-primary rounded-full shadow-lg flex items-center justify-center animate-float">
                <GraduationCap className="h-6 w-6 md:h-7 md:w-7 text-primary-foreground" />
              </div>
              
              {/* Left side - Bar chart (white circle with blue icon) */}
              <div className="absolute top-1/4 -left-2 md:-left-4 w-10 h-10 md:w-12 md:h-12 bg-card rounded-full shadow-lg flex items-center justify-center animate-float border border-border/50" style={{ animationDelay: "0.5s" }}>
                <BarChart3 className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
              
              {/* Right side - Trend (white circle with blue icon) */}
              <div className="absolute top-1/2 -right-2 md:-right-4 w-10 h-10 md:w-12 md:h-12 bg-card rounded-full shadow-lg flex items-center justify-center animate-float border border-border/50" style={{ animationDelay: "1s" }}>
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
