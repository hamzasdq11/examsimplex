import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, 
  Send, 
  Copy, 
  Check, 
  BookOpen, 
  FileQuestion, 
  Loader2,
  Bot,
  User,
  Code,
  BarChart3
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { parseAIResponse, Segment } from "@/lib/responseParser";
import { MathRenderer, MixedMathContent } from "@/components/ai/MathRenderer";
import { CodeBlock } from "@/components/ai/CodeBlock";
import { CitationBadge, CitationDrawer, Citation } from "@/components/ai/CitationDrawer";
import { GraphViewer } from "@/components/ai/GraphViewer";

interface Message {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  code?: {
    language: string;
    source: string;
    executable: boolean;
  };
  graph?: {
    pythonCode?: string;
    data?: string;
  };
  intent?: string;
}

interface SubjectAIChatProps {
  subject: {
    id: string;
    name: string;
    code: string;
  };
  universityName?: string;
}

export const SubjectAIChat = ({ subject, universityName }: SubjectAIChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your ${subject.name} study assistant. Ask me anything about concepts, exam preparation, practice questions, or request code examples and visualizations.`
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (type: "ask" | "notes" | "quiz" | "code" = "ask", customMessage?: string) => {
    const messageText = customMessage || input.trim();
    if (!messageText) return;

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to use the AI assistant.",
        variant: "destructive"
      });
      return;
    }

    const userMessage: Message = { role: "user", content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Build conversation history for context
      const conversationHistory = messages.slice(-6).map(m => ({
        role: m.role,
        content: m.content
      }));

      const { data, error } = await supabase.functions.invoke("ai-orchestrator", {
        body: {
          query: messageText,
          type,
          subject: subject.name,
          subjectId: subject.id,
          context: universityName ? `${universityName} - ${subject.code}` : subject.code,
          conversationHistory
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.content || "I couldn't generate a response. Please try again.",
        citations: data.citations || [],
        code: data.code,
        graph: data.graph,
        intent: data.intent
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error("AI error:", error);
      toast({
        title: "Error",
        description: "Failed to get AI response. Please try again.",
        variant: "destructive"
      });
      // Remove the user message if there was an error
      setMessages(prev => prev.slice(0, -1));
      setInput(messageText);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (content: string, index: number) => {
    await navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const quickActions = [
    { 
      label: "Explain", 
      icon: BookOpen, 
      action: () => {
        const topic = input.trim() || "the key concepts";
        handleSubmit("ask", `Explain ${topic} in simple terms with examples`);
      }
    },
    { 
      label: "Notes", 
      icon: Sparkles, 
      action: () => {
        const topic = input.trim() || subject.name;
        handleSubmit("notes", topic);
      }
    },
    { 
      label: "Quiz", 
      icon: FileQuestion, 
      action: () => {
        const topic = input.trim() || subject.name;
        handleSubmit("quiz", topic);
      }
    },
    { 
      label: "Code", 
      icon: Code, 
      action: () => {
        const topic = input.trim() || subject.name;
        handleSubmit("code", `Generate an executable Python example demonstrating: ${topic}`);
      }
    },
    { 
      label: "Graph", 
      icon: BarChart3, 
      action: () => {
        const topic = input.trim() || subject.name;
        handleSubmit("ask", `Create a Python visualization/graph for: ${topic}. Use matplotlib and make it executable.`);
      }
    }
  ];

  return (
    <Card className="h-full flex flex-col lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
      <CardHeader className="pb-3 border-b shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base">AI Study Assistant</CardTitle>
            <p className="text-xs text-muted-foreground truncate">
              {subject.name} • {universityName || subject.code}
            </p>
          </div>
        </div>
      </CardHeader>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "assistant" && (
                <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
              <div
                className={`max-w-[90%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.role === "assistant" ? (
                  <MessageContent message={msg} />
                ) : (
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                )}
                
                {msg.role === "assistant" && (
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/50">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs opacity-60 hover:opacity-100"
                      onClick={() => handleCopy(msg.content, idx)}
                    >
                      {copiedIndex === idx ? (
                        <><Check className="h-3 w-3 mr-1" /> Copied</>
                      ) : (
                        <><Copy className="h-3 w-3 mr-1" /> Copy</>
                      )}
                    </Button>
                    
                    {msg.citations && msg.citations.length > 0 && (
                      <CitationDrawer 
                        citations={msg.citations}
                        trigger={
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs opacity-60 hover:opacity-100 gap-1">
                            <BookOpen className="h-3 w-3" />
                            {msg.citations.length} sources
                          </Button>
                        }
                      />
                    )}
                    
                    {msg.intent && (
                      <Badge variant="outline" className="text-[10px] h-5 opacity-60">
                        {msg.intent}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              {msg.role === "user" && (
                <div className="shrink-0 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <User className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-2">
              <div className="shrink-0 w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
              <div className="bg-muted rounded-lg px-3 py-2 text-sm">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <CardContent className="p-3 pt-2 border-t shrink-0 space-y-2">
        {/* Quick Actions */}
        <div className="flex gap-1.5 flex-wrap">
          {quickActions.map((action) => (
            <Badge
              key={action.label}
              variant="secondary"
              className="cursor-pointer hover:bg-secondary/80 transition-colors gap-1 py-1 px-2"
              onClick={action.action}
            >
              <action.icon className="h-3 w-3" />
              {action.label}
            </Badge>
          ))}
        </div>

        {/* Input Area */}
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[40px] max-h-[80px] resize-none text-sm"
            disabled={isLoading}
          />
          <Button
            size="icon"
            onClick={() => handleSubmit()}
            disabled={!input.trim() || isLoading}
            className="shrink-0"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Component to render message content with math, code, citations, and graphs
function MessageContent({ message }: { message: Message }) {
  const { content, citations = [], code, graph } = message;
  const parsed = parseAIResponse(content);

  return (
    <div className="space-y-3">
      {/* Render parsed segments */}
      <div className="whitespace-pre-wrap">
        {parsed.segments.map((segment, idx) => (
          <SegmentRenderer 
            key={idx} 
            segment={segment} 
            citations={citations} 
          />
        ))}
      </div>

      {/* Render standalone code block if provided */}
      {code && code.source && !parsed.hasExecutableCode && (
        <CodeBlock
          code={code.source}
          language={code.language}
          executable={code.executable}
          className="mt-3"
        />
      )}

      {/* Render graph if provided */}
      {graph && (graph.pythonCode || graph.data) && (
        <GraphViewer
          pythonCode={graph.pythonCode}
          imageData={graph.data}
          className="mt-3"
        />
      )}
    </div>
  );
}

// Render individual segments
function SegmentRenderer({ 
  segment, 
  citations 
}: { 
  segment: Segment; 
  citations: Citation[];
}) {
  switch (segment.type) {
    case "text":
      return <span>{segment.content}</span>;
    
    case "math":
      return (
        <MathRenderer 
          latex={segment.latex} 
          display={segment.display} 
        />
      );
    
    case "code":
      return (
        <CodeBlock
          code={segment.content}
          language={segment.language}
          executable={segment.executable}
          className="my-3"
        />
      );
    
    case "citation":
      const citation = citations.find(c => c.id === segment.id);
      if (citation) {
        return <CitationBadge citation={citation} />;
      }
      return (
        <span className="inline-flex items-center justify-center w-4 h-4 text-[10px] font-medium rounded bg-muted text-muted-foreground">
          {segment.id}
        </span>
      );
    
    case "graph":
      return (
        <GraphViewer
          pythonCode={segment.pythonCode}
          className="my-3"
        />
      );
    
    default:
      return null;
  }
}
