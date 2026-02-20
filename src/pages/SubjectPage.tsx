import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import DOMPurify from "dompurify";
import Header from "@/components/landing/Header";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
  BookOpen,
  FileQuestion,
  FileText,
  Clock,
  Award,
  ChevronRight,
  ChevronDown,
  Download,
  Printer,
  Loader2,
  Sparkles,
  X,
  Home,
  GraduationCap,
  ArrowRight,
  Layers,
  Hash,
  Timer,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type {
  Subject,
  Unit,
  Note,
  ImportantQuestion,
  PYQPaper,
  PYQQuestion,
  University,
  Course,
  Semester,
} from "@/types/database";
import { SEO, createBreadcrumbSchema, createCourseSchema } from "@/components/SEO";
import { AddToLibraryButton } from "@/components/AddToLibraryButton";
import { AddToStudylistButton } from "@/components/AddToStudylistButton";
import { SubjectAIChat } from "@/components/SubjectAIChat";
import { MCQPractice } from "@/components/MCQPractice";
import { NoteViewer } from "@/components/NoteViewer";
import { cn } from "@/lib/utils";

interface NoteWithUnit extends Note {
  units: Unit;
}

interface PYQPaperWithQuestions extends PYQPaper {
  pyq_questions: PYQQuestion[];
}

interface ImportantQuestionWithUnit extends ImportantQuestion {
  units: Unit | null;
}

