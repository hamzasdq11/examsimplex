-- Create error_logs table for production monitoring
CREATE TABLE public.error_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  url TEXT,
  user_agent TEXT,
  user_id UUID,
  metadata JSONB DEFAULT '{}',
  severity TEXT DEFAULT 'error' CHECK (severity IN ('info', 'warn', 'error', 'fatal')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Allow inserting errors (anyone can report errors, even unauthenticated)
CREATE POLICY "Anyone can insert error logs" 
ON public.error_logs 
FOR INSERT 
WITH CHECK (true);

-- Only admins can view error logs
CREATE POLICY "Admins can view error logs" 
ON public.error_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Create index for faster queries
CREATE INDEX idx_error_logs_created_at ON public.error_logs(created_at DESC);
CREATE INDEX idx_error_logs_severity ON public.error_logs(severity);