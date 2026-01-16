import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ExternalLink, BookOpen, Globe, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Citation {
  id: number;
  title: string;
  url: string;
  snippet: string;
  type: "internal" | "external";
}

interface CitationBadgeProps {
  citation: Citation;
  onClick?: () => void;
}

export function CitationBadge({ citation, onClick }: CitationBadgeProps) {
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button
          onClick={onClick}
          className="inline-flex items-center justify-center w-5 h-5 text-[10px] font-medium rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors align-super"
        >
          {citation.id}
        </button>
      </HoverCardTrigger>
      <HoverCardContent 
        side="top" 
        className="w-80 p-3"
        align="center"
      >
        <div className="space-y-2">
          <div className="flex items-start gap-2">
            {citation.type === "internal" ? (
              <BookOpen className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            ) : (
              <Globe className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-2">{citation.title}</p>
              <Badge 
                variant={citation.type === "internal" ? "default" : "secondary"}
                className="text-[10px] h-4 mt-1"
              >
                {citation.type === "internal" ? "Knowledge Base" : "Web"}
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground line-clamp-3">
            {citation.snippet}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

interface CitationListProps {
  citations: Citation[];
  className?: string;
}

export function CitationList({ citations, className }: CitationListProps) {
  if (citations.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Sources ({citations.length})
      </h4>
      <div className="space-y-2">
        {citations.map((citation) => (
          <CitationCard key={citation.id} citation={citation} />
        ))}
      </div>
    </div>
  );
}

interface CitationCardProps {
  citation: Citation;
}

function CitationCard({ citation }: CitationCardProps) {
  const handleClick = () => {
    if (citation.url.startsWith("http")) {
      window.open(citation.url, "_blank", "noopener,noreferrer");
    } else {
      // Internal link - navigate within app
      window.location.href = citation.url;
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors group"
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center justify-center w-6 h-6 rounded bg-primary/10 text-primary text-sm font-medium shrink-0">
          {citation.id}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium line-clamp-1 group-hover:text-primary transition-colors">
              {citation.title}
            </p>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {citation.snippet}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <Badge 
              variant={citation.type === "internal" ? "default" : "outline"}
              className="text-[10px] h-4"
            >
              {citation.type === "internal" ? (
                <>
                  <BookOpen className="h-2.5 w-2.5 mr-1" />
                  Knowledge Base
                </>
              ) : (
                <>
                  <Globe className="h-2.5 w-2.5 mr-1" />
                  Web
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>
    </button>
  );
}

interface CitationDrawerProps {
  citations: Citation[];
  trigger?: React.ReactNode;
}

export function CitationDrawer({ citations, trigger }: CitationDrawerProps) {
  const [open, setOpen] = useState(false);

  if (citations.length === 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <BookOpen className="h-4 w-4" />
            {citations.length} Sources
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Sources & Citations
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <CitationList citations={citations} />
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Inline citation renderer for message content
interface InlineCitationProps {
  id: number;
  citations: Citation[];
}

export function InlineCitation({ id, citations }: InlineCitationProps) {
  const citation = citations.find((c) => c.id === id);
  
  if (!citation) {
    return (
      <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-medium rounded bg-muted text-muted-foreground">
        {id}
      </span>
    );
  }

  return <CitationBadge citation={citation} />;
}
