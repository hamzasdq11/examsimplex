const StatsBanner = () => {
  return (
    <section className="py-16 md:py-20 bg-primary">
      <div className="container">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-6 md:gap-10">
            <span className="text-6xl md:text-8xl font-bold text-primary-foreground">
              98%
            </span>
            <div className="text-primary-foreground">
              <p className="text-lg md:text-xl opacity-90">Of students who study with us</p>
              <p className="text-2xl md:text-4xl font-semibold">Get Better Grades</p>
            </div>
          </div>
          
          <div className="flex -space-x-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card-pink border-4 border-primary flex items-center justify-center text-2xl">
              👩🏻
            </div>
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card-cyan border-4 border-primary flex items-center justify-center text-2xl">
              👨🏽
            </div>
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-card-lavender border-4 border-primary flex items-center justify-center text-2xl">
              👩🏼
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatsBanner;
