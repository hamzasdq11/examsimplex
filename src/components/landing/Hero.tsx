import { Link } from "react-router-dom";
import { Star, MessageCircle, BarChart3, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  const avatars = [
    { src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face", bg: "bg-card-lavender" },
    { src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face", bg: "bg-card-mint" },
    { src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face", bg: "bg-card-pink" },
    { src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face", bg: "bg-card-cyan" },
    { src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face", bg: "bg-card-purple" },
  ];

  return (
    <section className="relative overflow-hidden bg-background pt-6 pb-10 md:pt-6 md:pb-12">
      <div className="container max-w-6xl mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-6 items-center">
          {/* Left Content */}
          <div className="space-y-5 md:space-y-6 text-center lg:text-left">
            {/* Social Proof - Mobile: stacked, Desktop: row */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-6">
              <div className="flex -space-x-2">
                {avatars.map((avatar, index) => (
                  <div
                    key={index}
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full ${avatar.bg} p-0.5 -ml-2 first:ml-0 ring-2 ring-background`}
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
                    <Star key={i} className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">3,76,300+</span> students served
                </span>
              </div>
            </div>

            {/* Main Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-tight">
                Smarter Prep for<br />Every Step
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-muted-foreground max-w-lg mx-auto lg:mx-0">
                Expert-led lessons, course-specific practice, and guarantees where it counts.
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex justify-center lg:justify-start">
              <Button
                asChild
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 sm:px-8 py-5 sm:py-6 text-sm sm:text-base font-medium shadow-lg shadow-primary/25"
              >
                <Link to="/dashboard">Go to My Dashboard</Link>
              </Button>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative flex justify-center lg:justify-end mt-4 lg:mt-0">
            {/* Background Circle */}
            <div className="relative">
              <div className="w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full bg-card-blue flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500&h=500&fit=crop"
                  alt="Student studying with laptop"
                  className="w-56 h-56 sm:w-72 sm:h-72 md:w-80 md:h-80 rounded-full object-cover"
                />
              </div>

              {/* Floating Icons - smaller on mobile */}
              <div className="absolute -top-4 sm:-top-6 -right-4 sm:-right-6 w-10 h-10 sm:w-14 sm:h-14 bg-card rounded-xl shadow-lg flex items-center justify-center animate-float">
                <MessageCircle className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
              </div>
              
              <div className="absolute top-1/4 -left-4 sm:-left-8 w-10 h-10 sm:w-14 sm:h-14 bg-card rounded-xl shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: "0.5s" }}>
                <BarChart3 className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
              </div>
              
              <div className="absolute bottom-4 sm:bottom-6 -right-4 sm:-right-6 w-10 h-10 sm:w-14 sm:h-14 bg-card rounded-xl shadow-lg flex items-center justify-center animate-float" style={{ animationDelay: "1s" }}>
                <TrendingUp className="h-5 w-5 sm:h-7 sm:w-7 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
