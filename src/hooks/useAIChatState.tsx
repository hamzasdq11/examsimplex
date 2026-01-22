import { useState, useCallback, createContext, useContext, ReactNode } from 'react';

interface Message {
  role: "user" | "assistant";
  content: string;
  response?: any;
  intent?: string;
  confidence?: number;
  modelUsed?: string;
  processingTime?: number;
}

interface AIChatState {
  messages: Message[];
  isOpen: boolean;
  isFullscreen: boolean;
  initialQuery: string;
}

interface AIChatContextValue extends AIChatState {
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setIsOpen: (open: boolean) => void;
  setIsFullscreen: (fullscreen: boolean) => void;
  setInitialQuery: (query: string) => void;
  openWithQuery: (query: string) => void;
  clearMessages: () => void;
}

const AIChatContext = createContext<AIChatContextValue | null>(null);

export function AIChatProvider({ children, subjectName = "General Study" }: { children: ReactNode; subjectName?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your ${subjectName} study assistant. Ask me anything about concepts, exam preparation, practice questions, or request code examples and visualizations.`,
      confidence: 1
    }
  ]);
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  const addMessage = useCallback((message: Message) => {
    setMessages(prev => [...prev, message]);
  }, []);

  const openWithQuery = useCallback((query: string) => {
    setInitialQuery(query);
    setIsOpen(true);
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([
      {
        role: "assistant",
        content: `Hi! I'm your ${subjectName} study assistant. Ask me anything about concepts, exam preparation, practice questions, or request code examples and visualizations.`,
        confidence: 1
      }
    ]);
  }, [subjectName]);

  return (
    <AIChatContext.Provider
      value={{
        messages,
        isOpen,
        isFullscreen,
        initialQuery,
        setMessages,
        addMessage,
        setIsOpen,
        setIsFullscreen,
        setInitialQuery,
        openWithQuery,
        clearMessages
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChatState() {
  const context = useContext(AIChatContext);
  if (!context) {
    throw new Error('useAIChatState must be used within AIChatProvider');
  }
  return context;
}
