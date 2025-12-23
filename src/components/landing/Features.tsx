import { BookOpen, Brain, Trophy, FileQuestion, Users, Sparkles, ArrowRight } from "lucide-react";

const features = [
  { icon: BookOpen, title: "Academic Arsenal", description: "College-specific notes, slides, and resources organized by semester and subject.", color: "from-card-purple to-primary/40", borderColor: "border-primary/30", stats: "10,000+ Resources", emoji: "📚" },
  { icon: FileQuestion, title: "PYQ Vault", description: "Previous year questions with AI-powered hints, solutions, and trend analysis.", color: "from-card-blue to-blue-600/30", borderColor: "border-blue-500/30", stats: "50,000+ Questions", emoji: "📝" },
  { icon: Brain, title: "ElixrAI Tutor", description: "Your personal AI study companion that understands your syllabus and exam patterns.", color: "from-card-pink to-accent/30", borderColor: "border-accent/30", stats: "24/7 Available", emoji: "🤖" },
  { icon: Trophy, title: "Battle Arena", description: "Compete in quizzes, climb leaderboards, and earn legendary badges.", color: "from-card-orange to-orange-500/30", borderColor: "border-orange-500/30", stats: "Daily Tournaments", emoji: "⚔️" },
  { icon: Sparkles, title: "XP & Rewards", description: "Earn XP for every activity, unlock achievements, and level up your scholar rank.", color: "from-card-green to-emerald-500/30", borderColor: "border-emerald-500/30", stats: "100+ Badges", emoji: "✨" },
  { icon: Users, title: "Guild System", description: "Join study groups, participate in college forums, and help fellow students.", color: "from-card-cyan to-cyan-500/30", borderColor: "border-cyan-500/30", stats: "Active Community", emoji: "🏰" },
];

const Features = () => (
  <section id="features" className="py-20 md:py-32 relative overflow-hidden">
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl" />
    <div className="container mx-auto px-4 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 mb-6">
          <Sparkles className="w-4 h-4 text-secondary" /><span className="text-sm font-bold text-foreground">Power-Ups</span>
        </div>
        <h2 className="font-display text-4xl md:text-6xl text-foreground mb-4">Your Academic Arsenal</h2>
        <p className="text-lg text-muted-foreground">Everything you need to conquer your exams and level up your academic journey</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature) => (
          <div key={feature.title} className={`group game-card p-6 hover-lift cursor-pointer border-2 ${feature.borderColor}`}>
            <div className="flex items-start justify-between mb-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7 text-foreground" />
              </div>
              <span className="text-3xl">{feature.emoji}</span>
            </div>
            <h3 className="font-display text-2xl text-foreground mb-2">{feature.title}</h3>
            <p className="text-muted-foreground mb-4">{feature.description}</p>
            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <span className="text-sm font-bold text-primary">{feature.stats}</span>
              <div className="flex items-center gap-1 text-sm font-semibold text-muted-foreground group-hover:text-foreground transition-colors">Explore<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Features;
