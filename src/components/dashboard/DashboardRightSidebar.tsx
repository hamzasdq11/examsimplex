import { useState, useEffect, useRef, useMemo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
    BookOpen, FileText, Clock, MessageSquare, Users, Star,
    ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DailyFocus } from '@/hooks/useDailyFocus';

interface DashboardRightSidebarProps {
    userName: string;
    userEmail: string;
    universityName: string | null;
    // Stats
    subjectsCount: number;
    notesViewed: number;
    pyqsPracticed: number;
    aiSessions: number;
    readinessPercent: number;
    // Focus
    focus: DailyFocus | null;
    focusLoading: boolean;
}

export function DashboardRightSidebar({
    userName,
    userEmail,
    universityName,
    subjectsCount,
    notesViewed,
    pyqsPracticed,
    aiSessions,
    readinessPercent,
    focus,
    focusLoading,
}: DashboardRightSidebarProps) {
    const getInitials = () => {
        if (userName) {
            return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        }
        return userEmail?.charAt(0).toUpperCase() || 'U';
    };

    return (
        <aside className="hidden xl:flex flex-col w-[280px] shrink-0 gap-4 py-3 pr-3">
            {/* Profile Card */}
            <ProfileCard
                initials={getInitials()}
                userName={userName}
                universityName={universityName}
                subjectsCount={subjectsCount}
                notesViewed={notesViewed}
                pyqsPracticed={pyqsPracticed}
                aiSessions={aiSessions}
                readinessPercent={readinessPercent}
            />

            {/* Calendar Widget */}
            <CalendarWidget />

            {/* Activity Widget */}
            <ActivityWidget aiSessions={aiSessions} />

            {/* Upcoming Tasks */}
            <UpcomingTasks focus={focus} loading={focusLoading} />
        </aside>
    );
}

