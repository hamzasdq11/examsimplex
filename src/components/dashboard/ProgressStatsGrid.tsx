import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BookOpen, FileText, MessageSquare } from 'lucide-react';

interface ProgressStatsGridProps {
  notesCoverage: number;
  notesViewed: number;
  totalNotes: number;
  pyqsCoverage: number;
  pyqsPracticed: number;
  totalPyqs: number;
  aiSessions: number;
  subjectsCount: number;
}

export function ProgressStatsGrid({
  notesCoverage,
  notesViewed,
  totalNotes,
  pyqsCoverage,
  pyqsPracticed,
  totalPyqs,
  aiSessions,
  subjectsCount
}: ProgressStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Notes Coverage */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <div className="p-1.5 rounded-md bg-primary-soft">
              <BookOpen className="h-4 w-4 text-primary" />
            </div>
            Notes Coverage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{notesCoverage}%</span>
            <span className="text-sm text-muted-foreground">
              {notesViewed} / {totalNotes || '-'}
            </span>
          </div>
          <Progress value={notesCoverage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {subjectsCount} subjects tracked
          </p>
        </CardContent>
      </Card>

      {/* PYQs Practiced */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <div className="p-1.5 rounded-md bg-warning/10">
              <FileText className="h-4 w-4 text-warning" />
            </div>
            PYQs Practiced
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{pyqsPracticed}</span>
            <span className="text-sm text-muted-foreground">
              / {totalPyqs || '-'} papers
            </span>
          </div>
          <Progress value={pyqsCoverage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {pyqsCoverage}% completed
          </p>
        </CardContent>
      </Card>

      {/* AI Sessions */}
      <Card className="bg-card border border-border">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <div className="p-1.5 rounded-md bg-success/10">
              <MessageSquare className="h-4 w-4 text-success" />
            </div>
            AI Sessions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold">{aiSessions}</span>
            <span className="text-sm text-muted-foreground">
              total sessions
            </span>
          </div>
          <Progress value={Math.min(aiSessions * 10, 100)} className="h-2" />
          <p className="text-xs text-muted-foreground">
            Keep learning with AI
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
