import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import DOMPurify from "dompurify";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
  BookOpen,
  FileQuestion,
  FileText,
  MessageSquare,
  Clock,
  Award,
  ChevronRight,
  ChevronDown,
  Download,
  Printer,
  Send,
  Loader2,
  PanelRightClose,
  PanelRightOpen,
  X,
  Sparkles,
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
        return "bg-red-100 text-red-700 border-red-200";
      case "Repeated":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "Expected":
        return "bg-blue-100 text-blue-700 border-blue-200";
      default:
        return "bg-muted text-muted-foreground";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-32">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Subject not found</h1>
          <p className="text-muted-foreground mb-6">The subject you're looking for doesn't exist.</p>
          <Link to={universityId ? `/university/${universityId}` : "/"}>
            <Button>Go Back</Button>
          </Link>
        </div>
        <Footer />
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
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Fullscreen Header */}
        <div className="border-b bg-card px-4 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-lg">AI Study Mode</h1>
              <p className="text-sm text-muted-foreground">
                {subject.name} • {university?.name || subject.code}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsAIFullscreen(false)} className="hover:bg-muted">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Fullscreen AI Chat */}
        <div className="flex-1 overflow-hidden">
          <SubjectAIChat subject={subject} universityName={university?.name} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={seoTitle}
        description={seoDescription}
        canonicalUrl={canonicalUrl}
        jsonLd={[breadcrumbSchema, courseSchema]}
      />
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/university/${university?.slug}`} className="hover:text-foreground">
            {university?.name}
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span>{course?.name}</span>
          <ChevronRight className="h-4 w-4" />
          <span>{semester?.name}</span>
        </div>

        {/* Desktop: Resizable layout, Mobile: Stack */}
        <div className="hidden lg:block">
          <ResizablePanelGroup direction="horizontal" className="min-h-[calc(100vh-12rem)]">
            {/* Main Content Panel */}
            <ResizablePanel defaultSize={78} minSize={50}>
              <div className="space-y-6 pr-4">
                {/* Subject Header */}
                <div className="bg-card border rounded-lg p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-foreground">{subject.name}</h1>
                        <Badge variant="secondary">{subject.code}</Badge>
                      </div>
                      <p className="text-muted-foreground">
                        {university?.name} · {course?.name} · {semester?.name}
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline" className="gap-1">
                        <Award className="h-3 w-3" />
                        {subject.total_marks} Marks
                      </Badge>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        {subject.duration}
                      </Badge>
                      <Badge variant="outline">{subject.exam_type}</Badge>
                      <AddToLibraryButton itemId={subject.id} itemType="subject" />
                      <AddToStudylistButton itemId={subject.id} itemType="subject" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Exam Type</p>
                      <p className="font-medium">{subject.exam_type}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Theory Marks</p>
                      <p className="font-medium">{subject.theory_marks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Internal Marks</p>
                      <p className="font-medium">{subject.internal_marks}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="font-medium">{subject.duration}</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="questions" className="gap-2">
                      <FileQuestion className="h-4 w-4" />
                      Questions
                    </TabsTrigger>
                    <TabsTrigger value="notes" className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      Notes
                    </TabsTrigger>
                    <TabsTrigger value="pyq" className="gap-2">
                      <FileText className="h-4 w-4" />
                      PYQs
                    </TabsTrigger>
                    <TabsTrigger
                      value="ai"
                      className="gap-2"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsAIFullscreen(true);
                      }}
                    >
                      <Sparkles className="h-4 w-4" />
                      AI Study Mode
                    </TabsTrigger>
                  </TabsList>

                  {/* Important Questions Tab */}
                  <TabsContent value="questions" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-primary">Important Questions</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Frequently asked questions based on previous year patterns
                        </p>
                      </CardHeader>
                      <CardContent>
                        {importantQuestions.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">No important questions available yet</p>
                        ) : (
                          <div className="space-y-4">
                            {units.map((unit) => {
                              const unitQuestions = importantQuestions.filter((q) => q.unit_id === unit.id);
                              if (unitQuestions.length === 0) return null;

                              return (
                                <Collapsible
                                  key={unit.id}
                                  open={openUnits.includes(unit.id)}
                                  onOpenChange={() => toggleUnit(unit.id)}
                                >
                                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                    <span className="font-medium">
                                      Unit {unit.number}: {unit.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary">{unitQuestions.length} questions</Badge>
                                      {openUnits.includes(unit.id) ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-2 space-y-2">
                                    {unitQuestions.map((q, idx) => (
                                      <div key={q.id} className="p-3 border rounded-lg">
                                        <div className="flex items-start justify-between gap-2">
                                          <p className="text-sm">
                                            <span className="font-medium text-muted-foreground">Q{idx + 1}. </span>
                                            {q.question}
                                          </p>
                                          <div className="flex items-center gap-2 shrink-0">
                                            <Badge variant="outline" className={getFrequencyColor(q.frequency)}>
                                              {q.frequency}
                                            </Badge>
                                            <Badge variant="secondary">{q.marks}M</Badge>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </CollapsibleContent>
                                </Collapsible>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* Notes Tab */}
                  <TabsContent value="notes" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-primary">Chapter-wise Notes</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Comprehensive notes organized by units and chapters
                        </p>
                      </CardHeader>
                      <CardContent>
                        {notes.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">No notes available yet</p>
                        ) : (
                          <div className="space-y-4">
                            {units.map((unit) => {
                              const unitNotes = notes.filter((n) => n.unit_id === unit.id);
                              if (unitNotes.length === 0) return null;

                              return (
                                <Collapsible
                                  key={unit.id}
                                  open={openUnits.includes(unit.id)}
                                  onOpenChange={() => toggleUnit(unit.id)}
                                >
                                  <CollapsibleTrigger className="flex items-center justify-between w-full p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                                    <span className="font-medium">
                                      Unit {unit.number}: {unit.name}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="secondary">{unitNotes.length} chapters</Badge>
                                      {openUnits.includes(unit.id) ? (
                                        <ChevronDown className="h-4 w-4" />
                                      ) : (
                                        <ChevronRight className="h-4 w-4" />
                                      )}
                                    </div>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent className="mt-2 space-y-3">
                                    {unitNotes.map((note) => (
                                      <Card key={note.id} className="border-l-4 border-l-primary/50">
                                        <CardHeader className="pb-2">
                                          <CardTitle className="text-base">{note.chapter_title}</CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                          <ul className="space-y-2">
                                            {(note.points as string[]).map((point, idx) => (
                                              <li
                                                key={idx}
                                                className="flex items-start gap-2 text-sm text-muted-foreground"
                                              >
                                                <span className="h-1.5 w-1.5 rounded-full bg-primary/50 mt-1.5 shrink-0" />
                                                <span
                                                  dangerouslySetInnerHTML={{
                                                    __html: DOMPurify.sanitize(point),
                                                  }}
                                                />
                                              </li>
                                            ))}
                                          </ul>
                                        </CardContent>
                                      </Card>
                                    ))}
                                  </CollapsibleContent>
                                </Collapsible>
                              );
                            })}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* PYQ Tab */}
                  <TabsContent value="pyq" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-primary">Previous Year Question Papers</CardTitle>
                        <p className="text-sm text-muted-foreground">Download and practice with actual exam papers</p>
                      </CardHeader>
                      <CardContent>
                        {pyqPapers.length === 0 ? (
                          <p className="text-center text-muted-foreground py-8">
                            No previous year papers available yet
                          </p>
                        ) : (
                          <div className="space-y-4">
                            {pyqPapers.map((paper) => (
                              <Collapsible
                                key={paper.id}
                                open={openPyqYears.includes(paper.id)}
                                onOpenChange={() => togglePyqYear(paper.id)}
                              >
                                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                                  <CollapsibleTrigger className="flex items-center gap-2 flex-1">
                                    <span className="font-medium">{paper.year} Exam</span>
                                    {paper.paper_code && (
                                      <Badge variant="outline" className="text-xs">
                                        {paper.paper_code}
                                      </Badge>
                                    )}
                                    {openPyqYears.includes(paper.id) ? (
                                      <ChevronDown className="h-4 w-4 ml-auto" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 ml-auto" />
                                    )}
                                  </CollapsibleTrigger>
                                  <div className="flex items-center gap-2 ml-4">
                                    {paper.pdf_url && (
                                      <>
                                        <Button variant="outline" size="sm" className="gap-1" asChild>
                                          <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer">
                                            <Download className="h-3 w-3" />
                                            PDF
                                          </a>
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => {
                                            const printWindow = window.open(paper.pdf_url!, "_blank");
                                            if (printWindow) {
                                              printWindow.onload = () => printWindow.print();
                                            }
                                          }}
                                        >
                                          <Printer className="h-4 w-4" />
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <CollapsibleContent className="mt-2 space-y-2">
                                  {paper.pyq_questions.length === 0 ? (
                                    <p className="text-sm text-muted-foreground p-3">
                                      Questions not digitized yet. Download the PDF to view.
                                    </p>
                                  ) : (
                                    paper.pyq_questions.map((q, idx) => (
                                      <div key={q.id} className="p-3 border rounded-lg">
                                        <div className="flex items-start justify-between gap-2">
                                          <p className="text-sm">
                                            <span className="font-medium text-muted-foreground">{idx + 1}. </span>
                                            {q.question}
                                          </p>
                                          <Badge variant="secondary" className="shrink-0">
                                            {q.marks}M
                                          </Badge>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </CollapsibleContent>
                              </Collapsible>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  {/* AI Tab */}
                  <TabsContent value="ai" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg text-primary flex items-center gap-2">
                          <MessageSquare className="h-5 w-5" />
                          AI Study Assistant
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Ask questions about {subject.name} and get instant explanations
                        </p>
                      </CardHeader>
                      <CardContent className="p-0">
                        <ScrollArea className="h-[400px] p-4">
                          {aiMessages.length === 0 ? (
                            <div className="text-center py-12">
                              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                              <p className="text-muted-foreground">Ask anything about {subject.name}</p>
                              <p className="text-sm text-muted-foreground mt-1">
                                Get explanations, practice questions, or study tips
                              </p>
                            </div>
                          ) : (
                            <div className="space-y-4">
                              {aiMessages.map((msg, idx) => (
                                <div
                                  key={idx}
                                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                >
                                  <div
                                    className={`max-w-[80%] rounded-lg px-4 py-2 ${
                                      msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                                    }`}
                                  >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </ScrollArea>
                        <div className="border-t p-4">
                          <div className="flex gap-2">
                            <Textarea
                              placeholder="Ask about any concept, question, or exam tip..."
                              value={aiMessage}
                              onChange={(e) => setAiMessage(e.target.value)}
                              className="min-h-[60px] resize-none"
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  handleAiSubmit();
                                }
                              }}
                            />
                            <Button onClick={handleAiSubmit} size="icon" className="shrink-0">
                              <Send className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </ResizablePanel>

            {/* Resizable Handle */}
            <ResizableHandle withHandle className="mx-2" />

            {/* AI Chat Panel */}
            <ResizablePanel
              defaultSize={23}
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

        {/* Mobile Layout - Stack */}
        <div className="lg:hidden space-y-6">
          {/* Subject Header - Mobile */}
          <div className="bg-card border rounded-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-foreground">{subject.name}</h1>
                <Badge variant="secondary">{subject.code}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {university?.name} · {course?.name} · {semester?.name}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="gap-1">
                  <Award className="h-3 w-3" />
                  {subject.total_marks} Marks
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <Clock className="h-3 w-3" />
                  {subject.duration}
                </Badge>
              </div>
            </div>
          </div>

          {/* AI Chat - Mobile (Full width card) */}
          <SubjectAIChat subject={subject} universityName={university?.name} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubjectPage;
