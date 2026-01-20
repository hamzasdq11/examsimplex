import { useState, useRef, useEffect } from "react";
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
  BarChart3,
  Globe,
  Zap
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { parseAIResponse, Segment } from "@/lib/responseParser";
import { MathRenderer } from "@/components/ai/MathRenderer";
import { CodeBlock } from "@/components/ai/CodeBlock";
import { CitationBadge, CitationDrawer, Citation } from "@/components/ai/CitationDrawer";
import { GraphViewer } from "@/components/ai/GraphViewer";
import { Progress } from "@/components/ui/progress";

// Strict response types matching backend schema
type AIResponseType = 
  | { type: "math"; python: string; explanation: string; latex?: string; steps?: string[] }
  | { type: "graph"; python: string; description: string }
  | { type: "code"; language: string; source: string; explanation: string; executable: boolean }
  | { type: "answer"; text: string; citations: Citation[] };

interface Message {
  role: "user" | "assistant";
  content: string;
  response?: AIResponseType;
  intent?: string;
  confidence?: number;
  modelUsed?: string;
  processingTime?: number;
}

interface SubjectAIChatProps {
  subject: {
    id: string;
    name: string;
    code: string;
  };
  universityName?: string;
  initialQuery?: string;
}

export const SubjectAIChat = ({ subject, universityName, initialQuery }: SubjectAIChatProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your ${subject.name} study assistant. Ask me anything about concepts, exam preparation, practice questions, or request code examples and visualizations.`,
      confidence: 1
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

  // Handle initial query from URL params
  useEffect(() => {
    if (initialQuery && user) {
      // Small delay to ensure component is ready
      const timer = setTimeout(() => {
        handleSubmit('ask', initialQuery);
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialQuery, user]);

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

      // Handle new structured response format
      const response = data.response as AIResponseType;
      let displayContent = "";
      
      if (response) {
        switch (response.type) {
          case "math":
            displayContent = response.explanation || 
              (response.python ? "Math computation generated. See code below." : "");
            break;
          case "graph":
            displayContent = response.description || 
              (response.python ? "Visualization generated. See graph below." : "");
            break;
          case "code":
            displayContent = response.explanation || 
              (response.source ? `Here's the ${response.language} code:` : "");
            break;
          case "answer":
            displayContent = response.text;
            break;
        }
      }

      // Additional fallback: if displayContent is still empty but we have code/data
      if (!displayContent && response) {
        if (response.type === "code" && response.source) {
          displayContent = "Code generated successfully:";
        } else if (response.type === "graph" && response.python) {
          displayContent = "Here's the visualization:";
        } else if (response.type === "math" && response.python) {
          displayContent = "Here's the mathematical computation:";
        }
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: displayContent || "I couldn't generate a response. Please try again.",
        response,
        intent: data.intent,
        confidence: data.confidence,
        modelUsed: data.modelUsed,
        processingTime: data.processingTime
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
    <Card className="h-full flex flex-col border-0 lg:border lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)]">
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
                  <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-border/50">
                    {/* Confidence indicator */}
                    {msg.confidence !== undefined && msg.confidence < 1 && (
                      <ConfidenceIndicator 
                        confidence={msg.confidence} 
                        processingTime={msg.processingTime}
                      />
                    )}
                    
                    <div className="flex items-center gap-2 flex-wrap">
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
                      
                      {/* Citations from response */}
                      {msg.response?.type === "answer" && msg.response.citations.length > 0 && (
                        <CitationDrawer 
                          citations={msg.response.citations}
                          trigger={
                            <Button variant="ghost" size="sm" className="h-6 px-2 text-xs opacity-60 hover:opacity-100 gap-1">
                              <BookOpen className="h-3 w-3" />
                              {msg.response.citations.length} sources
                            </Button>
                          }
                        />
                      )}
                      
                      {/* Web source indicator */}
                      {msg.response?.type === "answer" && 
                       msg.response.citations.some(c => (c as any).source === "web") && (
                        <Badge variant="outline" className="text-[10px] h-5 opacity-60 gap-1">
                          <Globe className="h-2.5 w-2.5" />
                          Web
                        </Badge>
                      )}
                      
                      {/* Response type badge */}
                      {msg.response && (
                        <Badge variant="outline" className="text-[10px] h-5 opacity-60">
                          {msg.response.type.toUpperCase()}
                        </Badge>
                      )}
                      
                      {msg.intent && (
                        <Badge variant="outline" className="text-[10px] h-5 opacity-60">
                          {msg.intent}
                        </Badge>
                      )}
                    </div>
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

// Confidence indicator component
function ConfidenceIndicator({ 
  confidence, 
  processingTime 
}: { 
  confidence: number;
  processingTime?: number;
}) {
  const percentage = Math.round(confidence * 100);
  const getConfidenceColor = () => {
    if (percentage >= 85) return "text-green-600 dark:text-green-400";
    if (percentage >= 70) return "text-yellow-600 dark:text-yellow-400";
    return "text-orange-600 dark:text-orange-400";
  };

  const getConfidenceLabel = () => {
    if (percentage >= 85) return "High confidence";
    if (percentage >= 70) return "Moderate confidence";
    return "Lower confidence";
  };

  return (
    <div className="flex items-center gap-2 text-[10px]">
      <div className="flex items-center gap-1.5 flex-1">
        <Zap className={`h-2.5 w-2.5 ${getConfidenceColor()}`} />
        <span className={`font-medium ${getConfidenceColor()}`}>{percentage}%</span>
        <Progress value={percentage} className="h-1 w-16" />
        <span className="text-muted-foreground">{getConfidenceLabel()}</span>
      </div>
      {processingTime && (
        <span className="text-muted-foreground opacity-60">
          {processingTime}ms
        </span>
      )}
    </div>
  );
}

// Helper to extract code from markdown content
function extractCodeFromContent(content: string): string {
  const match = content.match(/```(?:python|py)?(?::executable)?\n([\s\S]*?)```/);
  return match ? match[1].trim() : "";
}

// Component to render message content with math, code, citations, and graphs
function MessageContent({ message }: { message: Message }) {
  const { content, response } = message;
  const parsed = parseAIResponse(content);

  // Get citations from structured response
  const citations = response?.type === "answer" ? response.citations : [];

  // Determine if we should show code/graph from response
  const showMathCode = response?.type === "math" && response.python;
  const showGraphCode = response?.type === "graph" && response.python;
  const showCode = response?.type === "code" && response.source;

  // Fallback detection: check if content has code even if response type is "answer"
  const hasCodeInParsed = parsed.segments.some(s => s.type === "code");
  const showFallbackCode = 
    !showMathCode && !showGraphCode && !showCode && 
    !hasCodeInParsed && 
    content.includes("```python");

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

      {/* Render math steps if available */}
      {response?.type === "math" && response.steps && response.steps.length > 0 && (
        <div className="space-y-1 p-2 rounded-md bg-background/50 border">
          <span className="text-xs font-medium text-muted-foreground">Steps:</span>
          <ol className="text-xs space-y-1 ml-4 list-decimal">
            {response.steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {/* Render math code block */}
      {showMathCode && !parsed.hasExecutableCode && (
        <CodeBlock
          code={response.python}
          language="python"
          executable={true}
          className="mt-3"
        />
      )}

      {/* Render standalone code block */}
      {showCode && !parsed.hasExecutableCode && (
        <CodeBlock
          code={response.source}
          language={response.language}
          executable={response.executable}
          className="mt-3"
        />
      )}

      {/* Render graph */}
      {showGraphCode && (
        <GraphViewer
          pythonCode={response.python}
          className="mt-3"
        />
      )}

      {/* Fallback code rendering for answer-type responses with embedded code */}
      {showFallbackCode && (
        <CodeBlock
          code={extractCodeFromContent(content)}
          language="python"
          executable={content.includes(":executable") || content.includes("plt.")}
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
