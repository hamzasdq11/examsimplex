import { Star, Quote } from "lucide-react";

const testimonials = [
  { name: "Arjun Sharma", role: "B.Tech CSE, IIT Delhi", level: 24, badge: "🏆 Grand Scholar", content: "ElixrLabs completely changed how I study. The gamification keeps me motivated, and the AI tutor explains concepts better than my professors!", avatar: "AS", gradient: "from-primary to-accent" },
  { name: "Priya Patel", role: "MBA, IIM Ahmedabad", level: 18, badge: "⚡ Quiz Champion", content: "The PYQ system is incredible. I went from struggling with case studies to consistently acing them. The leaderboard battles are so fun!", avatar: "PP", gradient: "from-accent to-secondary" },
  { name: "Rahul Verma", role: "B.Sc Physics, DU", level: 31, badge: "🔥 Streak Master", content: "My 45-day streak speaks for itself. The XP system is addictive in the best way. I've never been this consistent with my studies!", avatar: "RV", gradient: "from-secondary to-primary" },
];

const Testimonials = () => (
  <section id="testimonials" className="py-20 md:py-32 relative overflow-hidden">
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-3xl" />
    <div className="container mx-auto px-4 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 mb-6">
          <span className="text-xl">⭐</span><span className="text-sm font-bold text-foreground">Hall of Fame</span>
        </div>
        <h2 className="font-display text-4xl md:text-6xl text-foreground mb-4">Legendary Scholars</h2>
        <p className="text-lg text-muted-foreground">Join thousands of students who leveled up their academic game</p>
      </div>
      <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {testimonials.map((t) => (
          <div key={t.name} className="game-card p-6 hover-lift">
            <Quote className="w-8 h-8 text-primary/50 mb-4" />
            <p className="text-foreground mb-6 leading-relaxed">"{t.content}"</p>
            <div className="flex gap-1 mb-6">{[1,2,3,4,5].map((s) => <Star key={s} className="w-5 h-5 fill-secondary text-secondary" />)}</div>
            <div className="flex items-center gap-4 pt-4 border-t border-border/50">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${t.gradient} flex items-center justify-center font-display text-xl text-foreground shadow-lg`}>{t.avatar}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2"><p className="font-bold text-foreground">{t.name}</p><div className="level-badge w-7 h-7 text-xs">{t.level}</div></div>
                <p className="text-sm text-muted-foreground">{t.role}</p>
                <p className="text-xs font-semibold text-primary mt-1">{t.badge}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-16 max-w-4xl mx-auto">
        <div className="game-card p-6 md:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8 text-center">
            {[{ value: "50K+", label: "Active Scholars", emoji: "👥" }, { value: "100+", label: "Colleges", emoji: "🏛️" }, { value: "1M+", label: "Questions Solved", emoji: "✅" }, { value: "4.9", label: "App Rating", emoji: "⭐" }].map((stat) => (
              <div key={stat.label}><span className="text-3xl mb-2 block">{stat.emoji}</span><p className="font-display text-3xl md:text-4xl text-foreground">{stat.value}</p><p className="text-sm text-muted-foreground">{stat.label}</p></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Testimonials;
