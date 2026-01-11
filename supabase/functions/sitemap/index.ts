import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface University {
  id: string;
  slug: string;
  updated_at: string;
}

const SITE_URL = 'https://examsimplex.lovable.app';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch all universities
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('id, slug, updated_at')
      .order('name');

    if (uniError) throw uniError;

    // Fetch all subjects with their full path including course code and semester number
    const { data: subjects, error: subError } = await supabase
      .from('subjects')
      .select(`
        slug,
        name,
        updated_at,
        semester:semesters!inner(
          number,
          course:courses!inner(
            code,
            university:universities!inner(
              slug
            )
          )
        )
      `)
      .order('name');

    if (subError) throw subError;

    // Generate XML sitemap
    const now = new Date().toISOString().split('T')[0];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <!-- Homepage -->
  <url>
    <loc>${SITE_URL}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
    <image:image>
      <image:loc>${SITE_URL}/og-image.png</image:loc>
      <image:title>EXAM Simplex - AKTU Notes, PYQs and AI Study Help</image:title>
    </image:image>
  </url>
  
  <!-- Auth page -->
  <url>
    <loc>${SITE_URL}/auth</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.4</priority>
  </url>
`;

    // Add university pages
    for (const uni of (universities as University[]) || []) {
      const lastmod = uni.updated_at ? uni.updated_at.split('T')[0] : now;
      xml += `
  <url>
    <loc>${SITE_URL}/university/${uni.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }

    // Add subject pages with proper SEO-friendly URLs
    for (const subject of subjects || []) {
      const semester = (subject as any).semester;
      if (!semester) continue;
      
      const course = semester.course;
      if (!course) continue;
      
      const university = course.university;
      if (!university?.slug || !course?.code || !semester?.number || !subject.slug) continue;

      const lastmod = subject.updated_at ? subject.updated_at.split('T')[0] : now;
      // SEO-friendly URL: /university/{uni-slug}/{course-code}/sem{number}/{subject-slug}
      const subjectUrl = `${SITE_URL}/university/${university.slug}/${course.code.toLowerCase()}/sem${semester.number}/${subject.slug}`;
      
      xml += `
  <url>
    <loc>${subjectUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
    }

    xml += `
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Sitemap generation error:', error);
    // Return a basic sitemap on error
    return new Response(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${SITE_URL}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`,
      {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600',
        },
      }
    );
  }
});
