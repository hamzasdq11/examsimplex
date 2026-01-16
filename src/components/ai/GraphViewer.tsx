import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  ZoomIn, 
  ZoomOut, 
  Maximize2, 
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import { usePyodide } from "@/hooks/usePyodide";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface GraphViewerProps {
  pythonCode?: string;
  imageData?: string; // Base64 image data
  title?: string;
  className?: string;
}

export function GraphViewer({
  pythonCode,
  imageData: initialImageData,
  title = "Generated Graph",
  className,
}: GraphViewerProps) {
  const [imageData, setImageData] = useState<string | null>(initialImageData || null);
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);
  
  const { execute, isExecuting, isLoading } = usePyodide();

  // Generate graph from Python code
  const generateGraph = useCallback(async () => {
    if (!pythonCode) return;
    
    setError(null);
    const result = await execute(pythonCode);
    
    if (result.success && result.plot) {
      setImageData(result.plot);
    } else if (result.error) {
      setError(result.error);
    } else {
      setError("No graph was generated. Make sure your code creates a matplotlib figure.");
    }
  }, [pythonCode, execute]);

  // Auto-generate on mount if we have code but no image
  useEffect(() => {
    if (pythonCode && !initialImageData && !imageData) {
      generateGraph();
    }
  }, [pythonCode, initialImageData, imageData, generateGraph]);

  const handleDownload = useCallback(() => {
    if (!imageData) return;
    
    const link = document.createElement("a");
    link.href = `data:image/png;base64,${imageData}`;
    link.download = `${title.replace(/\s+/g, "-").toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [imageData, title]);

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  // Loading state
  if (isExecuting || isLoading) {
    return (
      <div className={cn("rounded-lg border bg-muted/50 p-8", className)}>
        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="text-sm">
            {isLoading ? "Loading Python runtime..." : "Generating graph..."}
          </span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn("rounded-lg border bg-destructive/5 p-4", className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-destructive">
              Failed to generate graph
            </p>
            <pre className="mt-2 text-xs text-muted-foreground whitespace-pre-wrap">
              {error}
            </pre>
            {pythonCode && (
              <Button
                variant="outline"
                size="sm"
                onClick={generateGraph}
                className="mt-3 gap-2"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // No image state
  if (!imageData) {
    return (
      <div className={cn("rounded-lg border bg-muted/50 p-8", className)}>
        <div className="flex flex-col items-center justify-center gap-3 text-muted-foreground">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Maximize2 className="h-6 w-6" />
          </div>
          <span className="text-sm">No graph available</span>
          {pythonCode && (
            <Button
              variant="outline"
              size="sm"
              onClick={generateGraph}
              className="gap-2"
            >
              Generate Graph
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-lg border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
        <span className="text-sm font-medium text-muted-foreground">
          {title}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
            className="h-7 w-7 p-0"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </Button>
          <button
            onClick={handleResetZoom}
            className="text-xs text-muted-foreground hover:text-foreground px-1"
          >
            {Math.round(zoom * 100)}%
          </button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 3}
            className="h-7 w-7 p-0"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </Button>
          
          <div className="w-px h-4 bg-border mx-1" />
          
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Maximize2 className="h-3.5 w-3.5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center justify-center p-4 bg-white rounded-lg">
                <img
                  src={`data:image/png;base64,${imageData}`}
                  alt={title}
                  className="max-w-full max-h-[70vh] object-contain"
                />
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownload}
            className="h-7 px-2 gap-1"
          >
            <Download className="h-3.5 w-3.5" />
            <span className="text-xs">Save</span>
          </Button>

          {pythonCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={generateGraph}
              className="h-7 w-7 p-0"
            >
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Image */}
      <div className="overflow-auto bg-white">
        <div
          className="flex items-center justify-center p-4 min-h-[200px] transition-transform"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "center center",
          }}
        >
          <img
            src={`data:image/png;base64,${imageData}`}
            alt={title}
            className="max-w-full"
          />
        </div>
      </div>
    </div>
  );
}
