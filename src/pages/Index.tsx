import Header from "@/components/landing/Header";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import StatsBanner from "@/components/landing/StatsBanner";
import SubjectCategories from "@/components/landing/SubjectCategories";
import Advantages from "@/components/landing/Advantages";
import CourseFeatures from "@/components/landing/CourseFeatures";
import Testimonials from "@/components/landing/Testimonials";
import FAQ, { faqs } from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";
import { SEO, createEducationalOrganizationSchema, createFAQSchema } from "@/components/SEO";

const Index = () => {
  const jsonLd = [
    createEducationalOrganizationSchema(),
    createFAQSchema(faqs),
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
        title="AKTU Notes, PYQs & AI Study Help - Free Exam Preparation"
        description="Free AKTU exam preparation with study notes, previous year questions (PYQs), and AI-powered assistance. B.Tech CSE, ECE, ME notes for all semesters. Ace your university exams!"
        canonicalUrl="/"
        jsonLd={jsonLd}
        keywords="AKTU notes, AKTU PYQ, AKTU previous year questions, B.Tech notes, UPTU notes, exam preparation India, university exam help, CSE notes, engineering notes, free study materials, AI tutor"
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
