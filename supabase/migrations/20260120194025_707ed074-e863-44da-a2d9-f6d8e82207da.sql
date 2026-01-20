-- Add last_unit_id column to track where user left off
ALTER TABLE public.user_study_progress 
ADD COLUMN IF NOT EXISTS last_unit_id UUID REFERENCES public.units(id) ON DELETE SET NULL;