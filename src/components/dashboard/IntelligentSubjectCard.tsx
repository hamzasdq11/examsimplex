import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Flame, AlertTriangle, Sparkles, Clock, Users } from 'lucide-react';
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

// ─── Course Image Mapping ─────────────────────────────────────
function getCourseImage(name: string, code: string): string {
  const lower = name.toLowerCase();
  const isLab = lower.includes('lab') || lower.includes('practical') || lower.includes('workshop');

  // ── Lab-specific images (checked first so labs get distinct images) ──
  if (isLab && (lower.includes('database') || lower.includes('dbms') || lower.includes('sql'))) {
    return '/images/courses/networking.png'; // hands-on tech — network switch close-up
  }
  if (isLab && (lower.includes('web') || lower.includes('html') || lower.includes('css') || lower.includes('javascript') || lower.includes('frontend') || lower.includes('react'))) {
    return '/images/courses/compiler.png'; // coding-focused — green code matrix
  }

  // ── Theory course images ───────────────────────────────────────────
  if (lower.includes('database') || lower.includes('dbms') || lower.includes('sql')) {
    return '/images/courses/database.png';
  }
  if (lower.includes('algorithm') || lower.includes('dsa') || lower.includes('data structure')) {
    return '/images/courses/algorithms.png';
  }
  if (lower.includes('web') || lower.includes('html') || lower.includes('css') || lower.includes('javascript') || lower.includes('frontend') || lower.includes('react')) {
    return '/images/courses/web-technology.png';
  }
  if (lower.includes('compiler') || lower.includes('parsing') || lower.includes('lexer')) {
    return '/images/courses/compiler.png';
  }
  if (lower.includes('operating system') || lower.includes('os ') || code.toUpperCase().includes('OS')) {
    return '/images/courses/os.png';
  }
  if (lower.includes('network') || lower.includes('tcp') || lower.includes('protocol')) {
    return '/images/courses/networking.png';
  }
  if (lower.includes('math') || lower.includes('calculus') || lower.includes('algebra') || lower.includes('discrete') || lower.includes('numerical')) {
    return '/images/courses/math.png';
  }
  if (lower.includes('software') || lower.includes('engineering') || lower.includes('agile') || lower.includes('project')) {
    return '/images/courses/software.png';
  }
  if (lower.includes('physics') || lower.includes('electronic') || lower.includes('circuit') || lower.includes('signal')) {
    return '/images/courses/os.png';
  }
  if (lower.includes('machine learning') || lower.includes('artificial intelligence') || lower.includes('deep learning') || lower.includes('neural')) {
    return '/images/courses/algorithms.png';
  }

  return '/images/courses/generic.png';
}

// ─── Main Component ───────────────────────────────────────────

export function IntelligentSubjectCard({
  subject,
  progress,
  universityId,
  courseId,
  semesterId,
  totalPyqs = 0
}: IntelligentSubjectCardProps) {
  const navigate = useNavigate();
  const subjectUrl = `/university/${universityId}/${courseId}/${semesterId}/${subject.slug}`;

  const notesCoverage = progress && progress.total_notes > 0
    ? Math.round((progress.notes_viewed / progress.total_notes) * 100)
    : 0;

  const isHighWeightage = true;
  const isWeakArea = progress && notesCoverage < 50;

  const getLevelBadge = () => {
    if (notesCoverage >= 75) return { label: 'Master', color: 'bg-emerald-500', icon: '📗' };
    if (notesCoverage >= 40) return { label: 'Intermediate', color: 'bg-blue-500', icon: '📘' };
    return { label: 'Beginner', color: 'bg-amber-500', icon: '📙' };
  };

  const level = getLevelBadge();
  const courseImage = getCourseImage(subject.name, subject.code);

  const progressColor =
    notesCoverage >= 75 ? 'bg-emerald-500' :
      notesCoverage >= 50 ? 'bg-amber-500' :
        'bg-indigo-500';

  return (
    <Link to={subjectUrl} className="block group">
      <Card className="h-full bg-white rounded-2xl shadow-sm border border-gray-100/80 hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 cursor-pointer overflow-hidden">
        {/* ── Image Thumbnail ─────────────────────── */}
        <div className="relative h-44 overflow-hidden rounded-t-2xl">
          <img
            src={courseImage}
            alt={subject.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Subtle dark overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          {/* Level Badge — bottom left, overlapping edge */}
          <div className="absolute bottom-3 left-3 z-10">
            <span className={cn(
              "px-3 py-1.5 rounded-lg text-[11px] font-bold text-white uppercase tracking-wider flex items-center gap-1.5 shadow-md backdrop-blur-sm",
              level.color
            )}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 20h.01M7 20v-4M12 20V10M17 20V4" />
              </svg>
              {level.label}
            </span>
          </div>
        </div>

        {/* ── Card Body ───────────────────────────── */}
        <CardContent className="p-4 space-y-3">
          {/* Title & Code */}
          <div>
            <h3 className="font-bold text-[15px] text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 leading-tight">
              {subject.name}
            </h3>
            <p className="text-xs text-gray-400 mt-0.5 font-medium">{subject.code}</p>
          </div>

          {/* Stats Row — matching Dribbble reference icons */}
          <div className="flex items-center gap-4 text-[12px] text-gray-500">
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-semibold text-gray-700">{progress?.total_notes || 0}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-semibold text-gray-700">{progress?.notes_viewed || 0}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-gray-400" />
              <span className="font-semibold text-gray-700">{progress?.pyqs_practiced || 0}</span>
            </span>
          </div>

          {/* Completion Row */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Completed : <span className="font-bold text-gray-800">{notesCoverage}%</span>
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={cn("h-full rounded-full transition-all duration-700", progressColor)}
                style={{ width: `${notesCoverage}%` }}
              />
            </div>
          </div>

          {/* Tags Row */}
          <div className="flex flex-wrap gap-1.5">
            {isHighWeightage && (
              <Badge variant="outline" className="text-[10px] gap-0.5 border-indigo-200 text-indigo-600 bg-indigo-50/80 rounded-md py-0.5 px-2">
                <Flame className="h-2.5 w-2.5" />
                High weightage
              </Badge>
            )}
            {isWeakArea && (
              <Badge variant="outline" className="text-[10px] gap-0.5 border-red-200 text-red-600 bg-red-50/80 rounded-md py-0.5 px-2">
                <AlertTriangle className="h-2.5 w-2.5" />
                Weak area
              </Badge>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <Link
              to={`${subjectUrl}?tab=notes`}
              className="text-[11px] text-gray-400 hover:text-gray-700 transition-colors font-medium"
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
              className="text-[11px] text-indigo-500 hover:text-indigo-700 transition-colors flex items-center gap-1 font-medium"
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
