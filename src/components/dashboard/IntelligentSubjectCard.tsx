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

// ─── Course-Specific Visual Theme Mapping ─────────────────────
interface CourseTheme {
  icon: React.ReactNode;
  pattern: React.ReactNode;
  label: string;
}

function getCourseTheme(name: string, code: string): CourseTheme {
  const lower = name.toLowerCase();
  const codeUpper = code.toUpperCase();

  // Database / DBMS
  if (lower.includes('database') || lower.includes('dbms') || lower.includes('sql')) {
    return {
      label: 'Database',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white/80">
          <ellipse cx="24" cy="12" rx="14" ry="5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
          <path d="M10 12v8c0 2.76 6.27 5 14 5s14-2.24 14-5v-8" stroke="currentColor" strokeWidth="2" />
          <path d="M10 20v8c0 2.76 6.27 5 14 5s14-2.24 14-5v-8" stroke="currentColor" strokeWidth="2" />
          <ellipse cx="24" cy="20" rx="14" ry="5" stroke="currentColor" strokeWidth="1" strokeDasharray="3 2" opacity="0.4" />
        </svg>
      ),
      pattern: (
        <>
          <circle cx="80%" cy="20%" r="18" fill="white" fillOpacity="0.06" />
          <circle cx="85%" cy="65%" r="10" fill="white" fillOpacity="0.04" />
          <rect x="10%" y="60%" width="20" height="3" rx="1.5" fill="white" fillOpacity="0.08" />
          <rect x="10%" y="68%" width="14" height="3" rx="1.5" fill="white" fillOpacity="0.06" />
          <rect x="10%" y="76%" width="18" height="3" rx="1.5" fill="white" fillOpacity="0.05" />
        </>
      ),
    };
  }

  // Algorithms / Data Structures
  if (lower.includes('algorithm') || lower.includes('dsa') || lower.includes('data structure')) {
    return {
      label: 'Algorithms',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white/80">
          {/* Binary tree */}
          <circle cx="24" cy="10" r="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
          <circle cx="14" cy="24" r="3.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
          <circle cx="34" cy="24" r="3.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
          <circle cx="8" cy="37" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
          <circle cx="20" cy="37" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
          <circle cx="28" cy="37" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
          <circle cx="40" cy="37" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.08" />
          <line x1="22" y1="13" x2="16" y2="21" stroke="currentColor" strokeWidth="1.5" />
          <line x1="26" y1="13" x2="32" y2="21" stroke="currentColor" strokeWidth="1.5" />
          <line x1="12" y1="27" x2="9" y2="34" stroke="currentColor" strokeWidth="1.2" />
          <line x1="16" y1="27" x2="19" y2="34" stroke="currentColor" strokeWidth="1.2" />
          <line x1="32" y1="27" x2="29" y2="34" stroke="currentColor" strokeWidth="1.2" />
          <line x1="36" y1="27" x2="39" y2="34" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      ),
      pattern: (
        <>
          <path d="M 75% 15% L 85% 25% L 75% 35%" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.08" />
          <path d="M 80% 20% L 90% 30% L 80% 40%" stroke="white" strokeWidth="1" fill="none" strokeOpacity="0.05" />
        </>
      ),
    };
  }

  // Web Technology / Web Development
  if (lower.includes('web') || lower.includes('html') || lower.includes('css') || lower.includes('javascript') || lower.includes('frontend') || lower.includes('react')) {
    return {
      label: 'Web Dev',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white/80">
          {/* Code brackets */}
          <path d="M16 14L6 24L16 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M32 14L42 24L32 34" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="28" y1="10" x2="20" y2="38" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
        </svg>
      ),
      pattern: (
        <>
          <text x="70%" y="30%" fill="white" fillOpacity="0.06" fontSize="10" fontFamily="monospace">&lt;/&gt;</text>
          <text x="75%" y="55%" fill="white" fillOpacity="0.04" fontSize="8" fontFamily="monospace">div</text>
          <rect x="72%" y="70%" width="22" height="3" rx="1.5" fill="white" fillOpacity="0.06" />
          <rect x="72%" y="78%" width="16" height="3" rx="1.5" fill="white" fillOpacity="0.04" />
        </>
      ),
    };
  }

  // Compiler Design
  if (lower.includes('compiler') || lower.includes('parsing') || lower.includes('lexer')) {
    return {
      label: 'Compilers',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white/80">
          {/* Gear + arrow flow */}
          <rect x="6" y="18" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
          <path d="M18 24H30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          <polygon points="30,20 38,24 30,28" fill="currentColor" fillOpacity="0.3" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="24" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.2" />
          <text x="8" y="26" fill="currentColor" fontSize="7" fontFamily="monospace" opacity="0.7">{'{ }'}</text>
        </svg>
      ),
      pattern: (
        <>
          <circle cx="82%" cy="25%" r="12" stroke="white" strokeWidth="1" fill="none" strokeOpacity="0.06" />
          <circle cx="82%" cy="25%" r="7" stroke="white" strokeWidth="1" fill="none" strokeOpacity="0.04" />
          <path d="M 70% 60% L 90% 60%" stroke="white" strokeWidth="1" strokeOpacity="0.06" strokeDasharray="4 3" />
          <path d="M 70% 70% L 85% 70%" stroke="white" strokeWidth="1" strokeOpacity="0.04" strokeDasharray="4 3" />
        </>
      ),
    };
  }

  // Operating Systems
  if (lower.includes('operating system') || lower.includes('os ') || codeUpper.includes('OS')) {
    return {
      label: 'OS',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white/80">
          {/* Terminal window */}
          <rect x="6" y="10" width="36" height="28" rx="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
          <line x1="6" y1="18" x2="42" y2="18" stroke="currentColor" strokeWidth="1.5" />
          <circle cx="11" cy="14" r="1.5" fill="currentColor" fillOpacity="0.5" />
          <circle cx="16" cy="14" r="1.5" fill="currentColor" fillOpacity="0.5" />
          <circle cx="21" cy="14" r="1.5" fill="currentColor" fillOpacity="0.5" />
          <path d="M12 24L18 28L12 32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="22" y1="32" x2="34" y2="32" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
        </svg>
      ),
      pattern: (
        <>
          <text x="72%" y="35%" fill="white" fillOpacity="0.05" fontSize="8" fontFamily="monospace">$_</text>
          <rect x="70%" y="55%" width="24" height="2.5" rx="1" fill="white" fillOpacity="0.06" />
          <rect x="70%" y="63%" width="18" height="2.5" rx="1" fill="white" fillOpacity="0.04" />
          <rect x="70%" y="71%" width="20" height="2.5" rx="1" fill="white" fillOpacity="0.05" />
        </>
      ),
    };
  }

  // Computer Networks
  if (lower.includes('network') || lower.includes('tcp') || lower.includes('protocol')) {
    return {
      label: 'Networks',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white/80">
          {/* Network topology */}
          <circle cx="24" cy="24" r="5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.15" />
          <circle cx="10" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
          <circle cx="38" cy="12" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
          <circle cx="10" cy="36" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
          <circle cx="38" cy="36" r="3.5" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.1" />
          <line x1="13" y1="14" x2="21" y2="21" stroke="currentColor" strokeWidth="1.5" />
          <line x1="35" y1="14" x2="27" y2="21" stroke="currentColor" strokeWidth="1.5" />
          <line x1="13" y1="34" x2="21" y2="27" stroke="currentColor" strokeWidth="1.5" />
          <line x1="35" y1="34" x2="27" y2="27" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      pattern: (
        <>
          <circle cx="78%" cy="22%" r="3" fill="white" fillOpacity="0.06" />
          <circle cx="88%" cy="40%" r="3" fill="white" fillOpacity="0.04" />
          <line x1="78%" y1="25%" x2="88%" y2="38%" stroke="white" strokeWidth="1" strokeOpacity="0.05" />
          <circle cx="75%" cy="65%" r="4" fill="white" fillOpacity="0.05" />
          <line x1="88%" y1="43%" x2="77%" y2="62%" stroke="white" strokeWidth="1" strokeOpacity="0.04" />
        </>
      ),
    };
  }

  // Mathematics / Discrete Math
  if (lower.includes('math') || lower.includes('calculus') || lower.includes('discrete') || lower.includes('linear algebra') || lower.includes('statistics')) {
    return {
      label: 'Math',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white/80">
          {/* Math symbols */}
          <text x="8" y="22" fill="currentColor" fontSize="16" fontFamily="serif" opacity="0.8">∫</text>
          <text x="22" y="28" fill="currentColor" fontSize="14" fontFamily="serif" opacity="0.6">∑</text>
          <text x="36" y="20" fill="currentColor" fontSize="12" fontFamily="serif" opacity="0.5">π</text>
          <text x="14" y="40" fill="currentColor" fontSize="10" fontFamily="serif" opacity="0.4">∞</text>
          <path d="M30 32 Q35 28 40 34" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.4" />
        </svg>
      ),
      pattern: (
        <>
          <text x="72%" y="30%" fill="white" fillOpacity="0.05" fontSize="16" fontFamily="serif">Σ</text>
          <text x="82%" y="60%" fill="white" fillOpacity="0.04" fontSize="12" fontFamily="serif">∂</text>
          <text x="75%" y="75%" fill="white" fillOpacity="0.03" fontSize="10" fontFamily="serif">λ</text>
        </>
      ),
    };
  }

  // Software Engineering
  if (lower.includes('software') || lower.includes('engineering') || lower.includes('sdlc') || lower.includes('uml')) {
    return {
      label: 'SE',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white/80">
          {/* Agile cycle */}
          <path d="M24 8 A16 16 0 0 1 40 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M40 24 A16 16 0 0 1 24 40" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M24 40 A16 16 0 0 1 8 24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M8 24 A16 16 0 0 1 24 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          <polygon points="38,22 42,24 38,26" fill="currentColor" fillOpacity="0.6" />
          <polygon points="26,38 24,42 22,38" fill="currentColor" fillOpacity="0.6" />
          <circle cx="24" cy="24" r="4" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      ),
      pattern: (
        <>
          <rect x="72%" y="20%" width="20" height="12" rx="3" stroke="white" strokeWidth="1" fill="none" strokeOpacity="0.05" />
          <rect x="76%" y="45%" width="16" height="10" rx="2" stroke="white" strokeWidth="1" fill="none" strokeOpacity="0.04" />
          <line x1="82%" y1="32%" x2="82%" y2="45%" stroke="white" strokeWidth="1" strokeOpacity="0.04" />
        </>
      ),
    };
  }

  // Physics / Electronics
  if (lower.includes('physics') || lower.includes('electronic') || lower.includes('circuit') || lower.includes('signal')) {
    return {
      label: 'Electronics',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white/80">
          {/* Waveform */}
          <path d="M4 24 L10 24 L14 10 L18 38 L22 10 L26 38 L30 10 L34 38 L38 24 L44 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      ),
      pattern: (
        <>
          <path d="M 68% 35% Q 74% 25% 80% 35% Q 86% 45% 92% 35%" stroke="white" strokeWidth="1" fill="none" strokeOpacity="0.06" />
          <path d="M 70% 60% Q 76% 50% 82% 60% Q 88% 70% 94% 60%" stroke="white" strokeWidth="1" fill="none" strokeOpacity="0.04" />
        </>
      ),
    };
  }

  // Machine Learning / AI
  if (lower.includes('machine learning') || lower.includes('artificial intelligence') || lower.includes('deep learning') || lower.includes('neural')) {
    return {
      label: 'AI/ML',
      icon: (
        <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white/80">
          {/* Neural net nodes */}
          <circle cx="10" cy="14" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
          <circle cx="10" cy="24" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
          <circle cx="10" cy="34" r="3" stroke="currentColor" strokeWidth="1.5" fill="currentColor" fillOpacity="0.15" />
          <circle cx="24" cy="18" r="3.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
          <circle cx="24" cy="30" r="3.5" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />
          <circle cx="38" cy="24" r="4" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.25" />
          {[14, 24, 34].map(y => [18, 30].map(ty => (
            <line key={`${y}-${ty}`} x1="13" y1={y} x2="21" y2={ty} stroke="currentColor" strokeWidth="1" opacity="0.4" />
          )))}
          <line x1="27" y1="18" x2="34" y2="23" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
          <line x1="27" y1="30" x2="34" y2="25" stroke="currentColor" strokeWidth="1.2" opacity="0.4" />
        </svg>
      ),
      pattern: (
        <>
          <circle cx="75%" cy="25%" r="5" fill="white" fillOpacity="0.04" />
          <circle cx="88%" cy="40%" r="4" fill="white" fillOpacity="0.03" />
          <circle cx="78%" cy="65%" r="6" fill="white" fillOpacity="0.04" />
        </>
      ),
    };
  }

  // Generic fallback — book icon
  return {
    label: 'Course',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" className="w-12 h-12 text-white/80">
        <path d="M8 8L8 38C8 38 13 35 24 35C35 35 40 38 40 38L40 8C40 8 35 11 24 11C13 11 8 8 8 8Z" stroke="currentColor" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
        <line x1="24" y1="11" x2="24" y2="35" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
        <line x1="14" y1="18" x2="20" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <line x1="14" y1="23" x2="20" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        <line x1="28" y1="18" x2="34" y2="18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <line x1="28" y1="23" x2="34" y2="23" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
      </svg>
    ),
    pattern: (
      <>
        <circle cx="80%" cy="25%" r="14" fill="white" fillOpacity="0.04" />
        <circle cx="85%" cy="60%" r="8" fill="white" fillOpacity="0.03" />
      </>
    ),
  };
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
  const subjectUrl = `/university/${universityId}/${courseId}/${semesterId}/${subject.id}`;

  // Calculate coverage percentage
  const notesCoverage = progress && progress.total_notes > 0
    ? Math.round((progress.notes_viewed / progress.total_notes) * 100)
    : 0;

  // Determine signals
  const isHighWeightage = true;
  const isWeakArea = progress && notesCoverage < 50;

  // Get level badge
  const getLevelBadge = () => {
    if (notesCoverage >= 75) return { label: 'Master', color: 'bg-green-500' };
    if (notesCoverage >= 40) return { label: 'Intermediate', color: 'bg-blue-500' };
    return { label: 'Beginner', color: 'bg-amber-500' };
  };

  const level = getLevelBadge();
  const gradFrom = subject.gradient_from || '#3B82F6';
  const gradTo = subject.gradient_to || '#8B5CF6';
  const theme = getCourseTheme(subject.name, subject.code);

  return (
    <Link to={subjectUrl} className="block group">
      <Card className="h-full bg-white rounded-2xl shadow-sm border border-gray-100/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden">
        {/* Thumbnail Area with course-specific visuals */}
        <div
          className="relative h-36 flex items-end p-3 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
          }}
        >
          {/* Course-specific background pattern (SVG) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
            {theme.pattern}
          </svg>

          {/* Course-specific icon — positioned top-right */}
          <div className="absolute top-3 right-3 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 drop-shadow-md">
            {theme.icon}
          </div>

          {/* Course type label — top left */}
          <span className="absolute top-3 left-3 px-2 py-0.5 bg-white/15 backdrop-blur-sm rounded-md text-[9px] font-semibold text-white uppercase tracking-widest">
            {theme.label}
          </span>

          {/* Level Badge — bottom left */}
          <span className={cn(
            "relative px-2.5 py-1 rounded-md text-[10px] font-bold text-white uppercase tracking-wider flex items-center gap-1 z-10",
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
              {progress?.total_notes || 0} notes
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {progress?.notes_viewed || 0} read
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {progress?.pyqs_practiced || 0} PYQs
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
              <span className="text-gray-400">Completed: {notesCoverage}%</span>
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
