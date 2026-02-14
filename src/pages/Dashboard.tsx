import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { useExamSettings } from '@/hooks/useExamSettings';
import { useDailyFocus } from '@/hooks/useDailyFocus';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, BookOpen, Search, Bell } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { AIBriefingHero } from '@/components/dashboard/AIBriefingHero';
import { IntelligentSubjectCard } from '@/components/dashboard/IntelligentSubjectCard';
import { GlobalAICommandBar } from '@/components/dashboard/GlobalAICommandBar';
import { ResizableAIPanel } from '@/components/dashboard/ResizableAIPanel';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardRightSidebar } from '@/components/dashboard/DashboardRightSidebar';

interface Subject {
  id: string;
  name: string;
  code: string;
  slug: string;
  gradient_from: string | null;
  gradient_to: string | null;
}

interface Message {
  role: "user" | "assistant";
  content: string;
  response?: any;
  intent?: string;
  confidence?: number;
  modelUsed?: string;
  processingTime?: number;
}

export default function Dashboard() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading, isProfileComplete } = useProfile();
  const { progress, getTotalStats, getOverallReadiness, getWeakestSubjects, getSubjectProgress } = useStudyProgress();
  const { settings, getDaysUntilExam, getExamTypeLabel, updateSettings } = useExamSettings();
  const { focus, loading: focusLoading, refresh: refreshFocus } = useDailyFocus(profile?.semester_id || null);

  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  // AI Panel state - persisted across open/close
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isAIFullscreen, setIsAIFullscreen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm your study assistant. Ask me anything about concepts, exam preparation, practice questions, or request code examples and visualizations.",
      confidence: 1
    }
  ]);

  // Detect OAuth callback
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('access_token') || hashParams.get('refresh_token')) {
      setIsProcessingOAuth(true);
      window.history.replaceState(null, '', window.location.pathname);
      const timer = setTimeout(() => setIsProcessingOAuth(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Redirect if not authenticated or profile incomplete
  useEffect(() => {
    if (isProcessingOAuth) return;

    if (!authLoading && !profileLoading) {
      if (!user) {
        navigate('/auth', { replace: true });
      } else if (!isProfileComplete) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [authLoading, profileLoading, user, isProfileComplete, navigate, isProcessingOAuth]);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!profile?.semester_id) {
        setLoadingSubjects(false);
        return;
      }

      const { data } = await supabase
        .from('subjects')
        .select('id, name, code, slug, gradient_from, gradient_to')
        .eq('semester_id', profile.semester_id)
        .order('name');

      if (data) setSubjects(data);
      setLoadingSubjects(false);
    };

    if (profile) fetchSubjects();
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handleAIOpen = (query: string) => {
    setAiInitialQuery(query);
    setIsAIPanelOpen(true);
  };

  const handleQueryConsumed = () => {
    setAiInitialQuery('');
  };

  const handleExamDateSet = async (date: Date, type: string) => {
    await updateSettings({
      exam_date: date.toISOString().split('T')[0],
      exam_type: type
    });
  };

  // Calculate stats
  const stats = getTotalStats();
  const readiness = getOverallReadiness();
  const weakestSubjects = getWeakestSubjects(1);
  const pendingSubjects = subjects.length - progress.filter(p =>
    (p.notes_viewed / Math.max(p.total_notes, 1)) >= 0.8
  ).length;

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f6f8]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const aiSubject = { id: 'general', name: 'General Study', code: 'AI' };
  const firstName = profile.full_name?.split(' ')[0] || 'Student';

  return (
    <div className="min-h-screen bg-[#f5f6f8]">
      <SEO
        title="Dashboard"
        description="Your personalized EXAM Simplex dashboard."
        canonicalUrl="/dashboard"
        noIndex={true}
      />

      {/* 3-Column Layout */}
      <div className="flex h-screen overflow-hidden">
        {/* Left Sidebar */}
        <DashboardSidebar
          onSignOut={handleSignOut}
          onAIOpen={() => setIsAIPanelOpen(true)}
        />

        {/* Main Content Area (wrapped in ResizableAIPanel) */}
        <ResizableAIPanel
          isOpen={isAIPanelOpen}
          isFullscreen={isAIFullscreen}
          initialQuery={aiInitialQuery}
          onOpenChange={setIsAIPanelOpen}
          onFullscreenChange={setIsAIFullscreen}
          onQueryConsumed={handleQueryConsumed}
          subject={aiSubject}
          universityName={profile.university?.name || 'AKTU'}
          messages={aiMessages}
          onMessagesChange={setAiMessages}
        >
          <div className="flex flex-1 min-w-0">
            {/* Scrollable Main Content */}
            <main className="flex-1 min-w-0 overflow-y-auto py-6 px-6 space-y-6">
              {/* Header: Greeting + Search */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Hello {firstName}! 👋
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    Let's learn something new today!
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search anything here.."
                      className="pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 w-full sm:w-64 transition-shadow"
                    />
                  </div>
                  <button className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors relative">
                    <Bell className="h-4 w-4 text-gray-500" />
                    <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                  </button>
                </div>
              </div>

              {/* Hero Banner */}
               <AIBriefingHero
                userName={profile.full_name || 'Student'}
                userEmail={user.email || ''}
                universityName={profile.university?.name || null}
                courseName={profile.course?.name || null}
                semesterName={profile.semester?.name || null}
                daysUntilExam={getDaysUntilExam()}
                examType={getExamTypeLabel()}
                subjectsCount={subjects.length}
                pendingSubjects={pendingSubjects}
                weakestSubject={weakestSubjects[0] ? subjects.find(s => s.id === weakestSubjects[0].subject_id)?.name || null : null}
                readinessPercent={readiness}
                onEditProfile={() => navigate('/onboarding?edit=true')}
                onExamDateSet={handleExamDateSet}
              />

              {/* Subjects Grid */}
              <section>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Your Courses</h2>
                  <span className="text-sm text-indigo-600 font-medium cursor-pointer hover:underline">
                    All Courses
                  </span>
                </div>

                {loadingSubjects ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                  </div>
                ) : subjects.length === 0 ? (
                  <Card className="p-8 text-center border-dashed bg-white rounded-2xl">
                    <BookOpen className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 mb-2">No subjects found</p>
                    <p className="text-sm text-gray-400">Subjects will appear once added to your semester.</p>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {subjects.map((subject) => (
                      <IntelligentSubjectCard
                        key={subject.id}
                        subject={subject}
                        progress={getSubjectProgress(subject.id)}
                        universityId={profile.university_id!}
                        courseId={profile.course_id!}
                        semesterId={profile.semester_id!}
                      />
                    ))}
                  </div>
                )}
              </section>
            </main>

            {/* Right Sidebar */}
            <DashboardRightSidebar
              userName={profile.full_name || 'Student'}
              userEmail={user.email || ''}
              universityName={profile.university?.name || null}
              subjectsCount={subjects.length}
              notesViewed={stats.notesViewed}
              pyqsPracticed={stats.pyqsPracticed}
              aiSessions={stats.aiSessions}
              readinessPercent={readiness}
              focus={focus}
              focusLoading={focusLoading}
            />
          </div>
        </ResizableAIPanel>
      </div>

      {/* Global AI Command Bar */}
      <GlobalAICommandBar onAIOpen={handleAIOpen} />
    </div>
  );
}
