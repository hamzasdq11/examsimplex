import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, FileText, HelpCircle, GraduationCap, MapPin, Calendar, Edit, LogOut, Home } from 'lucide-react';

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
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingSubjects, setLoadingSubjects] = useState(true);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);

  // Detect OAuth callback (tokens in URL hash)
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    if (hashParams.get('access_token') || hashParams.get('refresh_token')) {
      setIsProcessingOAuth(true);
      // Clean up the URL hash
      window.history.replaceState(null, '', window.location.pathname);
      // Give Supabase time to process the tokens
      const timer = setTimeout(() => setIsProcessingOAuth(false), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Redirect to onboarding if profile is incomplete
  useEffect(() => {
    if (isProcessingOAuth) return; // Don't redirect while processing OAuth
    
    if (!authLoading && !profileLoading) {
      if (!user) {
        navigate('/auth', { replace: true });
      } else if (!isProfileComplete) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [authLoading, profileLoading, user, isProfileComplete, navigate, isProcessingOAuth]);

  // Fetch subjects for user's semester
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

    if (profile) {
      fetchSubjects();
    }
  }, [profile]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getUserInitials = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user?.email?.charAt(0).toUpperCase() || 'U';
  };

  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
            <BookOpen className="h-6 w-6 text-primary" />
            ExamPrep
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <Home className="h-4 w-4 mr-2" />
                Home
              </Link>
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="container py-8 space-y-8">
        {/* Profile Card */}
        <Card className="overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-primary/80 to-primary" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-8">
              <Avatar className="h-24 w-24 border-4 border-background shadow-lg">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 pb-2">
                <h1 className="text-2xl font-bold">{profile.full_name}</h1>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/onboarding?edit=true')}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            </div>

            <div className="mt-6 flex flex-wrap gap-4">
              {profile.university && (
                <div className="flex items-center gap-2 text-sm">
                  <GraduationCap className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.university.name}</span>
                </div>
              )}
              {profile.course && (
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.course.name}</span>
                </div>
              )}
              {profile.semester && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{profile.semester.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-hsl(var(--card-cyan)) to-hsl(var(--card-mint)) border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="h-5 w-5" />
                My Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{subjects.length}</p>
              <p className="text-sm text-muted-foreground">subjects this semester</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-hsl(var(--card-lavender)) to-hsl(var(--card-purple)) border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="h-5 w-5" />
                Study Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">available for your subjects</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-hsl(var(--card-pink)) to-hsl(var(--card-lavender)) border-0">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <HelpCircle className="h-5 w-5" />
                Important Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">-</p>
              <p className="text-sm text-muted-foreground">to practice</p>
            </CardContent>
          </Card>
        </div>

        {/* Subjects Grid */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Your Subjects</h2>
            {profile.university && (
              <Button variant="link" asChild>
                <Link to={`/university/${profile.university.id}`}>
                  View All Courses
                </Link>
              </Button>
            )}
          </div>

          {loadingSubjects ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : subjects.length === 0 ? (
            <Card className="p-8 text-center">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground mb-2">No subjects found for your semester</p>
              <p className="text-sm text-muted-foreground">
                Subjects will appear here once they're added to your semester.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((subject) => (
                <Link
                  key={subject.id}
                  to={`/university/${profile.university_id}/${profile.course_id}/${profile.semester_id}/${subject.id}`}
                >
                  <Card className="h-full hover:shadow-lg transition-all hover:-translate-y-1 cursor-pointer group">
                    <CardHeader>
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center mb-2"
                        style={{
                          background: `linear-gradient(135deg, ${subject.gradient_from || '#3B82F6'}, ${subject.gradient_to || '#8B5CF6'})`,
                        }}
                      >
                        <BookOpen className="h-6 w-6 text-white" />
                      </div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {subject.name}
                      </CardTitle>
                      <CardDescription>
                        <Badge variant="secondary">{subject.code}</Badge>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2 text-xs text-muted-foreground">
                        <span>Notes</span>
                        <span>•</span>
                        <span>PYQs</span>
                        <span>•</span>
                        <span>Questions</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
