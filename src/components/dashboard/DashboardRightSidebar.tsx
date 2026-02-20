import { useState, useEffect, useRef, useMemo } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import {
    BookOpen, FileText, Clock, MessageSquare, Users, Star,
    ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon,
    Flame, Plus, Calendar as CalendarIcon, Trash2, Zap, Target,
    TrendingUp, Award, Bell, GraduationCap, Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DailyFocus } from '@/hooks/useDailyFocus';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { format, isSameDay } from 'date-fns';

interface DashboardRightSidebarProps {
    userName: string;
    userEmail: string;
    universityName: string | null;
    subjectsCount: number;
    notesViewed: number;
    pyqsPracticed: number;
    aiSessions: number;
    readinessPercent: number;
    focus: DailyFocus | null;
    focusLoading: boolean;
}

export function DashboardRightSidebar({
    userName, userEmail, universityName,
    subjectsCount, notesViewed, pyqsPracticed, aiSessions, readinessPercent,
    focus, focusLoading,
}: DashboardRightSidebarProps) {
    const getInitials = () => {
        if (userName) return userName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        return userEmail?.charAt(0).toUpperCase() || 'U';
    };

    return (
        <aside className="hidden xl:flex flex-col w-[280px] shrink-0 py-3 pr-3 overflow-hidden">
            <div className="flex flex-col gap-3 overflow-y-auto overflow-x-hidden h-full pr-0.5 pb-24 [&>*]:shrink-0" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <ProfileCard
                    initials={getInitials()} userName={userName} universityName={universityName}
                    subjectsCount={subjectsCount} notesViewed={notesViewed}
                    pyqsPracticed={pyqsPracticed} aiSessions={aiSessions} readinessPercent={readinessPercent}
                />
                <InteractiveCalendarWidget />
                <StreakWidget currentStreak={12} maxStreak={15} />
                <ActivityWidget aiSessions={aiSessions} />
                <HeatmapWidget aiSessions={aiSessions} />
                <UpcomingTasks focus={focus} loading={focusLoading} />
            </div>
        </aside>
    );
}

/* ════════════════════════════════════════════════════════════════
   PROFILE CARD — Glassmorphism hero + ring avatar + stat pills
   ════════════════════════════════════════════════════════════════ */
