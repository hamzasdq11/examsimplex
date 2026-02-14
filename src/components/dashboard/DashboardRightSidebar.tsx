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
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900">{monthName}</h3>
                <div className="flex gap-1">
                    <button className="p-1 rounded-md hover:bg-gray-100 text-gray-400 transition-colors">
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <button className="p-1 rounded-md hover:bg-gray-100 text-gray-400 transition-colors">
                        <ChevronRight className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-1">
                {weekDays.map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-medium text-gray-400 py-1">
                        {day}
                    </div>
                ))}
                {weekDates.map((date, i) => (
                    <button
                        key={i}
                        className={cn(
                            "text-center text-xs py-1.5 rounded-lg transition-colors font-medium",
                            date === today
                                ? "bg-indigo-600 text-white shadow-sm"
                                : "text-gray-700 hover:bg-gray-100"
                        )}
                    >
                        {date > 0 ? date : ''}
                    </button>
                ))}
            </div>
        </Card>
    );
}

// ─── Activity Widget ──────────────────────────────────────────
function ActivityWidget({ aiSessions }: { aiSessions: number }) {
    // Generate fake activity data based on aiSessions for visual
    const barHeights = [30, 55, 40, 70, 50, 85, 45];

    return (
        <Card className="bg-white rounded-2xl shadow-sm border border-gray-100/80 p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-sm text-gray-900">Your Activity</h3>
                <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                    Last week
                </span>
            </div>

            {/* Mini bar chart */}
            <div className="flex items-end gap-2 h-20 mt-2">
                {barHeights.map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                        <div
                            className={cn(
                                "w-full rounded-t-md transition-all",
                                i === 5 ? "bg-indigo-500" : "bg-indigo-100"
                            )}
                            style={{ height: `${height}%` }}
                        />
                    </div>
                ))}
            </div>

            {aiSessions > 0 && (
                <p className="text-[10px] text-gray-400 mt-2 text-center">
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
