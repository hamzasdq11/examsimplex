import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Flame, AlertTriangle, FileText, ChevronRight, Sparkles, Clock, Users } from 'lucide-react';
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

  // Determine signals
  const isHighWeightage = true;
  const isWeakArea = progress && notesCoverage < 50;

  // Determine primary CTA text
  const getPrimaryCTA = () => {
    if (progress?.last_unit_id) return 'Continue where you left off';
    if (isWeakArea) return 'Start catching up';
    return 'Start studying';
  };

  // Get level badge
  const getLevelBadge = () => {
    if (notesCoverage >= 75) return { label: 'Master', color: 'bg-green-500' };
    if (notesCoverage >= 40) return { label: 'Intermediate', color: 'bg-blue-500' };
    return { label: 'Beginner', color: 'bg-amber-500' };
  };

  const level = getLevelBadge();
  const gradFrom = subject.gradient_from || '#3B82F6';
  const gradTo = subject.gradient_to || '#8B5CF6';

  return (
    <Link to={subjectUrl} className="block group">
      <Card className="h-full bg-white rounded-2xl shadow-sm border border-gray-100/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
        {/* Thumbnail Area */}
        <div
          className="relative h-32 flex items-end p-3"
          style={{
            background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
          }}
        >
          {/* Decorative pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-3 right-3 w-16 h-16 border-2 border-white rounded-lg rotate-12" />
            <div className="absolute bottom-3 left-3 w-10 h-10 border-2 border-white rounded-full" />
          </div>

          {/* Level Badge */}
          <span className={cn(
            "relative px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1",
            level.color
          )}>
            <span className="inline-block w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            {level.label}
          </span>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Subject Name */}
          <div>
            <h3 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {subject.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{subject.code}</p>
          </div>

          {/* Metadata Row */}
          <div className="flex items-center gap-3 text-[11px] text-gray-500">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {progress?.total_notes || 0}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {progress?.notes_viewed || 0}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {progress?.pyqs_practiced || 0}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  notesCoverage >= 75 ? "bg-green-500" :
                    notesCoverage >= 50 ? "bg-amber-500" :
                      "bg-indigo-500"
                )}
                style={{ width: `${notesCoverage}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-gray-400">Completed : {notesCoverage}%</span>
            </div>
          </div>

          {/* Signals */}
          <div className="flex flex-wrap gap-1">
            {isHighWeightage && (
              <Badge variant="outline" className="text-[10px] gap-0.5 border-indigo-200 text-indigo-600 bg-indigo-50 rounded-md py-0">
                <Flame className="h-2.5 w-2.5" />
                High weightage
              </Badge>
            )}
            {isWeakArea && (
              <Badge variant="outline" className="text-[10px] gap-0.5 border-red-200 text-red-600 bg-red-50 rounded-md py-0">
                <AlertTriangle className="h-2.5 w-2.5" />
                Weak area
              </Badge>
            )}
          </div>

          {/* Secondary Links */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Link
              to={`${subjectUrl}?tab=notes`}
              className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              View syllabus
            </Link>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                navigate(`/dashboard/ai-study?subject=${subject.id}&q=Help me study ${subject.name}`);
              }}
              className="text-[11px] text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1"
            >
              <Sparkles className="h-2.5 w-2.5" />
              Ask AI
            </button>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
