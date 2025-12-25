import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import StatsBanner from "@/components/landing/StatsBanner";
import SubjectCategories from "@/components/landing/SubjectCategories";
import Advantages from "@/components/landing/Advantages";
import CourseFeatures from "@/components/landing/CourseFeatures";
import Testimonials from "@/components/landing/Testimonials";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <Features />
        <StatsBanner />
        <SubjectCategories />
        <Advantages />
        <CourseFeatures />
        <Testimonials />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
