import { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Calendar, Flame, Target, TrendingUp } from 'lucide-react';
import { SetExamDateDialog } from './SetExamDateDialog';
import { cn } from '@/lib/utils';

interface AIBriefingHeroProps {
  userName: string;
  userEmail: string;
  universityName: string | null;
  daysUntilExam: number | null;
  examType: string;
  subjectsCount: number;
  pendingSubjects: number;
  weakestSubject: string | null;
  readinessPercent: number;
  onEditProfile: () => void;
  onExamDateSet: (date: Date, type: string) => void;
}

export function AIBriefingHero({
  userName,
  userEmail,
  universityName,
  daysUntilExam,
  examType,
  subjectsCount,
  pendingSubjects,
  weakestSubject,
  readinessPercent,
  onEditProfile,
  onExamDateSet
}: AIBriefingHeroProps) {
  const [showExamDialog, setShowExamDialog] = useState(false);

  const getInitials = () => {
    if (userName) {
      return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return userEmail?.charAt(0).toUpperCase() || 'U';
  };

  const getUrgencyColor = () => {
    if (daysUntilExam === null) return 'text-muted-foreground';
    if (daysUntilExam <= 7) return 'text-destructive';
    if (daysUntilExam <= 14) return 'text-amber-500';
    return 'text-primary';
  };

  const getReadinessColor = () => {
    if (readinessPercent >= 75) return 'text-green-500';
    if (readinessPercent >= 50) return 'text-amber-500';
    return 'text-destructive';
  };

  return (
    <>
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-background to-accent/5">
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Avatar and Name */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-primary/20 shadow-lg">
                <AvatarFallback className="text-xl bg-primary text-primary-foreground font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="md:hidden">
                <h1 className="text-xl font-bold">{userName.split(' ')[0]}, here's your exam status</h1>
                {universityName && (
                  <p className="text-sm text-muted-foreground">{universityName}</p>
                )}
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 space-y-4">
              <div className="hidden md:block">
                <h1 className="text-2xl font-bold">{userName.split(' ')[0]}, here's your exam status</h1>
                {universityName && (
                  <p className="text-sm text-muted-foreground">{universityName}</p>
                )}
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {/* Days Until Exam */}
                <button
                  onClick={() => setShowExamDialog(true)}
                  className="flex items-center gap-2 p-3 rounded-lg bg-background/60 hover:bg-background/80 border border-border/50 transition-colors text-left"
                >
                  <Calendar className={cn("h-4 w-4 shrink-0", getUrgencyColor())} />
                  <div className="min-w-0">
                    {daysUntilExam !== null ? (
                      <>
                        <p className={cn("text-lg font-bold leading-tight", getUrgencyColor())}>
                          {daysUntilExam} days
                        </p>
                        <p className="text-xs text-muted-foreground truncate">to {examType}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-muted-foreground">Set exam date</p>
                        <p className="text-xs text-muted-foreground">Click to add</p>
                      </>
                    )}
                  </div>
                </button>

                {/* Subjects Pending */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-background/60 border border-border/50">
                  <Target className="h-4 w-4 shrink-0 text-primary" />
                  <div className="min-w-0">
                    <p className="text-lg font-bold leading-tight">{pendingSubjects}</p>
                    <p className="text-xs text-muted-foreground truncate">subjects pending</p>
                  </div>
                </div>

                {/* Highest Risk */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-background/60 border border-border/50">
                  <Flame className="h-4 w-4 shrink-0 text-destructive" />
                  <div className="min-w-0">
                    {weakestSubject ? (
                      <>
                        <p className="text-sm font-semibold leading-tight truncate" title={weakestSubject}>
                          {weakestSubject.length > 15 ? weakestSubject.slice(0, 15) + '...' : weakestSubject}
                        </p>
                        <p className="text-xs text-muted-foreground">highest risk</p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-medium text-muted-foreground">No data</p>
                        <p className="text-xs text-muted-foreground">start studying</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Readiness */}
                <div className="flex items-center gap-2 p-3 rounded-lg bg-background/60 border border-border/50">
                  <TrendingUp className={cn("h-4 w-4 shrink-0", getReadinessColor())} />
                  <div className="min-w-0">
                    <p className={cn("text-lg font-bold leading-tight", getReadinessColor())}>
                      {readinessPercent}%
                    </p>
                    <p className="text-xs text-muted-foreground truncate">readiness</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Card>

      <SetExamDateDialog
        open={showExamDialog}
        onOpenChange={setShowExamDialog}
        onConfirm={(date, type) => {
          onExamDateSet(date, type);
          setShowExamDialog(false);
        }}
      />
    </>
  );
}
