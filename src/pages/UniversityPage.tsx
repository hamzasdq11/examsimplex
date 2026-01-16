import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  MapPin,
  FileText,
  Download,
  ExternalLink,
  MessageSquare,
  Sparkles,
  ClipboardList,
  GraduationCap,
  BarChart3,
  Filter,
  Loader2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Zap,
  Settings,
  User,
  X
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import AIToolDialog from "@/components/AIToolDialog";
import { supabase } from "@/integrations/supabase/client";
import type { University, Course, Semester, Subject } from "@/types/database";
import { SEO, createBreadcrumbSchema, createWebPageSchema } from "@/components/SEO";

// Fallback mock data
const fallbackUniversityData: Record<string, {
  name: string;
  location: string;
  type: string;
  description: string;
  stats: { courses: number; subjects: number; pastPapers: number };
}> = {
  "aligarh-muslim-university": {
    name: "Aligarh Muslim University",
    location: "Aligarh, Uttar Pradesh",
    type: "Central University",
    description: "Browse courses, notes, past papers, and exam resources for Aligarh Muslim University.",
    stats: { courses: 156, subjects: 892, pastPapers: 1456 }
  },
  "university-of-delhi": {
    name: "University of Delhi",
    location: "New Delhi, Delhi",
    type: "Central University",
    description: "Browse courses, notes, past papers, and exam resources for University of Delhi.",
    stats: { courses: 245, subjects: 1234, pastPapers: 2345 }
  },
  "banaras-hindu-university": {
    name: "Banaras Hindu University",
    location: "Varanasi, Uttar Pradesh",
    type: "Central University",
    description: "Browse courses, notes, past papers, and exam resources for Banaras Hindu University.",
    stats: { courses: 198, subjects: 1045, pastPapers: 1890 }
  }
};

interface CourseWithSemesters extends Course {
  semesters: (Semester & { subjects: Subject[] })[];
}

