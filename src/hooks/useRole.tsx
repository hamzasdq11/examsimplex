import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { AppRole } from '@/types/database';

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching role:', error);
          setRole(null);
          setIsAdmin(false);
        } else if (data) {
          setRole(data.role as AppRole);
          setIsAdmin(data.role === 'admin');
        } else {
          setRole(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Error:', err);
        setRole(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user]);

  return { role, isAdmin, loading };
}
