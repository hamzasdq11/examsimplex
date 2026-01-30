import { AnimatedSection } from "@/hooks/useScrollAnimation";

const StatsBanner = () => {
  return (
    <section className="py-16 md:py-20 bg-section-dark overflow-hidden">
      <div className="container">
        <AnimatedSection animation="scale" className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 text-center md:text-left">
          <span className="text-6xl md:text-8xl font-bold text-white/95">
            98%
          </span>
          <div className="text-white/90">
            <p className="text-lg md:text-xl opacity-80">Of students who study with us</p>
            <p className="text-2xl md:text-4xl font-semibold">Get Better Grades</p>
          </div>
        </AnimatedSection>
      </div>
    </section>
  );
};

export default StatsBanner;
