import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, User, GraduationCap, BookOpen, Calendar, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface University {
  id: string;
  name: string;
  full_name: string;
}

interface Course {
  id: string;
  name: string;
  code: string;
}

interface Semester {
  id: string;
  name: string;
  number: number;
}

const steps = [
  { id: 1, title: 'Your Name', icon: User },
  { id: 2, title: 'University', icon: GraduationCap },
  { id: 3, title: 'Course', icon: BookOpen },
  { id: 4, title: 'Semester', icon: Calendar },
];

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [fullName, setFullName] = useState('');
  const [universityId, setUniversityId] = useState('');
  const [courseId, setCourseId] = useState('');
  const [semesterId, setSemesterId] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading, updateProfile, isProfileComplete } = useProfile();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Check if user is editing (allows complete profiles to access onboarding)
  const isEditMode = searchParams.get('edit') === 'true';

  // Pre-fill existing data
  useEffect(() => {
    if (profile) {
      if (profile.full_name) setFullName(profile.full_name);
      if (profile.university_id) setUniversityId(profile.university_id);
      if (profile.course_id) setCourseId(profile.course_id);
      if (profile.semester_id) setSemesterId(profile.semester_id);
    }
  }, [profile]);

  // Fetch universities
  useEffect(() => {
    const fetchUniversities = async () => {
      const { data } = await supabase.from('universities').select('id, name, full_name').order('name');
      if (data) setUniversities(data);
      setLoadingData(false);
    };
    fetchUniversities();
  }, []);

  // Fetch courses when university changes
  useEffect(() => {
    if (!universityId) {
      setCourses([]);
      setCourseId('');
      return;
    }
    const fetchCourses = async () => {
      const { data } = await supabase
        .from('courses')
        .select('id, name, code')
        .eq('university_id', universityId)
        .order('name');
      if (data) setCourses(data);
    };
    fetchCourses();
  }, [universityId]);

  // Fetch semesters when course changes
  useEffect(() => {
    if (!courseId) {
      setSemesters([]);
      setSemesterId('');
      return;
    }
    const fetchSemesters = async () => {
      const { data } = await supabase
        .from('semesters')
        .select('id, name, number')
        .eq('course_id', courseId)
        .order('number');
      if (data) setSemesters(data);
    };
    fetchSemesters();
  }, [courseId]);

  const canProceed = () => {
    switch (currentStep) {
      case 1: return fullName.trim().length >= 2;
      case 2: return !!universityId;
      case 3: return !!courseId;
      case 4: return !!semesterId;
      default: return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    const { error } = await updateProfile({
      full_name: fullName.trim(),
      university_id: universityId,
      course_id: courseId,
      semester_id: semesterId,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save profile',
        variant: 'destructive',
      });
      setLoading(false);
    } else {
      toast({
        title: 'Profile Complete!',
        description: 'Welcome to EXAM Simplex. Let\'s get started!',
      });
      // Small delay to ensure profile state is updated before navigation
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 100);
    }
  };

  // Show loading while checking auth/profile status
  if (authLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    navigate('/auth');
    return null;
  }

  // Redirect to dashboard if profile is already complete (unless in edit mode)
  if (isProfileComplete && !isEditMode) {
    navigate('/dashboard', { replace: true });
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center transition-all",
                  currentStep > step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.id
                    ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "w-12 h-1 mx-1 rounded",
                    currentStep > step.id ? "bg-primary" : "bg-muted"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="border-0 shadow-xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              Step {currentStep} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-4">
            {/* Step 1: Name */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  What should we call you?
                </p>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="text-lg h-12"
                  />
                </div>
              </div>
            )}

            {/* Step 2: University */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  Select your university
                </p>
                <Select value={universityId} onValueChange={setUniversityId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose university" />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.id}>
                        {uni.name} - {uni.full_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {universities.length === 0 && !loadingData && (
                  <p className="text-sm text-muted-foreground text-center">
                    No universities found. Please contact support.
                  </p>
                )}
              </div>
            )}

            {/* Step 3: Course */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  What course are you pursuing?
                </p>
                <Select value={courseId} onValueChange={setCourseId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((course) => (
                      <SelectItem key={course.id} value={course.id}>
                        {course.name} ({course.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {courses.length === 0 && universityId && (
                  <p className="text-sm text-muted-foreground text-center">
                    No courses found for this university.
                  </p>
                )}
              </div>
            )}

            {/* Step 4: Semester */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center">
                  Which semester are you in?
                </p>
                <Select value={semesterId} onValueChange={setSemesterId}>
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Choose semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((sem) => (
                      <SelectItem key={sem.id} value={sem.id}>
                        {sem.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {semesters.length === 0 && courseId && (
                  <p className="text-sm text-muted-foreground text-center">
                    No semesters found for this course.
                  </p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1"
                  disabled={loading}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1"
                disabled={!canProceed() || loading}
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {currentStep === 4 ? 'Complete' : 'Continue'}
                {currentStep < 4 && <ChevronRight className="h-4 w-4 ml-1" />}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
