import { useState } from 'react';
import { ChevronDown, ChevronUp, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { IntelligentSubjectCard } from './IntelligentSubjectCard';
import type { StudyProgress } from '@/hooks/useStudyProgress';

interface SubjectBasic {
  id: string;
  name: string;
  code: string;
  slug: string;
  gradient_from: string | null;
  gradient_to: string | null;
}

interface CollapsedSubjectsDrawerProps {
  subjects: SubjectBasic[];
  progress: StudyProgress[];
  universityId: string;
  courseId: string;
  semesterId: string;
  pyqCounts?: Record<string, number>;
}

export function CollapsedSubjectsDrawer({
  subjects,
  progress,
  universityId,
  courseId,
  semesterId,
  pyqCounts = {},
}: CollapsedSubjectsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (subjects.length === 0) return null;

  const getSubjectProgress = (subjectId: string) => {
    return progress.find(p => p.subject_id === subjectId);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
      <CollapsibleTrigger asChild>
        <Button 
          variant="ghost" 
          className="w-full justify-between text-muted-foreground hover:text-foreground"
        >
          <span className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            All Subjects ({subjects.length})
          </span>
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4">
        <p className="text-sm text-muted-foreground px-4">
          Your session is already optimized. Browse all subjects only if you need to.
        </p>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <IntelligentSubjectCard
              key={subject.id}
              subject={subject}
              progress={getSubjectProgress(subject.id)}
              universityId={universityId}
              courseId={courseId}
              semesterId={semesterId}
              totalPyqs={pyqCounts[subject.id] || 0}
            />
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
