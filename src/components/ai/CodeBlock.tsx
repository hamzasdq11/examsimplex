import { useState, useCallback } from "react";
import { Highlight, themes } from "prism-react-renderer";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Copy, 
  Check, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  Download,
  AlertCircle
} from "lucide-react";
import { usePyodide, PyodideResult } from "@/hooks/usePyodide";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  code: string;
  language?: string;
  executable?: boolean;
  showLineNumbers?: boolean;
  className?: string;
  onExecute?: (result: PyodideResult) => void;
}

export function CodeBlock({
  code,
  language = "python",
  executable = false,
  showLineNumbers = true,
  className,
  onExecute,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [result, setResult] = useState<PyodideResult | null>(null);
  const [showOutput, setShowOutput] = useState(false);
  
  const { execute, isExecuting, isLoading, isReady, error: pyodideError } = usePyodide();

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleRun = useCallback(async () => {
    const execResult = await execute(code);
    setResult(execResult);
    setShowOutput(true);
    onExecute?.(execResult);
  }, [code, execute, onExecute]);

  const handleDownloadPlot = useCallback(() => {
    if (!result?.plot) return;
    
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${result.plot}`;
    link.download = "plot.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [result?.plot]);

  const trimmedCode = code.trim();
  const lineCount = trimmedCode.split("\n").length;
  const shouldCollapse = lineCount > 15;

  return (
    <div className={cn("rounded-lg border bg-muted/50 overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/80">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground uppercase">
            {language}
          </span>
          {executable && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
              Executable
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {executable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRun}
              disabled={isExecuting || isLoading}
              className="h-7 px-2 text-xs gap-1"
            >
              {isExecuting ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Running...
                </>
              ) : isLoading ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading Python...
                </>
              ) : (
                <>
                  <Play className="h-3 w-3" />
                  Run
                </>
              )}
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-7 px-2 text-xs gap-1"
          >
            {copied ? (
              <>
                <Check className="h-3 w-3" />
                Copied
              </>
            ) : (
              <>
                <Copy className="h-3 w-3" />
                Copy
              </>
            )}
          </Button>

          {shouldCollapse && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2"
            >
              {isExpanded ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Code */}
      <div
        className={cn(
          "overflow-x-auto transition-all duration-200",
          !isExpanded && shouldCollapse && "max-h-[100px] overflow-hidden"
        )}
      >
        <Highlight
          theme={themes.nightOwl}
          code={trimmedCode}
          language={language as any}
        >
          {({ className: highlightClass, style, tokens, getLineProps, getTokenProps }) => (
            <pre
              className={cn(highlightClass, "text-sm p-4 m-0")}
              style={{ ...style, background: "transparent" }}
            >
              {tokens.map((line, i) => (
                <div key={i} {...getLineProps({ line })} className="table-row">
                  {showLineNumbers && (
                    <span className="table-cell pr-4 text-muted-foreground/50 text-right select-none w-8">
                      {i + 1}
                    </span>
                  )}
                  <span className="table-cell">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              ))}
            </pre>
          )}
        </Highlight>
      </div>

      {/* Collapsed indicator */}
      {!isExpanded && shouldCollapse && (
        <div className="px-4 py-2 text-xs text-muted-foreground text-center border-t">
          {lineCount - 4} more lines...
        </div>
      )}

      {/* Output Panel */}
      {showOutput && result && (
        <div className="border-t">
          <div className="flex items-center justify-between px-3 py-2 bg-muted/60">
            <span className="text-xs font-medium text-muted-foreground">
              Output {result.executionTime > 0 && `(${result.executionTime}ms)`}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowOutput(false)}
              className="h-6 px-2 text-xs"
            >
              Hide
            </Button>
          </div>

          <div className="p-3 space-y-3">
            {/* Error */}
            {result.error && (
              <div className="flex items-start gap-2 p-2 rounded bg-destructive/10 text-destructive text-sm">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <pre className="whitespace-pre-wrap font-mono text-xs overflow-x-auto">
                  {result.error}
                </pre>
              </div>
            )}

            {/* Standard output */}
            {result.output && (
              <pre className="text-sm font-mono bg-background/50 rounded p-2 overflow-x-auto whitespace-pre-wrap">
                {result.output}
              </pre>
            )}

            {/* Return value */}
            {result.result && result.result !== "None" && (
              <div className="text-sm">
                <span className="text-muted-foreground">Result: </span>
                <code className="bg-primary/10 px-1 rounded">{result.result}</code>
              </div>
            )}

            {/* Plot */}
            {result.plot && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">
                    Generated Plot
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDownloadPlot}
                    className="h-6 px-2 text-xs gap-1"
                  >
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
                <img
                  src={`data:image/png;base64,${result.plot}`}
                  alt="Generated plot"
                  className="max-w-full rounded border bg-white"
                />
              </div>
            )}

            {/* No output */}
            {!result.error && !result.output && !result.result && !result.plot && (
              <div className="text-sm text-muted-foreground italic">
                Code executed successfully with no output.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Pyodide error */}
      {pyodideError && (
        <div className="px-3 py-2 border-t bg-destructive/5 text-destructive text-xs">
          {pyodideError}
        </div>
      )}
    </div>
  );
}
