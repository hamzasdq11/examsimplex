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
import { SEO, createOrganizationSchema } from "@/components/SEO";

const Index = () => {
  const jsonLd = [
    createOrganizationSchema(),
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'EXAM Simplex',
      url: typeof window !== 'undefined' ? window.location.origin : '',
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${typeof window !== 'undefined' ? window.location.origin : ''}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Your Exam Preparation Companion - Notes, PYQs & AI Help"
        description="Ace your exams with EXAM Simplex. Access study notes, previous year questions, and AI-powered assistance for 10+ universities across India."
        canonicalUrl="/"
        jsonLd={jsonLd}
      />
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
