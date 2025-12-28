import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Play, RotateCcw, RotateCw, List } from "lucide-react";

const CourseFeatures = () => {
  return (
    <section className="py-16 md:py-24 bg-section-dark text-white">
      <div className="container max-w-6xl mx-auto px-6 md:px-8">
        {/* Feature 1: Follow Along With Your Course */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Follow Along With Your Course
            </h2>
            <p className="text-lg opacity-90 mb-8">
              No more hunting for information online. Our expert tutors curate courses for you, based on your syllabus and textbook to ensure that you're learning exactly what will be on your exams.
            </p>
            <div className="flex items-start gap-4 bg-primary-foreground/10 rounded-xl p-4">
              <div className="w-12 h-12 rounded-full bg-card-cyan flex items-center justify-center text-xl shrink-0">
                👨🏻
              </div>
              <div>
                <p className="italic opacity-90 mb-2">
                  "The course-specific videos and practice questions helped me to get through University Calculus and I ended up getting an A-."
                </p>
                <p className="text-sm opacity-70">- Rycon, Undergraduate Student</p>
              </div>
            </div>
          </div>
          
          {/* Curriculum Mockup */}
          <div className="relative">
            <div className="bg-card-lavender/20 rounded-xl p-4 mb-4 max-w-xs">
              <p className="font-semibold text-sm">CHEM 103 SYLLABUS</p>
              <p className="text-xs opacity-70">Prof. McGonagall</p>
              <div className="mt-2 space-y-1">
                <div className="h-2 bg-primary-foreground/20 rounded w-full"></div>
                <div className="h-2 bg-primary-foreground/20 rounded w-4/5"></div>
                <div className="h-2 bg-primary-foreground/20 rounded w-3/4"></div>
              </div>
            </div>
            <div className="bg-card rounded-xl p-6 text-foreground shadow-xl ml-8">
              <div className="flex items-center gap-2 mb-4 text-primary">
                <List className="h-5 w-5" />
                <span className="font-semibold text-sm">CURRICULUM</span>
              </div>
              <div className="space-y-3">
                <p className="font-semibold">1. Atoms, Ions & Isotopes</p>
                <div>
                  <p className="font-semibold">2. Stoichiometry</p>
                  <div className="ml-4 mt-2 space-y-1 text-sm text-muted-foreground">
                    <p>2.1 Introduction to Chemical Equations and Balancing</p>
                    <p>2.2 Atoms, Molecules, and the Mole!</p>
                    <p>2.3 Stoichiometry</p>
                  </div>
                </div>
                <p className="font-semibold">3. Early Atomic Theory to Quantum Theory</p>
                <p className="font-semibold">4. Quantum Numbers and Electron Configurations</p>
              </div>
            </div>
            {/* Arrow decoration */}
            <svg className="absolute top-16 left-48 w-16 h-16 text-primary-foreground" viewBox="0 0 100 100" fill="none">
              <path d="M20 80 Q50 20 80 40" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round"/>
              <path d="M75 30 L85 42 L70 45" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>

        {/* Feature 2: Quickly Understand Complex Concepts */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Quickly Understand Complex Concepts
            </h2>
            <p className="text-lg opacity-90 mb-8">
              With bite-sized videos and comprehensive, easy-to-understand notes that cover all of the concepts in your course, you can fit your study session in whenever you have time.
            </p>
            <div className="flex items-start gap-4 bg-primary-foreground/10 rounded-xl p-4">
              <div className="w-12 h-12 rounded-full bg-card-pink flex items-center justify-center text-xl shrink-0">
                👩🏻
              </div>
              <div>
                <p className="italic opacity-90 mb-2">
                  "Explains concepts in a very concise way that is really easy to understand."
                </p>
                <p className="text-sm opacity-70">- Bianca, Undergraduate Student</p>
              </div>
            </div>
          </div>
          
          {/* Video Player Mockup */}
          <div className="relative">
            <div className="bg-card rounded-xl p-4 text-foreground shadow-xl">
              <div className="mb-4">
                <p className="text-primary font-semibold text-sm mb-2">Absorption and Emission Spectra</p>
                <p className="text-xs text-muted-foreground">Continuous Spectrum</p>
                <div className="h-8 mt-2 rounded bg-gradient-to-r from-violet-500 via-green-500 to-red-500"></div>
              </div>
              <div className="bg-muted rounded-lg p-4 relative">
                <div className="absolute top-2 right-2 bg-card rounded p-2 text-xs">
                  <p className="font-semibold text-primary mb-1">Absorption Spectra</p>
                  <div className="flex gap-1">
                    <div className="w-4 h-4 bg-destructive rounded"></div>
                    <div className="w-4 h-4 bg-foreground rounded"></div>
                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  </div>
                </div>
                <p className="text-sm font-medium mb-8">Absorption Lines</p>
                <div className="flex items-center gap-4 mt-4">
                  <Play className="h-6 w-6 text-primary" />
                  <RotateCcw className="h-5 w-5 text-muted-foreground" />
                  <RotateCw className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1 h-1 bg-primary/30 rounded">
                    <div className="w-1/3 h-full bg-primary rounded"></div>
                  </div>
                  <span className="text-xs text-muted-foreground">1X</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Feature 3: Be Prepared With Exam-Like Practice */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-24">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Be Prepared With Exam-Like Practice
            </h2>
            <p className="text-lg opacity-90 mb-8">
              Learn how to solve tough problems and get exam ready with exam-like practice questions and step-by-step solutions.
            </p>
            <div className="flex items-start gap-4 bg-primary-foreground/10 rounded-xl p-4">
              <div className="w-12 h-12 rounded-full bg-card-mint flex items-center justify-center text-xl shrink-0">
                👩🏽
              </div>
              <div>
                <p className="italic opacity-90 mb-2">
                  "The extra practice questions truly help me understand the material instead of just memorizing it."
                </p>
                <p className="text-sm opacity-70">- Emily, Undergraduate Student</p>
              </div>
            </div>
          </div>
          
          {/* Quiz Mockup */}
          <div className="relative">
            <div className="bg-card rounded-xl overflow-hidden text-foreground shadow-xl">
              <div className="bg-muted p-4">
                <p className="text-sm">
                  Given that advertising can make consumers loyal to some brands, it could ______ the price elasticity of demand and ______ the markup of price over marginal cost.
                </p>
              </div>
              <div className="p-4 space-y-3">
                <div className="border border-border rounded-lg p-3 text-sm hover:border-primary cursor-pointer transition-colors">
                  A) Decrease, increase
                </div>
                <div className="border border-border rounded-lg p-3 text-sm hover:border-primary cursor-pointer transition-colors">
                  B) Increase, decrease
                </div>
                <div className="border border-border rounded-lg p-3 text-sm hover:border-primary cursor-pointer transition-colors">
                  C) Increase, increase
                </div>
                <div className="border border-border rounded-lg p-3 text-sm hover:border-primary cursor-pointer transition-colors">
                  D) Decrease, decrease
                </div>
                <Button variant="outline" className="w-full mt-2">
                  Check Solution
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center pt-12">
          <Link to="/get-started">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
              Start Studying for Free
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default CourseFeatures;
