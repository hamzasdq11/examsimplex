import { Link } from "react-router-dom";
import { Star, BarChart3, ClipboardCheck, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const avatars = [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
  ];

  return (
    <section className="relative overflow-hidden bg-background py-20 md:py-32">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-10">
            {/* Social Proof - Moved above headline */}
            <div className="flex items-center gap-4 flex-wrap">
              <div className="flex -space-x-2">
                {avatars.map((avatar, index) => (
                  <img
                    key={index}
                    src={avatar}
                    alt={`Student ${index + 1}`}
                    className="w-11 h-11 rounded-full border-2 border-background object-cover shadow-sm"
                  />
                ))}
              </div>
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="text-base font-medium text-foreground">
                3,76,300+ students served
              </span>
            </div>

            {/* Main Headline */}
            <div className="space-y-5">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold text-foreground leading-[1.1] max-w-[65%]">
                Smarter Prep for Every Step
              </h1>
              <p className="text-lg text-muted-foreground max-w-md leading-relaxed">
                Expert-led lessons, course-specific practice, and guarantees where it counts.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-5 pt-2">
              <Button
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 py-7 text-base font-semibold shadow-md"
              >
                Create a Free Account
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full px-10 py-7 text-base font-medium text-muted-foreground hover:text-foreground hover:bg-transparent"
              >
                <Link to="/get-started">Get Started for Free →</Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative flex justify-center lg:justify-end">
            {/* Background Circle */}
            <div className="relative">
              <div className="w-[22rem] h-[22rem] md:w-[26rem] md:h-[26rem] rounded-full bg-card-blue flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=500&fit=crop"
                  alt="Student studying with laptop"
                  className="w-80 h-80 md:w-96 md:h-96 rounded-full object-cover"
                />
              </div>

              {/* Floating Icons - Subtle utility icons */}
              <div className="absolute -top-2 right-4 w-12 h-12 bg-card/80 rounded-xl shadow-sm flex items-center justify-center opacity-70">
                <BarChart3 className="h-6 w-6 text-primary/80" />
              </div>
              
              <div className="absolute top-1/4 -left-4 w-12 h-12 bg-card/80 rounded-xl shadow-sm flex items-center justify-center opacity-70">
                <ClipboardCheck className="h-6 w-6 text-primary/80" />
              </div>
              
              <div className="absolute bottom-12 -right-2 w-12 h-12 bg-card/80 rounded-xl shadow-sm flex items-center justify-center opacity-70">
                <GraduationCap className="h-6 w-6 text-primary/80" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
