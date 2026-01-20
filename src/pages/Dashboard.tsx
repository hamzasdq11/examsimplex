import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useStudyProgress } from '@/hooks/useStudyProgress';
import { useExamSettings } from '@/hooks/useExamSettings';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, BookOpen, LogOut, Home, PlusCircle } from 'lucide-react';
import { SEO } from '@/components/SEO';
import { ActiveSessionHero } from '@/components/dashboard/ActiveSessionHero';
import { SessionTimeline } from '@/components/dashboard/SessionTimeline';
import { AIDirective, TimelineDirective } from '@/components/dashboard/AIDirective';
import { CollapsedSubjectsDrawer } from '@/components/dashboard/CollapsedSubjectsDrawer';

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
  const { progress, getWeakestSubjects } = useStudyProgress();
  const { getDaysUntilExam } = useExamSettings();
  const { 
    session,
    currentStep,
    loading: sessionLoading,
    generating,
    progressPercent,
    completedSteps,
    totalSteps,
    generateSession,
    startSession,
    completeStep,
    skipStep,
  } = useSession(profile?.semester_id || null);
  
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const [pyqCounts, setPyqCounts] = useState<Record<string, number>>({});

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

  // Fetch subjects and PYQ counts
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

      if (data) {
        setSubjects(data);
        
        // Fetch PYQ counts for each subject
        const { data: pyqs } = await supabase
          .from('pyq_papers')
          .select('subject_id')
          .in('subject_id', data.map(s => s.id));
        
        if (pyqs) {
          const counts: Record<string, number> = {};
          pyqs.forEach(p => {
            counts[p.subject_id] = (counts[p.subject_id] || 0) + 1;
          });
          setPyqCounts(counts);
        }
      }
      setLoadingSubjects(false);
    };

    if (profile) fetchSubjects();
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Get weakest subjects for directive
  const weakestSubjects = getWeakestSubjects(2);
  const daysUntilExam = getDaysUntilExam();
  const prioritySubjectNames = weakestSubjects
    .map(ws => subjects.find(s => s.id === ws.subject_id)?.name)
    .filter(Boolean) as string[];

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) return null;

  const showTimelineDirective = daysUntilExam !== null && 
    daysUntilExam <= 30 && 
    prioritySubjectNames.length > 0 && 
    !session?.status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
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
        {/* AI Directive (proactive message) */}
        {showTimelineDirective && (
          <TimelineDirective
            daysUntilExam={daysUntilExam!}
            prioritySubjects={prioritySubjectNames}
            onAction={generateSession}
          />
        )}

        {/* Active Session Hero - The main directive component */}
        <ActiveSessionHero
          session={session}
          currentStep={currentStep}
          loading={sessionLoading || loadingSubjects}
          generating={generating}
          progressPercent={progressPercent}
          completedSteps={completedSteps}
          totalSteps={totalSteps}
          daysUntilExam={daysUntilExam}
          onGenerateSession={generateSession}
          onStartSession={startSession}
          onCompleteStep={completeStep}
          onSkipStep={skipStep}
          universityId={profile.university_id}
          courseId={profile.course_id}
          semesterId={profile.semester_id}
        />

        {/* Session Timeline - Shows when session is active */}
        {session && session.steps.length > 0 && session.status !== 'pending' && (
          <SessionTimeline
            steps={session.steps}
            currentStepIndex={session.current_step_index}
          />
        )}

        {/* Collapsed Subjects Drawer - Hidden by default */}
        {!loadingSubjects && subjects.length > 0 && (
          <div className="pt-4 border-t border-border/40">
            <CollapsedSubjectsDrawer
              subjects={subjects}
              progress={progress}
              universityId={profile.university_id!}
              courseId={profile.course_id!}
              semesterId={profile.semester_id!}
              pyqCounts={pyqCounts}
            />
          </div>
        )}

        {/* Empty state if no subjects */}
        {!loadingSubjects && subjects.length === 0 && (
          <Card className="p-8 text-center border-dashed">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-2">No subjects found</p>
            <p className="text-sm text-muted-foreground mb-4">Add subjects to your semester to get started.</p>
            <Button asChild>
              <Link to={`/university/${profile.university_id}`}>
                <PlusCircle className="h-4 w-4 mr-2" />
                Browse subjects
              </Link>
            </Button>
          </Card>
        )}
      </main>
    </div>
  );
}
