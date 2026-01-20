import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { differenceInDays, parseISO } from 'date-fns';

export interface ExamSettings {
  id: string;
  user_id: string;
  exam_date: string | null;
  exam_type: string;
}

export function useExamSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<ExamSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setSettings(null);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_exam_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Error fetching exam settings:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = useCallback(async (updates: Partial<Pick<ExamSettings, 'exam_date' | 'exam_type'>>) => {
    if (!user) return;

    try {
      if (settings) {
        const { error } = await supabase
          .from('user_exam_settings')
          .update(updates)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('user_exam_settings')
          .insert({
            user_id: user.id,
            ...updates
          });
        if (error) throw error;
      }
      
      await fetchSettings();
    } catch (error) {
      console.error('Error updating exam settings:', error);
    }
  }, [user, settings, fetchSettings]);

  const getDaysUntilExam = useCallback(() => {
    if (!settings?.exam_date) return null;
    
    const examDate = parseISO(settings.exam_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return differenceInDays(examDate, today);
  }, [settings]);

  const getExamTypeLabel = useCallback(() => {
    switch (settings?.exam_type) {
      case 'mid_sem':
        return 'Mid Semester';
      case 'end_sem':
        return 'End Semester';
      case 'viva':
        return 'Viva';
      default:
        return 'Exam';
    }
  }, [settings]);

  const getUrgencyLevel = useCallback(() => {
    const days = getDaysUntilExam();
    if (days === null) return 'unknown';
    if (days <= 7) return 'critical';
    if (days <= 14) return 'high';
    if (days <= 30) return 'medium';
    return 'low';
  }, [getDaysUntilExam]);

  return {
    settings,
    loading,
    updateSettings,
    getDaysUntilExam,
    getExamTypeLabel,
    getUrgencyLevel,
    refresh: fetchSettings
  };
}