function ProfileCard({
    initials, userName, universityName,
    subjectsCount, notesViewed, pyqsPracticed, aiSessions, readinessPercent,
}: {
    initials: string; userName: string; universityName: string | null;
    subjectsCount: number; notesViewed: number; pyqsPracticed: number;
    aiSessions: number; readinessPercent: number;
}) {
    const stats = [
        { icon: BookOpen, value: subjectsCount, label: 'Subjects', color: 'text-indigo-500' },
        { icon: FileText, value: notesViewed, label: 'Notes', color: 'text-emerald-500' },
        { icon: Star, value: pyqsPracticed, label: 'PYQs', color: 'text-amber-500' },
        { icon: Target, value: `${readinessPercent}%`, label: 'Ready', color: 'text-rose-500' },
        { icon: Sparkles, value: aiSessions, label: 'AI', color: 'text-violet-500' },
    ];

    return (
        <Card className="rounded-2xl shadow-sm border border-gray-100/60 overflow-hidden bg-white">
            {/* Animated gradient banner */}
            <div className="h-[52px] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-violet-500 to-purple-600" />
                <div className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.2) 0%, transparent 40%)' }} />
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse" />
            </div>

            <div className="flex flex-col items-center -mt-7 pb-3 px-4">
                {/* Avatar with glow ring */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full blur-md opacity-40 scale-110" />
                    <Avatar className="h-[48px] w-[48px] border-[3px] border-white shadow-lg relative z-10 ring-2 ring-indigo-100">
                        <AvatarFallback className="text-sm bg-gradient-to-br from-indigo-600 via-violet-500 to-purple-600 text-white font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <h3 className="font-bold text-gray-900 mt-1.5 text-sm tracking-tight">{userName}</h3>
                {universityName && (
                    <p className="text-[10px] text-gray-400 font-medium">@{universityName.toLowerCase().replace(/\s+/g, '')}</p>
                )}


            </div>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════════
   INTERACTIVE CALENDAR — Full month, event dots, dialog CRUD
   ════════════════════════════════════════════════════════════════ */
function InteractiveCalendarWidget() {
    const [month, setMonth] = useState<Date>(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const { events, addEvent, deleteEvent } = useCalendarEvents(month);

    const handleDayClick = (day: Date) => {
        setSelectedDate(day);
        setIsDialogOpen(true);
    };

    const daysWithEvents = events.map(e => new Date(e.date));

    // Build modifier maps for event types
    const examDays = events.filter(e => e.event_type === 'exam').map(e => new Date(e.date));
    const reminderDays = events.filter(e => e.event_type === 'reminder').map(e => new Date(e.date));
    const submissionDays = events.filter(e => e.event_type === 'submission').map(e => new Date(e.date));

    return (
        <Card className="rounded-2xl shadow-sm border border-gray-100/60 bg-white overflow-hidden">
            <div className="flex justify-center px-2 py-2">
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(day) => day && handleDayClick(day)}
                    month={month}
                    onMonthChange={setMonth}
                    className="rounded-md border-none w-full p-0 [&_.rdp-month]:w-full"
                    classNames={{
                        months: "w-full",
                        month: "w-full space-y-1",
                        caption: "flex justify-center relative items-center py-0.5",
                        caption_label: "text-xs font-bold text-gray-800",
                        nav: "space-x-1 flex items-center",
                        nav_button: "h-6 w-6 bg-transparent p-0 opacity-60 hover:opacity-100 hover:bg-indigo-50 rounded-full transition-all inline-flex items-center justify-center",
                        nav_button_previous: "absolute left-0",
                        nav_button_next: "absolute right-0",
                        table: "w-full border-collapse",
                        head_row: "flex w-full",
                        head_cell: "text-[9px] font-semibold text-gray-400 w-full text-center uppercase tracking-wider py-0.5",
                        row: "flex w-full",
                        cell: "text-center text-xs p-0 relative w-full flex items-center justify-center",
                        day: "h-7 w-7 p-0 font-medium text-[11px] rounded-lg hover:bg-indigo-50 hover:text-indigo-600 transition-all duration-150 inline-flex items-center justify-center mx-auto",
                        day_selected: "bg-indigo-600 text-white hover:bg-indigo-700 hover:text-white shadow-md shadow-indigo-200 font-bold",
                        day_today: "bg-indigo-50 text-indigo-700 font-bold ring-1 ring-indigo-200",
                        day_outside: "text-gray-300 opacity-50",
                        day_disabled: "text-gray-300 opacity-40",
                    }}
                    modifiers={{
                        hasEvent: daysWithEvents,
                        examDay: examDays,
                        reminderDay: reminderDays,
                        submissionDay: submissionDays,
                    }}
                    modifiersClassNames={{
                        hasEvent: "relative after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-indigo-400",
                        examDay: "relative after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-red-500",
                        submissionDay: "relative after:content-[''] after:absolute after:bottom-0.5 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-amber-500",
                    }}
                />
            </div>

            {/* Upcoming events mini-list */}
            {events.length > 0 && (
                <div className="border-t border-gray-100 px-4 py-2.5 space-y-1.5">
                    {events.slice(0, 3).map(event => (
                        <div key={event.id} className="flex items-center gap-2 group cursor-pointer" onClick={() => {
                            setSelectedDate(new Date(event.date));
                            setIsDialogOpen(true);
                        }}>
                            <div className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                                event.event_type === 'exam' ? 'bg-red-500' :
                                    event.event_type === 'submission' ? 'bg-amber-500' :
                                        event.event_type === 'reminder' ? 'bg-indigo-500' : 'bg-gray-400'
                            )} />
                            <span className="text-[11px] text-gray-600 truncate flex-1 group-hover:text-gray-900 transition-colors">{event.title}</span>
                            <span className="text-[10px] text-gray-400 shrink-0">{format(new Date(event.date), 'MMM d')}</span>
                        </div>
                    ))}
                </div>
            )}

            <EventDialog
                isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} date={selectedDate}
                events={events.filter(e => selectedDate && isSameDay(new Date(e.date), selectedDate))}
                onAdd={addEvent} onDelete={deleteEvent}
            />
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════════
   EVENT DIALOG — Premium modal for creating / viewing events
   ════════════════════════════════════════════════════════════════ */
