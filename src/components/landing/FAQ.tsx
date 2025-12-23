import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

const faqs = [
  { q: "Is ElixrLabs free to use?", a: "Yes! ElixrLabs offers a generous free tier with basic resources, limited AI tutor queries, and community features. Premium unlocks unlimited AI access and exclusive content." },
  { q: "How does the XP and leveling system work?", a: "Earn XP for watching videos, solving quizzes, maintaining streaks, and helping others. Level up to unlock titles, badges, and perks!" },
  { q: "Which colleges are supported?", a: "We support 100+ colleges across India including IITs, NITs, IIMs, and major private institutions. Request yours if not listed!" },
  { q: "How accurate is the ElixrAI tutor?", a: "ElixrAI is trained on verified academic content and understands your specific syllabus and exam patterns. Cross-reference for critical exams." },
  { q: "Can I access ElixrLabs on mobile?", a: "Absolutely! Fully responsive on all devices with iOS and Android apps coming soon with offline access." },
  { q: "How do I contribute notes?", a: "Verified students can upload through their dashboard. Contributions earn bonus XP and contributor badges!" },
];

const FAQ = () => (
  <section id="faq" className="py-20 md:py-32 relative overflow-hidden bg-muted/30">
    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
    <div className="container mx-auto px-4 relative z-10">
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted border border-border mb-6">
          <HelpCircle className="w-4 h-4 text-primary" /><span className="text-sm font-bold text-foreground">Knowledge Base</span>
        </div>
        <h2 className="font-display text-4xl md:text-6xl text-foreground mb-4">Quest Guide</h2>
        <p className="text-lg text-muted-foreground">Everything you need to know before starting your adventure</p>
      </div>
      <div className="max-w-3xl mx-auto">
        <Accordion type="single" collapsible className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="game-card border-2 border-border/50 px-6 data-[state=open]:border-primary/50">
              <AccordionTrigger className="text-left font-bold text-foreground hover:text-primary py-6 hover:no-underline">
                <span className="flex items-center gap-3"><span className="text-2xl">{["❓","⚡","🏛️","🤖","📱","📤"][i]}</span>{faq.q}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 pl-10">{faq.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  </section>
);

export default FAQ;