const SubjectPage = () => {
  const { universityId, courseId, semesterId, subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "questions";
  const [activeTab, setActiveTab] = useState(initialTab);
  const [openUnits, setOpenUnits] = useState<string[]>([]);
  const [openPyqYears, setOpenPyqYears] = useState<string[]>([]);
  const [aiMessage, setAiMessage] = useState("");
  const [aiMessages, setAiMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [isAIPanelCollapsed, setIsAIPanelCollapsed] = useState(false);
  const [isAIFullscreen, setIsAIFullscreen] = useState(false);

  // Database state
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState<Subject | null>(null);
  const [units, setUnits] = useState<Unit[]>([]);
  const [notes, setNotes] = useState<NoteWithUnit[]>([]);
  const [importantQuestions, setImportantQuestions] = useState<ImportantQuestionWithUnit[]>([]);
  const [pyqPapers, setPyqPapers] = useState<PYQPaperWithQuestions[]>([]);
  const [university, setUniversity] = useState<University | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [semester, setSemester] = useState<Semester | null>(null);

  useEffect(() => {
    const fetchSubjectData = async () => {
      if (!subjectId) return;

      setLoading(true);
      try {
        // Fetch subject with nested semester, course, university
        const { data: subjectData, error: subjectError } = await supabase
          .from("subjects")
          .select(
            `
            *,
            semesters!inner (
              *,
              courses!inner (
                *,
                universities!inner (*)
              )
            )
          `,
          )
          .eq("slug", subjectId)
          .maybeSingle();

        if (subjectError || !subjectData) {
          console.error("Error fetching subject:", subjectError);
          setLoading(false);
          return;
        }

        setSubject(subjectData);
        const semesterData = subjectData.semesters as unknown as Semester & {
          courses: Course & { universities: University };
        };
        setSemester(semesterData);
        setCourse(semesterData.courses);
        setUniversity(semesterData.courses.universities);

        // Set AI initial message with subject context
        setAiMessages([
          {
            role: "assistant",
            content: `Hello! I'm your ${subjectData.name} exam assistant. Ask me anything about ${subjectData.name} - concepts, questions, or exam preparation tips.`,
          },
        ]);

        // Fetch units
        const { data: unitsData, error: unitsError } = await supabase
          .from("units")
          .select("*")
          .eq("subject_id", subjectData.id)
          .order("number");

        if (unitsError) {
          console.error("Error fetching units:", unitsError);
        } else {
          setUnits(unitsData || []);
          if (unitsData && unitsData.length > 0) {
            setOpenUnits([unitsData[0].id]);
          }
        }

        // Fetch notes with unit info
        if (unitsData && unitsData.length > 0) {
          const unitIds = unitsData.map((u) => u.id);
          const { data: notesData, error: notesError } = await supabase
            .from("notes")
            .select("*, units!inner(*)")
            .in("unit_id", unitIds)
            .order("order_index");

          if (notesError) {
            console.error("Error fetching notes:", notesError);
          } else {
            setNotes((notesData as NoteWithUnit[]) || []);
          }
        }

        // Fetch important questions
        const { data: questionsData, error: questionsError } = await supabase
          .from("important_questions")
          .select("*, units(*)")
          .eq("subject_id", subjectData.id);

        if (questionsError) {
          console.error("Error fetching questions:", questionsError);
        } else {
          setImportantQuestions((questionsData as ImportantQuestionWithUnit[]) || []);
        }

        // Fetch PYQ papers with questions
        const { data: pyqData, error: pyqError } = await supabase
          .from("pyq_papers")
          .select("*, pyq_questions(*)")
          .eq("subject_id", subjectData.id)
          .order("year", { ascending: false });

        if (pyqError) {
          console.error("Error fetching PYQ papers:", pyqError);
        } else {
          setPyqPapers((pyqData as PYQPaperWithQuestions[]) || []);
          if (pyqData && pyqData.length > 0) {
            setOpenPyqYears([pyqData[0].year]);
          }
        }
      } catch (error) {
        console.error("Error fetching subject data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectData();
  }, [subjectId]);

  const toggleUnit = (unitId: string) => {
    setOpenUnits((prev) => (prev.includes(unitId) ? prev.filter((u) => u !== unitId) : [...prev, unitId]));
  };

  const togglePyqYear = (year: string) => {
    setOpenPyqYears((prev) => (prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]));
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "Very Frequent":
        return "bg-red-50 text-red-600 border-red-200";
      case "Repeated":
        return "bg-amber-50 text-amber-600 border-amber-200";
      case "Expected":
        return "bg-blue-50 text-blue-600 border-blue-200";
      default:
        return "bg-gray-50 text-gray-500 border-gray-200";
    }
  };

  const handleAiSubmit = async () => {
    if (!aiMessage.trim()) return;
    const messageText = aiMessage;
    setAiMessages((prev) => [...prev, { role: "user", content: messageText }]);
    setAiMessage("");

    try {
      const { data, error } = await supabase.functions.invoke("ai-assistant", {
        body: {
          type: "ask",
          message: messageText,
          subject: subject?.name,
          context: university?.name ? `${university.name} - ${subject?.code}` : subject?.code,
        },
      });

      if (error) throw error;

      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.content || "I couldn't generate a response. Please try again.",
        },
      ]);
    } catch (error) {
      console.error("AI error:", error);
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }
  };

  // Group notes by unit
  const notesByUnit = units.map((unit) => ({
    unit,
    notes: notes.filter((note) => note.unit_id === unit.id),
  }));

  // Tab configuration
  const tabs = [
    { id: "questions", label: "Questions", icon: FileQuestion, count: importantQuestions.length },
    { id: "notes", label: "Notes", icon: BookOpen, count: notes.length },
    { id: "pyq", label: "PYQs", icon: FileText, count: pyqPapers.length },
    { id: "ai", label: "Practice", icon: Sparkles },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f6f8]">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-[#f5f6f8]">
        <Header />
        <div className="max-w-md mx-auto px-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-8 w-8 text-gray-300" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Subject not found</h1>
          <p className="text-sm text-gray-500 mb-6">The subject you're looking for doesn't exist.</p>
          <Link to={universityId ? `/university/${universityId}` : "/"}>
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl">Go Back</Button>
          </Link>
        </div>
      </div>
    );
  }

  // SEO data
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const canonicalUrl = `/university/${universityId}/${courseId}/${semesterId}/${subjectId}`;
  const seoTitle = `${subject.name} - ${course?.name || "Course"} | ${university?.name || "University"}`;
  const seoDescription = `${subject.name} (${subject.code}) study materials for ${course?.name || ""} at ${university?.name || ""}. Get important questions, chapter-wise notes, and previous year question papers.`;

  const breadcrumbSchema = createBreadcrumbSchema([
    { name: "Home", url: origin },
    { name: university?.name || "University", url: `${origin}/university/${universityId}` },
    { name: course?.name || "Course", url: `${origin}/university/${universityId}` },
    { name: semester?.name || "Semester", url: `${origin}/university/${universityId}` },
    { name: subject.name, url: `${origin}${canonicalUrl}` },
  ]);

  const courseSchema = createCourseSchema({
    name: subject.name,
    code: subject.code,
    university: university?.name || "",
    description: seoDescription,
  });

  // Fullscreen AI Mode
  if (isAIFullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-[#f5f6f8] flex flex-col">
        <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-100">
              <Sparkles className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 text-lg">Practice Mode</h1>
              <p className="text-sm text-gray-500">
                {subject.name} &middot; {university?.name || subject.code}
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsAIFullscreen(false)}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <SubjectAIChat subject={subject} universityName={university?.name} />
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[#f5f6f8]">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        jsonLd={[breadcrumbSchema, courseSchema]}
      />
      <Header />

      <main className="flex-1 min-h-0 flex flex-col px-4 sm:px-6 pt-3 pb-3">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-sm mb-3 shrink-0">
          <Link
            to="/"
            className="flex items-center gap-1 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Home className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <Link
            to={`/university/${university?.slug}`}
            className="text-gray-400 hover:text-indigo-600 transition-colors"
          >
            {university?.name}
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="text-gray-400">{course?.name}</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="text-gray-400">{semester?.name}</span>
          <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
          <span className="text-gray-900 font-medium">{subject.name}</span>
        </nav>

        {/* Desktop: Resizable layout */}
        <div className="hidden lg:flex flex-1 min-h-0">
          <ResizablePanelGroup direction="horizontal" className="h-full">
            {/* Main Content Panel */}
            <ResizablePanel defaultSize={76} minSize={50}>
              <ScrollArea className="h-full">
                <div className="space-y-5 pr-4">
                  {/* Subject Hero Banner */}
                  <Card className="relative overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-[#1a1f4e] via-[#243b8a] to-[#2d5bb9] text-white shadow-lg">
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
                    <div className="absolute bottom-0 right-20 w-24 h-24 bg-white/5 rounded-full translate-y-1/2" />
                    <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white/[0.03] rounded-full" />

                    <div className="relative p-6 md:p-8 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                      <div className="space-y-3 flex-1">
                        <div className="flex items-center gap-3">
                          <h1 className="text-2xl md:text-3xl font-bold leading-tight">{subject.name}</h1>
                          <span className="px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold">
                            {subject.code}
                          </span>
                        </div>
                        <p className="text-blue-200 text-sm">
                          {university?.name} &middot; {course?.name} &middot; {semester?.name}
                        </p>

                        {/* Quick Stats Pills */}
                        <div className="flex flex-wrap gap-2 pt-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                            <Award className="h-3 w-3" />
                            {subject.total_marks} Marks
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                            <Timer className="h-3 w-3" />
                            {subject.duration}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                            <GraduationCap className="h-3 w-3" />
                            {subject.exam_type}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                            <Layers className="h-3 w-3" />
                            {units.length} Units
                          </span>
                        </div>
                      </div>

                      {/* Right side actions */}
                      <div className="flex items-center gap-2 [&_button]:bg-white/15 [&_button]:border-white/20 [&_button]:text-white [&_button]:hover:bg-white/25 [&_button]:backdrop-blur-sm">
                        <AddToLibraryButton itemId={subject.id} itemType="subject" />
                        <AddToStudylistButton itemId={subject.id} itemType="subject" />
                      </div>
                    </div>

                    {/* Bottom stats bar */}
                    <div className="relative border-t border-white/10 px-6 md:px-8 py-3 flex items-center gap-6">
                      <div className="flex items-center gap-2 text-xs text-blue-200">
                        <Hash className="h-3 w-3" />
                        <span>Theory: <span className="text-white font-semibold">{subject.theory_marks}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-blue-200">
                        <Hash className="h-3 w-3" />
                        <span>Internal: <span className="text-white font-semibold">{subject.internal_marks}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-blue-200">
                        <FileQuestion className="h-3 w-3" />
                        <span>Questions: <span className="text-white font-semibold">{importantQuestions.length}</span></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-blue-200">
                        <FileText className="h-3 w-3" />
                        <span>PYQs: <span className="text-white font-semibold">{pyqPapers.length}</span></span>
                      </div>
                    </div>
                  </Card>

                  {/* Tab Navigation */}
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
                          <span>{tab.label}</span>
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

                  {/* Tab Content */}
                  <div className="mt-1">
                    {/* Important Questions Tab */}
                    {activeTab === "questions" && (
                      <Card className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                              <FileQuestion className="h-4 w-4 text-indigo-600" />
                            </div>
                            <div>
                              <h2 className="font-bold text-gray-900">Important Questions</h2>
                              <p className="text-xs text-gray-500">
                                Frequently asked questions based on previous year patterns
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          {importantQuestions.length === 0 ? (
                            <div className="text-center py-12">
                              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                <FileQuestion className="h-6 w-6 text-gray-300" />
                              </div>
                              <p className="text-sm text-gray-500">No important questions available yet</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {units.map((unit) => {
                                const unitQuestions = importantQuestions.filter((q) => q.unit_id === unit.id);
                                if (unitQuestions.length === 0) return null;

                                return (
                                  <Collapsible
                                    key={unit.id}
                                    open={openUnits.includes(unit.id)}
                                    onOpenChange={() => toggleUnit(unit.id)}
                                  >
                                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-600">
                                          {unit.number}
                                        </div>
                                        <span className="font-semibold text-sm text-gray-900">
                                          {unit.name}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-medium text-gray-400 bg-white px-2.5 py-1 rounded-full border border-gray-100">
                                          {unitQuestions.length} questions
                                        </span>
                                        {openUnits.includes(unit.id) ? (
                                          <ChevronDown className="h-4 w-4 text-gray-400 transition-transform" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                                        )}
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-2 space-y-2 pl-2">
                                      {unitQuestions.map((q, idx) => (
                                        <div
                                          key={q.id}
                                          className="flex items-start gap-3 p-3.5 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                                        >
                                          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gray-50 text-[11px] font-bold text-gray-400 shrink-0 mt-0.5">
                                            {idx + 1}
                                          </span>
                                          <p className="text-sm text-gray-700 flex-1 leading-relaxed">
                                            {q.question}
                                          </p>
                                          <div className="flex items-center gap-1.5 shrink-0">
                                            <span
                                              className={cn(
                                                "text-[10px] font-semibold px-2 py-1 rounded-md border",
                                                getFrequencyColor(q.frequency)
                                              )}
                                            >
                                              {q.frequency}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                                              {q.marks}M
                                            </span>
                                          </div>
                                        </div>
                                      ))}
                                    </CollapsibleContent>
                                  </Collapsible>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </Card>
                    )}

                    {/* Notes Tab */}
                    {activeTab === "notes" && (
                      <Card className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                        <div className="p-5 border-b border-gray-100">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                              <BookOpen className="h-4 w-4 text-emerald-600" />
                            </div>
                            <div>
                              <h2 className="font-bold text-gray-900">Chapter-wise Notes</h2>
                              <p className="text-xs text-gray-500">
                                Comprehensive notes organized by units and chapters
                              </p>
                            </div>
                          </div>
                        </div>
                        <div className="p-5">
                          {notes.length === 0 ? (
                            <div className="text-center py-12">
                              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                <BookOpen className="h-6 w-6 text-gray-300" />
                              </div>
                              <p className="text-sm text-gray-500">No notes available yet</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {units.map((unit) => {
                                const unitNotes = notes.filter((n) => n.unit_id === unit.id);
                                if (unitNotes.length === 0) return null;

                                return (
                                  <Collapsible
                                    key={unit.id}
                                    open={openUnits.includes(unit.id)}
                                    onOpenChange={() => toggleUnit(unit.id)}
                                  >
                                    <CollapsibleTrigger className="flex items-center justify-between w-full p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200 group">
                                      <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-xs font-bold text-emerald-600">
                                          {unit.number}
                                        </div>
                                        <span className="font-semibold text-sm text-gray-900">
                                          {unit.name}
                                        </span>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[11px] font-medium text-gray-400 bg-white px-2.5 py-1 rounded-full border border-gray-100">
                                          {unitNotes.length} chapters
                                        </span>
                                        {openUnits.includes(unit.id) ? (
                                          <ChevronDown className="h-4 w-4 text-gray-400 transition-transform" />
                                        ) : (
                                          <ChevronRight className="h-4 w-4 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
                                        )}
                                      </div>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent className="mt-2 space-y-2.5 pl-2">
                                      {unitNotes.map((note) => (
                                        <div
                                          key={note.id}
                                          className="bg-white border border-gray-100 rounded-xl overflow-hidden hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                                        >
                                          <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            <h3 className="font-semibold text-sm text-gray-900">
                                              {note.chapter_title}
                                            </h3>
                                          </div>
                                          <div className="p-4">
                                            <NoteViewer note={note} />
                                          </div>
                                        </div>
                                      ))}
                                    </CollapsibleContent>
                                  </Collapsible>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </Card>
                    )}

                    {/* PYQ Tab */}
                    {activeTab === "pyq" && (
                      <Card className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
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
                        <div className="p-5">
                          {pyqPapers.length === 0 ? (
                            <div className="text-center py-12">
                              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                                <FileText className="h-6 w-6 text-gray-300" />
                              </div>
                              <p className="text-sm text-gray-500">No previous year papers available yet</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {pyqPapers.map((paper) => (
                                <Collapsible
                                  key={paper.id}
                                  open={openPyqYears.includes(paper.id)}
                                  onOpenChange={() => togglePyqYear(paper.id)}
                                >
                                  <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-200">
                                    <CollapsibleTrigger className="flex items-center gap-3 flex-1">
                                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                                        <FileText className="h-3.5 w-3.5 text-amber-600" />
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-semibold text-sm text-gray-900">{paper.year} Exam</span>
                                        {paper.paper_code && (
                                          <span className="text-[10px] font-medium text-gray-400 bg-white px-2 py-0.5 rounded-md border border-gray-100">
                                            {paper.paper_code}
                                          </span>
                                        )}
                                      </div>
                                      {openPyqYears.includes(paper.id) ? (
                                        <ChevronDown className="h-4 w-4 text-gray-400 ml-auto transition-transform" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4 text-gray-400 ml-auto transition-transform" />
                                      )}
                                    </CollapsibleTrigger>
                                    <div className="flex items-center gap-1.5 ml-3">
                                      {paper.pdf_url && (
                                        <>
                                          <a
                                            href={paper.pdf_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-medium hover:bg-indigo-700 transition-colors shadow-sm"
                                          >
                                            <Download className="h-3 w-3" />
                                            PDF
                                          </a>
                                          <button
                                            onClick={() => {
                                              const printWindow = window.open(paper.pdf_url!, "_blank");
                                              if (printWindow) {
                                                printWindow.onload = () => printWindow.print();
                                              }
                                            }}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-white transition-all"
                                          >
                                            <Printer className="h-3.5 w-3.5" />
                                          </button>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <CollapsibleContent className="mt-2 space-y-2 pl-2">
                                    {paper.pyq_questions.length === 0 ? (
                                      <p className="text-xs text-gray-400 p-3.5">
                                        Questions not digitized yet. Download the PDF to view.
                                      </p>
                                    ) : (
                                      paper.pyq_questions.map((q, idx) => (
                                        <div
                                          key={q.id}
                                          className="flex items-start gap-3 p-3.5 bg-white border border-gray-100 rounded-xl hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                                        >
                                          <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-gray-50 text-[11px] font-bold text-gray-400 shrink-0 mt-0.5">
                                            {idx + 1}
                                          </span>
                                          <p className="text-sm text-gray-700 flex-1 leading-relaxed">
                                            {q.question}
                                          </p>
                                          <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-1 rounded-md shrink-0">
                                            {q.marks}M
                                          </span>
                                        </div>
                                      ))
                                    )}
                                  </CollapsibleContent>
                                </Collapsible>
                              ))}
                            </div>
                          )}
                        </div>
                      </Card>
                    )}

                    {/* Practice Mode Tab - MCQ */}
                    {activeTab === "ai" && (
                      <MCQPractice
                        subjectId={subject.id}
                        subjectName={subject.name}
                        units={units}
                      />
                    )}
                  </div>
                </div>
              </ScrollArea>
            </ResizablePanel>

            {/* Resizable Handle */}
            <ResizableHandle withHandle className="mx-1" />

            {/* AI Chat Panel */}
            <ResizablePanel
              defaultSize={20}
              minSize={15}
              maxSize={45}
              collapsible
              collapsedSize={0}
              onCollapse={() => setIsAIPanelCollapsed(true)}
              onExpand={() => setIsAIPanelCollapsed(false)}
            >
              <SubjectAIChat subject={subject} universityName={university?.name} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>

        {/* Mobile Layout */}
        <div className="lg:hidden space-y-5 overflow-y-auto flex-1">
          {/* Subject Header - Mobile */}
          <Card className="relative overflow-hidden rounded-2xl border-0 bg-gradient-to-r from-[#1a1f4e] via-[#243b8a] to-[#2d5bb9] text-white shadow-lg">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="relative p-5 space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold">{subject.name}</h1>
                <span className="px-2.5 py-0.5 bg-white/15 backdrop-blur-sm rounded-full text-xs font-semibold">
                  {subject.code}
                </span>
              </div>
              <p className="text-sm text-blue-200">
                {university?.name} &middot; {course?.name} &middot; {semester?.name}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                  <Award className="h-3 w-3" />
                  {subject.total_marks} Marks
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                  <Timer className="h-3 w-3" />
                  {subject.duration}
                </span>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">
                  <Layers className="h-3 w-3" />
                  {units.length} Units
                </span>
              </div>
            </div>
          </Card>

          {/* Mobile Tab Navigation */}
          <div className="flex items-center gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100/80 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all duration-200 whitespace-nowrap flex-1 justify-center",
                    isActive
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Tab Content */}
          <div>
            {activeTab === "questions" && (
              <Card className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <FileQuestion className="h-3.5 w-3.5 text-indigo-600" />
                    </div>
                    <h2 className="font-bold text-sm text-gray-900">Important Questions</h2>
                  </div>
                </div>
                <div className="p-4">
                  {importantQuestions.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">No important questions available yet</p>
                  ) : (
                    <div className="space-y-2.5">
                      {units.map((unit) => {
                        const unitQuestions = importantQuestions.filter((q) => q.unit_id === unit.id);
                        if (unitQuestions.length === 0) return null;
                        return (
                          <Collapsible
                            key={unit.id}
                            open={openUnits.includes(unit.id)}
                            onOpenChange={() => toggleUnit(unit.id)}
                          >
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600">
                                  {unit.number}
                                </div>
                                <span className="font-semibold text-xs text-gray-900">{unit.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-400">{unitQuestions.length}</span>
                                {openUnits.includes(unit.id) ? (
                                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                                )}
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-1.5 space-y-1.5">
                              {unitQuestions.map((q, idx) => (
                                <div key={q.id} className="p-3 border border-gray-100 rounded-xl">
                                  <div className="flex items-start gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 mt-0.5">{idx + 1}.</span>
                                    <p className="text-xs text-gray-700 flex-1">{q.question}</p>
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-2 ml-4">
                                    <span className={cn("text-[9px] font-semibold px-1.5 py-0.5 rounded border", getFrequencyColor(q.frequency))}>
                                      {q.frequency}
                                    </span>
                                    <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                                      {q.marks}M
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {activeTab === "notes" && (
              <Card className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                    </div>
                    <h2 className="font-bold text-sm text-gray-900">Chapter-wise Notes</h2>
                  </div>
                </div>
                <div className="p-4">
                  {notes.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">No notes available yet</p>
                  ) : (
                    <div className="space-y-2.5">
                      {units.map((unit) => {
                        const unitNotes = notes.filter((n) => n.unit_id === unit.id);
                        if (unitNotes.length === 0) return null;
                        return (
                          <Collapsible
                            key={unit.id}
                            open={openUnits.includes(unit.id)}
                            onOpenChange={() => toggleUnit(unit.id)}
                          >
                            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all">
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-[10px] font-bold text-emerald-600">
                                  {unit.number}
                                </div>
                                <span className="font-semibold text-xs text-gray-900">{unit.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <span className="text-[10px] text-gray-400">{unitNotes.length} chapters</span>
                                {openUnits.includes(unit.id) ? (
                                  <ChevronDown className="h-3.5 w-3.5 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                                )}
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-1.5 space-y-2">
                              {unitNotes.map((note) => (
                                <div key={note.id} className="border border-gray-100 rounded-xl overflow-hidden">
                                  <div className="px-3 py-2.5 border-b border-gray-50 flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                    <h3 className="font-semibold text-xs text-gray-900">{note.chapter_title}</h3>
                                  </div>
                                  <div className="p-3">
                                    <NoteViewer note={note} />
                                  </div>
                                </div>
                              ))}
                            </CollapsibleContent>
                          </Collapsible>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {activeTab === "pyq" && (
              <Card className="bg-white rounded-2xl shadow-sm border border-gray-100/80 overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                      <FileText className="h-3.5 w-3.5 text-amber-600" />
                    </div>
                    <h2 className="font-bold text-sm text-gray-900">Previous Year Papers</h2>
                  </div>
                </div>
                <div className="p-4">
                  {pyqPapers.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-8">No previous year papers available yet</p>
                  ) : (
                    <div className="space-y-2.5">
                      {pyqPapers.map((paper) => (
                        <Collapsible
                          key={paper.id}
                          open={openPyqYears.includes(paper.id)}
                          onOpenChange={() => togglePyqYear(paper.id)}
                        >
                          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                            <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                              <span className="font-semibold text-xs text-gray-900">{paper.year}</span>
                              {paper.paper_code && (
                                <span className="text-[9px] text-gray-400 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                                  {paper.paper_code}
                                </span>
                              )}
                              {openPyqYears.includes(paper.id) ? (
                                <ChevronDown className="h-3.5 w-3.5 text-gray-400 ml-auto" />
                              ) : (
                                <ChevronRight className="h-3.5 w-3.5 text-gray-400 ml-auto" />
                              )}
                            </CollapsibleTrigger>
                            {paper.pdf_url && (
                              <a
                                href={paper.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-600 text-white rounded-lg text-[10px] font-medium ml-2"
                              >
                                <Download className="h-2.5 w-2.5" />
                                PDF
                              </a>
                            )}
                          </div>
                          <CollapsibleContent className="mt-1.5 space-y-1.5">
                            {paper.pyq_questions.length === 0 ? (
                              <p className="text-[11px] text-gray-400 p-3">Questions not digitized yet.</p>
                            ) : (
                              paper.pyq_questions.map((q, idx) => (
                                <div key={q.id} className="p-3 border border-gray-100 rounded-xl">
                                  <div className="flex items-start gap-2">
                                    <span className="text-[10px] font-bold text-gray-400 mt-0.5">{idx + 1}.</span>
                                    <p className="text-xs text-gray-700 flex-1">{q.question}</p>
                                    <span className="text-[9px] font-bold text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded shrink-0">
                                      {q.marks}M
                                    </span>
                                  </div>
                                </div>
                              ))
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            )}

            {activeTab === "ai" && (
              <MCQPractice
                subjectId={subject.id}
                subjectName={subject.name}
                units={units}
              />
            )}
          </div>

          {/* AI Chat - Mobile */}
          <SubjectAIChat subject={subject} universityName={university?.name} />
        </div>
      </main>
    </div>
  );
};

export default SubjectPage;
