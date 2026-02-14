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

// ─── Inline keyframe styles (injected once) ──────────────────
const ANIM_STYLES_ID = 'subject-card-anims';
function ensureAnimStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(ANIM_STYLES_ID)) return;
  const style = document.createElement('style');
  style.id = ANIM_STYLES_ID;
  style.textContent = `
    @keyframes sc-float-x {
      0%, 100% { transform: translateX(0) translateY(0); }
      25% { transform: translateX(12px) translateY(-6px); }
      50% { transform: translateX(-8px) translateY(4px); }
      75% { transform: translateX(6px) translateY(-3px); }
    }
    @keyframes sc-drift-slow {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      33% { transform: translate(15px, -10px) rotate(8deg); }
      66% { transform: translate(-10px, 8px) rotate(-5deg); }
    }
    @keyframes sc-drift-med {
      0%, 100% { transform: translate(0, 0) scale(1); }
      25% { transform: translate(-12px, 6px) scale(1.05); }
      50% { transform: translate(8px, -8px) scale(0.95); }
      75% { transform: translate(-5px, -4px) scale(1.02); }
    }
    @keyframes sc-drift-fast {
      0%, 100% { transform: translate(0, 0) rotate(0deg); }
      20% { transform: translate(10px, 8px) rotate(12deg); }
      40% { transform: translate(-14px, -4px) rotate(-6deg); }
      60% { transform: translate(6px, -10px) rotate(8deg); }
      80% { transform: translate(-8px, 6px) rotate(-10deg); }
    }
    @keyframes sc-pulse-glow {
      0%, 100% { opacity: 0.08; }
      50% { opacity: 0.15; }
    }
    @keyframes sc-wiggle {
      0%, 100% { transform: translateX(0) rotate(0deg); }
      25% { transform: translateX(4px) rotate(3deg); }
      75% { transform: translateX(-4px) rotate(-3deg); }
    }
  `;
  document.head.appendChild(style);
}

// ─── Course Theme Definitions ────────────────────────────────

interface CourseTheme {
  label: string;
  elements: React.ReactNode;
}

