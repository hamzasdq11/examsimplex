import { Star, Zap, Trophy, BookOpen, Brain, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const Hero = () => {
  return (
    <section className="relative min-h-screen pt-24 md:pt-32 pb-16 overflow-hidden">
      <div className="absolute inset-0 bg-animated-gradient opacity-50" />
      <div className="absolute inset-0 particles" />
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-card/80 backdrop-blur border border-border/50 mb-8 animate-slide-up">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary to-accent" style={{ zIndex: 5 - i }} />
                ))}
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (<Star key={i} className="w-4 h-4 fill-secondary text-secondary" />))}
              </div>
              <span className="text-sm font-bold text-foreground">50,000+ Students Leveling Up</span>
            </div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-wide mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <span className="block text-foreground">Level Up</span>
              <span className="block bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">Your College</span>
              <span className="block text-foreground">Journey</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto lg:mx-0 mb-8 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              AI-powered study tools, college-specific resources, and gamified learning. Earn XP, unlock achievements, and dominate your exams.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Button size="lg" className="bg-gradient-to-b from-secondary to-secondary/80 text-secondary-foreground font-bold text-lg px-8 py-6 shadow-lg hover:scale-105 transition-all border-2 border-secondary/30">
                <Sparkles className="w-5 h-5 mr-2" />Start Free Adventure
              </Button>
              <Button size="lg" variant="outline" className="border-2 border-primary/50 text-foreground font-bold text-lg px-8 py-6 hover:bg-primary/20 hover:border-primary transition-all">
                <BookOpen className="w-5 h-5 mr-2" />Explore Resources
              </Button>
            </div>

            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mt-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              {[{ icon: Brain, label: "AI Tutor" }, { icon: Trophy, label: "Leaderboards" }, { icon: Zap, label: "50+ Colleges" }].map((item) => (
                <div key={item.label} className="flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50">
                  <item.icon className="w-4 h-4 text-primary" />
                  <span className="text-sm font-semibold text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative game-card p-6 animate-float">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="level-badge">12</div>
                  <div>
                    <p className="font-display text-lg text-foreground">Scholar Warrior</p>
                    <p className="text-sm text-muted-foreground">2,450 / 3,000 XP</p>
                  </div>
                </div>
                <div className="badge-game"><Zap className="w-4 h-4" />+150 XP</div>
              </div>
              <div className="xp-bar mb-6"><div className="xp-bar-fill" style={{ width: '82%' }} /></div>
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[{ label: "Streak", value: "12 Days", icon: "🔥" }, { label: "Quizzes", value: "48", icon: "⚡" }, { label: "Rank", value: "#24", icon: "🏆" }].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/50">
                    <span className="text-2xl">{stat.icon}</span>
                    <p className="font-bold text-foreground mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="font-display text-sm text-muted-foreground">Recent Unlocks</p>
                <div className="flex gap-3">
                  {["🎯", "📚", "⭐", "🏅"].map((emoji, i) => (
                    <div key={i} className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center text-2xl border border-primary/30 hover:scale-110 transition-transform cursor-pointer">{emoji}</div>
                  ))}
                </div>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 game-card p-4 animate-float-delayed">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center"><Trophy className="w-5 h-5 text-background" /></div>
                <div><p className="font-bold text-sm text-foreground">Quiz Master!</p><p className="text-xs text-muted-foreground">+50 XP Earned</p></div>
              </div>
            </div>
            <div className="absolute -bottom-4 -left-4 game-card p-3 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center gap-2"><span className="text-2xl">🔥</span><span className="font-bold text-foreground">12 Day Streak!</span></div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
