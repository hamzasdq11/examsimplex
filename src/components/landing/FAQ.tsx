import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is the score guarantee?",
    answer: "We guarantee specific score improvements based on the test you're preparing for. If you complete our full program and don't achieve the guaranteed score, you'll get your money back or continue studying for free until you do.",
  },
  {
    question: "How long does it take to prepare?",
    answer: "Preparation time varies by test and your starting point. Typically, MCAT prep takes 3-6 months, LSAT prep takes 2-4 months, and DAT prep takes 2-3 months. Our adaptive platform helps you optimize your study time.",
  },
  {
    question: "Can I access the content on mobile?",
    answer: "Yes! Our platform is fully responsive and works on all devices. You can study on your phone, tablet, or computer. We also offer offline access for premium subscribers.",
  },
  {
    question: "What's included in the free account?",
    answer: "Free accounts include access to sample lessons, limited practice questions, and our study planning tools. Premium subscriptions unlock full course content, unlimited practice, and personalized tutoring.",
  },
  {
    question: "Do you offer tutoring sessions?",
    answer: "Yes, we offer 1-on-1 tutoring sessions with expert instructors who have achieved top scores on their respective tests. Tutoring is available as an add-on or included in our premium packages.",
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
            Got questions? We've got answers. If you don't see your question here, feel free to contact us.
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
