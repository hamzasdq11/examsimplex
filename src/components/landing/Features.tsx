import { GraduationCap, Stethoscope, Scale, BookOpen, Microscope, Users, ArrowRight } from "lucide-react";

const features = [
  {
    title: "University Course Help",
    description: "Score higher with customized video lessons, expert Q&A, and topic-wise practice.",
    icon: GraduationCap,
    bgColor: "bg-card-cyan",
    link: "#",
  },
  {
    title: "MCAT Prep",
    description: "Score 515+ guaranteed with our comprehensive MCAT prep program.",
    icon: Stethoscope,
    bgColor: "bg-card-lavender",
    link: "#",
  },
  {
    title: "LSAT Prep",
    description: "Score 170+ guaranteed with expert-led lessons and practice tests.",
    icon: Scale,
    bgColor: "bg-card-blue",
    link: "#",
  },
  {
    title: "High School & AP Course Help",
    description: "Better grades with video lessons tailored for high school curriculum.",
    icon: BookOpen,
    bgColor: "bg-card-pink",
    link: "#",
  },
  {
    title: "DAT Prep",
    description: "Score 23+ guaranteed with our dental admission test prep.",
    icon: Microscope,
    bgColor: "bg-card-purple",
    link: "#",
  },
  {
    title: "Admissions Counseling",
    description: "Get into your dream school with personalized guidance from experts.",
    icon: Users,
    bgColor: "bg-card-mint",
    link: "#",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative p-6 rounded-2xl ${feature.bgColor} transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
            >
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-xl bg-background/80 flex items-center justify-center">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
                <a
                  href={feature.link}
                  className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:gap-3 transition-all"
                >
                  Learn more <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
