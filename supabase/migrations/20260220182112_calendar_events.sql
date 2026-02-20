-- Create calendar_events table
CREATE TABLE IF NOT EXISTS public.calendar_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN ('exam', 'reminder', 'submission', 'other')),
    color TEXT DEFAULT 'indigo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- Create Policies
CREATE POLICY "Users can view their own calendar events"
    ON public.calendar_events
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events"
    ON public.calendar_events
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events"
    ON public.calendar_events
    FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events"
    ON public.calendar_events
    FOR DELETE
    USING (auth.uid() = user_id);

-- Create simple index for quick lookup by user and date
CREATE INDEX IF NOT EXISTS calendar_events_user_date_idx ON public.calendar_events(user_id, date);
