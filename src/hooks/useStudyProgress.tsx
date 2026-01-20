import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface StudyProgress {
  id: string;
  user_id: string;
  subject_id: string;
  notes_viewed: number;
  total_notes: number;
  pyqs_practiced: number;
  total_pyqs: number;
  questions_attempted: number;
  total_questions: number;
  ai_sessions: number;
  last_activity_at: string | null;
  last_unit_id: string | null;
}

export function useStudyProgress() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<StudyProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgress = useCallback(async () => {
    if (!user) {
      setProgress([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_study_progress')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setProgress(data || []);
    } catch (error) {
      console.error('Error fetching study progress:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const getSubjectProgress = useCallback((subjectId: string) => {
    return progress.find(p => p.subject_id === subjectId);
  }, [progress]);

  const updateProgress = useCallback(async (
    subjectId: string,
    updates: Partial<Omit<StudyProgress, 'id' | 'user_id' | 'subject_id'>>
  ) => {
    if (!user) return;

    try {
      const existing = getSubjectProgress(subjectId);
      
      if (existing) {
        const { error } = await supabase
          .from('user_study_progress')
          .update({ ...updates, last_activity_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_study_progress')
          .insert({
            user_id: user.id,
            subject_id: subjectId,
            ...updates,
            last_activity_at: new Date().toISOString()
          });
        if (error) throw error;
      }
      
      await fetchProgress();
    } catch (error) {
      console.error('Error updating study progress:', error);
    }
  }, [user, getSubjectProgress, fetchProgress]);

  const incrementAISessions = useCallback(async (subjectId: string) => {
    const current = getSubjectProgress(subjectId);
    await updateProgress(subjectId, {
      ai_sessions: (current?.ai_sessions || 0) + 1
    });
  }, [getSubjectProgress, updateProgress]);

  const getTotalStats = useCallback(() => {
    const totals = progress.reduce((acc, p) => ({
      notesViewed: acc.notesViewed + p.notes_viewed,
      totalNotes: acc.totalNotes + p.total_notes,
      pyqsPracticed: acc.pyqsPracticed + p.pyqs_practiced,
      totalPyqs: acc.totalPyqs + p.total_pyqs,
      questionsAttempted: acc.questionsAttempted + p.questions_attempted,
      totalQuestions: acc.totalQuestions + p.total_questions,
      aiSessions: acc.aiSessions + p.ai_sessions
    }), {
      notesViewed: 0,
      totalNotes: 0,
      pyqsPracticed: 0,
      totalPyqs: 0,
      questionsAttempted: 0,
      totalQuestions: 0,
      aiSessions: 0
    });

    return {
      ...totals,
      notesCoverage: totals.totalNotes > 0 
        ? Math.round((totals.notesViewed / totals.totalNotes) * 100) 
        : 0,
      pyqsCoverage: totals.totalPyqs > 0 
        ? Math.round((totals.pyqsPracticed / totals.totalPyqs) * 100) 
        : 0,
      questionsCoverage: totals.totalQuestions > 0 
        ? Math.round((totals.questionsAttempted / totals.totalQuestions) * 100) 
        : 0
    };
  }, [progress]);

  const getOverallReadiness = useCallback(() => {
    if (progress.length === 0) return 0;
    
    const subjectReadiness = progress.map(p => {
      const noteScore = p.total_notes > 0 ? (p.notes_viewed / p.total_notes) : 0;
      const pyqScore = p.total_pyqs > 0 ? (p.pyqs_practiced / p.total_pyqs) : 0;
      const questionScore = p.total_questions > 0 ? (p.questions_attempted / p.total_questions) : 0;
      
      // Weight: Notes 40%, PYQs 40%, Questions 20%
      return (noteScore * 0.4) + (pyqScore * 0.4) + (questionScore * 0.2);
    });

    return Math.round((subjectReadiness.reduce((a, b) => a + b, 0) / progress.length) * 100);
  }, [progress]);

  const getWeakestSubjects = useCallback((limit = 3) => {
    return [...progress]
      .map(p => {
        const noteScore = p.total_notes > 0 ? (p.notes_viewed / p.total_notes) : 0;
        const pyqScore = p.total_pyqs > 0 ? (p.pyqs_practiced / p.total_pyqs) : 0;
        const score = (noteScore + pyqScore) / 2;
        return { ...p, score };
      })
      .sort((a, b) => a.score - b.score)
      .slice(0, limit);
  }, [progress]);

  return {
    progress,
    loading,
    getSubjectProgress,
    updateProgress,
    incrementAISessions,
    getTotalStats,
    getOverallReadiness,
    getWeakestSubjects,
    refresh: fetchProgress
  };
}
