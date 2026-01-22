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
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, BookOpen, LogOut, Home, PlusCircle, Maximize2, Minimize2, X, Sparkles, Grid3X3 } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { AIBriefingHero } from '@/components/dashboard/AIBriefingHero';
import { TodaysFocusCard } from '@/components/dashboard/TodaysFocusCard';
import { ProgressStatsGrid } from '@/components/dashboard/ProgressStatsGrid';
import { IntelligentSubjectCard } from '@/components/dashboard/IntelligentSubjectCard';
import { GlobalAICommandBar } from '@/components/dashboard/GlobalAICommandBar';
import { SubjectAIChat, type Message } from '@/components/SubjectAIChat';

interface Subject {
  id: string;
  name: string;
  code: string;
  slug: string;
  gradient_from: string | null;
  gradient_to: string | null;
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
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(false);
  const [isAIFullscreen, setIsAIFullscreen] = useState(false);
  const [aiInitialQuery, setAiInitialQuery] = useState('');
  const [activeTab, setActiveTab] = useState('subjects');
  
  // Lifted AI message state - shared across all views (panel, fullscreen, tab)
  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi! I'm your General Study assistant. Ask me anything about concepts, exam preparation, practice questions, or request code examples and visualizations.`,
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10 pb-24">
      <SEO
        title="Dashboard"
        description="Your personalized EXAM Simplex dashboard."
        canonicalUrl="/dashboard"
        noIndex={true}
      />
      
      {/* Header */}
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
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-1" />Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-6 space-y-6">
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

        {/* Tabbed Content: Subjects + AI Study */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="subjects" className="gap-2">
              <Grid3X3 className="h-4 w-4" />
              Subjects
            </TabsTrigger>
            <TabsTrigger value="ai-study" className="gap-2">
              <Sparkles className="h-4 w-4" />
              AI Study
            </TabsTrigger>
          </TabsList>

          <TabsContent value="subjects">
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Your Subjects</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/university/${profile.university_id}`}>
                    <PlusCircle className="h-4 w-4 mr-1" />
                    Add subjects
                  </Link>
                </Button>
              </div>

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
          </TabsContent>

          <TabsContent value="ai-study" className="min-h-[500px]">
            <Card className="h-[600px] flex flex-col overflow-hidden">
              <SubjectAIChat 
                subject={{ id: 'general', name: 'General Study', code: 'AI' }}
                universityName={profile.university?.name || 'AKTU'}
                externalMessages={aiMessages}
                onExternalMessagesChange={setAiMessages}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      {/* Global AI Command Bar */}
      <GlobalAICommandBar onAIOpen={handleAIOpen} />

      {/* AI Study Panel - Sheet Mode */}
      {!isAIFullscreen && (
        <Sheet open={isAIPanelOpen} onOpenChange={setIsAIPanelOpen}>
          <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h2 className="font-semibold">AI Study Assistant</h2>
                <p className="text-xs text-muted-foreground">General Study</p>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => setIsAIFullscreen(true)}>
                  <Maximize2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setIsAIPanelOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-hidden">
              <SubjectAIChat 
                subject={{ id: 'general', name: 'General Study', code: 'AI' }}
                universityName={profile.university?.name || 'AKTU'}
                initialQuery={aiInitialQuery}
                externalMessages={aiMessages}
                onExternalMessagesChange={setAiMessages}
              />
            </div>
          </SheetContent>
        </Sheet>
      )}

      {/* AI Study Panel - Fullscreen Mode */}
      {isAIFullscreen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
          <div className="flex items-center justify-between p-4 border-b">
            <div>
              <h2 className="font-semibold text-lg">AI Study Mode</h2>
              <p className="text-sm text-muted-foreground">General Study</p>
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsAIFullscreen(false)}>
                <Minimize2 className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => { setIsAIFullscreen(false); setIsAIPanelOpen(false); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex-1 overflow-hidden container py-4">
            <SubjectAIChat 
              subject={{ id: 'general', name: 'General Study', code: 'AI' }}
              universityName={profile.university?.name || 'AKTU'}
              externalMessages={aiMessages}
              onExternalMessagesChange={setAiMessages}
            />
          </div>
        </div>
      )}
    </div>
  );
}
