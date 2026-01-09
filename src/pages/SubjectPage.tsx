import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import Header from "@/components/landing/Header";
import Footer from "@/components/landing/Footer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  Target,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { Subject, Unit, Note, ImportantQuestion, PYQPaper, PYQQuestion, University, Course, Semester } from "@/types/database";

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
  const [activeTab, setActiveTab] = useState("questions");
  const [openUnits, setOpenUnits] = useState<string[]>([]);
  const [openPyqYears, setOpenPyqYears] = useState<string[]>([]);
  const [aiMessage, setAiMessage] = useState("");
  const [aiMessages, setAiMessages] = useState<Array<{ role: string; content: string }>>([]);

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
          .from('subjects')
          .select(`
            *,
            semesters!inner (
              *,
              courses!inner (
                *,
                universities!inner (*)
              )
            )
          `)
          .eq('slug', subjectId)
          .maybeSingle();

        if (subjectError || !subjectData) {
          console.error('Error fetching subject:', subjectError);
          setLoading(false);
          return;
        }

        setSubject(subjectData);
        const semesterData = subjectData.semesters as unknown as Semester & { courses: Course & { universities: University } };
        setSemester(semesterData);
        setCourse(semesterData.courses);
        setUniversity(semesterData.courses.universities);

        // Set AI initial message with subject context
        setAiMessages([{
          role: "assistant",
          content: `Hello! I'm your ${subjectData.name} exam assistant. Ask me anything about ${subjectData.name} - concepts, questions, or exam preparation tips.`,
        }]);

        // Fetch units
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('*')
          .eq('subject_id', subjectData.id)
          .order('number');

        if (unitsError) {
          console.error('Error fetching units:', unitsError);
        } else {
          setUnits(unitsData || []);
          if (unitsData && unitsData.length > 0) {
            setOpenUnits([unitsData[0].id]);
          }
        }

        // Fetch notes with unit info
        if (unitsData && unitsData.length > 0) {
          const unitIds = unitsData.map(u => u.id);
          const { data: notesData, error: notesError } = await supabase
            .from('notes')
            .select('*, units!inner(*)')
            .in('unit_id', unitIds)
            .order('order_index');

          if (notesError) {
            console.error('Error fetching notes:', notesError);
          } else {
            setNotes((notesData as NoteWithUnit[]) || []);
          }
        }

        // Fetch important questions
        const { data: questionsData, error: questionsError } = await supabase
          .from('important_questions')
          .select('*, units(*)')
          .eq('subject_id', subjectData.id);

        if (questionsError) {
          console.error('Error fetching questions:', questionsError);
        } else {
          setImportantQuestions((questionsData as ImportantQuestionWithUnit[]) || []);
        }

        // Fetch PYQ papers with questions
        const { data: pyqData, error: pyqError } = await supabase
          .from('pyq_papers')
          .select('*, pyq_questions(*)')
          .eq('subject_id', subjectData.id)
          .order('year', { ascending: false });

        if (pyqError) {
          console.error('Error fetching PYQ papers:', pyqError);
        } else {
          setPyqPapers((pyqData as PYQPaperWithQuestions[]) || []);
          if (pyqData && pyqData.length > 0) {
            setOpenPyqYears([pyqData[0].year]);
          }
        }

      } catch (error) {
        console.error('Error fetching subject data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectData();
  }, [subjectId]);

  const toggleUnit = (unitId: string) => {
    setOpenUnits((prev) =>
      prev.includes(unitId) ? prev.filter((u) => u !== unitId) : [...prev, unitId]
    );
  };

  const togglePyqYear = (year: string) => {
    setOpenPyqYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    );
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

  const handleAiSubmit = () => {
    if (!aiMessage.trim()) return;
    setAiMessages((prev) => [...prev, { role: "user", content: aiMessage }]);
    setTimeout(() => {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Regarding "${aiMessage}":\n\n**Key Points for Exam:**\n1. Focus on the definition and core concept first\n2. Include relevant examples from previous years\n3. Use proper keywords that carry marks\n4. Draw diagrams wherever applicable\n\nWould you like me to explain this topic in more detail or provide an answer template?`,
        },
      ]);
    }, 1000);
    setAiMessage("");
  };

  // Group notes by unit
  const notesByUnit = units.map(unit => ({
    unit,
    notes: notes.filter(note => note.unit_id === unit.id)
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
          <Link to={universityId ? `/university/${universityId}` : '/'}>
            <Button>Go Back</Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/university/${university?.slug}`} className="hover:text-foreground">{university?.name}</Link>
          <ChevronRight className="h-4 w-4" />
          <span>{course?.name}</span>
          <ChevronRight className="h-4 w-4" />
          <span>{semester?.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Subject Header */}
            <div className="bg-card border rounded-lg p-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h1 className="text-2xl font-bold text-foreground">
                      {subject.name}
                    </h1>
                    <Badge variant="secondary" className="text-xs">
                      {subject.code}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {university?.name} · {course?.name} · {semester?.name}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="gap-1 py-1.5 px-3">
                    <Award className="h-3.5 w-3.5" />
                    {subject.total_marks} Marks
                  </Badge>
                  <Badge variant="outline" className="gap-1 py-1.5 px-3">
                    <Clock className="h-3.5 w-3.5" />
                    {subject.duration}
                  </Badge>
                  <Badge variant="outline" className="gap-1 py-1.5 px-3">
                    {subject.pattern}
                  </Badge>
                </div>
              </div>

              {/* Exam Info */}
              <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Exam Type</span>
                  <p className="font-medium text-foreground">{subject.exam_type}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Theory Marks</span>
                  <p className="font-medium text-foreground">{subject.theory_marks}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Internal Marks</span>
                  <p className="font-medium text-foreground">{subject.internal_marks}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Duration</span>
                  <p className="font-medium text-foreground">{subject.duration}</p>
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-4 h-auto">
                <TabsTrigger value="questions" className="gap-2 py-3">
                  <FileQuestion className="h-4 w-4" />
                  <span className="hidden sm:inline">Questions</span>
                </TabsTrigger>
                <TabsTrigger value="notes" className="gap-2 py-3">
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">Notes</span>
                </TabsTrigger>
                <TabsTrigger value="pyqs" className="gap-2 py-3">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">PYQs</span>
                </TabsTrigger>
                <TabsTrigger value="ai" className="gap-2 py-3">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">Ask AI</span>
                </TabsTrigger>
              </TabsList>

              {/* Important Questions Tab */}
              <TabsContent value="questions" className="mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Important Questions</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Frequently asked questions based on previous year patterns
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {importantQuestions.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No important questions available yet
                      </div>
                    ) : (
                      importantQuestions.map((q, idx) => (
                        <div
                          key={q.id}
                          className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          <div className="flex items-start gap-4">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                              {idx + 1}
                            </span>
                            <div className="flex-1 space-y-2">
                              <p className="text-foreground font-medium">{q.question}</p>
                              <div className="flex flex-wrap gap-2">
                                <Badge
                                  variant="outline"
                                  className={getFrequencyColor(q.frequency)}
                                >
                                  {q.frequency}
                                </Badge>
                                <Badge variant="outline" className="bg-muted/50">
                                  {q.marks} marks
                                </Badge>
                                {q.units && (
                                  <Badge variant="secondary" className="text-xs">
                                    Unit {q.units.number}: {q.units.name}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Notes Tab */}
              <TabsContent value="notes" className="mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">Chapter-wise Notes</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2">
                          <Printer className="h-4 w-4" />
                          Print
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {notesByUnit.length === 0 || notes.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No notes available for this subject yet
                      </div>
                    ) : (
                      notesByUnit.map(({ unit, notes: unitNotes }) => (
                        <Collapsible
                          key={unit.id}
                          open={openUnits.includes(unit.id)}
                          onOpenChange={() => toggleUnit(unit.id)}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50">
                              <span className="font-medium text-foreground">
                                Unit {unit.number}: {unit.name}
                              </span>
                              {openUnits.includes(unit.id) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2 space-y-3">
                            {unitNotes.length === 0 ? (
                              <div className="ml-4 p-4 text-sm text-muted-foreground">
                                No notes for this unit yet
                              </div>
                            ) : (
                              unitNotes.map((note) => (
                                <div key={note.id} className="ml-4 p-4 border-l-2 border-primary/20 bg-background">
                                  <h4 className="font-medium text-foreground mb-3">{note.chapter_title}</h4>
                                  <ul className="space-y-2">
                                    {(note.points as string[]).map((point, pidx) => (
                                      <li
                                        key={pidx}
                                        className="text-sm text-muted-foreground"
                                        dangerouslySetInnerHTML={{
                                          __html: DOMPurify.sanitize(
                                            point.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>'),
                                            { ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br'], ALLOWED_ATTR: ['class'] }
                                          ),
                                        }}
                                      />
                                    ))}
                                  </ul>
                                </div>
                              ))
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PYQs Tab */}
              <TabsContent value="pyqs" className="mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Previous Year Questions</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Actual questions from end semester examinations
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {pyqPapers.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No past papers available yet
                      </div>
                    ) : (
                      pyqPapers.map((paper) => (
                        <Collapsible
                          key={paper.id}
                          open={openPyqYears.includes(paper.year)}
                          onOpenChange={() => togglePyqYear(paper.year)}
                        >
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-foreground">{paper.year}</span>
                                {paper.paper_code && (
                                  <Badge variant="outline" className="text-xs">{paper.paper_code}</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-muted-foreground">
                                  {paper.pyq_questions.length} questions
                                </span>
                                {paper.pdf_url && (
                                  <a
                                    href={paper.pdf_url}
                                    download
                                    onClick={(e) => e.stopPropagation()}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
                                  >
                                    <Download className="h-3.5 w-3.5" />
                                    Download PDF
                                  </a>
                                )}
                                {openPyqYears.includes(paper.year) ? (
                                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                ) : (
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent className="mt-2 space-y-4">
                            {paper.pyq_questions.length === 0 ? (
                              <div className="ml-4 p-4 text-sm text-muted-foreground">
                                No questions recorded for this paper
                              </div>
                            ) : (
                              paper.pyq_questions
                                .sort((a, b) => a.order_index - b.order_index)
                                .map((q, idx) => (
                                  <div key={q.id} className="ml-4 border rounded-lg bg-background overflow-hidden">
                                    <div className="p-4 bg-muted/40 border-b">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-3">
                                          <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary/10 text-primary text-sm font-semibold shrink-0">
                                            {idx + 1}
                                          </span>
                                          <p className="text-foreground font-medium pt-0.5">{q.question}</p>
                                        </div>
                                        <div className="flex gap-2 shrink-0">
                                          <Badge variant="outline" className="bg-background">{q.marks} marks</Badge>
                                        </div>
                                      </div>
                                    </div>
                                    
                                    {q.answer && (
                                      <div className="p-4">
                                        <div className="flex items-center gap-2 mb-3">
                                          <div className="w-1 h-4 bg-primary rounded-full" />
                                          <span className="text-sm font-semibold text-primary">Model Answer</span>
                                        </div>
                                        <div 
                                          className="text-sm text-muted-foreground leading-relaxed prose prose-sm max-w-none dark:prose-invert"
                                          dangerouslySetInnerHTML={{
                                            __html: DOMPurify.sanitize(
                                              q.answer
                                                .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                                                .replace(/```sql([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto my-2"><code class="text-foreground">$1</code></pre>')
                                                .replace(/```([\s\S]*?)```/g, '<pre class="bg-muted p-3 rounded-md text-xs overflow-x-auto my-2"><code class="text-foreground">$1</code></pre>')
                                                .replace(/\n\n/g, '</p><p class="mt-2">')
                                                .replace(/\n- /g, '</p><p class="mt-1 pl-4">• ')
                                                .replace(/\n\d\. /g, (match) => `</p><p class="mt-1 pl-4">${match.trim()} `),
                                              { ALLOWED_TAGS: ['strong', 'em', 'b', 'i', 'br', 'p', 'pre', 'code'], ALLOWED_ATTR: ['class'] }
                                            ),
                                          }}
                                        />
                                      </div>
                                    )}
                                  </div>
                                ))
                            )}
                          </CollapsibleContent>
                        </Collapsible>
                      ))
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Ask AI Tab */}
              <TabsContent value="ai" className="mt-0">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-lg">Ask AI</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Context: {subject.name} ({subject.code}) - {university?.name}
                    </p>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-0">
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {aiMessages.map((msg, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg ${
                              msg.role === "assistant"
                                ? "bg-muted/50 mr-8"
                                : "bg-primary/10 ml-8"
                            }`}
                          >
                            <p className="text-sm text-foreground whitespace-pre-line">{msg.content}</p>
                          </div>
                        ))}
                      </div>
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

          {/* Right Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Unit Weightage */}
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Unit Weightage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {units.length === 0 ? (
                  <div className="text-sm text-muted-foreground">No units available</div>
                ) : (
                  units.map((unit) => (
                    <div key={unit.id}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground truncate pr-2">
                          Unit {unit.number}: {unit.name}
                        </span>
                        <span className="font-medium shrink-0">{unit.weight}%</span>
                      </div>
                      <Progress value={unit.weight} className="h-1.5" />
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Important Questions</span>
                  <span className="font-medium">{importantQuestions.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Notes Chapters</span>
                  <span className="font-medium">{notes.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Past Papers</span>
                  <span className="font-medium">{pyqPapers.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Units</span>
                  <span className="font-medium">{units.length}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SubjectPage;
