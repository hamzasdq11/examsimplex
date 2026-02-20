import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import type { CalendarEvent } from '@/types/database';
import { startOfMonth, endOfMonth, formatISO } from 'date-fns';

export function useCalendarEvents(currentMonth: Date) {
    const { user } = useAuth();
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = useCallback(async () => {
        if (!user) {
            setEvents([]);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            // Fetch events for the current month view (plus a bit of padding for visible days)
            const startStr = formatISO(startOfMonth(currentMonth), { representation: 'date' });
            const endStr = formatISO(endOfMonth(currentMonth), { representation: 'date' });

            const { data, error } = await supabase
                .from('calendar_events')
                .select('*')
                .eq('user_id', user.id)
                .gte('date', startStr)
                .lte('date', endStr)
                .order('date', { ascending: true });

            if (error) throw error;
            setEvents((data as CalendarEvent[]) || []);
        } catch (error) {
            console.error('Error fetching calendar events:', error);
        } finally {
            setLoading(false);
        }
    }, [user, currentMonth]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const addEvent = async (eventData: Omit<CalendarEvent, 'id' | 'user_id' | 'created_at'>) => {
        if (!user) return null;

        try {
            const { data, error } = await supabase
                .from('calendar_events')
                .insert({
                    user_id: user.id,
                    ...eventData
                })
                .select()
                .single();

            if (error) throw error;
            // Optimistically update the local state
            setEvents((prev) => [...prev, data as CalendarEvent]);
            return data;
        } catch (error) {
            console.error('Error adding calendar event:', error);
            return null;
        }
    };

    const deleteEvent = async (eventId: string) => {
        if (!user) return false;

        try {
            const { error } = await supabase
                .from('calendar_events')
                .delete()
                .eq('id', eventId);

            if (error) throw error;
            setEvents((prev) => prev.filter((e) => e.id !== eventId));
            return true;
        } catch (error) {
            console.error('Error deleting calendar event:', error);
            return false;
        }
    };

    return {
        events,
        loading,
        refresh: fetchEvents,
        addEvent,
        deleteEvent
    };
}
