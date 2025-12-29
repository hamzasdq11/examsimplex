import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useRole } from "@/hooks/useRole";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const getUserInitials = () => {
    if (!user?.email) return "U";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-10">
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => scrollToSection("features")}
              className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              University
            </button>
            
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              Exams
            </button>

            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              Practice
            </button>

            <button
              onClick={() => scrollToSection("faq")}
              className="text-sm font-medium text-foreground hover:text-foreground/80 transition-colors"
            >
              Free Resources
            </button>
          </nav>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex items-center gap-2 p-2">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {isAdmin ? "Admin" : "User"}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                {isAdmin && (
                  <DropdownMenuItem onClick={() => navigate("/admin")}>
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Admin Dashboard
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth" className="text-sm font-medium text-primary hover:text-primary/80 transition-colors">
                Log in
              </Link>
              <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6">
                <Link to="/get-started">Get Started for Free</Link>
              </Button>
            </>
          )}
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
              onClick={() => scrollToSection("how-it-works")}
              className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Exams
            </button>
            <button
              onClick={() => scrollToSection("testimonials")}
              className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Practice
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Free Resources
            </button>
            <div className="pt-4 border-t border-border flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex items-center gap-2 py-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                        {getUserInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.email}</p>
                      <p className="text-xs text-muted-foreground">{isAdmin ? "Admin" : "User"}</p>
                    </div>
                  </div>
                  {isAdmin && (
                    <Button variant="outline" onClick={() => { navigate("/admin"); setMobileMenuOpen(false); }} className="w-full justify-start">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleSignOut} className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    to="/auth" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Log in
                  </Link>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-full">
                    <Link to="/get-started" onClick={() => setMobileMenuOpen(false)}>Get Started for Free</Link>
                  </Button>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
