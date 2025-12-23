import { Zap, Sparkles, Twitter, Instagram, Youtube, Linkedin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Footer = () => (
  <footer className="relative pt-20 pb-8 overflow-hidden border-t border-border/50">
    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-3xl" />
    <div className="container mx-auto px-4 relative z-10">
      <div className="game-card p-8 md:p-12 mb-16 text-center">
        <span className="text-4xl mb-4 block">🚀</span>
        <h3 className="font-display text-3xl md:text-4xl text-foreground mb-4">Join the Scholar Army</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">Get weekly study tips, new features, and exclusive rewards.</p>
        <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <Input type="email" placeholder="your.email@college.edu" className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground" />
          <Button className="bg-gradient-to-b from-secondary to-secondary/80 text-secondary-foreground font-bold shrink-0">Subscribe<ArrowRight className="w-4 h-4 ml-2" /></Button>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
        <div className="col-span-2">
          <a href="/" className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary via-accent to-secondary flex items-center justify-center shadow-lg"><Zap className="w-6 h-6 text-foreground" /></div>
            <span className="font-display text-2xl text-foreground">ElixrLabs</span>
          </a>
          <p className="text-sm text-muted-foreground mb-6 max-w-xs">Level up your college life with AI-powered study tools and gamified learning.</p>
          <div className="flex gap-3">
            {[Twitter, Instagram, Youtube, Linkedin].map((Icon, i) => (
              <a key={i} href="#" className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/20 transition-all"><Icon className="w-5 h-5" /></a>
            ))}
          </div>
        </div>
        {[["Product", ["Resources", "PYQ Vault", "AI Tutor", "Quizzes"]], ["Company", ["About Us", "Careers", "Blog"]], ["Legal", ["Privacy", "Terms", "Cookies"]]].map(([title, links]) => (
          <div key={title as string}><h4 className="font-display text-lg text-foreground mb-4">{title}</h4><ul className="space-y-3">{(links as string[]).map(l => <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a></li>)}</ul></div>
        ))}
      </div>
      <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} ElixrLabs. All rights reserved.</p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground"><span>Made with</span><Sparkles className="w-4 h-4 text-secondary" /><span>for students across India</span></div>
      </div>
    </div>
  </footer>
);

export default Footer;