function getCourseTheme(name: string, code: string): CourseTheme {
  ensureAnimStyles();
  const lower = name.toLowerCase();

  // Database / DBMS
  if (lower.includes('database') || lower.includes('dbms') || lower.includes('sql')) {
    return {
      label: 'Database',
      elements: (
        <>
          {/* Flowing database cylinders */}
          <g style={{ animation: 'sc-drift-slow 8s ease-in-out infinite' }}>
            <ellipse cx="75%" cy="30%" rx="16" ry="6" fill="white" fillOpacity="0.12" />
            <rect x="calc(75% - 16px)" y="30%" width="32" height="16" fill="white" fillOpacity="0.08" rx="0" />
            <ellipse cx="75%" cy="calc(30% + 16px)" rx="16" ry="6" fill="white" fillOpacity="0.06" />
          </g>
          <g style={{ animation: 'sc-drift-med 10s ease-in-out infinite' }}>
            <ellipse cx="20%" cy="55%" rx="12" ry="4.5" fill="white" fillOpacity="0.09" />
            <rect x="calc(20% - 12px)" y="55%" width="24" height="12" fill="white" fillOpacity="0.06" />
            <ellipse cx="20%" cy="calc(55% + 12px)" rx="12" ry="4.5" fill="white" fillOpacity="0.05" />
          </g>
          <g style={{ animation: 'sc-drift-fast 12s ease-in-out infinite' }}>
            <ellipse cx="55%" cy="70%" rx="10" ry="3.5" fill="white" fillOpacity="0.07" />
            <rect x="calc(55% - 10px)" y="70%" width="20" height="10" fill="white" fillOpacity="0.05" />
            <ellipse cx="55%" cy="calc(70% + 10px)" rx="10" ry="3.5" fill="white" fillOpacity="0.04" />
          </g>
          {/* Data rows floating */}
          <g style={{ animation: 'sc-float-x 7s ease-in-out infinite' }}>
            <rect x="60%" y="18%" width="28" height="2.5" rx="1.2" fill="white" fillOpacity="0.1" />
            <rect x="62%" y="24%" width="20" height="2.5" rx="1.2" fill="white" fillOpacity="0.07" />
            <rect x="58%" y="30%" width="24" height="2.5" rx="1.2" fill="white" fillOpacity="0.08" />
          </g>
          {/* Glowing circles */}
          <circle cx="88%" cy="60%" r="8" fill="white" fillOpacity="0.06" style={{ animation: 'sc-pulse-glow 4s ease-in-out infinite' }} />
          <circle cx="12%" cy="25%" r="14" fill="white" fillOpacity="0.04" style={{ animation: 'sc-pulse-glow 5s ease-in-out infinite 1s' }} />
        </>
      ),
    };
  }

  // Algorithms / Data Structures
  if (lower.includes('algorithm') || lower.includes('dsa') || lower.includes('data structure')) {
    return {
      label: 'Algorithms',
      elements: (
        <>
          {/* Floating binary tree */}
          <g style={{ animation: 'sc-drift-slow 9s ease-in-out infinite' }}>
            <circle cx="70%" cy="25%" r="5" fill="white" fillOpacity="0.12" />
            <circle cx="60%" cy="45%" r="4" fill="white" fillOpacity="0.09" />
            <circle cx="80%" cy="45%" r="4" fill="white" fillOpacity="0.09" />
            <line x1="68%" y1="29%" x2="62%" y2="42%" stroke="white" strokeWidth="1.2" strokeOpacity="0.1" />
            <line x1="72%" y1="29%" x2="78%" y2="42%" stroke="white" strokeWidth="1.2" strokeOpacity="0.1" />
            <circle cx="55%" cy="62%" r="3" fill="white" fillOpacity="0.06" />
            <circle cx="65%" cy="62%" r="3" fill="white" fillOpacity="0.06" />
            <line x1="58%" y1="48%" x2="56%" y2="59%" stroke="white" strokeWidth="1" strokeOpacity="0.07" />
            <line x1="62%" y1="48%" x2="64%" y2="59%" stroke="white" strokeWidth="1" strokeOpacity="0.07" />
          </g>
          {/* Drifting nodes cluster 2 */}
          <g style={{ animation: 'sc-drift-fast 11s ease-in-out infinite' }}>
            <circle cx="22%" cy="35%" r="4.5" fill="white" fillOpacity="0.08" />
            <circle cx="15%" cy="52%" r="3.5" fill="white" fillOpacity="0.06" />
            <circle cx="30%" cy="52%" r="3.5" fill="white" fillOpacity="0.06" />
            <line x1="21%" y1="39%" x2="17%" y2="49%" stroke="white" strokeWidth="1" strokeOpacity="0.07" />
            <line x1="24%" y1="39%" x2="28%" y2="49%" stroke="white" strokeWidth="1" strokeOpacity="0.07" />
          </g>
          {/* Floating sort bars */}
          <g style={{ animation: 'sc-drift-med 7s ease-in-out infinite' }}>
            <rect x="40%" y="72%" width="3" height="8" rx="1" fill="white" fillOpacity="0.08" />
            <rect x="45%" y="68%" width="3" height="12" rx="1" fill="white" fillOpacity="0.1" />
            <rect x="50%" y="74%" width="3" height="6" rx="1" fill="white" fillOpacity="0.06" />
            <rect x="55%" y="66%" width="3" height="14" rx="1" fill="white" fillOpacity="0.09" />
            <rect x="60%" y="71%" width="3" height="9" rx="1" fill="white" fillOpacity="0.07" />
          </g>
          {/* Pulsing glow */}
          <circle cx="85%" cy="70%" r="10" fill="white" fillOpacity="0.05" style={{ animation: 'sc-pulse-glow 4.5s ease-in-out infinite' }} />
          <circle cx="10%" cy="75%" r="6" fill="white" fillOpacity="0.04" style={{ animation: 'sc-pulse-glow 5.5s ease-in-out infinite 1.5s' }} />
        </>
      ),
    };
  }

  // Web Technology
  if (lower.includes('web') || lower.includes('html') || lower.includes('css') || lower.includes('javascript') || lower.includes('frontend') || lower.includes('react')) {
    return {
      label: 'Web Dev',
      elements: (
        <>
          {/* Floating code brackets */}
          <g style={{ animation: 'sc-drift-slow 8s ease-in-out infinite' }}>
            <text x="70%" y="30%" fill="white" fillOpacity="0.14" fontSize="22" fontFamily="monospace" fontWeight="bold">&lt;/&gt;</text>
          </g>
          <g style={{ animation: 'sc-drift-fast 11s ease-in-out infinite' }}>
            <text x="15%" y="60%" fill="white" fillOpacity="0.08" fontSize="14" fontFamily="monospace">&lt;div&gt;</text>
          </g>
          <g style={{ animation: 'sc-drift-med 9s ease-in-out infinite' }}>
            <text x="50%" y="75%" fill="white" fillOpacity="0.06" fontSize="11" fontFamily="monospace">{'{ }'}</text>
          </g>
          {/* Flowing code lines */}
          <g style={{ animation: 'sc-float-x 6s ease-in-out infinite' }}>
            <rect x="60%" y="50%" width="30" height="2" rx="1" fill="white" fillOpacity="0.1" />
            <rect x="63%" y="56%" width="22" height="2" rx="1" fill="white" fillOpacity="0.07" />
            <rect x="58%" y="62%" width="26" height="2" rx="1" fill="white" fillOpacity="0.08" />
          </g>
          <g style={{ animation: 'sc-float-x 8s ease-in-out infinite 2s' }}>
            <rect x="10%" y="32%" width="24" height="2" rx="1" fill="white" fillOpacity="0.08" />
            <rect x="14%" y="38%" width="18" height="2" rx="1" fill="white" fillOpacity="0.06" />
          </g>
          {/* Glowing dots */}
          <circle cx="42%" cy="22%" r="3" fill="white" fillOpacity="0.08" style={{ animation: 'sc-pulse-glow 3.5s ease-in-out infinite' }} />
          <circle cx="88%" cy="72%" r="5" fill="white" fillOpacity="0.06" style={{ animation: 'sc-pulse-glow 4s ease-in-out infinite 1s' }} />
          <circle cx="30%" cy="80%" r="10" fill="white" fillOpacity="0.04" style={{ animation: 'sc-pulse-glow 5s ease-in-out infinite 2s' }} />
        </>
      ),
    };
  }

  // Compiler Design
  if (lower.includes('compiler') || lower.includes('parsing') || lower.includes('lexer')) {
    return {
      label: 'Compilers',
      elements: (
        <>
          {/* Flowing gear shapes */}
          <g style={{ animation: 'sc-drift-slow 10s ease-in-out infinite' }}>
            <circle cx="72%" cy="35%" r="12" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.1" />
            <circle cx="72%" cy="35%" r="7" stroke="white" strokeWidth="1" fill="white" fillOpacity="0.05" strokeOpacity="0.08" />
          </g>
          <g style={{ animation: 'sc-drift-fast 8s ease-in-out infinite' }}>
            <circle cx="25%" cy="50%" r="9" stroke="white" strokeWidth="1.2" fill="none" strokeOpacity="0.08" />
            <circle cx="25%" cy="50%" r="5" fill="white" fillOpacity="0.04" />
          </g>
          {/* Flowing arrows (pipeline) */}
          <g style={{ animation: 'sc-float-x 6s ease-in-out infinite' }}>
            <rect x="15%" y="25%" width="16" height="10" rx="3" stroke="white" strokeWidth="1" fill="white" fillOpacity="0.06" strokeOpacity="0.08" />
            <path d="M calc(15% + 20px) calc(25% + 5px) L calc(15% + 30px) calc(25% + 5px)" stroke="white" strokeWidth="1.2" strokeOpacity="0.1" />
            <rect x="calc(15% + 34px)" y="25%" width="16" height="10" rx="3" stroke="white" strokeWidth="1" fill="white" fillOpacity="0.06" strokeOpacity="0.08" />
          </g>
          {/* Token symbols */}
          <g style={{ animation: 'sc-drift-med 12s ease-in-out infinite' }}>
            <text x="55%" y="70%" fill="white" fillOpacity="0.07" fontSize="10" fontFamily="monospace">tok</text>
            <text x="70%" y="78%" fill="white" fillOpacity="0.05" fontSize="9" fontFamily="monospace">AST</text>
          </g>
          <circle cx="85%" cy="65%" r="6" fill="white" fillOpacity="0.05" style={{ animation: 'sc-pulse-glow 4s ease-in-out infinite' }} />
        </>
      ),
    };
  }

  // Operating Systems
  if (lower.includes('operating system') || lower.includes('os ') || code.toUpperCase().includes('OS')) {
    return {
      label: 'OS',
      elements: (
        <>
          {/* Floating terminal window */}
          <g style={{ animation: 'sc-drift-slow 9s ease-in-out infinite' }}>
            <rect x="60%" y="18%" width="32" height="24" rx="4" stroke="white" strokeWidth="1.2" fill="white" fillOpacity="0.06" strokeOpacity="0.1" />
            <line x1="60%" y1="24%" x2="calc(60% + 32px)" y2="24%" stroke="white" strokeWidth="0.8" strokeOpacity="0.08" />
            <circle cx="calc(60% + 5px)" cy="21%" r="1.5" fill="white" fillOpacity="0.12" />
            <circle cx="calc(60% + 10px)" cy="21%" r="1.5" fill="white" fillOpacity="0.1" />
          </g>
          {/* Prompt lines drifting */}
          <g style={{ animation: 'sc-float-x 7s ease-in-out infinite' }}>
            <text x="18%" y="45%" fill="white" fillOpacity="0.08" fontSize="10" fontFamily="monospace">$ _</text>
            <rect x="18%" y="50%" width="28" height="2" rx="1" fill="white" fillOpacity="0.07" />
            <rect x="18%" y="55%" width="20" height="2" rx="1" fill="white" fillOpacity="0.05" />
          </g>
          {/* Process blocks */}
          <g style={{ animation: 'sc-drift-fast 10s ease-in-out infinite' }}>
            <rect x="50%" y="60%" width="10" height="8" rx="2" fill="white" fillOpacity="0.07" />
            <rect x="64%" y="58%" width="10" height="12" rx="2" fill="white" fillOpacity="0.06" />
            <rect x="78%" y="62%" width="10" height="6" rx="2" fill="white" fillOpacity="0.05" />
          </g>
          <circle cx="40%" cy="75%" r="8" fill="white" fillOpacity="0.04" style={{ animation: 'sc-pulse-glow 5s ease-in-out infinite' }} />
        </>
      ),
    };
  }

  // Computer Networks
  if (lower.includes('network') || lower.includes('tcp') || lower.includes('protocol')) {
    return {
      label: 'Networks',
      elements: (
        <>
          {/* Floating network nodes */}
          <g style={{ animation: 'sc-drift-slow 8s ease-in-out infinite' }}>
            <circle cx="70%" cy="30%" r="5" fill="white" fillOpacity="0.12" />
            <circle cx="85%" cy="50%" r="4" fill="white" fillOpacity="0.09" />
            <circle cx="65%" cy="55%" r="4" fill="white" fillOpacity="0.08" />
            <line x1="73%" y1="33%" x2="83%" y2="47%" stroke="white" strokeWidth="1" strokeOpacity="0.1" />
            <line x1="68%" y1="34%" x2="66%" y2="51%" stroke="white" strokeWidth="1" strokeOpacity="0.08" />
            <line x1="69%" y1="55%" x2="81%" y2="50%" stroke="white" strokeWidth="1" strokeOpacity="0.07" />
          </g>
          <g style={{ animation: 'sc-drift-fast 11s ease-in-out infinite' }}>
            <circle cx="20%" cy="40%" r="4.5" fill="white" fillOpacity="0.08" />
            <circle cx="35%" cy="28%" r="3.5" fill="white" fillOpacity="0.07" />
            <circle cx="30%" cy="60%" r="3" fill="white" fillOpacity="0.06" />
            <line x1="22%" y1="37%" x2="33%" y2="31%" stroke="white" strokeWidth="1" strokeOpacity="0.07" />
            <line x1="22%" y1="43%" x2="29%" y2="57%" stroke="white" strokeWidth="1" strokeOpacity="0.06" />
          </g>
          {/* Traveling data dots */}
          <g style={{ animation: 'sc-float-x 5s ease-in-out infinite' }}>
            <circle cx="50%" cy="72%" r="2" fill="white" fillOpacity="0.12" />
            <circle cx="55%" cy="72%" r="1.5" fill="white" fillOpacity="0.1" />
            <circle cx="59%" cy="72%" r="1" fill="white" fillOpacity="0.08" />
          </g>
          <circle cx="50%" cy="18%" r="10" fill="white" fillOpacity="0.04" style={{ animation: 'sc-pulse-glow 4s ease-in-out infinite' }} />
        </>
      ),
    };
  }

  // Mathematics
  if (lower.includes('math') || lower.includes('calculus') || lower.includes('discrete') || lower.includes('linear algebra') || lower.includes('statistics')) {
    return {
      label: 'Math',
      elements: (
        <>
          <g style={{ animation: 'sc-drift-slow 9s ease-in-out infinite' }}>
            <text x="65%" y="32%" fill="white" fillOpacity="0.12" fontSize="20" fontFamily="serif">∫</text>
          </g>
          <g style={{ animation: 'sc-drift-fast 10s ease-in-out infinite' }}>
            <text x="22%" y="50%" fill="white" fillOpacity="0.09" fontSize="16" fontFamily="serif">∑</text>
          </g>
          <g style={{ animation: 'sc-drift-med 8s ease-in-out infinite' }}>
            <text x="78%" y="65%" fill="white" fillOpacity="0.07" fontSize="14" fontFamily="serif">π</text>
          </g>
          <g style={{ animation: 'sc-wiggle 6s ease-in-out infinite' }}>
            <text x="40%" y="75%" fill="white" fillOpacity="0.06" fontSize="12" fontFamily="serif">∞</text>
          </g>
          <g style={{ animation: 'sc-drift-slow 12s ease-in-out infinite' }}>
            <text x="50%" y="22%" fill="white" fillOpacity="0.06" fontSize="10" fontFamily="serif">Δ</text>
            <text x="15%" y="30%" fill="white" fillOpacity="0.05" fontSize="11" fontFamily="serif">λ</text>
          </g>
          {/* Flowing curve */}
          <g style={{ animation: 'sc-float-x 7s ease-in-out infinite' }}>
            <path d="M 10% 68% Q 20% 55% 30% 68% Q 40% 80% 50% 68%" stroke="white" strokeWidth="1.2" fill="none" strokeOpacity="0.08" />
          </g>
          <circle cx="88%" cy="40%" r="8" fill="white" fillOpacity="0.04" style={{ animation: 'sc-pulse-glow 5s ease-in-out infinite' }} />
        </>
      ),
    };
  }

  // Software Engineering
  if (lower.includes('software') || lower.includes('engineering') || lower.includes('sdlc') || lower.includes('uml')) {
    return {
      label: 'SE',
      elements: (
        <>
          {/* Floating sprint cycle */}
          <g style={{ animation: 'sc-drift-slow 10s ease-in-out infinite' }}>
            <circle cx="72%" cy="38%" r="16" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.1" strokeDasharray="6 4" />
            <circle cx="72%" cy="38%" r="5" fill="white" fillOpacity="0.06" />
          </g>
          {/* Flowing UML boxes */}
          <g style={{ animation: 'sc-drift-fast 8s ease-in-out infinite' }}>
            <rect x="15%" y="30%" width="18" height="12" rx="3" stroke="white" strokeWidth="1" fill="white" fillOpacity="0.06" strokeOpacity="0.09" />
            <rect x="15%" y="58%" width="18" height="12" rx="3" stroke="white" strokeWidth="1" fill="white" fillOpacity="0.05" strokeOpacity="0.07" />
            <line x1="24%" y1="42%" x2="24%" y2="58%" stroke="white" strokeWidth="1" strokeOpacity="0.07" />
          </g>
          {/* Kanban cols */}
          <g style={{ animation: 'sc-float-x 7s ease-in-out infinite' }}>
            <rect x="48%" y="65%" width="8" height="14" rx="2" fill="white" fillOpacity="0.06" />
            <rect x="58%" y="62%" width="8" height="18" rx="2" fill="white" fillOpacity="0.05" />
            <rect x="68%" y="67%" width="8" height="12" rx="2" fill="white" fillOpacity="0.04" />
          </g>
          <circle cx="88%" cy="70%" r="6" fill="white" fillOpacity="0.04" style={{ animation: 'sc-pulse-glow 4.5s ease-in-out infinite' }} />
        </>
      ),
    };
  }

  // Physics / Electronics
  if (lower.includes('physics') || lower.includes('electronic') || lower.includes('circuit') || lower.includes('signal')) {
    return {
      label: 'Electronics',
      elements: (
        <>
          {/* Flowing waveforms */}
          <g style={{ animation: 'sc-float-x 6s ease-in-out infinite' }}>
            <path d="M 5% 40% Q 15% 20% 25% 40% Q 35% 60% 45% 40% Q 55% 20% 65% 40% Q 75% 60% 85% 40%" stroke="white" strokeWidth="1.5" fill="none" strokeOpacity="0.1" />
          </g>
          <g style={{ animation: 'sc-float-x 8s ease-in-out infinite 2s' }}>
            <path d="M 10% 65% Q 20% 50% 30% 65% Q 40% 80% 50% 65% Q 60% 50% 70% 65%" stroke="white" strokeWidth="1" fill="none" strokeOpacity="0.06" />
          </g>
          {/* Circuit nodes */}
          <g style={{ animation: 'sc-drift-slow 9s ease-in-out infinite' }}>
            <circle cx="75%" cy="25%" r="4" fill="white" fillOpacity="0.1" />
            <circle cx="85%" cy="55%" r="3" fill="white" fillOpacity="0.07" />
            <line x1="77%" y1="28%" x2="83%" y2="52%" stroke="white" strokeWidth="1" strokeOpacity="0.07" />
          </g>
          <circle cx="20%" cy="78%" r="8" fill="white" fillOpacity="0.04" style={{ animation: 'sc-pulse-glow 5s ease-in-out infinite' }} />
        </>
      ),
    };
  }

  // Machine Learning / AI
  if (lower.includes('machine learning') || lower.includes('artificial intelligence') || lower.includes('deep learning') || lower.includes('neural')) {
    return {
      label: 'AI/ML',
      elements: (
        <>
          {/* Floating neural network */}
          <g style={{ animation: 'sc-drift-slow 10s ease-in-out infinite' }}>
            {/* Input layer */}
            <circle cx="20%" cy="25%" r="3" fill="white" fillOpacity="0.1" />
            <circle cx="20%" cy="45%" r="3" fill="white" fillOpacity="0.1" />
            <circle cx="20%" cy="65%" r="3" fill="white" fillOpacity="0.1" />
            {/* Hidden layer */}
            <circle cx="45%" cy="32%" r="3.5" fill="white" fillOpacity="0.08" />
            <circle cx="45%" cy="55%" r="3.5" fill="white" fillOpacity="0.08" />
            {/* Output */}
            <circle cx="68%" cy="42%" r="4" fill="white" fillOpacity="0.12" />
            {/* Connections */}
            <line x1="23%" y1="25%" x2="42%" y2="32%" stroke="white" strokeWidth="0.8" strokeOpacity="0.06" />
            <line x1="23%" y1="25%" x2="42%" y2="55%" stroke="white" strokeWidth="0.8" strokeOpacity="0.05" />
            <line x1="23%" y1="45%" x2="42%" y2="32%" stroke="white" strokeWidth="0.8" strokeOpacity="0.06" />
            <line x1="23%" y1="45%" x2="42%" y2="55%" stroke="white" strokeWidth="0.8" strokeOpacity="0.05" />
            <line x1="23%" y1="65%" x2="42%" y2="32%" stroke="white" strokeWidth="0.8" strokeOpacity="0.04" />
            <line x1="23%" y1="65%" x2="42%" y2="55%" stroke="white" strokeWidth="0.8" strokeOpacity="0.05" />
            <line x1="48%" y1="32%" x2="64%" y2="42%" stroke="white" strokeWidth="1" strokeOpacity="0.07" />
            <line x1="48%" y1="55%" x2="64%" y2="42%" stroke="white" strokeWidth="1" strokeOpacity="0.07" />
          </g>
          {/* Floating data points */}
          <g style={{ animation: 'sc-drift-fast 7s ease-in-out infinite' }}>
            <circle cx="78%" cy="22%" r="2" fill="white" fillOpacity="0.1" />
            <circle cx="82%" cy="28%" r="1.5" fill="white" fillOpacity="0.08" />
            <circle cx="85%" cy="18%" r="1.8" fill="white" fillOpacity="0.07" />
            <circle cx="90%" cy="25%" r="2.2" fill="white" fillOpacity="0.06" />
          </g>
          <g style={{ animation: 'sc-drift-med 9s ease-in-out infinite' }}>
            <circle cx="80%" cy="68%" r="2" fill="white" fillOpacity="0.08" />
            <circle cx="75%" cy="75%" r="1.5" fill="white" fillOpacity="0.06" />
            <circle cx="88%" cy="72%" r="1.8" fill="white" fillOpacity="0.07" />
          </g>
          <circle cx="50%" cy="80%" r="10" fill="white" fillOpacity="0.03" style={{ animation: 'sc-pulse-glow 4s ease-in-out infinite' }} />
        </>
      ),
    };
  }

  // Generic fallback — floating book / document shapes
  return {
    label: 'Course',
    elements: (
      <>
        <g style={{ animation: 'sc-drift-slow 9s ease-in-out infinite' }}>
          <rect x="65%" y="22%" width="20" height="26" rx="3" stroke="white" strokeWidth="1.2" fill="white" fillOpacity="0.06" strokeOpacity="0.1" />
          <line x1="75%" y1="22%" x2="75%" y2="48%" stroke="white" strokeWidth="0.8" strokeOpacity="0.06" />
          <rect x="68%" y="30%" width="5" height="1.5" rx="0.5" fill="white" fillOpacity="0.08" />
          <rect x="68%" y="35%" width="4" height="1.5" rx="0.5" fill="white" fillOpacity="0.06" />
        </g>
        <g style={{ animation: 'sc-drift-fast 10s ease-in-out infinite' }}>
          <rect x="15%" y="45%" width="16" height="20" rx="2" stroke="white" strokeWidth="1" fill="white" fillOpacity="0.05" strokeOpacity="0.07" />
          <rect x="18%" y="52%" width="8" height="1.5" rx="0.5" fill="white" fillOpacity="0.06" />
          <rect x="18%" y="56%" width="6" height="1.5" rx="0.5" fill="white" fillOpacity="0.05" />
        </g>
        <circle cx="50%" cy="30%" r="12" fill="white" fillOpacity="0.04" style={{ animation: 'sc-pulse-glow 5s ease-in-out infinite' }} />
        <circle cx="85%" cy="70%" r="8" fill="white" fillOpacity="0.03" style={{ animation: 'sc-pulse-glow 4s ease-in-out infinite 1.5s' }} />
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

  const notesCoverage = progress && progress.total_notes > 0
    ? Math.round((progress.notes_viewed / progress.total_notes) * 100)
    : 0;

  const isHighWeightage = true;
  const isWeakArea = progress && notesCoverage < 50;

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
        {/* Thumbnail with animated flowing elements */}
        <div
          className="relative h-36 flex items-end p-3 overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${gradFrom}, ${gradTo})`,
          }}
        >
          {/* Animated flowing SVG layer */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="xMidYMid slice">
            {theme.elements}
          </svg>

          {/* Course type label — top left */}
          <span className="absolute top-3 left-3 px-2 py-0.5 bg-white/15 backdrop-blur-sm rounded-md text-[9px] font-semibold text-white uppercase tracking-widest z-10">
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
          <div>
            <h3 className="font-bold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
              {subject.name}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">{subject.code}</p>
          </div>

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