const UniversityPage = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);
  const [selectedDegree, setSelectedDegree] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("courses");
  
  // Data states
  const [university, setUniversity] = useState<University | null>(null);
  const [courses, setCourses] = useState<CourseWithSemesters[]>([]);
  const [pyqCount, setPyqCount] = useState<number>(0);
  const [notesCount, setNotesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  
  // AI Tool dialog states (for AI Tools tab)
  const [askAIOpen, setAskAIOpen] = useState(false);
  const [notesAIOpen, setNotesAIOpen] = useState(false);
  const [quizAIOpen, setQuizAIOpen] = useState(false);

  useEffect(() => {
    async function fetchUniversityData() {
      if (!universityId) return;

      try {
        // First try to find university by slug
        const { data: uniData, error: uniError } = await supabase
          .from('universities')
          .select('*')
          .eq('slug', universityId)
          .maybeSingle();

        if (uniError) throw uniError;

        if (uniData) {
          setUniversity(uniData);

          // Fetch courses with semesters and subjects
          const { data: coursesData, error: coursesError } = await supabase
            .from('courses')
            .select(`
              *,
              semesters (
                *,
                subjects (*)
              )
            `)
            .eq('university_id', uniData.id)
            .order('name');

          if (coursesError) throw coursesError;
          const fetchedCourses = coursesData as CourseWithSemesters[] || [];
          setCourses(fetchedCourses);

          // Fetch PYQ count for this university
          const subjectIds = fetchedCourses.flatMap(c => 
            c.semesters?.flatMap(s => s.subjects?.map(sub => sub.id) || []) || []
          );
          
          if (subjectIds.length > 0) {
            const { count: pyqsCount } = await supabase
              .from('pyq_papers')
              .select('*', { count: 'exact', head: true })
              .in('subject_id', subjectIds);
            
            setPyqCount(pyqsCount || 0);

            // Fetch Notes count
            const unitIds: string[] = [];
            for (const course of fetchedCourses) {
              for (const semester of course.semesters || []) {
                for (const subject of semester.subjects || []) {
                  const { data: units } = await supabase
                    .from('units')
                    .select('id')
                    .eq('subject_id', subject.id);
                  if (units) unitIds.push(...units.map(u => u.id));
                }
              }
            }
            
            if (unitIds.length > 0) {
              const { count: notesC } = await supabase
                .from('notes')
                .select('*', { count: 'exact', head: true })
                .in('unit_id', unitIds);
              setNotesCount(notesC || 0);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching university data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUniversityData();
  }, [universityId]);

  // Get fallback university data if not from database
  const fallbackUni = fallbackUniversityData[universityId || ""] || {
    name: universityId?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "University",
    location: "India",
    type: "Central University",
    description: "Browse courses, notes, past papers, and exam resources.",
    stats: { courses: 120, subjects: 650, pastPapers: 1200 }
  };

  const displayUniversity = university ? {
    name: university.full_name,
    location: university.location,
    type: university.type,
    description: `Browse courses, notes, past papers, and exam resources for ${university.full_name}.`,
    stats: { 
      courses: courses.length, 
      subjects: courses.reduce((acc, c) => acc + (c.semesters?.reduce((a, s) => a + (s.subjects?.length || 0), 0) || 0), 0),
      pastPapers: pyqCount,
      notes: notesCount
    }
  } : { ...fallbackUni, stats: { ...fallbackUni.stats, notes: 0 } };

  const toggleSemester = (key: string) => {
    setExpandedSemester(expandedSemester === key ? null : key);
  };

  // Filter courses based on selected degree
  const filteredCourses = useMemo(() => {
    if (selectedDegree === "all") return courses;
    return courses.filter(c => c.id === selectedDegree);
  }, [courses, selectedDegree]);

  // Get dynamic semester options based on selected course
  const semesterOptions = useMemo(() => {
    const targetCourses = selectedDegree === "all" ? courses : courses.filter(c => c.id === selectedDegree);
    const semesters = targetCourses.flatMap(c => c.semesters || []);
    const uniqueSemesters = [...new Map(semesters.map(s => [s.number, s])).values()];
    return uniqueSemesters.sort((a, b) => a.number - b.number);
  }, [courses, selectedDegree]);

  // Filter semesters within courses based on selected semester
  const getFilteredSemesters = (courseSemesters: (Semester & { subjects: Subject[] })[]) => {
    if (selectedSemester === "all") return courseSemesters;
    return courseSemesters.filter(s => s.number.toString() === selectedSemester);
  };

  // Check if filters are active
  const hasActiveFilters = selectedDegree !== "all" || selectedSemester !== "all";

  const clearFilters = () => {
    setSelectedDegree("all");
    setSelectedSemester("all");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // SEO data
  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const canonicalUrl = `/university/${universityId}`;
  const seoTitle = `${displayUniversity.name} - Courses, Notes & Past Papers`;
  const seoDescription = `Explore ${displayUniversity.name} exam resources. Access ${displayUniversity.stats.courses} courses, study notes, and previous year question papers for all semesters.`;
  
  const breadcrumbSchema = createBreadcrumbSchema([
    { name: 'Home', url: origin },
    { name: displayUniversity.name, url: `${origin}${canonicalUrl}` },
  ]);
  
  const webPageSchema = createWebPageSchema({
    title: seoTitle,
    description: seoDescription,
    url: `${origin}${canonicalUrl}`,
  });

  return (
    <SidebarProvider>
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        jsonLd={[breadcrumbSchema, webPageSchema]}
      />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        
        {/* Main Content */}
        <main className="flex-1 flex">
          <div className="flex-1 overflow-y-auto">
            {/* Header with SidebarTrigger */}
            <header className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
              <div className="flex items-center gap-4 px-4 py-3">
                <SidebarTrigger />
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-foreground">
                    {displayUniversity.name}
                  </h1>
                </div>
              </div>
            </header>

            {/* University Header */}
            <div className="bg-background border-b border-border px-8 py-6">
              <div className="max-w-5xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                      {displayUniversity.name}
                    </h1>
                    <div className="flex items-center gap-4 text-muted-foreground mb-3">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {displayUniversity.location}
                      </span>
                      <Badge variant="secondary" className="font-medium">
                        {displayUniversity.type}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground max-w-2xl">
                      {displayUniversity.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Tabs Navigation */}
            <div className="px-8 py-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="bg-muted/50 p-1 h-auto">
                  <TabsTrigger value="courses" className="px-4 py-2 data-[state=active]:bg-background">
                    Courses
                  </TabsTrigger>
                  <TabsTrigger value="notes" className="px-4 py-2 data-[state=active]:bg-background">
                    Notes
                  </TabsTrigger>
                  <TabsTrigger value="past-papers" className="px-4 py-2 data-[state=active]:bg-background">
                    Past Papers
                  </TabsTrigger>
                  <TabsTrigger value="ai-tools" className="px-4 py-2 data-[state=active]:bg-background">
                    AI Tools
                  </TabsTrigger>
                </TabsList>

                {/* TAB 1: COURSES */}
                <TabsContent value="courses" className="mt-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Courses at {displayUniversity.name}
                  </h2>

                  {filteredCourses.length > 0 ? (
                    <Accordion type="multiple" className="space-y-3">
                      {filteredCourses.map((course) => (
                        <AccordionItem 
                          key={course.id} 
                          value={course.id}
                          className="border border-border rounded-lg px-4 bg-card"
                        >
                          <AccordionTrigger className="hover:no-underline py-4">
                            <div className="flex items-center gap-3">
                              <GraduationCap className="h-5 w-5 text-muted-foreground" />
                              <span className="font-medium text-foreground">{course.name}</span>
                              <Badge variant="outline" className="text-xs">{course.code}</Badge>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-4">
                            <div className="grid gap-3">
                              {getFilteredSemesters(course.semesters || []).sort((a, b) => a.number - b.number).map((semester) => (
                                <div key={semester.id}>
                                  <div 
                                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                    onClick={() => toggleSemester(`${course.id}-${semester.id}`)}
                                  >
                                    <div className="flex items-center gap-3">
                                      {expandedSemester === `${course.id}-${semester.id}` ? (
                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                      )}
                                      <div>
                                        <p className="font-medium text-foreground">{semester.name}</p>
                                        <p className="text-sm text-muted-foreground">{semester.subjects?.length || 0} subjects</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <Badge variant="outline" className="text-xs">Exam-focused</Badge>
                                      <Button size="sm" variant="outline">View Subjects</Button>
                                    </div>
                                  </div>

                                  {/* Subject List */}
                                  {expandedSemester === `${course.id}-${semester.id}` && semester.subjects && semester.subjects.length > 0 && (
                                    <div className="mt-3 border border-border rounded-lg overflow-hidden">
                                      <table className="w-full">
                                        <thead className="bg-muted/30">
                                          <tr className="text-left text-sm">
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Subject Name</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Code</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                                            <th className="px-4 py-3 font-medium text-muted-foreground">Action</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-border">
                                          {semester.subjects.map((subject) => (
                                            <tr key={subject.id} className="hover:bg-muted/20">
                                              <td className="px-4 py-3 font-medium text-foreground">{subject.name}</td>
                                              <td className="px-4 py-3 text-muted-foreground">{subject.code}</td>
                                              <td className="px-4 py-3">
                                                <Badge variant="secondary" className="text-xs">
                                                  {subject.pattern}
                                                </Badge>
                                              </td>
                                              <td className="px-4 py-3">
                                                <Button size="sm" variant="ghost" className="text-primary" asChild>
                                                  <Link to={`/university/${universityId}/${course.code}/${semester.number}/${subject.slug}`}>
                                                    Open Subject <ExternalLink className="h-3 w-3 ml-1" />
                                                  </Link>
                                                </Button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  ) : (
                    <div className="text-center py-12 bg-muted/30 rounded-lg">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">No courses available</h3>
                      <p className="text-muted-foreground">
                        Courses and subjects for this university will appear here soon.
                      </p>
                    </div>
                  )}
                </TabsContent>

                {/* TAB 2: NOTES */}
                <TabsContent value="notes" className="mt-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Study Notes
                  </h2>
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">Notes coming soon</h3>
                    <p className="text-muted-foreground">
                      Study notes will be available once content is added.
                    </p>
                  </div>
                </TabsContent>

                {/* TAB 3: PAST PAPERS */}
                <TabsContent value="past-papers" className="mt-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Past Year Question Papers
                  </h2>
                  <div className="text-center py-12 bg-muted/30 rounded-lg">
                    <Download className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-foreground mb-2">PYQs coming soon</h3>
                    <p className="text-muted-foreground">
                      Previous year question papers will be available once uploaded.
                    </p>
                  </div>
                </TabsContent>

                {/* TAB 4: AI TOOLS */}
                <TabsContent value="ai-tools" className="mt-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    AI Tools for Students
                  </h2>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Ask AI Card */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
                          <MessageSquare className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg">Ask AI</CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">University Context</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Ask questions aligned with your university syllabus and exam patterns</p>
                        <Button className="w-full" onClick={() => setAskAIOpen(true)}>
                          Open Tool <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>

                    {/* AI Notes Card */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-3">
                          <Sparkles className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg">AI Notes</CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Smart Summaries</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Generate structured exam-ready notes for your subjects</p>
                        <Button className="w-full" onClick={() => setNotesAIOpen(true)}>
                          Open Tool <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>

                    {/* AI Quiz Card */}
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="w-12 h-12 rounded-lg bg-green-50 text-green-600 flex items-center justify-center mb-3">
                          <ClipboardList className="h-6 w-6" />
                        </div>
                        <CardTitle className="text-lg">AI Quiz</CardTitle>
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Practice Mode</p>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Practice exam-style MCQs based on university trends</p>
                        <Button className="w-full" onClick={() => setQuizAIOpen(true)}>
                          Open Tool <ExternalLink className="h-4 w-4 ml-2" />
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right Sidebar - Sticky */}
          <aside className="w-72 border-l border-border bg-background p-6 sticky top-0 h-screen overflow-y-auto hidden lg:block">
            {/* University Stats - Clickable */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                University Stats
              </h3>
              <div className="space-y-1">
                <button 
                  onClick={() => setActiveTab("courses")}
                  className="flex justify-between items-center w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <GraduationCap className="h-3.5 w-3.5" />
                    Courses
                  </span>
                  <span className="font-medium text-foreground">{displayUniversity.stats.courses}</span>
                </button>
                <button 
                  onClick={() => setActiveTab("courses")}
                  className="flex justify-between items-center w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <BookOpen className="h-3.5 w-3.5" />
                    Subjects
                  </span>
                  <span className="font-medium text-foreground">{displayUniversity.stats.subjects}</span>
                </button>
                <button 
                  onClick={() => setActiveTab("notes")}
                  className="flex justify-between items-center w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5" />
                    Notes
                  </span>
                  <span className="font-medium text-foreground">{displayUniversity.stats.notes}</span>
                </button>
                <button 
                  onClick={() => setActiveTab("past-papers")}
                  className="flex justify-between items-center w-full p-2 rounded-lg hover:bg-muted/50 transition-colors text-left"
                >
                  <span className="text-sm text-muted-foreground flex items-center gap-2">
                    <Download className="h-3.5 w-3.5" />
                    Past Papers
                  </span>
                  <span className="font-medium text-foreground">{displayUniversity.stats.pastPapers}</span>
                </button>
              </div>
            </div>

            <Separator className="my-5" />

            {/* Quick Filters - Functional */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Quick Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Course</label>
                  <Select value={selectedDegree} onValueChange={(value) => {
                    setSelectedDegree(value);
                    setSelectedSemester("all"); // Reset semester when course changes
                  }}>
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="All Courses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Courses</SelectItem>
                      {courses.map(c => (
                        <SelectItem key={c.id} value={c.id}>{c.code}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1.5 block">Semester</label>
                  <Select 
                    value={selectedSemester} 
                    onValueChange={setSelectedSemester}
                    disabled={semesterOptions.length === 0}
                  >
                    <SelectTrigger className="w-full h-9">
                      <SelectValue placeholder="All Semesters" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Semesters</SelectItem>
                      {semesterOptions.map(s => (
                        <SelectItem key={s.id} value={s.number.toString()}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="my-5" />

            {/* Your Context - Functional */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <User className="h-4 w-4" />
                Your Context
              </h3>
              <Card className="bg-muted/30 border-border">
                <CardContent className="p-3">
                  {profileLoading ? (
                    <div className="flex items-center justify-center py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : profile?.course ? (
                    <div className="space-y-2">
                      <div className="text-sm">
                        <p className="font-medium text-foreground">{profile.course.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {profile.semester?.name} • {profile.university?.name}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full h-8 text-xs"
                        onClick={() => navigate('/onboarding?edit=true')}
                      >
                        <Settings className="h-3 w-3 mr-1.5" />
                        Change Course
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs text-muted-foreground">
                        {user ? "Set your course to personalize content" : "Sign in to personalize your experience"}
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full h-8 text-xs"
                        onClick={() => navigate(user ? '/onboarding?edit=true' : '/auth')}
                      >
                        {user ? "Set Your Course" : "Sign In"}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Separator className="my-5" />

            {/* Quick Actions */}
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start h-9 text-xs"
                  onClick={() => setAskAIOpen(true)}
                >
                  <MessageSquare className="h-3.5 w-3.5 mr-2" />
                  Ask AI About Syllabus
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start h-9 text-xs"
                  onClick={() => setQuizAIOpen(true)}
                >
                  <ClipboardList className="h-3.5 w-3.5 mr-2" />
                  Start Practice Quiz
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start h-9 text-xs"
                  onClick={() => setActiveTab("past-papers")}
                >
                  <Download className="h-3.5 w-3.5 mr-2" />
                  Browse Past Papers
                </Button>
              </div>
            </div>
          </aside>
        </main>
      </div>

      {/* AI Tool Dialogs */}
      <AIToolDialog
        open={askAIOpen}
        onOpenChange={setAskAIOpen}
        type="ask"
        title="Ask AI"
        subtitle="Get answers aligned with your university syllabus"
        placeholder="Ask any question about your course material, concepts, or exam topics..."
        universityName={displayUniversity.name}
      />
      <AIToolDialog
        open={notesAIOpen}
        onOpenChange={setNotesAIOpen}
        type="notes"
        title="AI Notes Generator"
        subtitle="Generate structured, exam-ready notes"
        placeholder="Enter a topic to generate comprehensive study notes (e.g., 'Supply and Demand in Microeconomics')..."
        universityName={displayUniversity.name}
      />
      <AIToolDialog
        open={quizAIOpen}
        onOpenChange={setQuizAIOpen}
        type="quiz"
        title="AI Quiz Generator"
        subtitle="Practice with exam-style questions"
        placeholder="Enter a topic to generate practice MCQs (e.g., 'Financial Accounting: Journal Entries')..."
        universityName={displayUniversity.name}
      />
    </SidebarProvider>
  );
};

export default UniversityPage;
