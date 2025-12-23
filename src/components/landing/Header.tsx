import { useState } from "react";
import { Menu, X, ChevronDown, Sparkles, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <a href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
              <Zap className="w-6 h-6 md:w-7 md:h-7 text-foreground" />
            </div>
            <div className="flex flex-col">
              <span className="font-display text-xl md:text-2xl tracking-wide text-foreground">ElixrLabs</span>
              <span className="text-[10px] md:text-xs text-muted-foreground -mt-1 hidden sm:block">Level Up Your College Life</span>
            </div>
          </a>

          <nav className="hidden lg:flex items-center gap-1">
            {["Resources", "AI Tutor", "Practice", "Leaderboard"].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className="px-4 py-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
                {item}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a href="#" className="hidden md:block text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors">Log in</a>
            <Button className="hidden sm:flex bg-gradient-to-b from-secondary to-secondary/80 text-secondary-foreground font-bold hover:from-secondary/90 hover:to-secondary/70 shadow-lg border-2 border-secondary/20">
              <Sparkles className="w-4 h-4 mr-2" />Start Free
            </Button>
            <button className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="w-6 h-6 text-foreground" /> : <Menu className="w-6 h-6 text-foreground" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden glass border-t border-border/50 animate-slide-up">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex flex-col gap-2">
              {["Resources", "AI Tutor", "Practice", "Leaderboard"].map((item) => (
                <a key={item} href="#" className="px-4 py-3 rounded-xl text-foreground font-semibold hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>{item}</a>
              ))}
              <hr className="border-border my-2" />
              <a href="#" className="px-4 py-3 rounded-xl text-muted-foreground font-semibold hover:bg-muted transition-colors">Log in</a>
              <Button className="mt-2 bg-gradient-to-b from-secondary to-secondary/80 text-secondary-foreground font-bold">
                <Sparkles className="w-4 h-4 mr-2" />Start Free
              </Button>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
