import { 
  BookOpen, 
  DollarSign, 
  FlaskConical, 
  BookText, 
  Calculator, 
  Microscope,
  BarChart3,
  Atom,
  Languages,
  History,
  Scale,
  Laptop,
  type LucideIcon
} from "lucide-react";
import { AnimatedSection } from "@/hooks/useScrollAnimation";

const subjects: { name: string; icon: LucideIcon; bgColor: string }[] = [
  { name: "All Subjects", icon: BookOpen, bgColor: "bg-card-lavender" },
  { name: "Accounting", icon: DollarSign, bgColor: "bg-card-mint" },
  { name: "Biology", icon: Microscope, bgColor: "bg-card-pink" },
  { name: "Chemistry", icon: FlaskConical, bgColor: "bg-card-cyan" },
  { name: "Economics", icon: BarChart3, bgColor: "bg-card-purple" },
  { name: "English", icon: BookText, bgColor: "bg-card-blue" },
  { name: "Finance", icon: DollarSign, bgColor: "bg-card-lavender" },
  { name: "Math", icon: Calculator, bgColor: "bg-card-mint" },
  { name: "Physics", icon: Atom, bgColor: "bg-card-pink" },
  { name: "History", icon: History, bgColor: "bg-card-cyan" },
  { name: "Law", icon: Scale, bgColor: "bg-card-purple" },
  { name: "Computer Science", icon: Laptop, bgColor: "bg-card-blue" },
];

const SubjectCategories = () => {
  return (
    <section className="py-16 md:py-24 bg-background overflow-hidden">
      <div className="container">
        <AnimatedSection animation="fade-up" className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Expert Guidance for Every Subject
          </h2>
          <p className="text-lg text-muted-foreground">
            Find study help for your most difficult subjects
          </p>
        </AnimatedSection>
      </div>
      
      <div className="relative">
        <div className="flex animate-scroll gap-4 w-max hover:[animation-play-state:paused]">
          {[...subjects, ...subjects].map((subject, index) => (
            <a
              key={index}
              href="#"
              className="group flex flex-col items-center p-4 rounded-xl border border-border bg-card hover:shadow-xl transition-all duration-500 min-w-[120px] hover:-translate-y-2 hover:border-primary/30"
            >
              <div className={`w-14 h-14 rounded-xl ${subject.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <subject.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground text-center group-hover:text-primary transition-colors duration-300">
                {subject.name}
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SubjectCategories;
