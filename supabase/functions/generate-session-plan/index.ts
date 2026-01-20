import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SessionStep {
  step_index: number;
  step_type: 'notes' | 'pyq' | 'quiz' | 'break';
  subject_id: string | null;
  unit_id: string | null;
  title: string;
  description: string;
  duration_minutes: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
    
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

    const today = new Date().toISOString().split('T')[0];

    // Check if session already exists
    const { data: existingSession } = await supabaseClient
      .from('user_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('session_date', today)
      .maybeSingle();

    if (existingSession) {
      return new Response(
        JSON.stringify({ message: 'Session already exists', session: existingSession }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get subjects with their units
    const { data: subjects, error: subjectsError } = await supabaseClient
      .from('subjects')
      .select(`
        id, name, code, total_marks,
        units (id, name, weight)
      `)
      .eq('semester_id', semesterId);

    if (subjectsError || !subjects || subjects.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No subjects found' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's study progress
    const { data: progressData } = await supabaseClient
      .from('user_study_progress')
      .select('*')
      .eq('user_id', user.id)
      .in('subject_id', subjects.map(s => s.id));

    // Get PYQ papers for each subject
    const { data: pyqPapers } = await supabaseClient
      .from('pyq_papers')
      .select('id, subject_id, year')
      .in('subject_id', subjects.map(s => s.id))
      .order('year', { ascending: false });

    // Calculate priority scores for each subject
    const subjectScores = subjects.map(subject => {
      const progress = progressData?.find(p => p.subject_id === subject.id);
      const units = (subject as any).units || [];
      const maxWeight = Math.max(...units.map((u: any) => u.weight || 0), 0);
      
      // Score based on: low progress + high weightage + available content
      const progressScore = progress 
        ? 1 - (progress.notes_viewed / Math.max(progress.total_notes, 1))
        : 1; // No progress = highest priority
      
      const weightScore = maxWeight / 100;
      const hasPyqs = pyqPapers?.some(p => p.subject_id === subject.id);
      
      return {
        subject,
        units,
        progress,
        hasPyqs,
        score: progressScore * 0.5 + weightScore * 0.3 + (hasPyqs ? 0.2 : 0),
        latestPyq: pyqPapers?.find(p => p.subject_id === subject.id),
      };
    }).sort((a, b) => b.score - a.score);

    // Build session steps
    const steps: SessionStep[] = [];
    let stepIndex = 0;
    let totalMinutes = 0;
    const targetMinutes = 60; // 1 hour session

    // Priority subject - deep dive
    const priority = subjectScores[0];
    if (priority && priority.units.length > 0) {
      const topUnit = priority.units.sort((a: any, b: any) => (b.weight || 0) - (a.weight || 0))[0];
      
      steps.push({
        step_index: stepIndex++,
        step_type: 'notes',
        subject_id: priority.subject.id,
        unit_id: topUnit.id,
        title: `${priority.subject.name} → ${topUnit.name}`,
        description: `High-weightage topic (${topUnit.weight}%). Focus on key concepts.`,
        duration_minutes: 25,
      });
      totalMinutes += 25;

      // Add PYQ practice for priority subject
      if (priority.hasPyqs && priority.latestPyq) {
        steps.push({
          step_index: stepIndex++,
          step_type: 'pyq',
          subject_id: priority.subject.id,
          unit_id: topUnit.id,
          title: `Practice ${priority.latestPyq.year} Questions`,
          description: `Apply concepts with real exam questions from ${topUnit.name}.`,
          duration_minutes: 15,
        });
        totalMinutes += 15;
      }
    }

    // Break
    if (totalMinutes >= 30) {
      steps.push({
        step_index: stepIndex++,
        step_type: 'break',
        subject_id: null,
        unit_id: null,
        title: 'Quick Break',
        description: 'Rest your mind. Stretch. Hydrate.',
        duration_minutes: 5,
      });
      totalMinutes += 5;
    }

    // Secondary subject if time permits
    if (subjectScores.length > 1 && totalMinutes < targetMinutes) {
      const secondary = subjectScores[1];
      const remainingTime = targetMinutes - totalMinutes;
      
      if (secondary.units.length > 0 && remainingTime >= 15) {
        const topUnit = secondary.units.sort((a: any, b: any) => (b.weight || 0) - (a.weight || 0))[0];
        
        steps.push({
          step_index: stepIndex++,
          step_type: 'notes',
          subject_id: secondary.subject.id,
          unit_id: topUnit.id,
          title: `${secondary.subject.name} → ${topUnit.name}`,
          description: 'Quick review of important concepts.',
          duration_minutes: Math.min(15, remainingTime),
        });
        totalMinutes += Math.min(15, remainingTime);
      }
    }

    // Create session
    const { data: newSession, error: sessionError } = await supabaseClient
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_date: today,
        status: 'pending',
        total_duration_minutes: totalMinutes,
        completed_duration_minutes: 0,
        current_step_index: 0,
      })
      .select()
      .single();

    if (sessionError) {
      throw sessionError;
    }

    // Create steps
    if (steps.length > 0) {
      const stepsWithSessionId = steps.map(step => ({
        ...step,
        session_id: newSession.id,
        status: 'pending',
      }));

      const { error: stepsError } = await supabaseClient
        .from('session_steps')
        .insert(stepsWithSessionId);

      if (stepsError) {
        throw stepsError;
      }
    }

    return new Response(
      JSON.stringify({ session: newSession, steps }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating session plan:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
