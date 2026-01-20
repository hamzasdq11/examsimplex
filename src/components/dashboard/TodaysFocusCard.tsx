import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain, BookOpen, FileText, Clock, RefreshCw, ChevronRight } from 'lucide-react';
import type { DailyFocus } from '@/hooks/useDailyFocus';

interface TodaysFocusCardProps {
  focus: DailyFocus | null;
  loading: boolean;
  universityId: string | null;
  courseId: string | null;
  semesterId: string | null;
  onRefresh: () => void;
}

export function TodaysFocusCard({
  focus,
  loading,
  universityId,
  courseId,
  semesterId,
  onRefresh
}: TodaysFocusCardProps) {
  const navigate = useNavigate();

  const handleStartNow = () => {
    if (focus && universityId && courseId && semesterId) {
      navigate(`/university/${universityId}/${courseId}/${semesterId}/${focus.subjectId}`);
    }
  };

  if (loading) {
    return (
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Today's Focus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-10 w-32 mt-4" />
        </CardContent>
      </Card>
    );
  }

  if (!focus) {
    return (
      <Card className="border-dashed border-2 border-muted">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <Brain className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-muted-foreground mb-2">No focus recommendation yet</p>
          <p className="text-sm text-muted-foreground mb-4">
            Start exploring subjects to get personalized recommendations
          </p>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Generate Focus
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-primary" />
            Today's Focus
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Subject & Unit */}
        <div className="flex items-start gap-2">
          <BookOpen className="h-4 w-4 mt-0.5 text-primary shrink-0" />
          <div>
            <p className="font-medium">{focus.subjectName}</p>
            <p className="text-sm text-muted-foreground">
              {focus.unitName} <span className="text-primary">({focus.reason})</span>
            </p>
          </div>
        </div>

        {/* PYQ Info */}
        {focus.pyqYear && (
          <div className="flex items-start gap-2">
            <FileText className="h-4 w-4 mt-0.5 text-amber-500 shrink-0" />
            <p className="text-sm">
              Revise PYQs from {focus.pyqYear}
              {focus.pyqMarks && <span className="text-muted-foreground"> ({focus.pyqMarks} marks)</span>}
            </p>
          </div>
        )}

        {/* Time Estimate */}
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Estimated time: {focus.estimatedMinutes} minutes
          </p>
        </div>

        {/* CTA */}
        <Button className="w-full mt-2 group" onClick={handleStartNow}>
          Start Now
          <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
      </CardContent>
    </Card>
  );
}
