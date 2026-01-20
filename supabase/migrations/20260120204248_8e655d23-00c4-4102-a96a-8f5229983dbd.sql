-- Create MCQ questions table
CREATE TABLE public.mcq_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
  unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL,
  question TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user MCQ attempts table for tracking progress
CREATE TABLE public.user_mcq_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  mcq_question_id UUID NOT NULL REFERENCES public.mcq_questions(id) ON DELETE CASCADE,
  selected_option TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  time_taken_seconds INTEGER,
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mcq_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_mcq_attempts ENABLE ROW LEVEL SECURITY;

-- MCQ questions policies (anyone can view, admins can manage)
CREATE POLICY "Anyone can view mcq_questions"
ON public.mcq_questions FOR SELECT
USING (true);

CREATE POLICY "Admins can insert mcq_questions"
ON public.mcq_questions FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update mcq_questions"
ON public.mcq_questions FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete mcq_questions"
ON public.mcq_questions FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- User MCQ attempts policies (users can manage their own)
CREATE POLICY "Users can view their own mcq_attempts"
ON public.user_mcq_attempts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mcq_attempts"
ON public.user_mcq_attempts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mcq_attempts"
ON public.user_mcq_attempts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mcq_attempts"
ON public.user_mcq_attempts FOR DELETE
USING (auth.uid() = user_id);

-- Add trigger for updated_at on mcq_questions
CREATE TRIGGER update_mcq_questions_updated_at
BEFORE UPDATE ON public.mcq_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();