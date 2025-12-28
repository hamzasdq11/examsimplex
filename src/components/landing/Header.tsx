import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X, ChevronDown, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-10">
          <span className="text-3xl font-display font-bold text-primary italic tracking-tight">W</span>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              University
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
                MCAT <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => scrollToSection("features")}>
                  MCAT Overview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection("how-it-works")}>
                  Study Plans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection("testimonials")}>
                  Success Stories
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-foreground hover:text-foreground/80 transition-colors">
                LSAT <ChevronDown className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => scrollToSection("features")}>
                  LSAT Overview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection("how-it-works")}>
                  Study Plans
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => scrollToSection("testimonials")}>
                  Success Stories
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              DAT
            </button>

            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              High School
            </button>
          </nav>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4">
          <button className="text-muted-foreground hover:text-foreground transition-colors">
            <Settings className="h-5 w-5" />
          </button>
          <button className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
            Log in
          </button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
            <Link to="/get-started">Get Started for Free</Link>
          </Button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="container py-4 flex flex-col gap-4">
            <button
              onClick={() => scrollToSection("features")}
              className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              University
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              MCAT
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              LSAT
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              DAT
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              High School
            </button>
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              <button className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Log in
              </button>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-full">
                <Link to="/get-started">Get Started for Free</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
