import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, ChevronRight, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AIDirectiveProps {
  message: string;
  subMessage?: string;
  actionLabel?: string;
  onAction?: () => void;
  subjectId?: string;
  universityId?: string;
  courseId?: string;
  semesterId?: string;
  dismissible?: boolean;
}

export function AIDirective({
  message,
  subMessage,
  actionLabel = "Got it, let's go",
  onAction,
  subjectId,
  universityId,
  courseId,
  semesterId,
  dismissible = true,
}: AIDirectiveProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showReply, setShowReply] = useState(false);
  const navigate = useNavigate();

  if (dismissed) return null;

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else if (subjectId && universityId && courseId && semesterId) {
      navigate(`/university/${universityId}/${courseId}/${semesterId}/${subjectId}`);
    }
  };

  const handleAskFollowUp = () => {
    // Navigate to AI study mode with context
    const params = new URLSearchParams();
    if (subjectId) params.set('subject', subjectId);
    params.set('context', 'directive');
    navigate(`/dashboard/ai-study?${params.toString()}`);
  };

  return (
    <div className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 rounded-xl p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Brain className="h-4 w-4 text-primary" />
        </div>
        
        <div className="flex-1 space-y-1">
          <p className="font-medium leading-snug">{message}</p>
          {subMessage && (
            <p className="text-sm text-muted-foreground">{subMessage}</p>
          )}
        </div>

        {dismissible && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 shrink-0"
            onClick={() => setDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 pl-11">
        <Button size="sm" onClick={handleAction} className="gap-1">
          {actionLabel}
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleAskFollowUp}
          className="gap-1 text-muted-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          Ask why
        </Button>
      </div>
    </div>
  );
}

// Pre-built directive messages
export function WeakAreaDirective({ 
  subjectName, 
  unitName,
  ...props 
}: { 
  subjectName: string; 
  unitName?: string;
} & Omit<AIDirectiveProps, 'message' | 'subMessage'>) {
  return (
    <AIDirective
      message={`Focus on ${subjectName}${unitName ? ` → ${unitName}` : ''} today.`}
      subMessage="This is your weakest area and appears frequently in exams."
      actionLabel="Start now"
      {...props}
    />
  );
}

export function PYQDirective({ 
  year, 
  marks,
  subjectName,
  ...props 
}: { 
  year: string;
  marks?: number;
  subjectName: string;
} & Omit<AIDirectiveProps, 'message' | 'subMessage'>) {
  return (
    <AIDirective
      message={`Practice ${year} paper for ${subjectName}.`}
      subMessage={marks ? `${marks} marks worth of questions you haven't attempted.` : 'These questions are likely to repeat.'}
      actionLabel="Open paper"
      {...props}
    />
  );
}

export function TimelineDirective({ 
  daysUntilExam,
  prioritySubjects,
  ...props 
}: { 
  daysUntilExam: number;
  prioritySubjects: string[];
} & Omit<AIDirectiveProps, 'message' | 'subMessage' | 'actionLabel'>) {
  const subjectsText = prioritySubjects.slice(0, 2).join(' and ');
  
  return (
    <AIDirective
      message={`With ${daysUntilExam} days left, spend 60% of time on ${subjectsText}.`}
      subMessage="Skip low-weightage topics. Focus on what gets marks."
      actionLabel="Show me the plan"
      {...props}
    />
  );
}
