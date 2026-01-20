import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Sparkles, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface GlobalAICommandBarProps {
  subjectId?: string;
  universityId?: string;
}

const SUGGESTED_QUERIES = [
  "What should I revise today?",
  "Explain parsing in compiler design",
  "Quiz me on DBMS normalization",
  "What are the most important PYQ topics?",
];

export function GlobalAICommandBar({ subjectId, universityId }: GlobalAICommandBarProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      // Escape to blur
      if (e.key === 'Escape' && isFocused) {
        inputRef.current?.blur();
        setShowSuggestions(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // Navigate to AI study mode with the query
    const params = new URLSearchParams({ q: query.trim() });
    if (subjectId) params.set('subject', subjectId);
    navigate(`/dashboard/ai-study?${params.toString()}`);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    const params = new URLSearchParams({ q: suggestion });
    if (subjectId) params.set('subject', subjectId);
    navigate(`/dashboard/ai-study?${params.toString()}`);
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4">
      <div 
        className={cn(
          "relative bg-background/95 backdrop-blur-xl border shadow-2xl rounded-2xl transition-all duration-200",
          isFocused ? "border-primary ring-2 ring-primary/20" : "border-border"
        )}
      >
        {/* Suggestions Dropdown */}
        {showSuggestions && (
          <div className="absolute bottom-full left-0 right-0 mb-2 bg-background/95 backdrop-blur-xl border rounded-xl shadow-xl p-2 space-y-1">
            <p className="text-xs text-muted-foreground px-2 py-1">Try asking...</p>
            {SUGGESTED_QUERIES.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 text-sm rounded-lg hover:bg-accent transition-colors flex items-center gap-2"
              >
                <Sparkles className="h-3 w-3 text-primary shrink-0" />
                <span className="truncate">{suggestion}</span>
              </button>
            ))}
          </div>
        )}

        {/* Main Input */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2 p-2">
          <div className="flex items-center gap-2 flex-1 px-2">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => {
                setIsFocused(true);
                setShowSuggestions(true);
              }}
              onBlur={() => {
                setIsFocused(false);
                // Delay hiding to allow click on suggestions
                setTimeout(() => setShowSuggestions(false), 200);
              }}
              placeholder="Ask Exam AI anything..."
              className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-muted-foreground"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <Button 
            type="submit" 
            size="sm" 
            disabled={!query.trim()}
            className="gap-1.5 rounded-xl"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ask AI</span>
            <ArrowRight className="h-3.5 w-3.5 sm:hidden" />
          </Button>
        </form>

        {/* Keyboard Shortcut Hint */}
        {!isFocused && (
          <div className="absolute right-14 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium bg-muted rounded border text-muted-foreground">
              ⌘K
            </kbd>
          </div>
        )}
      </div>
    </div>
  );
}
