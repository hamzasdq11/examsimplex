import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DailyFocus {
  subjectName: string;
  subjectId: string;
  unitName: string;
  unitId: string;
  reason: string;
  pyqYear?: string;
  pyqMarks?: number;
  estimatedMinutes: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
    // Verify user
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { semesterId } = await req.json();
    
    if (!semesterId) {
      return new Response(
        JSON.stringify({ error: 'Semester ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get subjects for the semester
    const { data: subjects, error: subjectsError } = await supabaseClient
      .from('subjects')
      .select('id, name, code, total_marks')
      .eq('semester_id', semesterId);

    if (subjectsError || !subjects || subjects.length === 0) {
      return new Response(
        JSON.stringify({ focus: null, message: 'No subjects found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's study progress
    const { data: progressData } = await supabaseClient
      .from('user_study_progress')
      .select('*')
      .eq('user_id', user.id)
      .in('subject_id', subjects.map(s => s.id));

    // Find subject with least progress or no progress
    let targetSubject = subjects[0];
    let lowestProgress = 1;

    for (const subject of subjects) {
      const progress = progressData?.find(p => p.subject_id === subject.id);
      if (!progress) {
        // No progress at all - prioritize this
        targetSubject = subject;
        lowestProgress = 0;
        break;
      }
      
      const notesCoverage = progress.total_notes > 0 
        ? progress.notes_viewed / progress.total_notes 
        : 0;
      
      if (notesCoverage < lowestProgress) {
        lowestProgress = notesCoverage;
        targetSubject = subject;
      }
    }

    // Get units for target subject, prioritized by weight
    const { data: units } = await supabaseClient
      .from('units')
      .select('id, name, weight')
      .eq('subject_id', targetSubject.id)
      .order('weight', { ascending: false });

    const targetUnit = units?.[0];

    if (!targetUnit) {
      // No units, return subject-level focus
      const focus: DailyFocus = {
        subjectName: targetSubject.name,
        subjectId: targetSubject.id,
        unitName: 'Overview',
        unitId: '',
        reason: 'Start your journey',
        estimatedMinutes: 30
      };

      return new Response(
        JSON.stringify({ focus }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check for PYQ papers
    const { data: pyqPapers } = await supabaseClient
      .from('pyq_papers')
      .select('id, year')
      .eq('subject_id', targetSubject.id)
      .order('year', { ascending: false })
      .limit(1);

    const focus: DailyFocus = {
      subjectName: targetSubject.name,
      subjectId: targetSubject.id,
      unitName: targetUnit.name,
      unitId: targetUnit.id,
      reason: targetUnit.weight >= 20 ? 'High weightage' : 'Important topic',
      pyqYear: pyqPapers?.[0]?.year,
      pyqMarks: 10,
      estimatedMinutes: Math.max(30, Math.min(60, targetUnit.weight * 2))
    };

    return new Response(
      JSON.stringify({ focus }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating daily focus:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
