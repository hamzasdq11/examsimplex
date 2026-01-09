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

interface SubjectWithPath {
  slug: string;
  updated_at: string;
  university_id: string;
  course_id: string;
  semester_id: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get base URL from request or environment
    const url = new URL(req.url);
    const baseUrl = url.searchParams.get('baseUrl') || 'https://examsimplex.com';

    // Fetch all universities
    const { data: universities, error: uniError } = await supabase
      .from('universities')
      .select('id, slug, updated_at');

    if (uniError) throw uniError;

    // Fetch all subjects with their full path
    const { data: subjects, error: subError } = await supabase
      .from('subjects')
      .select(`
        slug,
        updated_at,
        semester:semesters!inner(
          id,
          course:courses!inner(
            id,
            university:universities!inner(id)
          )
        )
      `);

    if (subError) throw subError;

    // Generate XML sitemap
    const now = new Date().toISOString().split('T')[0];
    
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  
  <!-- Auth page -->
  <url>
    <loc>${baseUrl}/auth</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
`;

    // Add university pages
    for (const uni of (universities as University[]) || []) {
      const lastmod = uni.updated_at ? uni.updated_at.split('T')[0] : now;
      xml += `
  <url>
    <loc>${baseUrl}/university/${uni.id}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
    }

    // Add subject pages
    for (const subject of subjects || []) {
      const semester = (subject as any).semester;
      if (!semester) continue;
      
      const course = semester.course;
      if (!course) continue;
      
      const university = course.university;
      if (!university) continue;

      const lastmod = subject.updated_at ? subject.updated_at.split('T')[0] : now;
      const subjectUrl = `${baseUrl}/university/${university.id}/${course.id}/${semester.id}/${subject.slug}`;
      
      xml += `
  <url>
    <loc>${subjectUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
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
    return new Response(
      JSON.stringify({ error: 'Failed to generate sitemap' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
