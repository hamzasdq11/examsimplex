import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Loader2, BookOpen, FileText, HelpCircle, GraduationCap, Calendar, Edit, LogOut, Home } from 'lucide-react';

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
  const [notesCount, setNotesCount] = useState(0);
  const [questionsCount, setQuestionsCount] = useState(0);

  // Redirect to onboarding if profile is incomplete
  useEffect(() => {
    if (!authLoading && !profileLoading) {
      if (!user) {
        navigate('/auth', { replace: true });
      } else if (!isProfileComplete) {
        navigate('/onboarding', { replace: true });
      }
    }
  }, [authLoading, profileLoading, user, isProfileComplete, navigate]);

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

  // Fetch notes and questions counts
  useEffect(() => {
    const fetchCounts = async () => {
      if (subjects.length === 0) return;

      const subjectIds = subjects.map(s => s.id);

      // Get unit IDs for these subjects first
      const { data: units } = await supabase
        .from('units')
        .select('id')
        .in('subject_id', subjectIds);

      if (units && units.length > 0) {
        const unitIds = units.map(u => u.id);

        // Fetch notes count
        const { count: notes } = await supabase
          .from('notes')
          .select('id', { count: 'exact', head: true })
          .in('unit_id', unitIds);

        setNotesCount(notes || 0);
      }

      // Fetch questions count
      const { count: questions } = await supabase
        .from('important_questions')
        .select('id', { count: 'exact', head: true })
        .in('subject_id', subjectIds);

      setQuestionsCount(questions || 0);
    };

    fetchCounts();
  }, [subjects]);

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
          <div className="h-24 bg-gradient-to-r from-primary/80 to-primary" />
          <CardContent className="relative pt-0">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
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

            <div className="mt-6 flex flex-wrap gap-2">
              {profile.university && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
                  <GraduationCap className="h-3.5 w-3.5" />
                  {profile.university.name}
                </Badge>
              )}
              {profile.course && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
                  <BookOpen className="h-3.5 w-3.5" />
                  {profile.course.name}
                </Badge>
              )}
              {profile.semester && (
                <Badge variant="secondary" className="flex items-center gap-1.5 px-3 py-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {profile.semester.name}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card 
            className="border-0 text-white"
            style={{ background: 'linear-gradient(135deg, hsl(185 70% 50%) 0%, hsl(160 60% 45%) 100%)' }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <BookOpen className="h-5 w-5" />
                My Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{subjects.length}</p>
              <p className="text-sm text-white/80">subjects this semester</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 text-white"
            style={{ background: 'linear-gradient(135deg, hsl(260 60% 65%) 0%, hsl(280 50% 55%) 100%)' }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <FileText className="h-5 w-5" />
                Study Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{notesCount}</p>
              <p className="text-sm text-white/80">available for your subjects</p>
            </CardContent>
          </Card>

          <Card 
            className="border-0 text-white"
            style={{ background: 'linear-gradient(135deg, hsl(330 60% 55%) 0%, hsl(280 50% 60%) 100%)' }}
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg text-white">
                <HelpCircle className="h-5 w-5" />
                Important Questions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{questionsCount}</p>
              <p className="text-sm text-white/80">to practice</p>
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
                        <span 
                          className="hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/university/${profile.university_id}/${profile.course_id}/${profile.semester_id}/${subject.id}?tab=notes`);
                          }}
                        >
                          Notes
                        </span>
                        <span>•</span>
                        <span 
                          className="hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/university/${profile.university_id}/${profile.course_id}/${profile.semester_id}/${subject.id}?tab=pyqs`);
                          }}
                        >
                          PYQs
                        </span>
                        <span>•</span>
                        <span 
                          className="hover:text-primary transition-colors"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigate(`/university/${profile.university_id}/${profile.course_id}/${profile.semester_id}/${subject.id}?tab=questions`);
                          }}
                        >
                          Questions
                        </span>
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
