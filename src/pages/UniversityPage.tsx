import { useState, useEffect, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  MapPin,
  FileText,
  Download,
  GraduationCap,
  BarChart3,
  Filter,
  Loader2,
  ChevronDown,
  ChevronRight,
  BookOpen,
  X,
  ArrowRight,
  Trophy,
  TrendingUp,
  Layers,
  Sparkles,
  MessageSquare,
} from "lucide-react";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import { Separator } from "@/components/ui/separator";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SubjectAIChat } from "@/components/SubjectAIChat";
import { supabase } from "@/integrations/supabase/client";
import type { University, Course, Semester, Subject } from "@/types/database";
import { SEO, createBreadcrumbSchema, createWebPageSchema } from "@/components/SEO";
import { cn } from "@/lib/utils";

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

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatPill = ({
  icon: Icon,
  value,
  label,
  onClick,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white transition-all duration-200 border border-white/10 hover:border-white/25"
  >
    <Icon className="h-3.5 w-3.5 text-blue-200" />
    <span className="font-bold">{value}</span>
    <span className="text-blue-200 font-normal">{label}</span>
  </button>
);

const SidebarStatCard = ({
  icon: Icon,
  value,
  label,
  color,
  onClick,
}: {
  icon: React.ElementType;
  value: number;
  label: string;
  color: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "flex flex-col items-start p-3 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 text-left w-full",
      color
    )}
  >
    <Icon className="h-4 w-4 mb-1.5 opacity-70" />
    <span className="text-xl font-bold leading-none">{value}</span>
    <span className="text-xs mt-0.5 opacity-70">{label}</span>
  </button>
);

// ─── Main component ────────────────────────────────────────────────────────────

