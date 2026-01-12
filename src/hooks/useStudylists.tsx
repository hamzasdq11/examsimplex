import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Studylist {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  item_count?: number;
}

export interface StudylistItem {
  id: string;
  studylist_id: string;
  item_type: 'subject' | 'note' | 'question';
  item_id: string;
  created_at: string;
}

export function useStudylists() {
  const { user } = useAuth();
  const [studylists, setStudylists] = useState<Studylist[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudylists = useCallback(async () => {
    if (!user) {
      setStudylists([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('studylists')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Get item counts
      const listsWithCounts = await Promise.all(
        (data as Studylist[]).map(async (list) => {
          const { count } = await supabase
            .from('studylist_items')
            .select('*', { count: 'exact', head: true })
            .eq('studylist_id', list.id);
          return { ...list, item_count: count || 0 };
        })
      );

      setStudylists(listsWithCounts);
    } catch (error) {
      console.error('Error fetching studylists:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchStudylists();
  }, [fetchStudylists]);

  const createStudylist = useCallback(async (
    name: string,
    description?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('studylists')
        .insert({
          user_id: user.id,
          name,
          description: description || null
        })
        .select()
        .single();

      if (error) throw error;

      fetchStudylists();
      return data as Studylist;
    } catch (error) {
      console.error('Error creating studylist:', error);
      return null;
    }
  }, [user, fetchStudylists]);

  const updateStudylist = useCallback(async (
    id: string,
    updates: { name?: string; description?: string }
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('studylists')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      fetchStudylists();
      return true;
    } catch (error) {
      console.error('Error updating studylist:', error);
      return false;
    }
  }, [user, fetchStudylists]);

  const deleteStudylist = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('studylists')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      fetchStudylists();
      return true;
    } catch (error) {
      console.error('Error deleting studylist:', error);
      return false;
    }
  }, [user, fetchStudylists]);

  const addItemToStudylist = useCallback(async (
    studylist_id: string,
    item_type: 'subject' | 'note' | 'question',
    item_id: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('studylist_items')
        .insert({
          studylist_id,
          item_type,
          item_id
        });

      if (error) {
        if (error.code === '23505') return true; // Already exists
        throw error;
      }

      // Update studylist timestamp
      await supabase
        .from('studylists')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', studylist_id);

      fetchStudylists();
      return true;
    } catch (error) {
      console.error('Error adding item to studylist:', error);
      return false;
    }
  }, [user, fetchStudylists]);

  const removeItemFromStudylist = useCallback(async (
    studylist_id: string,
    item_type: string,
    item_id: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('studylist_items')
        .delete()
        .eq('studylist_id', studylist_id)
        .eq('item_type', item_type)
        .eq('item_id', item_id);

      if (error) throw error;

      fetchStudylists();
      return true;
    } catch (error) {
      console.error('Error removing item from studylist:', error);
      return false;
    }
  }, [user, fetchStudylists]);

  const getStudylistItems = useCallback(async (studylist_id: string) => {
    try {
      const { data, error } = await supabase
        .from('studylist_items')
        .select('*')
        .eq('studylist_id', studylist_id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as StudylistItem[];
    } catch (error) {
      console.error('Error fetching studylist items:', error);
      return [];
    }
  }, []);

  return {
    studylists,
    loading,
    createStudylist,
    updateStudylist,
    deleteStudylist,
    addItemToStudylist,
    removeItemFromStudylist,
    getStudylistItems,
    refresh: fetchStudylists
  };
}
