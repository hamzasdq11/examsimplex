import { AnimatedSection } from "@/hooks/useScrollAnimation";

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: Math.random() * 4 + 2,
  left: Math.random() * 100,
  delay: Math.random() * 8,
  duration: Math.random() * 6 + 8,
  opacity: Math.random() * 0.3 + 0.1,
}));

const StatsBanner = () => {
  return (
    <section className="relative py-16 md:py-20 bg-section-dark overflow-hidden">
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {particles.map((p) => (
          <div
            key={p.id}
            className="absolute rounded-full bg-primary"
            style={{
              width: p.size,
              height: p.size,
              left: `${p.left}%`,
              bottom: `-${p.size}px`,
              opacity: p.opacity,
              animation: `floatUp ${p.duration}s ${p.delay}s linear infinite`,
            }}
          />
        ))}
      </div>
      <div className="container relative z-10">
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
