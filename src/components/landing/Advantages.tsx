import { TrendingUp, Lightbulb, Clock } from "lucide-react";

const advantages = [
  {
    title: "Exam-Aligned Content",
    description: "Study exactly what matters for your university exams. Our content matches your syllabus and paper pattern.",
    icon: TrendingUp,
    iconBg: "bg-card-cyan",
    testimonial: {
      quote: "The important questions list covered almost everything that appeared in our AKTU paper. Felt like studying from the examiner's POV.",
      name: "Priya Sharma",
      role: "B.Tech CSE, KIET Ghaziabad",
      bgColor: "bg-card-blue",
    },
    layout: "left",
  },
  {
    title: "No More Study Confusion",
    description: "Stop wasting time on random notes. Know exactly what to study and what to skip.",
    icon: Lightbulb,
    iconBg: "bg-card-pink",
    testimonial: {
      quote: "I stopped reading random PDFs and focused only on what mattered. The chapter-wise weightage helped me prioritize my revision.",
      name: "Rahul Verma",
      role: "B.Com, Hansraj College",
      bgColor: "bg-card-lavender",
    },
    layout: "right",
  },
  {
    title: "Better Answer Writing",
    description: "Learn to frame answers the way evaluators expect. Proper structure, keywords, and formatting.",
    icon: Clock,
    iconBg: "bg-card-mint",
    testimonial: {
      quote: "The answer templates helped me structure 10-mark answers properly. I usually lose marks for presentation, but this time it was clean.",
      name: "Ananya Gupta",
      role: "BA English, Delhi University",
      bgColor: "bg-card-mint",
    },
    layout: "left",
  },
];

const Advantages = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container max-w-6xl mx-auto px-6 md:px-8">
        <h2 className="text-3xl md:text-5xl font-display font-bold text-center text-foreground mb-16">
          Experience the Advantage
        </h2>

        <div className="space-y-20">
          {advantages.map((item, index) => (
            <div
              key={index}
              className={`grid md:grid-cols-2 gap-8 md:gap-12 items-center ${
                item.layout === "right" ? "md:[direction:rtl]" : ""
              }`}
            >
              {/* Benefit Card */}
              <div className="md:[direction:ltr]">
                <div className={`w-24 h-24 rounded-full ${item.iconBg} flex items-center justify-center mb-6`}>
                  <item.icon className="h-12 w-12 text-primary" />
                </div>
                <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                  {item.title}
                </h3>
                <p className="text-lg text-muted-foreground">
                  {item.description}
                </p>
              </div>

              {/* Testimonial Card */}
              <div className="md:[direction:ltr]">
                <div className={`${item.testimonial.bgColor} rounded-2xl p-8`}>
                  <svg
                    className="w-10 h-10 text-primary mb-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                  </svg>
                  <p className="text-lg md:text-xl font-medium italic text-foreground mb-6">
                    {item.testimonial.quote}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-xl">
                      👤
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {item.testimonial.name}, {item.testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Advantages;
