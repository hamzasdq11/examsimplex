import { 
  BookOpen, 
  DollarSign, 
  FlaskConical, 
  Globe, 
  BookText, 
  Calculator, 
  Microscope,
  BarChart3
} from "lucide-react";

const subjects = [
  { name: "All Subjects", icon: BookOpen, bgColor: "bg-card-lavender" },
  { name: "Accounting", icon: DollarSign, bgColor: "bg-card-mint" },
  { name: "Biology", icon: Microscope, bgColor: "bg-card-pink" },
  { name: "Chemistry", icon: FlaskConical, bgColor: "bg-card-cyan" },
  { name: "Economics", icon: BarChart3, bgColor: "bg-card-purple" },
  { name: "English", icon: BookText, bgColor: "bg-card-blue" },
  { name: "Finance", icon: DollarSign, bgColor: "bg-card-lavender" },
  { name: "Math", icon: Calculator, bgColor: "bg-card-mint" },
];

const SubjectCategories = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Expert Guidance for Every Subject
          </h2>
          <p className="text-lg text-muted-foreground">
            Find study help for your most difficult subjects
          </p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
          {subjects.map((subject, index) => (
            <a
              key={index}
              href="#"
              className="group flex flex-col items-center p-4 rounded-xl border border-border bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
            >
              <div className={`w-14 h-14 rounded-xl ${subject.bgColor} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <subject.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="text-sm font-medium text-foreground text-center">
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
