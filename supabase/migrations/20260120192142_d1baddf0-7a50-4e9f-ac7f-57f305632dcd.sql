-- Create user_sessions table for tracking daily study sessions
CREATE TABLE public.user_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'completed', 'skipped'
  total_duration_minutes INTEGER NOT NULL DEFAULT 0,
  completed_duration_minutes INTEGER DEFAULT 0,
  current_step_index INTEGER DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, session_date)
);

-- Create session_steps table for individual tasks in a session
CREATE TABLE public.session_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  step_index INTEGER NOT NULL,
  step_type TEXT NOT NULL, -- 'notes', 'pyq', 'quiz', 'break'
  subject_id UUID REFERENCES public.subjects(id),
  unit_id UUID REFERENCES public.units(id),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL DEFAULT 15,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'active', 'completed', 'skipped'
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_steps ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_sessions
CREATE POLICY "Users can view their own sessions" 
ON public.user_sessions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" 
ON public.user_sessions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" 
ON public.user_sessions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sessions" 
ON public.user_sessions FOR DELETE 
USING (auth.uid() = user_id);

-- RLS policies for session_steps
CREATE POLICY "Users can view their session steps" 
ON public.session_steps FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_sessions 
  WHERE user_sessions.id = session_steps.session_id 
  AND user_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can insert their session steps" 
ON public.session_steps FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_sessions 
  WHERE user_sessions.id = session_steps.session_id 
  AND user_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can update their session steps" 
ON public.session_steps FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.user_sessions 
  WHERE user_sessions.id = session_steps.session_id 
  AND user_sessions.user_id = auth.uid()
));

CREATE POLICY "Users can delete their session steps" 
ON public.session_steps FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.user_sessions 
  WHERE user_sessions.id = session_steps.session_id 
  AND user_sessions.user_id = auth.uid()
));

-- Add updated_at triggers
CREATE TRIGGER update_user_sessions_updated_at
BEFORE UPDATE ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_session_steps_updated_at
BEFORE UPDATE ON public.session_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();