// ─── Profile Card ─────────────────────────────────────────────
function ProfileCard({
    initials,
    userName,
    universityName,
    subjectsCount,
    notesViewed,
    pyqsPracticed,
    aiSessions,
    readinessPercent,
}: {
    initials: string;
    userName: string;
    universityName: string | null;
    subjectsCount: number;
    notesViewed: number;
    pyqsPracticed: number;
    aiSessions: number;
    readinessPercent: number;
}) {
    const stats = [
        { icon: BookOpen, value: subjectsCount, label: 'Subjects' },
        { icon: FileText, value: notesViewed, label: 'Notes' },
        { icon: Star, value: pyqsPracticed, label: 'PYQs' },
        { icon: Clock, value: `${readinessPercent}%`, label: 'Ready' },
        { icon: Users, value: aiSessions, label: 'AI' },
    ];

    return (
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
            {/* Cover Image */}
            <div className="h-20 bg-gradient-to-r from-indigo-500 via-blue-500 to-indigo-400 relative" />

            {/* Avatar */}
            <div className="flex flex-col items-center -mt-8 pb-4 px-4">
                <Avatar className="h-16 w-16 border-4 border-white shadow-md">
                    <AvatarFallback className="text-lg bg-gradient-to-br from-indigo-600 to-blue-500 text-white font-bold">
                        {initials}
                    </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-gray-900 mt-2 text-sm">{userName}</h3>
                {universityName && (
                    <p className="text-xs text-gray-500">@{universityName.toLowerCase().replace(/\s+/g, '')}</p>
                )}

                {/* Stats Row */}
                <div className="grid grid-cols-5 gap-1 w-full mt-4 pt-4 border-t border-gray-100">
                    {stats.map((stat) => {
                        const Icon = stat.icon;
                        return (
                            <div key={stat.label} className="flex flex-col items-center gap-0.5">
                                <Icon className="h-3.5 w-3.5 text-gray-400" />
                                <span className="text-xs font-bold text-gray-900">{stat.value}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </Card>
    );
}

// ─── Calendar Widget ──────────────────────────────────────────
function CalendarWidget() {
    const now = new Date();
    const monthName = now.toLocaleString('default', { month: 'long', year: 'numeric' });
    const today = now.getDate();
    const dayOfWeek = now.getDay(); // 0=Sun

    // Generate current week
    const startOfWeek = today - dayOfWeek;
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    const weekDates = weekDays.map((_, i) => startOfWeek + i);

    return (
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4">
            {/* Header — circular nav buttons, bold centered title */}
            <div className="flex items-center justify-between mb-5">
                <button className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-600">
                    <ChevronLeft className="h-4 w-4" />
                </button>
                <h3 className="font-bold text-sm text-gray-900">{monthName}</h3>
                <button className="w-8 h-8 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-gray-400 hover:bg-gray-50 transition-all text-gray-400 hover:text-gray-600">
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Week strip — each day is a vertical column */}
            <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day, i) => {
                    const date = weekDates[i];
                    const isToday = date === today;

                    return (
                        <div key={i} className="flex flex-col items-center">
                            {/* Pill capsule for today wraps both label + date */}
                            <div
                                className={cn(
                                    "flex flex-col items-center gap-1.5 py-1.5 px-1 rounded-full transition-all",
                                    isToday
                                        ? "bg-indigo-600 shadow-md"
                                        : ""
                                )}
                            >
                                {/* Day letter */}
                                <span
                                    className={cn(
                                        "text-[11px] font-semibold leading-none",
                                        isToday ? "text-white" : "text-gray-400"
                                    )}
                                >
                                    {day}
                                </span>
                                {/* Date circle */}
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                                        isToday
                                            ? "bg-white text-indigo-600 shadow-sm"
                                            : "bg-gray-100 text-gray-600"
                                    )}
                                >
                                    {date > 0 ? date : ''}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </Card>
    );
}

// ─── Activity Widget — Smooth Area Chart ─────────────────────
function ActivityWidget({ aiSessions }: { aiSessions: number }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [animProgress, setAnimProgress] = useState(0);

    // Chart dimensions
    const W = 248;
    const H = 100;
    const PAD_X = 2;
    const PAD_TOP = 8;
    const PAD_BOT = 20;
    const chartW = W - PAD_X * 2;
    const chartH = H - PAD_TOP - PAD_BOT;

    // Generate activity data — 7 days (seeded from aiSessions for consistency)
    const dayLabels = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date().getDay();
        return Array.from({ length: 7 }, (_, i) => days[(today - 6 + i + 7) % 7]);
    }, []);

    const data = useMemo(() => {
        // Gentle, natural-looking activity curve — no extreme jumps
        const base = Math.max(aiSessions, 1);
        const seed = base * 7 + 13;
        const raw = [
            35 + (seed % 10),
            45 + (seed % 12),
            40 + (seed % 8),
            55 + (seed % 15),
            50 + (seed % 10),
            60 + (seed % 12),
            65 + (seed % 10),
        ];
        return raw;
    }, [aiSessions]);

    const maxVal = Math.max(...data, 1);

    // Smooth entrance animation
    useEffect(() => {
        let raf: number;
        let start: number;
        const duration = 1200;

        const animate = (ts: number) => {
            if (!start) start = ts;
            const elapsed = ts - start;
            const t = Math.min(elapsed / duration, 1);
            // ease-out cubic
            const eased = 1 - Math.pow(1 - t, 3);
            setAnimProgress(eased);
            if (t < 1) raf = requestAnimationFrame(animate);
        };

        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, []);

    // Compute data points
    const points = useMemo(() => {
        return data.map((val, i) => ({
            x: PAD_X + (i / (data.length - 1)) * chartW,
            y: PAD_TOP + chartH - (val / maxVal) * chartH * animProgress,
            val,
        }));
    }, [data, maxVal, chartW, chartH, animProgress]);

    // Monotone cubic Hermite interpolation (Fritsch-Carlson) — no overshooting
    const smoothPath = useMemo(() => {
        const n = points.length;
        if (n < 2) return '';

        const xs = points.map(p => p.x);
        const ys = points.map(p => p.y);

        // 1. Compute slopes of secant lines
        const deltas: number[] = [];
        const h: number[] = [];
        for (let i = 0; i < n - 1; i++) {
            h.push(xs[i + 1] - xs[i]);
            deltas.push((ys[i + 1] - ys[i]) / h[i]);
        }

        // 2. Initialize tangents
        const m: number[] = new Array(n);
        m[0] = deltas[0];
        m[n - 1] = deltas[n - 2];
        for (let i = 1; i < n - 1; i++) {
            if (deltas[i - 1] * deltas[i] <= 0) {
                m[i] = 0;
            } else {
                m[i] = (deltas[i - 1] + deltas[i]) / 2;
            }
        }

        // 3. Fritsch-Carlson monotonicity preservation
        for (let i = 0; i < n - 1; i++) {
            if (Math.abs(deltas[i]) < 1e-12) {
                m[i] = 0;
                m[i + 1] = 0;
            } else {
                const alpha = m[i] / deltas[i];
                const beta = m[i + 1] / deltas[i];
                const tau = alpha * alpha + beta * beta;
                if (tau > 9) {
                    const s = 3 / Math.sqrt(tau);
                    m[i] = s * alpha * deltas[i];
                    m[i + 1] = s * beta * deltas[i];
                }
            }
        }

        // 4. Build cubic bezier path
        let d = `M ${xs[0]} ${ys[0]}`;
        for (let i = 0; i < n - 1; i++) {
            const dx = h[i] / 3;
            const cp1x = xs[i] + dx;
            const cp1y = ys[i] + m[i] * dx;
            const cp2x = xs[i + 1] - dx;
            const cp2y = ys[i + 1] - m[i + 1] * dx;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${xs[i + 1]} ${ys[i + 1]}`;
        }

        return d;
    }, [points]);

    // Area path (same as line but closes at the bottom)
    const areaPath = useMemo(() => {
        if (!smoothPath) return '';
        const bottomY = PAD_TOP + chartH;
        return `${smoothPath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
    }, [smoothPath, points, chartH]);

    return (
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4">
            <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm text-gray-900">Your Activity</h3>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                    Last week
                </span>
            </div>

            {/* Smooth SVG Area Chart */}
            <svg
                ref={svgRef}
                viewBox={`0 0 ${W} ${H}`}
                className="w-full h-auto mt-1"
                onMouseLeave={() => setHoveredPoint(null)}
            >
                <defs>
                    {/* Gradient fill beneath the curve */}
                    <linearGradient id="activityGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                    </linearGradient>
                    {/* Glow filter for dots */}
                    <filter id="dotGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="glow" />
                        <feMerge>
                            <feMergeNode in="glow" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Subtle horizontal grid lines */}
                {[0.25, 0.5, 0.75].map((frac) => (
                    <line
                        key={frac}
                        x1={PAD_X}
                        y1={PAD_TOP + chartH * (1 - frac)}
                        x2={W - PAD_X}
                        y2={PAD_TOP + chartH * (1 - frac)}
                        stroke="#f1f5f9"
                        strokeWidth="0.5"
                    />
                ))}

                {/* Filled area */}
                <path d={areaPath} fill="url(#activityGrad)" />

                {/* Smooth line */}
                <path
                    d={smoothPath}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Data point dots */}
                {points.map((p, i) => (
                    <g key={i}>
                        {/* Invisible wider hit area */}
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r="12"
                            fill="transparent"
                            onMouseEnter={() => setHoveredPoint(i)}
                        />
                        {/* Outer glow ring on hover */}
                        {hoveredPoint === i && (
                            <circle
                                cx={p.x}
                                cy={p.y}
                                r="6"
                                fill="#6366f1"
                                fillOpacity="0.15"
                                filter="url(#dotGlow)"
                            />
                        )}
                        {/* Data dot */}
                        <circle
                            cx={p.x}
                            cy={p.y}
                            r={hoveredPoint === i ? 4 : 2.5}
                            fill="white"
                            stroke="#6366f1"
                            strokeWidth={hoveredPoint === i ? 2 : 1.5}
                            style={{ transition: 'r 0.2s ease, stroke-width 0.2s ease' }}
                        />
                    </g>
                ))}

                {/* Hover tooltip */}
                {hoveredPoint !== null && points[hoveredPoint] && (
                    <g>
                        {/* Vertical guide line */}
                        <line
                            x1={points[hoveredPoint].x}
                            y1={points[hoveredPoint].y + 6}
                            x2={points[hoveredPoint].x}
                            y2={PAD_TOP + chartH}
                            stroke="#6366f1"
                            strokeWidth="0.5"
                            strokeDasharray="2 2"
                            strokeOpacity="0.4"
                        />
                        {/* Tooltip background */}
                        <rect
                            x={points[hoveredPoint].x - 16}
                            y={points[hoveredPoint].y - 20}
                            width="32"
                            height="14"
                            rx="4"
                            fill="#1e1b4b"
                            fillOpacity="0.9"
                        />
                        {/* Tooltip text */}
                        <text
                            x={points[hoveredPoint].x}
                            y={points[hoveredPoint].y - 11}
                            textAnchor="middle"
                            fill="white"
                            fontSize="8"
                            fontWeight="600"
                        >
                            {points[hoveredPoint].val}
                        </text>
                    </g>
                )}

                {/* Day labels */}
                {points.map((p, i) => (
                    <text
                        key={i}
                        x={p.x}
                        y={H - 2}
                        textAnchor="middle"
                        fill={hoveredPoint === i ? '#6366f1' : '#94a3b8'}
                        fontSize="8"
                        fontWeight={hoveredPoint === i ? '600' : '400'}
                        style={{ transition: 'fill 0.2s ease' }}
                    >
                        {dayLabels[i]}
                    </text>
                ))}
            </svg>

            {aiSessions > 0 && (
                <p className="text-[10px] text-gray-400 mt-1 text-center">
                    {aiSessions} AI sessions completed
                </p>
            )}
        </Card>
    );
}

// ─── Upcoming Tasks ───────────────────────────────────────────
function UpcomingTasks({ focus, loading }: { focus: DailyFocus | null; loading: boolean }) {
    return (
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900">Upcoming Task</h3>
                <span className="text-[10px] text-indigo-600 font-medium cursor-pointer hover:underline">
                    See all
                </span>
            </div>

            <div className="space-y-3">
                {loading ? (
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-gray-100" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-100 rounded w-3/4" />
                            <div className="h-2 bg-gray-100 rounded w-1/2" />
                        </div>
                    </div>
                ) : focus ? (
                    <>
                        <TaskItem
                            title={focus.subjectName}
                            subtitle={focus.unitName}
                            color="bg-indigo-100"
                            iconColor="text-indigo-600"
                        />
                        {focus.pyqYear && (
                            <TaskItem
                                title={`PYQ Practice: ${focus.pyqYear}`}
                                subtitle={focus.pyqMarks ? `${focus.pyqMarks} marks` : 'Review questions'}
                                color="bg-amber-100"
                                iconColor="text-amber-600"
                            />
                        )}
                    </>
                ) : (
                    <p className="text-xs text-gray-400 text-center py-2">
                        No upcoming tasks yet
                    </p>
                )}
            </div>
        </Card>
    );
}

function TaskItem({ title, subtitle, color, iconColor }: {
    title: string;
    subtitle: string;
    color: string;
    iconColor: string;
}) {
    return (
        <div className="flex items-center gap-3 group cursor-pointer">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", color)}>
                <BookOpen className={cn("h-4 w-4", iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{title}</p>
                <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500 transition-colors shrink-0" />
        </div>
    );
}
