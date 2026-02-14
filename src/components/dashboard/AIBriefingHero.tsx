import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Flame, Target, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { SetExamDateDialog } from './SetExamDateDialog';
import { cn } from '@/lib/utils';

interface AIBriefingHeroProps {
  userName: string;
  userEmail: string;
  universityName: string | null;
  courseName: string | null;
  semesterName: string | null;
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
  courseName,
  semesterName,
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

  const getUrgencyText = () => {
    if (daysUntilExam === null) return 'Set your exam date to get started';
    if (daysUntilExam <= 0) return 'Exam time! You got this 💪';
    if (daysUntilExam <= 7) return `Only ${daysUntilExam} days left — focus on key topics!`;
    if (daysUntilExam <= 14) return `${daysUntilExam} days to go — keep up the momentum!`;
    return `${daysUntilExam} days until your ${examType}. Start strong!`;
  };

  return (
    <>
      <Card className="relative overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-[#1a1f4e] via-[#243b8a] to-[#2d5bb9] text-white shadow-lg">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          {/* Content */}
          <div className="space-y-3 flex-1">
            <h2 className="text-2xl md:text-3xl font-bold leading-tight">
              {universityName || 'Your University'}
            </h2>
            <p className="text-lg md:text-xl font-semibold text-white/80">
              {[courseName, semesterName].filter(Boolean).join(' • ') || 'Set up your profile'}
            </p>
            <p className="text-blue-200 text-sm md:text-base max-w-md">
              {getUrgencyText()}
            </p>

            {/* Quick Stats Pills */}
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                onClick={() => setShowExamDialog(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-xs font-medium transition-colors"
              >
                <Calendar className="h-3 w-3" />
                {daysUntilExam !== null ? `${daysUntilExam}d to ${examType}` : 'Set exam date'}
              </button>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                <Target className="h-3 w-3" />
                {pendingSubjects} pending
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                <TrendingUp className="h-3 w-3" />
                {readinessPercent}% ready
              </span>
            </div>

            <Button
              className="mt-4 bg-white text-indigo-700 hover:bg-blue-50 font-semibold rounded-xl shadow-md hover:shadow-lg transition-all gap-2"
              onClick={onEditProfile}
            >
              View Course
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Decorative Mascot / Icon */}
          <div className="hidden md:flex items-center justify-center">
            <div className="w-24 h-24 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/10">
              <Sparkles className="h-12 w-12 text-blue-200" />
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
