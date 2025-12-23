import { UserPlus, Target, Trophy, Zap } from "lucide-react";

const steps = [
  { step: 1, icon: UserPlus, title: "Create Your Character", description: "Sign up with your college email and customize your scholar profile.", color: "from-primary to-primary/60", emoji: "🧙‍♂️" },
  { step: 2, icon: Target, title: "Set Your Quest", description: "Tell us your goals - upcoming exams, weak subjects, or skills to master.", color: "from-accent to-accent/60", emoji: "🎯" },
  { step: 3, icon: Zap, title: "Train & Battle", description: "Access resources, practice with PYQs, challenge friends, and earn XP.", color: "from-secondary to-secondary/60", emoji: "⚡" },
  { step: 4, icon: Trophy, title: "Claim Victory", description: "Dominate exams, climb leaderboards, and unlock legendary achievements.", color: "from-yellow-500 to-orange-500", emoji: "👑" },
];

const HowItWorks = () => (
  <section id="how-it-works" className="py-20 md:py-32 relative overflow-hidden bg-muted/30">
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
    <div className="container mx-auto px-4 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/20 border border-accent/30 mb-6">
          <span className="text-xl">🗺️</span><span className="text-sm font-bold text-foreground">Your Journey</span>
        </div>
        <h2 className="font-display text-4xl md:text-6xl text-foreground mb-4">Begin Your Quest</h2>
        <p className="text-lg text-muted-foreground">From rookie scholar to legendary academic warrior in 4 simple steps</p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {steps.map((step) => (
          <div key={step.step} className="relative group">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center font-display text-xl text-foreground shadow-lg border-4 border-background`}>{step.step}</div>
            </div>
            <div className="game-card p-6 pt-10 text-center hover-lift h-full">
              <div className="text-5xl mb-4 group-hover:scale-125 transition-transform">{step.emoji}</div>
              <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}>
                <step.icon className="w-8 h-8 text-foreground" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">{step.title}</h3>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;
