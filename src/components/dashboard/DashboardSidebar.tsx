import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Home, GraduationCap, MessageSquare, Calendar, Settings, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
    onSignOut: () => void;
    onAIOpen: () => void;
}

const navItems = [
    { icon: Home, label: 'Home', href: '/dashboard' },
    { icon: GraduationCap, label: 'Subjects', href: '/dashboard', section: 'subjects' },
    { icon: MessageSquare, label: 'AI Chat', action: 'ai' },
    { icon: Calendar, label: 'Calendar', href: '/dashboard', section: 'calendar' },
    { icon: Settings, label: 'Settings', href: '/onboarding?edit=true' },
];

export function DashboardSidebar({ onSignOut, onAIOpen }: DashboardSidebarProps) {
    const location = useLocation();

    return (
        <aside className="hidden md:flex flex-col items-center w-[72px] bg-white rounded-2xl py-6 gap-2 shadow-sm border border-gray-100/80 my-3 ml-3">
            {/* Logo */}
            <Link to="/" className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white mb-4 shadow-md hover:shadow-lg transition-shadow">
                <BookOpen className="h-5 w-5" />
            </Link>

            {/* Nav Items */}
            <nav className="flex flex-col items-center gap-1 flex-1">
                {navItems.map((item) => {
                    const isActive = item.href === '/dashboard' && location.pathname === '/dashboard' && !item.section;
                    const Icon = item.icon;

                    if (item.action === 'ai') {
                        return (
                            <button
                                key={item.label}
                                onClick={onAIOpen}
                                className={cn(
                                    "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 group relative",
                                    "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                                )}
                                title={item.label}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                                    {item.label}
                                </span>
                            </button>
                        );
                    }

                    return (
                        <Link
                            key={item.label}
                            to={item.href!}
                            className={cn(
                                "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                                    : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"
                            )}
                            title={item.label}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* Sign Out */}
            <button
                onClick={onSignOut}
                className="flex items-center justify-center w-11 h-11 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 group relative"
                title="Sign out"
            >
                <LogOut className="h-5 w-5" />
                <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                    Sign out
                </span>
            </button>
        </aside>
    );
}
