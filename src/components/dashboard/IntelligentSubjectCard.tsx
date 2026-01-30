import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Flame, AlertTriangle, FileText, ChevronRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { StudyProgress } from '@/hooks/useStudyProgress';

interface Subject {
  id: string;
  name: string;
  code: string;
  slug: string;
  gradient_from: string | null;
  gradient_to: string | null;
}

interface IntelligentSubjectCardProps {
  subject: Subject;
  progress: StudyProgress | undefined;
  universityId: string;
  courseId: string;
  semesterId: string;
  totalPyqs?: number;
}

export function IntelligentSubjectCard({
  subject,
  progress,
  universityId,
  courseId,
  semesterId,
  totalPyqs = 0
}: IntelligentSubjectCardProps) {
  const navigate = useNavigate();
  const subjectUrl = `/university/${universityId}/${courseId}/${semesterId}/${subject.id}`;
  
  // Calculate coverage percentage
  const notesCoverage = progress && progress.total_notes > 0
    ? Math.round((progress.notes_viewed / progress.total_notes) * 100)
    : 0;
  
  const pyqsUnattempted = totalPyqs - (progress?.pyqs_practiced || 0);
  
  // Determine signals to show
  const isHighWeightage = true; // Could be based on subject marks in future
  const isWeakArea = progress && notesCoverage < 50;
  const hasPendingPyqs = pyqsUnattempted > 0;
  
  // Determine primary CTA text
  const getPrimaryCTA = () => {
    if (progress?.last_unit_id) {
      return 'Continue where you left off';
    }
    if (isWeakArea) {
      return 'Start catching up';
    }
    return 'Start studying';
  };

  return (
    <Link to={subjectUrl} className="block">
      <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group overflow-hidden">
        <CardHeader className="pb-2">
          {/* Subject Icon */}
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center mb-2 shrink-0"
            style={{
              background: `linear-gradient(135deg, ${subject.gradient_from || '#3B82F6'}, ${subject.gradient_to || '#8B5CF6'})`,
            }}
          >
            <BookOpen className="h-5 w-5 text-white" />
          </div>
          
          <CardTitle className="text-base group-hover:text-primary transition-colors line-clamp-1">
            {subject.name}
          </CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="text-xs">{subject.code}</Badge>
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Signals */}
          <div className="flex flex-wrap gap-1.5">
            {isHighWeightage && (
              <Badge variant="outline" className="text-xs gap-1 border-primary/30 text-primary">
                <Flame className="h-3 w-3" />
                High weightage
              </Badge>
            )}
            {isWeakArea && (
              <Badge variant="outline" className="text-xs gap-1 border-destructive/30 text-destructive">
                <AlertTriangle className="h-3 w-3" />
                Weak area
              </Badge>
            )}
            {hasPendingPyqs && (
              <Badge variant="outline" className="text-xs gap-1 border-border text-muted-foreground">
                <FileText className="h-3 w-3" />
                {pyqsUnattempted} PYQs pending
              </Badge>
            )}
          </div>
          
          {/* Progress Bar */}
          {progress && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Progress</span>
                <span className={cn(
                  "font-medium",
                  notesCoverage >= 75 ? "text-success" :
                  notesCoverage >= 50 ? "text-warning" :
                  "text-destructive"
                )}>
                  {notesCoverage}%
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all",
                    notesCoverage >= 75 ? "bg-success" :
                    notesCoverage >= 50 ? "bg-warning" :
                    "bg-destructive"
                  )}
                  style={{ width: `${notesCoverage}%` }}
                />
              </div>
            </div>
          )}
          
          {/* Primary CTA */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full justify-between group/btn hover:bg-primary hover:text-primary-foreground"
          >
            <span className="text-xs">{getPrimaryCTA()}</span>
            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
          
          {/* Secondary Links */}
          <div className="flex items-center justify-center gap-3 text-xs text-muted-foreground pt-1 border-t">
            <Link 
              to={`${subjectUrl}?tab=notes`} 
              className="hover:text-foreground transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              View syllabus
            </Link>
            <span className="text-border">•</span>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/dashboard/ai-study?subject=${subject.id}&q=Help me study ${subject.name}`);
              }}
              className="hover:text-primary transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-3 w-3" />
              Ask AI
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
