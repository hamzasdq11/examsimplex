import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  university_id: string | null;
  course_id: string | null;
  semester_id: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  university?: { id: string; name: string; full_name: string; slug: string } | null;
  course?: { id: string; name: string; code: string } | null;
  semester?: { id: string; name: string; number: number } | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select(`
          *,
          university:universities(id, name, full_name, slug),
          course:courses(id, name, code),
          semester:semesters(id, name, number)
        `)
        .eq('id', user.id)
        .single();

      if (fetchError) {
        // Profile might not exist yet for new users
        if (fetchError.code === 'PGRST116') {
          setProfile(null);
        } else {
          throw fetchError;
        }
      } else {
        setProfile(data as Profile);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('Not authenticated') };

    try {
      // Use upsert to create profile if it doesn't exist
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          full_name: updates.full_name,
          avatar_url: updates.avatar_url,
          university_id: updates.university_id,
          course_id: updates.course_id,
          semester_id: updates.semester_id,
          bio: updates.bio,
        }, { onConflict: 'id' });

      if (updateError) throw updateError;
      
      await fetchProfile();
      return { error: null };
    } catch (err: any) {
      return { error: err };
    }
  };

  const isProfileComplete = profile && 
    profile.full_name && 
    profile.university_id && 
    profile.course_id && 
    profile.semester_id;

  return {
    profile,
    loading,
    error,
    updateProfile,
    refetch: fetchProfile,
    isProfileComplete,
  };
}
