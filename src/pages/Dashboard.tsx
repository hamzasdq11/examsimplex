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
import { Loader2, BookOpen, LogOut, Home, Edit } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { AIBriefingHero } from '@/components/dashboard/AIBriefingHero';
import { TodaysFocusCard } from '@/components/dashboard/TodaysFocusCard';
import { ProgressStatsGrid } from '@/components/dashboard/ProgressStatsGrid';
import { IntelligentSubjectCard } from '@/components/dashboard/IntelligentSubjectCard';
import { GlobalAICommandBar } from '@/components/dashboard/GlobalAICommandBar';
import { ResizableAIPanel } from '@/components/dashboard/ResizableAIPanel';

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
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const aiSubject = { id: 'general', name: 'General Study', code: 'AI' };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <SEO
        title="Dashboard"
        description="Your personalized EXAM Simplex dashboard."
        canonicalUrl="/dashboard"
        noIndex={true}
      />
      
      {/* Header - Always visible */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-5 w-5 text-primary" />
            EXAM Simplex
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/"><Home className="h-4 w-4 mr-1" />Home</Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/onboarding?edit=true')}>
              <Edit className="h-4 w-4 mr-1" />Edit Profile
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content with resizable AI panel */}
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
        <main className="container py-6 space-y-6 pb-24">
          {/* AI Briefing Hero */}
          <AIBriefingHero
            userName={profile.full_name || 'Student'}
            userEmail={user.email || ''}
            universityName={profile.university?.name || null}
            daysUntilExam={getDaysUntilExam()}
            examType={getExamTypeLabel()}
            subjectsCount={subjects.length}
            pendingSubjects={pendingSubjects}
            weakestSubject={weakestSubjects[0] ? subjects.find(s => s.id === weakestSubjects[0].subject_id)?.name || null : null}
            readinessPercent={readiness}
            onEditProfile={() => navigate('/onboarding?edit=true')}
            onExamDateSet={handleExamDateSet}
          />

          {/* Today's Focus + Progress Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TodaysFocusCard
              focus={focus}
              loading={focusLoading}
              universityId={profile.university_id}
              courseId={profile.course_id}
              semesterId={profile.semester_id}
              onRefresh={refreshFocus}
            />
            <div className="lg:col-span-2">
              <ProgressStatsGrid
                notesCoverage={stats.notesCoverage}
                notesViewed={stats.notesViewed}
                totalNotes={stats.totalNotes}
                pyqsCoverage={stats.pyqsCoverage}
                pyqsPracticed={stats.pyqsPracticed}
                totalPyqs={stats.totalPyqs}
                aiSessions={stats.aiSessions}
                subjectsCount={subjects.length}
              />
            </div>
          </div>

          {/* Subjects Grid */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Your Subjects</h2>

            {loadingSubjects ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : subjects.length === 0 ? (
              <Card className="p-8 text-center border-dashed">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground mb-2">No subjects found</p>
                <p className="text-sm text-muted-foreground">Subjects will appear once added to your semester.</p>
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
      </ResizableAIPanel>

      {/* Global AI Command Bar */}
      <GlobalAICommandBar onAIOpen={handleAIOpen} />
    </div>
  );
}
