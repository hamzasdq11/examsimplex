const StatsBanner = () => {
  return (
    <section className="py-16 md:py-20 bg-primary">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-10 text-center md:text-left">
          <span className="text-6xl md:text-8xl font-bold text-primary-foreground">
            98%
          </span>
          <div className="text-primary-foreground">
            <p className="text-lg md:text-xl opacity-90">Of students who study with us</p>
            <p className="text-2xl md:text-4xl font-semibold">Get Better Grades</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
