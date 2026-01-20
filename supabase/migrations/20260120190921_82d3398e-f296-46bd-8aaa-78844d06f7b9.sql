-- Create user_study_progress table to track learning progress per subject
CREATE TABLE public.user_study_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  notes_viewed INTEGER DEFAULT 0,
  total_notes INTEGER DEFAULT 0,
  pyqs_practiced INTEGER DEFAULT 0,
  total_pyqs INTEGER DEFAULT 0,
  questions_attempted INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  ai_sessions INTEGER DEFAULT 0,
  last_activity_at TIMESTAMPTZ,
  last_unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(user_id, subject_id)
);

-- Create user_exam_settings table to store exam dates and preferences
CREATE TABLE public.user_exam_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  exam_date DATE,
  exam_type TEXT DEFAULT 'end_sem',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Enable RLS on both tables
ALTER TABLE public.user_study_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exam_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_study_progress
CREATE POLICY "Users can view their own study progress"
ON public.user_study_progress
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study progress"
ON public.user_study_progress
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study progress"
ON public.user_study_progress
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study progress"
ON public.user_study_progress
FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for user_exam_settings
CREATE POLICY "Users can view their own exam settings"
ON public.user_exam_settings
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own exam settings"
ON public.user_exam_settings
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exam settings"
ON public.user_exam_settings
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exam settings"
ON public.user_exam_settings
FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at triggers
CREATE TRIGGER update_user_study_progress_updated_at
BEFORE UPDATE ON public.user_study_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_exam_settings_updated_at
BEFORE UPDATE ON public.user_exam_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();