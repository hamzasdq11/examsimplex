import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import { SubjectAIChat } from '@/components/SubjectAIChat';
import { ChevronLeft, ChevronRight, Maximize2, Minimize2, X, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResizableAIPanelProps {
  isOpen: boolean;
  isFullscreen: boolean;
  initialQuery: string;
  onOpenChange: (open: boolean) => void;
  onFullscreenChange: (fullscreen: boolean) => void;
  onQueryConsumed: () => void;
  subject: { id: string; name: string; code: string };
  universityName: string;
  children: React.ReactNode;
  messages: any[];
  onMessagesChange: (messages: any[]) => void;
}

export function ResizableAIPanel({
  isOpen,
  isFullscreen,
  initialQuery,
  onOpenChange,
  onFullscreenChange,
  onQueryConsumed,
  subject,
  universityName,
  children,
  messages,
  onMessagesChange
}: ResizableAIPanelProps) {
  const [defaultSize, setDefaultSize] = useState(25);

  // Handle escape key for fullscreen
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        onFullscreenChange(false);
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isFullscreen, onFullscreenChange]);

  // Fullscreen mode
  if (isFullscreen) {
    return (
      <>
        {children}
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <PanelHeader
            subject={subject}
            isFullscreen={true}
            onMinimize={() => onFullscreenChange(false)}
            onClose={() => {
              onFullscreenChange(false);
              onOpenChange(false);
            }}
          />
          <div className="flex-1 overflow-hidden">
            <SubjectAIChat
              subject={subject}
              universityName={universityName}
              initialQuery={initialQuery}
              onQueryConsumed={onQueryConsumed}
              externalMessages={messages}
              onMessagesChange={onMessagesChange}
            />
          </div>
        </div>
      </>
    );
  }

  // Collapsed state - just show the toggle arrow
  if (!isOpen) {
    return (
      <div className="relative h-[calc(100vh-3.5rem)] overflow-auto">
        {children}
        {/* Floating toggle button */}
        <Button
          variant="secondary"
          size="sm"
          className="fixed right-4 top-1/2 -translate-y-1/2 z-40 h-auto py-3 px-2 rounded-l-lg rounded-r-none shadow-lg border-r-0 flex-col gap-1 hover:bg-primary hover:text-primary-foreground transition-colors"
          onClick={() => onOpenChange(true)}
        >
          <MessageSquare className="h-4 w-4" />
          <ChevronLeft className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  // Open state - resizable panel
  return (
    <ResizablePanelGroup direction="horizontal" className="h-[calc(100vh-3.5rem)]">
      <ResizablePanel defaultSize={100 - defaultSize} minSize={40} className="overflow-auto">
        {children}
      </ResizablePanel>
      
      <ResizableHandle withHandle className="bg-border hover:bg-primary/20 transition-colors" />
      
      <ResizablePanel 
        defaultSize={defaultSize} 
        minSize={25} 
        maxSize={60}
        onResize={(size) => setDefaultSize(size)}
        className="h-full flex flex-col bg-background border-l"
      >
        <PanelHeader
          subject={subject}
          isFullscreen={false}
          onMaximize={() => onFullscreenChange(true)}
          onClose={() => onOpenChange(false)}
        />
        <div className="flex-1 min-h-0 overflow-hidden">
          <SubjectAIChat
            subject={subject}
            universityName={universityName}
            initialQuery={initialQuery}
            onQueryConsumed={onQueryConsumed}
            externalMessages={messages}
            onMessagesChange={onMessagesChange}
            hideHeader={true}
          />
        </div>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}

function PanelHeader({
  subject,
  isFullscreen,
  onMaximize,
  onMinimize,
  onClose
}: {
  subject: { name: string };
  isFullscreen: boolean;
  onMaximize?: () => void;
  onMinimize?: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 border-b bg-muted/30 shrink-0">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <div>
          <h2 className="font-semibold text-sm">AI Study Assistant</h2>
          <p className="text-xs text-muted-foreground">{subject.name}</p>
        </div>
      </div>
      <div className="flex gap-1">
        {isFullscreen ? (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMinimize}>
            <Minimize2 className="h-3.5 w-3.5" />
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onMaximize}>
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
        )}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
