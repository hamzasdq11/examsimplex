import { supabase } from "@/integrations/supabase/client";

type Severity = 'info' | 'warn' | 'error' | 'fatal';

interface ErrorLogData {
  errorMessage: string;
  errorStack?: string;
  componentStack?: string;
  metadata?: Record<string, unknown>;
  severity?: Severity;
}

export async function logError({
  errorMessage,
  errorStack,
  componentStack,
  metadata = {},
  severity = 'error'
}: ErrorLogData): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    // Use type assertion since types may not be updated yet
    await (supabase.from('error_logs') as any).insert({
      error_message: errorMessage,
      error_stack: errorStack,
      component_stack: componentStack,
      url: window.location.href,
      user_agent: navigator.userAgent,
      user_id: user?.id || null,
      metadata,
      severity
    });
  } catch (e) {
    // Fallback to console if logging fails
    console.error('Failed to log error:', e);
  }
}

// Global error handler for uncaught errors
export function setupGlobalErrorHandlers(): void {
  window.onerror = (message, source, lineno, colno, error) => {
    logError({
      errorMessage: String(message),
      errorStack: error?.stack,
      metadata: { source, lineno, colno },
      severity: 'error'
    });
  };

  window.onunhandledrejection = (event) => {
    logError({
      errorMessage: event.reason?.message || 'Unhandled Promise Rejection',
      errorStack: event.reason?.stack,
      severity: 'error'
    });
  };
}
