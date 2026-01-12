import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface LibraryItem {
  id: string;
  item_type: 'course' | 'subject' | 'note';
  item_id: string;
  created_at: string;
}

export interface EnrichedLibraryItem extends LibraryItem {
  name?: string;
  code?: string;
  url?: string;
}

export function useLibrary() {
  const { user } = useAuth();
  const [libraryItems, setLibraryItems] = useState<EnrichedLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLibraryItems = useCallback(async () => {
    if (!user) {
      setLibraryItems([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_library_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Enrich items with names
      const enrichedItems: EnrichedLibraryItem[] = [];
      
      for (const item of data as LibraryItem[]) {
        let enriched: EnrichedLibraryItem = { ...item };
        
        if (item.item_type === 'course') {
          const { data: course } = await supabase
            .from('courses')
            .select('name, code, university_id')
            .eq('id', item.item_id)
            .single();
          if (course) {
            enriched.name = course.name;
            enriched.code = course.code;
            enriched.url = `/university/${course.university_id}`;
          }
        } else if (item.item_type === 'subject') {
          const { data: subject } = await supabase
            .from('subjects')
            .select(`
              name, code, slug,
              semesters!inner(number, courses!inner(code, universities!inner(slug)))
            `)
            .eq('id', item.item_id)
            .single();
          if (subject) {
            enriched.name = subject.name;
            enriched.code = subject.code;
            const sem = (subject as any).semesters;
            enriched.url = `/university/${sem.courses.universities.slug}/${sem.courses.code}/sem${sem.number}/${subject.slug}`;
          }
        }
        
        enrichedItems.push(enriched);
      }

      setLibraryItems(enrichedItems);
    } catch (error) {
      console.error('Error fetching library items:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLibraryItems();
  }, [fetchLibraryItems]);

  const addToLibrary = useCallback(async (
    item_type: 'course' | 'subject' | 'note',
    item_id: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_library_items')
        .insert({
          user_id: user.id,
          item_type,
          item_id
        });

      if (error) {
        if (error.code === '23505') {
          // Already exists
          return true;
        }
        throw error;
      }

      fetchLibraryItems();
      return true;
    } catch (error) {
      console.error('Error adding to library:', error);
      return false;
    }
  }, [user, fetchLibraryItems]);

  const removeFromLibrary = useCallback(async (
    item_type: 'course' | 'subject' | 'note',
    item_id: string
  ) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('user_library_items')
        .delete()
        .eq('user_id', user.id)
        .eq('item_type', item_type)
        .eq('item_id', item_id);

      if (error) throw error;

      fetchLibraryItems();
      return true;
    } catch (error) {
      console.error('Error removing from library:', error);
      return false;
    }
  }, [user, fetchLibraryItems]);

  const isInLibrary = useCallback((item_type: string, item_id: string) => {
    return libraryItems.some(
      item => item.item_type === item_type && item.item_id === item_id
    );
  }, [libraryItems]);

  return {
    libraryItems,
    loading,
    addToLibrary,
    removeFromLibrary,
    isInLibrary,
    refresh: fetchLibraryItems
  };
}
