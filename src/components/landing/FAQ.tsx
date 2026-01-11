import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const faqs = [
  {
    question: "What universities does EXAM Simplex cover?",
    answer: "EXAM Simplex currently covers AKTU (Abdul Kalam Technical University), UPTU, and is expanding to more universities across India. We provide study materials, previous year questions, and notes for B.Tech, BCA, MCA, and other courses.",
  },
  {
    question: "Are the previous year questions (PYQs) from actual exams?",
    answer: "Yes, all our PYQs are collected from actual university examinations. We verify and organize them by year, subject, and unit to help you understand exam patterns and prepare effectively.",
  },
  {
    question: "How does the AI assistant help with exam preparation?",
    answer: "Our AI assistant can explain complex topics, solve problems step-by-step, generate practice questions, summarize notes, and answer your doubts instantly. It's like having a personal tutor available 24/7.",
  },
  {
    question: "Is EXAM Simplex free to use?",
    answer: "Yes, basic access to notes, PYQs, and study materials is completely free. We believe quality education should be accessible to everyone. Premium features like advanced AI assistance are available for subscribers.",
  },
  {
    question: "How are the study notes organized?",
    answer: "Notes are organized by university, course, semester, and subject. Each subject is further divided into units following the official syllabus, making it easy to find exactly what you need for your exams.",
  },
  {
    question: "Can I access EXAM Simplex on my mobile phone?",
    answer: "Absolutely! EXAM Simplex is fully responsive and works perfectly on mobile phones, tablets, and computers. Study anywhere, anytime with our mobile-friendly platform.",
  },
];

const FAQ = () => {
  return (
    <section id="faq" className="py-16 md:py-24 bg-muted/30">
      <div className="container max-w-3xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Got questions about EXAM Simplex? Find answers to common questions below.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`} className="bg-card rounded-lg mb-3 px-6 border border-border/50">
              <AccordionTrigger className="text-left font-medium text-foreground hover:no-underline">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
