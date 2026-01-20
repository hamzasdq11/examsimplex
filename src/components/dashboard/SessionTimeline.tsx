import { Clock, BookOpen, FileText, Brain, Coffee, CheckCircle2, Circle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SessionStep } from '@/hooks/useSession';

interface SessionTimelineProps {
  steps: SessionStep[];
  currentStepIndex: number;
}

const stepTypeIcons = {
  notes: BookOpen,
  pyq: FileText,
  quiz: Brain,
  break: Coffee,
};

const stepTypeLabels = {
  notes: 'Study',
  pyq: 'Practice',
  quiz: 'Quiz',
  break: 'Break',
};

export function SessionTimeline({ steps, currentStepIndex }: SessionTimelineProps) {
  if (steps.length === 0) return null;

  // Calculate cumulative time
  let cumulativeTime = 0;
  const stepsWithTime = steps.map(step => {
    const startTime = cumulativeTime;
    cumulativeTime += step.duration_minutes;
    return { ...step, startTime };
  });

  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();

  return (
    <div className="bg-card border rounded-xl p-4 space-y-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          Today's Plan
        </h3>
        <span className="text-sm text-muted-foreground">
          {cumulativeTime} min total
        </span>
      </div>

      <div className="space-y-1">
        {stepsWithTime.map((step, index) => {
          const Icon = stepTypeIcons[step.step_type as keyof typeof stepTypeIcons] || Circle;
          const isCompleted = step.status === 'completed';
          const isActive = step.status === 'active';
          const isPending = step.status === 'pending';
          const isSkipped = step.status === 'skipped';

          // Estimate time based on start time
          const estimatedHour = currentHour + Math.floor(step.startTime / 60);
          const estimatedMinute = (currentMinute + step.startTime) % 60;
          const timeString = `${estimatedHour.toString().padStart(2, '0')}:${estimatedMinute.toString().padStart(2, '0')}`;

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 p-2 rounded-lg transition-colors",
                isActive && "bg-primary/10 border border-primary/20",
                isCompleted && "opacity-60",
                isSkipped && "opacity-40 line-through"
              )}
            >
              {/* Status indicator */}
              <div className="w-6 flex justify-center">
              {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : isActive ? (
                  <Play className="h-5 w-5 text-primary fill-primary" />
                ) : (
                  <Circle className={cn(
                    "h-5 w-5",
                    isSkipped ? "text-muted-foreground/50" : "text-muted-foreground"
                  )} />
                )}
              </div>

              {/* Time */}
              <span className={cn(
                "text-sm font-mono w-12",
                isActive ? "text-primary font-semibold" : "text-muted-foreground"
              )}>
                {timeString}
              </span>

              {/* Icon */}
              <div className={cn(
                "h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                isActive ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
              )}>
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  isActive && "text-primary"
                )}>
                  {step.title}
                </p>
                <p className="text-xs text-muted-foreground">
                  {stepTypeLabels[step.step_type as keyof typeof stepTypeLabels]} • {step.duration_minutes}m
                </p>
              </div>

              {/* Active indicator */}
              {isActive && (
                <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                  NOW
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
