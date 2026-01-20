import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface DailyFocus {
  subjectName: string;
  subjectId: string;
  unitName: string;
  unitId: string;
  reason: string;
  pyqYear?: string;
  pyqMarks?: number;
  estimatedMinutes: number;
}

const CACHE_KEY = 'daily_focus_cache';
const CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours

interface CachedFocus {
  data: DailyFocus | null;
  timestamp: number;
  userId: string;
}

export function useDailyFocus(semesterId: string | null) {
  const { user } = useAuth();
  const [focus, setFocus] = useState<DailyFocus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const getCachedFocus = useCallback((): DailyFocus | null => {
    if (!user) return null;
    
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (!cached) return null;
      
      const parsed: CachedFocus = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid and belongs to current user
      if (parsed.userId === user.id && (now - parsed.timestamp) < CACHE_DURATION) {
        return parsed.data;
      }
      
      return null;
    } catch {
      return null;
    }
  }, [user]);

  const setCachedFocus = useCallback((data: DailyFocus | null) => {
    if (!user) return;
    
    const cache: CachedFocus = {
      data,
      timestamp: Date.now(),
      userId: user.id
    };
    
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  }, [user]);

  const generateFocus = useCallback(async (forceRefresh = false) => {
    if (!user || !semesterId) {
      setLoading(false);
      return;
    }

    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = getCachedFocus();
      if (cached) {
        setFocus(cached);
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('generate-daily-focus', {
        body: { semesterId }
      });

      if (fnError) throw fnError;
      
      if (data?.focus) {
        setFocus(data.focus);
        setCachedFocus(data.focus);
      } else {
        setFocus(null);
        setCachedFocus(null);
      }
    } catch (err) {
      console.error('Error generating daily focus:', err);
      setError('Failed to generate daily focus');
      
      // Fallback: Generate a simple focus from local data
      await generateFallbackFocus();
    } finally {
      setLoading(false);
    }
  }, [user, semesterId, getCachedFocus, setCachedFocus]);

  const generateFallbackFocus = useCallback(async () => {
    if (!semesterId) return;

    try {
      // Get subjects for the semester
      const { data: subjects } = await supabase
        .from('subjects')
        .select('id, name')
        .eq('semester_id', semesterId)
        .limit(1);

      if (subjects && subjects.length > 0) {
        const subject = subjects[0];
        
        // Get first unit of this subject
        const { data: units } = await supabase
          .from('units')
          .select('id, name, weight')
          .eq('subject_id', subject.id)
          .order('weight', { ascending: false })
          .limit(1);

        if (units && units.length > 0) {
          const fallbackFocus: DailyFocus = {
            subjectName: subject.name,
            subjectId: subject.id,
            unitName: units[0].name,
            unitId: units[0].id,
            reason: 'High weightage topic',
            estimatedMinutes: 45
          };
          
          setFocus(fallbackFocus);
          setCachedFocus(fallbackFocus);
        }
      }
    } catch (err) {
      console.error('Error generating fallback focus:', err);
    }
  }, [semesterId, setCachedFocus]);

  useEffect(() => {
    generateFocus();
  }, [generateFocus]);

  return {
    focus,
    loading,
    error,
    refresh: () => generateFocus(true)
  };
}
