import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  jsonLd?: object | object[];
  noIndex?: boolean;
}

const SITE_NAME = 'EXAM Simplex';
const DEFAULT_DESCRIPTION = 'Ace your exams with EXAM Simplex. Access study notes, previous year questions, and AI-powered assistance for universities across India.';
const DEFAULT_OG_IMAGE = '/og-image.png';

export const SEO = ({
  title,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  jsonLd,
  noIndex = false,
}: SEOProps) => {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const fullCanonicalUrl = canonicalUrl ? `${origin}${canonicalUrl}` : undefined;
  const fullOgImage = ogImage.startsWith('http') ? ogImage : `${origin}${ogImage}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullOgImage} />
      {fullCanonicalUrl && <meta property="og:url" content={fullCanonicalUrl} />}
      <meta property="og:site_name" content={SITE_NAME} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={fullOgImage} />
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(Array.isArray(jsonLd) ? jsonLd : jsonLd)}
        </script>
      )}
    </Helmet>
  );
};

// Pre-built JSON-LD schemas
export const createOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'EXAM Simplex',
  description: 'Exam preparation platform with notes, previous year questions, and AI-powered assistance',
  url: typeof window !== 'undefined' ? window.location.origin : '',
});

export const createBreadcrumbSchema = (items: { name: string; url: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: item.url,
  })),
});

export const createCourseSchema = ({
  name,
  code,
  university,
  description,
}: {
  name: string;
  code: string;
  university: string;
  description?: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'Course',
  name,
  courseCode: code,
  description: description || `Study materials for ${name} at ${university}`,
  provider: {
    '@type': 'CollegeOrUniversity',
    name: university,
  },
  hasCourseInstance: {
    '@type': 'CourseInstance',
    courseMode: 'full-time',
  },
});

export const createWebPageSchema = ({
  title,
  description,
  url,
}: {
  title: string;
  description: string;
  url: string;
}) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url,
});

export default SEO;
