import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface SessionStep {
  id: string;
  session_id: string;
  step_index: number;
  step_type: 'notes' | 'pyq' | 'quiz' | 'break';
  subject_id: string | null;
  unit_id: string | null;
  title: string;
  description: string | null;
  duration_minutes: number;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  completed_at: string | null;
  // Joined data
  subject_name?: string;
  unit_name?: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  session_date: string;
  status: 'pending' | 'active' | 'completed' | 'skipped';
  total_duration_minutes: number;
  completed_duration_minutes: number;
  current_step_index: number;
  started_at: string | null;
  completed_at: string | null;
  steps: SessionStep[];
}

export function useSession(semesterId: string | null) {
  const { user } = useAuth();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchTodaySession = useCallback(async () => {
    if (!user || !semesterId) {
      setLoading(false);
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch today's session with steps
      const { data: sessionData, error: sessionError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('session_date', today)
        .maybeSingle();

      if (sessionError) throw sessionError;

      if (!sessionData) {
        setSession(null);
        setLoading(false);
        return;
      }

      // Fetch steps for this session
      const { data: stepsData, error: stepsError } = await supabase
        .from('session_steps')
        .select(`
          *,
          subjects:subject_id (name),
          units:unit_id (name)
        `)
        .eq('session_id', sessionData.id)
        .order('step_index', { ascending: true });

      if (stepsError) throw stepsError;

      const steps: SessionStep[] = (stepsData || []).map((step: any) => ({
        ...step,
        subject_name: step.subjects?.name,
        unit_name: step.units?.name,
      }));

      setSession({
        ...sessionData,
        status: sessionData.status as UserSession['status'],
        steps,
      });
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  }, [user, semesterId]);

  const generateSession = useCallback(async () => {
    if (!user || !semesterId || generating) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-session-plan', {
        body: { semesterId }
      });

      if (error) throw error;

      if (data?.session) {
        await fetchTodaySession();
      }
    } catch (error) {
      console.error('Error generating session:', error);
      // Fallback: create a basic session locally
      await generateFallbackSession();
    } finally {
      setGenerating(false);
    }
  }, [user, semesterId, generating, fetchTodaySession]);

  const generateFallbackSession = async () => {
    if (!user || !semesterId) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      // Get subjects for the semester
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('semester_id', semesterId)
        .limit(2);

      if (!subjects || subjects.length === 0) return;

      // Get units for first subject
      const { data: units } = await supabase
        .from('units')
        .select('id, name, weight')
        .eq('subject_id', subjects[0].id)
        .order('weight', { ascending: false })
        .limit(2);

      // Create session
      const { data: newSession, error: sessionError } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          session_date: today,
          status: 'pending',
          total_duration_minutes: 60,
          completed_duration_minutes: 0,
          current_step_index: 0,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create steps
      const steps = [];
      
      if (units && units.length > 0) {
        steps.push({
          session_id: newSession.id,
          step_index: 0,
          step_type: 'notes',
          subject_id: subjects[0].id,
          unit_id: units[0].id,
          title: `${subjects[0].name} → ${units[0].name}`,
          description: 'High weightage topic - master the fundamentals',
          duration_minutes: 25,
          status: 'pending',
        });

        steps.push({
          session_id: newSession.id,
          step_index: 1,
          step_type: 'pyq',
          subject_id: subjects[0].id,
          unit_id: units[0].id,
          title: 'Practice PYQ Questions',
          description: 'Apply what you learned with real exam questions',
          duration_minutes: 20,
          status: 'pending',
        });
      }

      steps.push({
        session_id: newSession.id,
        step_index: steps.length,
        step_type: 'break',
        subject_id: null,
        unit_id: null,
        title: 'Quick Break',
        description: 'Rest your mind before the next block',
        duration_minutes: 5,
        status: 'pending',
      });

      if (subjects.length > 1) {
        steps.push({
          session_id: newSession.id,
          step_index: steps.length,
          step_type: 'notes',
          subject_id: subjects[1].id,
          unit_id: null,
          title: `${subjects[1].name} Overview`,
          description: 'Quick review of key concepts',
          duration_minutes: 10,
          status: 'pending',
        });
      }

      if (steps.length > 0) {
        await supabase.from('session_steps').insert(steps);
      }

      await fetchTodaySession();
    } catch (error) {
      console.error('Error generating fallback session:', error);
    }
  };

  const startSession = useCallback(async () => {
    if (!session) return;

    try {
      await supabase
        .from('user_sessions')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
          current_step_index: 0,
        })
        .eq('id', session.id);

      // Mark first step as active
      if (session.steps.length > 0) {
        await supabase
          .from('session_steps')
          .update({ status: 'active' })
          .eq('id', session.steps[0].id);
      }

      await fetchTodaySession();
    } catch (error) {
      console.error('Error starting session:', error);
    }
  }, [session, fetchTodaySession]);

  const completeStep = useCallback(async (stepId: string) => {
    if (!session) return;

    try {
      const currentIndex = session.steps.findIndex(s => s.id === stepId);
      const currentStep = session.steps[currentIndex];
      
      // Mark step as completed
      await supabase
        .from('session_steps')
        .update({ 
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', stepId);

      // Update session progress
      const newCompletedDuration = session.completed_duration_minutes + currentStep.duration_minutes;
      const nextIndex = currentIndex + 1;
      const isLastStep = nextIndex >= session.steps.length;

      await supabase
        .from('user_sessions')
        .update({
          completed_duration_minutes: newCompletedDuration,
          current_step_index: nextIndex,
          status: isLastStep ? 'completed' : 'active',
          completed_at: isLastStep ? new Date().toISOString() : null,
        })
        .eq('id', session.id);

      // Mark next step as active if not last
      if (!isLastStep) {
        await supabase
          .from('session_steps')
          .update({ status: 'active' })
          .eq('id', session.steps[nextIndex].id);
      }

      await fetchTodaySession();
    } catch (error) {
      console.error('Error completing step:', error);
    }
  }, [session, fetchTodaySession]);

  const skipStep = useCallback(async (stepId: string) => {
    if (!session) return;

    try {
      const currentIndex = session.steps.findIndex(s => s.id === stepId);
      
      // Mark step as skipped
      await supabase
        .from('session_steps')
        .update({ status: 'skipped' })
        .eq('id', stepId);

      // Move to next step
      const nextIndex = currentIndex + 1;
      const isLastStep = nextIndex >= session.steps.length;

      await supabase
        .from('user_sessions')
        .update({
          current_step_index: nextIndex,
          status: isLastStep ? 'completed' : 'active',
          completed_at: isLastStep ? new Date().toISOString() : null,
        })
        .eq('id', session.id);

      if (!isLastStep) {
        await supabase
          .from('session_steps')
          .update({ status: 'active' })
          .eq('id', session.steps[nextIndex].id);
      }

      await fetchTodaySession();
    } catch (error) {
      console.error('Error skipping step:', error);
    }
  }, [session, fetchTodaySession]);

  useEffect(() => {
    fetchTodaySession();
  }, [fetchTodaySession]);

  const currentStep = session?.steps.find(s => s.status === 'active') || null;
  const completedSteps = session?.steps.filter(s => s.status === 'completed').length || 0;
  const totalSteps = session?.steps.length || 0;
  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  return {
    session,
    currentStep,
    loading,
    generating,
    completedSteps,
    totalSteps,
    progressPercent,
    generateSession,
    startSession,
    completeStep,
    skipStep,
    refresh: fetchTodaySession,
  };
}
