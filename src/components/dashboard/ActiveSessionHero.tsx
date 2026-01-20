import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Play, 
  Zap, 
  Clock, 
  BookOpen, 
  FileText, 
  Brain,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  Target
} from 'lucide-react';
import type { UserSession, SessionStep } from '@/hooks/useSession';

interface ActiveSessionHeroProps {
  session: UserSession | null;
  currentStep: SessionStep | null;
  loading: boolean;
  generating: boolean;
  progressPercent: number;
  completedSteps: number;
  totalSteps: number;
  daysUntilExam: number | null;
  onGenerateSession: () => void;
  onStartSession: () => void;
  onCompleteStep: (stepId: string) => void;
  onSkipStep: (stepId: string) => void;
  universityId: string | null;
  courseId: string | null;
  semesterId: string | null;
}

const stepTypeIcons = {
  notes: BookOpen,
  pyq: FileText,
  quiz: Brain,
  break: Clock,
};

const stepTypeColors = {
  notes: 'text-primary',
  pyq: 'text-primary',
  quiz: 'text-primary',
  break: 'text-muted-foreground',
};

export function ActiveSessionHero({
  session,
  currentStep,
  loading,
  generating,
  progressPercent,
  completedSteps,
  totalSteps,
  daysUntilExam,
  onGenerateSession,
  onStartSession,
  onCompleteStep,
  onSkipStep,
  universityId,
  courseId,
  semesterId,
}: ActiveSessionHeroProps) {
  const navigate = useNavigate();

  const handleStartContent = () => {
    if (!currentStep || !universityId || !courseId || !semesterId) return;
    
    if (currentStep.subject_id) {
      navigate(`/university/${universityId}/${courseId}/${semesterId}/${currentStep.subject_id}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 p-8">
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-40" />
        </div>
      </div>
    );
  }

  // No session - Generate one
  if (!session) {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium">AI-Powered Study Plan</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Ready to get exam-ready?
            </h1>
            <p className="text-muted-foreground max-w-lg">
              {daysUntilExam ? (
                <>You have <span className="text-primary font-semibold">{daysUntilExam} days</span> until your exam. Let's create a focused session to maximize your marks.</>
              ) : (
                <>Let me analyze your syllabus and create a personalized study session that targets high-weightage topics.</>
              )}
            </p>
          </div>

          <Button 
            size="lg" 
            onClick={onGenerateSession}
            disabled={generating}
            className="gap-2 text-base"
          >
            {generating ? (
              <>
                <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Creating your session...
              </>
            ) : (
              <>
                <Zap className="h-5 w-5" />
                Generate Today's Session
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Session completed
  if (session.status === 'completed') {
    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500/10 via-background to-background border border-green-500/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-green-500">Session Complete!</h1>
              <p className="text-muted-foreground">
                You completed {session.completed_duration_minutes} minutes of focused study
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              View Progress
            </Button>
            <p className="text-sm text-muted-foreground">
              Come back tomorrow for your next session
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Session pending - Ready to start
  if (session.status === 'pending') {
    const firstStep = session.steps[0];
    const StepIcon = firstStep ? stepTypeIcons[firstStep.step_type as keyof typeof stepTypeIcons] : Target;

    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-primary">
              <Target className="h-5 w-5" />
              <span className="text-sm font-medium">Today's Mission</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Let's get you closer to passing.
            </h1>
          </div>

          {/* First step preview */}
          {firstStep && (
            <div className="bg-background/50 rounded-xl border p-4 space-y-3">
              <div className="flex items-start gap-3">
                <div className={`h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center ${stepTypeColors[firstStep.step_type as keyof typeof stepTypeColors]}`}>
                  <StepIcon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold">{firstStep.title}</p>
                  {firstStep.description && (
                    <p className="text-sm text-muted-foreground">{firstStep.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {session.total_duration_minutes} min session • {totalSteps} steps
                </span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Button size="lg" onClick={onStartSession} className="gap-2 text-base">
              <Play className="h-5 w-5" />
              Begin Session
            </Button>
            <p className="text-sm text-muted-foreground">
              One click. Zero decisions.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Session active - Show current step
  if (session.status === 'active' && currentStep) {
    const StepIcon = stepTypeIcons[currentStep.step_type as keyof typeof stepTypeIcons] || Target;
    const stepColor = stepTypeColors[currentStep.step_type as keyof typeof stepTypeColors] || 'text-primary';

    return (
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-background to-background border border-primary/20 p-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        
        <div className="relative space-y-6">
          {/* Progress indicator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                Step {completedSteps + 1} of {totalSteps}
              </span>
              <span className="font-medium">{Math.round(progressPercent)}% complete</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>

          {/* Current step */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className={`h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center ${stepColor}`}>
                <StepIcon className="h-4 w-4" />
              </div>
              <span className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                {currentStep.step_type === 'pyq' ? 'Practice' : currentStep.step_type}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-bold">
              {currentStep.title}
            </h1>
            
            {currentStep.description && (
              <p className="text-muted-foreground max-w-lg">
                {currentStep.description}
              </p>
            )}

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{currentStep.duration_minutes} minutes</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {currentStep.step_type === 'break' ? (
              <Button size="lg" onClick={() => onCompleteStep(currentStep.id)} className="gap-2">
                <CheckCircle2 className="h-5 w-5" />
                Break Complete
              </Button>
            ) : (
              <>
                <Button size="lg" onClick={handleStartContent} className="gap-2">
                  Start Now
                  <ChevronRight className="h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => onCompleteStep(currentStep.id)}
                >
                  Mark Complete
                </Button>
              </>
            )}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onSkipStep(currentStep.id)}
              className="text-muted-foreground"
            >
              Skip
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
