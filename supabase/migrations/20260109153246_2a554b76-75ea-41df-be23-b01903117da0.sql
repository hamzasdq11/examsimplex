-- Create rate_limits table for tracking OTP request attempts
CREATE TABLE public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL,
  identifier_type TEXT NOT NULL CHECK (identifier_type IN ('email', 'ip')),
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create unique index for upsert operations
CREATE UNIQUE INDEX rate_limits_identifier_type_idx ON public.rate_limits(identifier, identifier_type);

-- Create index for cleanup queries
CREATE INDEX rate_limits_window_start_idx ON public.rate_limits(window_start);

-- Enable RLS - only service role should access this table
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- No public policies - only service role can access (for edge functions)