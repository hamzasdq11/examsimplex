import { useState, useEffect, useRef, useCallback } from "react";

export interface PyodideResult {
  success: boolean;
  output: string;
  error: string | null;
  result: string | null;
  plot: string | null;
  executionTime: number;
}

interface UsePyodideReturn {
  isLoading: boolean;
  isReady: boolean;
  isExecuting: boolean;
  execute: (code: string, options?: ExecuteOptions) => Promise<PyodideResult>;
  loadPackage: (packageName: string) => Promise<boolean>;
  error: string | null;
}

interface ExecuteOptions {
  timeout?: number;
  packages?: string[];
}

interface WorkerMessage {
  id: string;
  type: "init" | "execute" | "loadPackage";
  payload?: Record<string, unknown>;
}

let sharedWorker: Worker | null = null;
let pendingRequests = new Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void }>();
let initPromise: Promise<void> | null = null;

function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function usePyodide(): UsePyodideReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize the shared worker if not already done
    if (!sharedWorker && typeof Worker !== "undefined") {
      try {
        sharedWorker = new Worker("/workers/pyodide-worker.js");
        
        sharedWorker.onmessage = (event) => {
          const { id, ...response } = event.data;
          const pending = pendingRequests.get(id);
          if (pending) {
            pending.resolve(response);
            pendingRequests.delete(id);
          }
        };

        sharedWorker.onerror = (err) => {
          console.error("[usePyodide] Worker error:", err);
          setError("Python runtime failed to initialize");
        };
      } catch (e) {
        console.error("[usePyodide] Failed to create worker:", e);
        setError("Python runtime not available in this browser");
      }
    }
  }, []);

  const sendMessage = useCallback(
    <T,>(message: WorkerMessage): Promise<T> => {
      return new Promise((resolve, reject) => {
        if (!sharedWorker) {
          reject(new Error("Worker not initialized"));
          return;
        }

        pendingRequests.set(message.id, { resolve, reject });
        sharedWorker.postMessage(message);

        // Timeout for requests (5 minutes for long operations)
        setTimeout(() => {
          if (pendingRequests.has(message.id)) {
            pendingRequests.delete(message.id);
            reject(new Error("Request timed out"));
          }
        }, 300000);
      });
    },
    []
  );

  const initialize = useCallback(async () => {
    if (isReady || initPromise) {
      await initPromise;
      return;
    }

    setIsLoading(true);
    setError(null);

    initPromise = (async () => {
      try {
        const response = await sendMessage<{ success: boolean; error?: string }>({
          id: generateId(),
          type: "init",
        });

        if (response.success) {
          setIsReady(true);
        } else {
          throw new Error(response.error || "Failed to initialize");
        }
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Initialization failed";
        setError(errorMessage);
        throw e;
      } finally {
        setIsLoading(false);
      }
    })();

    await initPromise;
  }, [isReady, sendMessage]);

  const execute = useCallback(
    async (code: string, options: ExecuteOptions = {}): Promise<PyodideResult> => {
      setIsExecuting(true);
      setError(null);

      try {
        // Initialize if not ready
        if (!isReady) {
          await initialize();
        }

        const response = await sendMessage<PyodideResult>({
          id: generateId(),
          type: "execute",
          payload: { code, options },
        });

        if (!response.success && response.error) {
          setError(response.error);
        }

        return response;
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : "Execution failed";
        setError(errorMessage);
        return {
          success: false,
          output: "",
          error: errorMessage,
          result: null,
          plot: null,
          executionTime: 0,
        };
      } finally {
        setIsExecuting(false);
      }
    },
    [isReady, initialize, sendMessage]
  );

  const loadPackage = useCallback(
    async (packageName: string): Promise<boolean> => {
      try {
        if (!isReady) {
          await initialize();
        }

        const response = await sendMessage<{ success: boolean; error?: string }>({
          id: generateId(),
          type: "loadPackage",
          payload: { packageName },
        });

        return response.success;
      } catch (e) {
        console.error("[usePyodide] Failed to load package:", e);
        return false;
      }
    },
    [isReady, initialize, sendMessage]
  );

  return {
    isLoading,
    isReady,
    isExecuting,
    execute,
    loadPackage,
    error,
  };
}
