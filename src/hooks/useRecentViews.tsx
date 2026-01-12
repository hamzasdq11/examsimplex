import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface RecentView {
  id: string;
  item_type: 'university' | 'course' | 'subject';
  item_id: string;
  item_name: string;
  item_url: string;
  viewed_at: string;
}

export function useRecentViews(limit = 5) {
  const { user } = useAuth();
  const [recentViews, setRecentViews] = useState<RecentView[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentViews = useCallback(async () => {
    if (!user) {
      setRecentViews([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('recent_views')
        .select('*')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      setRecentViews(data as RecentView[]);
    } catch (error) {
      console.error('Error fetching recent views:', error);
    } finally {
      setLoading(false);
    }
  }, [user, limit]);

  useEffect(() => {
    fetchRecentViews();
  }, [fetchRecentViews]);

  const addRecentView = useCallback(async (
    item_type: 'university' | 'course' | 'subject',
    item_id: string,
    item_name: string,
    item_url: string
  ) => {
    if (!user) return;

    try {
      // Delete existing entry for this item if exists (to move it to top)
      await supabase
        .from('recent_views')
        .delete()
        .eq('user_id', user.id)
        .eq('item_type', item_type)
        .eq('item_id', item_id);

      // Insert new view
      await supabase
        .from('recent_views')
        .insert({
          user_id: user.id,
          item_type,
          item_id,
          item_name,
          item_url,
          viewed_at: new Date().toISOString()
        });

      // Keep only last 20 items
      const { data: allViews } = await supabase
        .from('recent_views')
        .select('id')
        .eq('user_id', user.id)
        .order('viewed_at', { ascending: false });

      if (allViews && allViews.length > 20) {
        const idsToDelete = allViews.slice(20).map(v => v.id);
        await supabase
          .from('recent_views')
          .delete()
          .in('id', idsToDelete);
      }

      fetchRecentViews();
    } catch (error) {
      console.error('Error adding recent view:', error);
    }
  }, [user, fetchRecentViews]);

  return { recentViews, loading, addRecentView, refresh: fetchRecentViews };
}