const UniversityPage = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);
  const [expandedCourses, setExpandedCourses] = useState<string[]>([]);
  const [selectedDegree, setSelectedDegree] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("courses");
  const [rightPanel, setRightPanel] = useState<"ai" | "stats">("ai");

  // Data states
  const [university, setUniversity] = useState<University | null>(null);
  const [courses, setCourses] = useState<CourseWithSemesters[]>([]);
  const [pyqCount, setPyqCount] = useState<number>(0);
  const [notesCount, setNotesCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);



  useEffect(() => {
    async function fetchUniversityData() {
      if (!universityId) return;

      try {
        const { data: uniData, error: uniError } = await supabase
          .from('universities')
          .select('*')
          .eq('slug', universityId)
          .maybeSingle();

        if (uniError) throw uniError;

        if (uniData) {
          setUniversity(uniData);

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

          // No auto-expand on load

          const subjectIds = fetchedCourses.flatMap(c =>
            c.semesters?.flatMap(s => s.subjects?.map(sub => sub.id) || []) || []
          );

          if (subjectIds.length > 0) {
            const { count: pyqsCount } = await supabase
              .from('pyq_papers')
              .select('*', { count: 'exact', head: true })
              .in('subject_id', subjectIds);

            setPyqCount(pyqsCount || 0);

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

  const fallbackUni = fallbackUniversityData[universityId || ""] || {
    name: universityId?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "University",
    location: "India",
    type: "State University",
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

  // AI panel subject context for university-level AI
  const aiSubject = useMemo(() => ({
    id: university?.id || "university-general",
    name: displayUniversity.name,
    code: "GEN",
  }), [university?.id, displayUniversity.name]);

  const toggleSemester = (key: string) => {
    setExpandedSemester(expandedSemester === key ? null : key);
  };

  const toggleCourse = (courseId: string) => {
    setExpandedCourses(prev =>
      prev.includes(courseId) ? prev.filter(id => id !== courseId) : [...prev, courseId]
    );
  };

  const filteredCourses = useMemo(() => {
    if (selectedDegree === "all") return courses;
    return courses.filter(c => c.id === selectedDegree);
  }, [courses, selectedDegree]);

  const semesterOptions = useMemo(() => {
    const targetCourses = selectedDegree === "all" ? courses : courses.filter(c => c.id === selectedDegree);
    const semesters = targetCourses.flatMap(c => c.semesters || []);
    const uniqueSemesters = [...new Map(semesters.map(s => [s.number, s])).values()];
    return uniqueSemesters.sort((a, b) => a.number - b.number);
  }, [courses, selectedDegree]);

  const getFilteredSemesters = (courseSemesters: (Semester & { subjects: Subject[] })[]) => {
    if (selectedSemester === "all") return courseSemesters;
    return courseSemesters.filter(s => s.number.toString() === selectedSemester);
  };

  const hasActiveFilters = selectedDegree !== "all" || selectedSemester !== "all";

  const clearFilters = () => {
    setSelectedDegree("all");
    setSelectedSemester("all");
  };

  // ─── Auto-expand logic via Filters ─────────────────────────────────────────
  useEffect(() => {
    if (selectedDegree !== "all" && selectedSemester !== "all") {
      // Find the specific course
      const course = courses.find(c => c.id === selectedDegree);
      if (course) {
        // Expand the course card if not already expanded
        setExpandedCourses(prev => prev.includes(course.id) ? prev : [...prev, course.id]);

        // Find the exact semester id to set expandedSemester key
        const sem = course.semesters?.find(s => s.number.toString() === selectedSemester);
        if (sem) {
          setExpandedSemester(`${course.id}-${sem.id}`);
        }
      }
    }
  }, [selectedDegree, selectedSemester, courses]);

  // ─── Tab config ────────────────────────────────────────────────────────────
  const tabs = [
    { id: "courses", label: "Courses", icon: GraduationCap, count: displayUniversity.stats.courses },
    { id: "notes", label: "Notes", icon: BookOpen, count: displayUniversity.stats.notes },
    { id: "past-papers", label: "Past Papers", icon: FileText, count: displayUniversity.stats.pastPapers },
  ];

  // ─── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            {/* Skeleton hero */}
            <div className="h-14 bg-background border-b border-border px-4 flex items-center gap-4 animate-pulse">
              <div className="h-8 w-8 bg-muted rounded-md" />
              <div className="h-4 w-48 bg-muted rounded-full" />
            </div>
            <div className="bg-gradient-to-r from-[#1a1f4e] via-[#243b8a] to-[#2d5bb9] px-8 py-10">
              <div className="animate-pulse space-y-3 max-w-lg">
                <div className="h-8 w-72 bg-white/20 rounded-full" />
                <div className="h-4 w-48 bg-white/10 rounded-full" />
                <div className="flex gap-2 pt-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-8 w-24 bg-white/10 rounded-full" />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  // ─── SEO ────────────────────────────────────────────────────────────────────
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

        <main className="flex-1 flex min-w-0">
          <div className="flex-1 flex flex-col overflow-y-auto min-w-0">

            {/* ── Sticky Top Bar ───────────────────────────────────────────── */}
            <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border">
              <div className="flex items-center gap-3 px-4 py-3">
                <SidebarTrigger />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
                  <ChevronRight className="h-3.5 w-3.5" />
                  <span className="text-foreground font-medium truncate">{displayUniversity.name}</span>
                </div>
              </div>
            </header>

            {/* ── Hero Banner ──────────────────────────────────────────────── */}
            <div className="relative overflow-hidden bg-gradient-to-r from-[#1a1f4e] via-[#243b8a] to-[#2d5bb9]">
              {/* Decorative blurred orbs */}
              <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 right-32 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 blur-xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/[0.04] rounded-full blur-lg pointer-events-none" />

              <div className="relative px-8 pt-8 pb-0">
                <div className="max-w-4xl">
                  {/* Type badge */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold text-blue-100 mb-4 border border-white/10">
                    <MapPin className="h-3 w-3" />
                    {displayUniversity.location} &middot; {displayUniversity.type}
                  </span>

                  {/* University name */}
                  <h1 className="text-3xl md:text-4xl font-display font-bold text-white leading-tight mb-2">
                    {displayUniversity.name}
                  </h1>
                  <p className="text-blue-200 text-sm max-w-xl mb-6">
                    {displayUniversity.description}
                  </p>
                </div>

                {/* ── Bottom stats bar inside hero ─────────────────────────── */}
                <div className="border-t border-white/10 pt-4 pb-5 flex flex-wrap gap-2">
                  <StatPill
                    icon={GraduationCap}
                    value={displayUniversity.stats.courses}
                    label="Courses"
                    onClick={() => setActiveTab("courses")}
                  />
                  <StatPill
                    icon={Layers}
                    value={displayUniversity.stats.subjects}
                    label="Subjects"
                    onClick={() => setActiveTab("courses")}
                  />
                  <StatPill
                    icon={BookOpen}
                    value={displayUniversity.stats.notes}
                    label="Notes"
                    onClick={() => setActiveTab("notes")}
                  />
                  <StatPill
                    icon={FileText}
                    value={displayUniversity.stats.pastPapers}
                    label="Past Papers"
                    onClick={() => setActiveTab("past-papers")}
                  />
                </div>
              </div>
            </div>

            {/* ── Content Area ─────────────────────────────────────────────── */}
            <div className="flex-1 px-6 py-6 space-y-5">

              {/* ── Tab Navigation ───────────────────────────────────────── */}
              <div className="flex items-center gap-1.5 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100/80">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 flex-1 justify-center",
                        isActive
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                          : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="hidden sm:inline">{tab.label}</span>
                      {tab.count !== undefined && tab.count > 0 && (
                        <span
                          className={cn(
                            "text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center",
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-gray-100 text-gray-500"
                          )}
                        >
                          {tab.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ── TAB 1: COURSES ───────────────────────────────────────── */}
              {activeTab === "courses" && (
                <div className="space-y-4">
                  {/* Section heading + filter summary */}
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest">
                      {hasActiveFilters ? "Filtered Results" : "All Degree Programmes"}
                    </h2>
                    <span className="text-xs text-muted-foreground">
                      {filteredCourses.length} {filteredCourses.length === 1 ? "programme" : "programmes"}
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="ml-2 text-indigo-500 hover:underline">
                          · Clear filter
                        </button>
                      )}
                    </span>
                  </div>

                  {/* Degree cards grid */}
                  {filteredCourses.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4">
                      {filteredCourses.map((course) => {
                        const isOpen = expandedCourses.includes(course.id);
                        const totalSubjects = course.semesters?.reduce((a, s) => a + (s.subjects?.length || 0), 0) || 0;
                        const totalSemesters = course.semesters?.length || 0;

                        return (
                          <div
                            key={course.id}
                            className="bg-white rounded-2xl border border-gray-100/80 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md"
                          >
                            {/* Card header — clean white */}
                            <button
                              onClick={() => toggleCourse(course.id)}
                              className="w-full text-left relative overflow-hidden bg-white group"
                            >
                              <div className="relative px-6 py-5 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center border border-indigo-100 shrink-0 group-hover:bg-indigo-100 transition-colors">
                                    <GraduationCap className="h-6 w-6 text-indigo-600" />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors">
                                        {course.name}
                                      </h3>
                                      <span className="text-[10px] font-semibold px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full border border-gray-200">
                                        {course.code}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                        <Layers className="h-3.5 w-3.5" />
                                        {totalSemesters} Semesters
                                      </span>
                                      <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                        <BookOpen className="h-3.5 w-3.5" />
                                        {totalSubjects} Subjects
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <div className="shrink-0 flex items-center gap-2">
                                  {isOpen ? (
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                      <ChevronDown className="h-4 w-4 text-gray-500" />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </button>

                            {/* Expanded — semester list */}
                            {isOpen && (
                              <div className="px-5 pb-5 pt-2 border-t border-gray-100 space-y-2">
                                {getFilteredSemesters(course.semesters || [])
                                  .sort((a, b) => a.number - b.number)
                                  .map((semester) => {
                                    const semKey = `${course.id}-${semester.id}`;
                                    const isExpanded = expandedSemester === semKey;
                                    return (
                                      <div key={semester.id}>
                                        <button
                                          className="w-full flex items-center justify-between px-4 py-3 mt-2 bg-gray-50 hover:bg-slate-100/80 rounded-xl transition-all duration-200 group border border-transparent hover:border-gray-200"
                                          onClick={() => toggleSemester(semKey)}
                                        >
                                          <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-700 border border-gray-100">
                                              {semester.number}
                                            </div>
                                            <p className="font-semibold text-sm text-gray-900 group-hover:text-indigo-600 transition-colors">
                                              {semester.name}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <span className="text-[11px] font-medium text-gray-500 bg-white px-2.5 py-1 rounded-full border border-gray-100 shadow-sm">
                                              {semester.subjects?.length || 0} subjects
                                            </span>
                                            {isExpanded ? (
                                              <ChevronDown className="h-4 w-4 text-indigo-500" />
                                            ) : (
                                              <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                                            )}
                                          </div>
                                        </button>

                                        {/* Subject table */}
                                        {isExpanded && semester.subjects && semester.subjects.length > 0 && (
                                          <div className="mt-2 rounded-xl border border-gray-100 overflow-hidden">
                                            <table className="w-full text-sm">
                                              <thead>
                                                <tr className="bg-gray-50 text-left">
                                                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Subject</th>
                                                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden sm:table-cell">Code</th>
                                                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide hidden md:table-cell">Type</th>
                                                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-400 uppercase tracking-wide text-right">Action</th>
                                                </tr>
                                              </thead>
                                              <tbody className="divide-y divide-gray-50">
                                                {semester.subjects.map((subject, idx) => (
                                                  <tr
                                                    key={subject.id}
                                                    className={cn(
                                                      "hover:bg-indigo-50/50 transition-colors group/row",
                                                      idx % 2 === 0 ? "bg-white" : "bg-gray-50/30"
                                                    )}
                                                  >
                                                    <td className="px-4 py-3 font-medium text-gray-900">{subject.name}</td>
                                                    <td className="px-4 py-3 hidden sm:table-cell">
                                                      <span className="text-xs text-gray-400 font-mono bg-gray-100 px-2 py-0.5 rounded">
                                                        {subject.code}
                                                      </span>
                                                    </td>
                                                    <td className="px-4 py-3 hidden md:table-cell">
                                                      <span className="inline-flex items-center text-[11px] font-semibold px-2 py-1 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        {subject.pattern}
                                                      </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                      <Link
                                                        to={`/university/${universityId}/${course.code}/${semester.number}/${subject.slug}`}
                                                        className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition-colors group-hover/row:gap-1.5"
                                                      >
                                                        Open
                                                        <ArrowRight className="h-3 w-3 transition-transform group-hover/row:translate-x-0.5" />
                                                      </Link>
                                                    </td>
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="h-8 w-8 text-gray-300" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-1">No courses found</h3>
                      <p className="text-sm text-gray-400 mb-4">Try adjusting your filters or check back soon.</p>
                      {hasActiveFilters && (
                        <button onClick={clearFilters} className="text-sm text-indigo-600 hover:underline font-medium">
                          Clear all filters
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB 2: NOTES ─────────────────────────────────────────── */}
              {activeTab === "notes" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">Study Notes</h2>
                        <p className="text-xs text-gray-500">Chapter-wise curated notes for every subject</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center py-16 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                      <BookOpen className="h-7 w-7 text-emerald-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">Notes available inside subjects</h3>
                    <p className="text-sm text-gray-400 max-w-xs mb-5">
                      Open any subject from the Courses tab to access its chapter-wise notes.
                    </p>
                    <button
                      onClick={() => setActiveTab("courses")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      Browse Courses
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* ── TAB 3: PAST PAPERS ───────────────────────────────────── */}
              {activeTab === "past-papers" && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-5 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center">
                        <FileText className="h-4 w-4 text-amber-600" />
                      </div>
                      <div>
                        <h2 className="font-bold text-gray-900">Previous Year Papers</h2>
                        <p className="text-xs text-gray-500">Download and practice with actual exam papers</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center py-16 px-6 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto mb-4">
                      <Download className="h-7 w-7 text-amber-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">PYQs available inside subjects</h3>
                    <p className="text-sm text-gray-400 max-w-xs mb-5">
                      Navigate to any subject to access and download previous year question papers.
                    </p>
                    <button
                      onClick={() => setActiveTab("courses")}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-sm font-semibold transition-colors"
                    >
                      Browse Courses
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              )}


            </div>
          </div>

          {/* ── Right Panel (toggle between Stats & AI) ────────────────── */}
          <aside className="w-80 border-l border-border bg-background hidden lg:flex flex-col sticky top-0 h-screen overflow-hidden">
            {/* Toggle header */}
            <div className="flex items-center border-b border-border shrink-0">
              <button
                onClick={() => setRightPanel("stats")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-3 text-xs font-semibold transition-all duration-200",
                  rightPanel === "stats"
                    ? "text-indigo-700 bg-indigo-50 border-b-2 border-indigo-600"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                Stats & Filters
              </button>
              <button
                onClick={() => setRightPanel("ai")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-3 text-xs font-semibold transition-all duration-200",
                  rightPanel === "ai"
                    ? "text-indigo-700 bg-indigo-50 border-b-2 border-indigo-600"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <MessageSquare className="h-3.5 w-3.5" />
                AI Assistant
              </button>
            </div>

            {/* Stats & Filters panel */}
            {rightPanel === "stats" && (
              <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
                {/* University Stats */}
                <div>
                  <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                    <BarChart3 className="h-3.5 w-3.5" />
                    University Stats
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <SidebarStatCard
                      icon={GraduationCap}
                      value={displayUniversity.stats.courses}
                      label="Courses"
                      color="bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100"
                      onClick={() => setActiveTab("courses")}
                    />
                    <SidebarStatCard
                      icon={Layers}
                      value={displayUniversity.stats.subjects}
                      label="Subjects"
                      color="bg-violet-50 text-violet-700 border-violet-100 hover:bg-violet-100"
                      onClick={() => setActiveTab("courses")}
                    />
                    <SidebarStatCard
                      icon={BookOpen}
                      value={displayUniversity.stats.notes}
                      label="Notes"
                      color="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100"
                      onClick={() => setActiveTab("notes")}
                    />
                    <SidebarStatCard
                      icon={FileText}
                      value={displayUniversity.stats.pastPapers}
                      label="Past Papers"
                      color="bg-amber-50 text-amber-700 border-amber-100 hover:bg-amber-100"
                      onClick={() => setActiveTab("past-papers")}
                    />
                  </div>
                </div>

                <Separator />

                {/* Quick Filters */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5" />
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
                  {/* Course pills */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-2">Course</p>
                      <div className="flex flex-wrap gap-1.5">
                        <button
                          onClick={() => { setSelectedDegree("all"); setSelectedSemester("all"); setActiveTab("courses"); }}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
                            selectedDegree === "all"
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                              : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                          )}
                        >All</button>
                        {courses.map(c => (
                          <button
                            key={c.id}
                            onClick={() => { setSelectedDegree(c.id); setSelectedSemester("all"); setActiveTab("courses"); }}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
                              selectedDegree === c.id
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                            )}
                          >{c.code}</button>
                        ))}
                      </div>
                    </div>

                    {semesterOptions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-2">Semester</p>
                        <div className="flex flex-wrap gap-1.5">
                          <button
                            onClick={() => { setSelectedSemester("all"); setActiveTab("courses"); }}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150",
                              selectedSemester === "all"
                                ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                            )}
                          >All</button>
                          {semesterOptions.map(s => (
                            <button
                              key={s.id}
                              onClick={() => { setSelectedSemester(s.number.toString()); setActiveTab("courses"); }}
                              className={cn(
                                "w-8 h-8 rounded-full text-xs font-bold border transition-all duration-150 flex items-center justify-center",
                                selectedSemester === s.number.toString()
                                  ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                              )}
                            >{s.number}</button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Tip */}
                <div className="mt-auto">
                  <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl border border-indigo-100 p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Trophy className="h-3.5 w-3.5 text-indigo-500" />
                      <span className="text-xs font-bold text-indigo-700">Study Smarter</span>
                    </div>
                    <p className="text-[11px] text-indigo-600 leading-relaxed">
                      Start from Courses → open a subject → use AI tools for targeted exam prep.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Chat panel */}
            {rightPanel === "ai" && (
              <div className="flex-1 min-h-0 overflow-hidden">
                <SubjectAIChat
                  subject={aiSubject}
                  universityName={displayUniversity.name}
                />
              </div>
            )}
          </aside>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UniversityPage;