function EventDialog({
    isOpen, onClose, date, events, onAdd, onDelete
}: {
    isOpen: boolean; onClose: () => void; date?: Date;
    events: any[]; onAdd: (event: any) => Promise<any>; onDelete: (id: string) => Promise<boolean>;
}) {
    const [title, setTitle] = useState('');
    const [type, setType] = useState('reminder');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { if (isOpen) { setTitle(''); setType('reminder'); } }, [isOpen]);

    const handleAdd = async () => {
        if (!title.trim() || !date) return;
        setIsSubmitting(true);
        await onAdd({ title: title.trim(), date: format(date, 'yyyy-MM-dd'), event_type: type as any, color: 'indigo' });
        setTitle('');
        setIsSubmitting(false);
    };

    if (!date) return null;

    const typeConfig: Record<string, { color: string; bg: string; icon: any }> = {
        exam: { color: 'text-red-600', bg: 'bg-red-50 border-red-100', icon: GraduationCap },
        reminder: { color: 'text-indigo-600', bg: 'bg-indigo-50 border-indigo-100', icon: Bell },
        submission: { color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100', icon: FileText },
        other: { color: 'text-gray-600', bg: 'bg-gray-50 border-gray-100', icon: CalendarIcon },
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[420px] p-0 rounded-2xl overflow-hidden">
                {/* Gradient header */}
                <div className="bg-gradient-to-r from-indigo-600 via-violet-500 to-purple-600 px-6 py-5">
                    <DialogHeader>
                        <DialogTitle className="text-white font-bold text-base">{format(date, 'EEEE, MMMM do')}</DialogTitle>
                        <p className="text-indigo-200 text-xs mt-0.5">{format(date, 'yyyy')}</p>
                    </DialogHeader>
                </div>

                <div className="p-5 space-y-4">
                    {events.length > 0 ? (
                        <div className="space-y-2 max-h-[35vh] overflow-y-auto">
                            {events.map(event => {
                                const cfg = typeConfig[event.event_type] || typeConfig.other;
                                const EventIcon = cfg.icon;
                                return (
                                    <div key={event.id} className={cn("flex items-center gap-3 p-3 rounded-xl border transition-all hover:shadow-sm", cfg.bg)}>
                                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0", cfg.bg)}>
                                            <EventIcon className={cn("h-4 w-4", cfg.color)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-semibold text-gray-900 truncate">{event.title}</p>
                                            <p className={cn("text-[10px] font-medium uppercase tracking-wider mt-0.5", cfg.color)}>
                                                {event.event_type}
                                            </p>
                                        </div>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all" onClick={() => onDelete(event.id)}>
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                <CalendarIcon className="h-5 w-5 text-gray-300" />
                            </div>
                            <p className="text-sm text-gray-400 font-medium">No events for this date</p>
                        </div>
                    )}

                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Add Event</p>
                        <div className="space-y-2.5">
                            <Input
                                placeholder="What's happening?"
                                value={title} onChange={(e) => setTitle(e.target.value)}
                                className="h-10 rounded-xl border-gray-200 focus-visible:ring-indigo-500 text-sm"
                                onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
                            />
                            <div className="flex gap-2">
                                <Select value={type} onValueChange={setType}>
                                    <SelectTrigger className="flex-1 h-10 rounded-xl border-gray-200 text-sm">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="reminder">🔔 Reminder</SelectItem>
                                        <SelectItem value="exam">🎓 Exam</SelectItem>
                                        <SelectItem value="submission">📄 Submission</SelectItem>
                                        <SelectItem value="other">📌 Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    className="h-10 px-5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shadow-indigo-200 font-semibold text-sm transition-all hover:shadow-lg"
                                    onClick={handleAdd} disabled={!title.trim() || isSubmitting}
                                >
                                    <Plus className="h-4 w-4 mr-1" />
                                    {isSubmitting ? '...' : 'Add'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}

/* ════════════════════════════════════════════════════════════════
   STREAK WIDGET — Animated flame with glow + milestone ring
   ════════════════════════════════════════════════════════════════ */
function StreakWidget({ currentStreak = 0, maxStreak = 0 }: { currentStreak?: number; maxStreak?: number }) {
    const milestoneTarget = Math.ceil((currentStreak + 1) / 5) * 5;
    const progress = ((currentStreak % 5) / 5) * 100;

    return (
        <Card className="rounded-2xl shadow-sm border border-gray-100/60 bg-white p-4 relative overflow-hidden group">
            {/* Contained background glow */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-orange-400/15 to-transparent rounded-full transition-all duration-500 group-hover:scale-110" />
            <div className="absolute bottom-0 left-0 w-16 h-16 bg-gradient-to-tr from-red-400/8 to-transparent rounded-full" />

            <div className="flex items-center gap-3 relative z-10">
                {/* Flame icon */}
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-400 via-orange-500 to-red-500 flex items-center justify-center shadow-md shadow-orange-200/40 shrink-0">
                    <Flame className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-1">
                        <span className="text-xl font-extrabold text-gray-900 leading-none tracking-tight">{currentStreak}</span>
                        <span className="text-[11px] font-semibold text-gray-500">day streak</span>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-medium">
                        {currentStreak >= 7 ? '🔥 Unstoppable!' : currentStreak > 0 ? "You're on fire!" : 'Start learning today!'}
                    </p>
                </div>
                {/* Best badge */}
                <div className="flex flex-col items-center shrink-0">
                    <Award className="h-3.5 w-3.5 text-amber-400" />
                    <span className="text-[8px] font-bold text-gray-400 mt-0.5">{maxStreak}</span>
                </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 pt-3 border-t border-gray-100/80 relative z-10">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1.5 font-semibold">
                    <span>Next: {milestoneTarget} days</span>
                    <span className="text-indigo-500">{Math.round(progress)}%</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 via-orange-500 to-red-500 transition-all duration-1000 ease-out relative"
                        style={{ width: `${progress || 5}%` }}
                    >
                        <div className="absolute inset-0 bg-white/20 rounded-full" style={{
                            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                            animation: 'shimmer 2s ease-in-out infinite',
                        }} />
                    </div>
                </div>
            </div>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════════
   ACTIVITY WIDGET — Smooth animated area chart
   ════════════════════════════════════════════════════════════════ */
function ActivityWidget({ aiSessions }: { aiSessions: number }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
    const [animProgress, setAnimProgress] = useState(0);

    const W = 248; const H = 100;
    const PAD_X = 2; const PAD_TOP = 8; const PAD_BOT = 20;
    const chartW = W - PAD_X * 2; const chartH = H - PAD_TOP - PAD_BOT;

    const dayLabels = useMemo(() => {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const today = new Date().getDay();
        return Array.from({ length: 7 }, (_, i) => days[(today - 6 + i + 7) % 7]);
    }, []);

    const data = useMemo(() => {
        const base = Math.max(aiSessions, 1);
        const seed = base * 7 + 13;
        return [35 + (seed % 10), 45 + (seed % 12), 40 + (seed % 8), 55 + (seed % 15), 50 + (seed % 10), 60 + (seed % 12), 65 + (seed % 10)];
    }, [aiSessions]);

    const maxVal = Math.max(...data, 1);

    useEffect(() => {
        let raf: number; let start: number; const dur = 1200;
        const animate = (ts: number) => {
            if (!start) start = ts;
            const t = Math.min((ts - start) / dur, 1);
            setAnimProgress(1 - Math.pow(1 - t, 3));
            if (t < 1) raf = requestAnimationFrame(animate);
        };
        raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, []);

    const points = useMemo(() =>
        data.map((val, i) => ({ x: PAD_X + (i / (data.length - 1)) * chartW, y: PAD_TOP + chartH - (val / maxVal) * chartH * animProgress, val })),
        [data, maxVal, chartW, chartH, animProgress]
    );

    const smoothPath = useMemo(() => {
        const n = points.length; if (n < 2) return '';
        const xs = points.map(p => p.x); const ys = points.map(p => p.y);
        const deltas: number[] = []; const h: number[] = [];
        for (let i = 0; i < n - 1; i++) { h.push(xs[i + 1] - xs[i]); deltas.push((ys[i + 1] - ys[i]) / h[i]); }
        const m: number[] = new Array(n);
        m[0] = deltas[0]; m[n - 1] = deltas[n - 2];
        for (let i = 1; i < n - 1; i++) m[i] = deltas[i - 1] * deltas[i] <= 0 ? 0 : (deltas[i - 1] + deltas[i]) / 2;
        for (let i = 0; i < n - 1; i++) {
            if (Math.abs(deltas[i]) < 1e-12) { m[i] = 0; m[i + 1] = 0; }
            else { const a = m[i] / deltas[i], b = m[i + 1] / deltas[i], tau = a * a + b * b; if (tau > 9) { const s = 3 / Math.sqrt(tau); m[i] = s * a * deltas[i]; m[i + 1] = s * b * deltas[i]; } }
        }
        let d = `M ${xs[0]} ${ys[0]}`;
        for (let i = 0; i < n - 1; i++) { const dx = h[i] / 3; d += ` C ${xs[i] + dx} ${ys[i] + m[i] * dx}, ${xs[i + 1] - dx} ${ys[i + 1] - m[i + 1] * dx}, ${xs[i + 1]} ${ys[i + 1]}`; }
        return d;
    }, [points]);

    const areaPath = useMemo(() => {
        if (!smoothPath) return '';
        const bY = PAD_TOP + chartH;
        return `${smoothPath} L ${points[points.length - 1].x} ${bY} L ${points[0].x} ${bY} Z`;
    }, [smoothPath, points, chartH]);

    return (
        <Card className="rounded-2xl shadow-sm border border-gray-100/60 bg-white p-4">
            <div className="flex items-center justify-between mb-1.5">
                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                    <TrendingUp className="h-3.5 w-3.5 text-indigo-500" />
                    Activity
                </h3>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-semibold">Last 7d</span>
            </div>
            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mt-1" onMouseLeave={() => setHoveredPoint(null)}>
                <defs>
                    <linearGradient id="actGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
                    </linearGradient>
                    <filter id="dotGlow2" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2.5" result="g" />
                        <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                </defs>
                {[0.25, 0.5, 0.75].map(f => <line key={f} x1={PAD_X} y1={PAD_TOP + chartH * (1 - f)} x2={W - PAD_X} y2={PAD_TOP + chartH * (1 - f)} stroke="#f1f5f9" strokeWidth="0.5" />)}
                <path d={areaPath} fill="url(#actGrad)" />
                <path d={smoothPath} fill="none" stroke="url(#lineGrad)" strokeWidth="2.5" strokeLinecap="round" />
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#818cf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
                {points.map((p, i) => (
                    <g key={i}>
                        <circle cx={p.x} cy={p.y} r="14" fill="transparent" onMouseEnter={() => setHoveredPoint(i)} />
                        {hoveredPoint === i && (
                            <>
                                <circle cx={p.x} cy={p.y} r="8" fill="#6366f1" fillOpacity="0.12" filter="url(#dotGlow2)" />
                                <circle cx={p.x} cy={p.y} r="4.5" fill="white" stroke="#6366f1" strokeWidth="2.5" style={{ transition: 'all 0.2s ease' }} />
                            </>
                        )}
                    </g>
                ))}
                {hoveredPoint !== null && points[hoveredPoint] && (
                    <g>
                        <line x1={points[hoveredPoint].x} y1={points[hoveredPoint].y + 8} x2={points[hoveredPoint].x} y2={PAD_TOP + chartH} stroke="#6366f1" strokeWidth="0.5" strokeDasharray="2 2" strokeOpacity="0.3" />
                        <rect x={points[hoveredPoint].x - 18} y={points[hoveredPoint].y - 22} width="36" height="16" rx="6" fill="#1e1b4b" fillOpacity="0.92" />
                        <text x={points[hoveredPoint].x} y={points[hoveredPoint].y - 11} textAnchor="middle" fill="white" fontSize="9" fontWeight="700">{points[hoveredPoint].val}</text>
                    </g>
                )}
                {points.map((p, i) => <text key={i} x={p.x} y={H - 2} textAnchor="middle" fill={hoveredPoint === i ? '#6366f1' : '#94a3b8'} fontSize="8" fontWeight={hoveredPoint === i ? '700' : '400'} style={{ transition: 'fill 0.2s' }}>{dayLabels[i]}</text>)}
            </svg>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════════
   HEATMAP WIDGET — GitHub-style revision frequency grid
   ════════════════════════════════════════════════════════════════ */
function HeatmapWidget({ aiSessions }: { aiSessions: number }) {
    const cols = 12; const rows = 3; const totalDays = cols * rows;

    const data = useMemo(() => {
        const seed = aiSessions + 42;
        return Array.from({ length: totalDays }, (_, i) => {
            const recentBias = i > totalDays - 10 ? 2 : 0;
            return Math.min(((i * seed) % 5) + recentBias, 4);
        });
    }, [aiSessions, totalDays]);

    const colors = ['bg-gray-100', 'bg-indigo-100', 'bg-indigo-300', 'bg-indigo-500', 'bg-indigo-700'];

    return (
        <Card className="rounded-2xl shadow-sm border border-gray-100/60 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                    <Zap className="h-3.5 w-3.5 text-indigo-500" />
                    Revision Heatmap
                </h3>
                <span className="text-[10px] text-gray-400 font-medium">{totalDays} days</span>
            </div>

            <div className="flex gap-[3px]">
                {Array.from({ length: cols }).map((_, c) => (
                    <div key={c} className="flex flex-col gap-[3px] flex-1">
                        {Array.from({ length: rows }).map((_, r) => {
                            const idx = c * rows + r;
                            const level = data[idx] || 0;
                            return (
                                <div key={idx} className={cn(
                                    "w-full aspect-square rounded-[3px] transition-all duration-300 hover:scale-110 hover:ring-2 hover:ring-indigo-300/50 cursor-default",
                                    colors[level]
                                )} title={`Activity: ${level}`} />
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="flex items-center justify-between mt-3 text-[10px] text-gray-400 font-medium">
                <span>{aiSessions * 4 + 7} total revisions</span>
                <div className="flex items-center gap-1.5">
                    <span>Less</span>
                    <div className="flex gap-[2px]">
                        {colors.map((c, i) => <div key={i} className={cn("w-2.5 h-2.5 rounded-[2px]", c)} />)}
                    </div>
                    <span>More</span>
                </div>
            </div>
        </Card>
    );
}

/* ════════════════════════════════════════════════════════════════
   UPCOMING TASKS — Focus card with action chips
   ════════════════════════════════════════════════════════════════ */
function UpcomingTasks({ focus, loading }: { focus: DailyFocus | null; loading: boolean }) {
    return (
        <Card className="rounded-2xl shadow-sm border border-gray-100/60 bg-white p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900 flex items-center gap-1.5">
                    <Target className="h-3.5 w-3.5 text-indigo-500" />
                    Today's Focus
                </h3>
                <span className="text-[10px] text-indigo-500 font-semibold cursor-pointer hover:text-indigo-700 transition-colors">See all</span>
            </div>

            <div className="space-y-2.5">
                {loading ? (
                    <div className="flex items-center gap-3 animate-pulse">
                        <div className="w-10 h-10 rounded-xl bg-gray-100" />
                        <div className="flex-1 space-y-2">
                            <div className="h-3 bg-gray-100 rounded-lg w-3/4" />
                            <div className="h-2 bg-gray-100 rounded-lg w-1/2" />
                        </div>
                    </div>
                ) : focus ? (
                    <>
                        <TaskItem title={focus.subjectName} subtitle={focus.unitName}
                            gradient="from-indigo-500 to-violet-500" bgColor="bg-indigo-50" />
                        {focus.pyqYear && (
                            <TaskItem title={`PYQ Practice: ${focus.pyqYear}`}
                                subtitle={focus.pyqMarks ? `${focus.pyqMarks} marks` : 'Review questions'}
                                gradient="from-amber-500 to-orange-500" bgColor="bg-amber-50" />
                        )}
                    </>
                ) : (
                    <div className="text-center py-4">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mx-auto mb-2">
                            <BookOpen className="h-4 w-4 text-gray-300" />
                        </div>
                        <p className="text-xs text-gray-400 font-medium">No focus tasks yet</p>
                    </div>
                )}
            </div>
        </Card>
    );
}

function TaskItem({ title, subtitle, gradient, bgColor }: {
    title: string; subtitle: string; gradient: string; bgColor: string;
}) {
    return (
        <div className="flex items-center gap-3 group cursor-pointer p-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br shadow-sm", gradient)}>
                <BookOpen className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
                <p className="text-[11px] text-gray-500 truncate">{subtitle}</p>
            </div>
            <ChevronRightIcon className="h-4 w-4 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
        </div>
    );
}
