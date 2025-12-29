import { useState } from "react";
import { useParams, Link } from "react-router-dom";
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
  ClipboardList,
  MessageSquare,
  Clock,
  Award,
  ChevronRight,
  ChevronDown,
  Download,
  Printer,
  Send,
  AlertCircle,
  Target,
  TrendingUp,
} from "lucide-react";

// Mock data for AKTU B.Tech CSE - Database Management System
const subjectData = {
  code: "BCS501",
  name: "Database Management System",
  university: "AKTU",
  course: "B.Tech CSE",
  semester: "Semester 5",
  examInfo: {
    type: "End Semester",
    totalMarks: 100,
    theoryMarks: 70,
    internalMarks: 30,
    duration: "3 Hours",
    pattern: "Theory + Numerical",
  },
  units: [
    { id: 1, name: "Introduction to DBMS", weight: 15 },
    { id: 2, name: "Relational Model & SQL", weight: 25 },
    { id: 3, name: "Database Design & Normalization", weight: 20 },
    { id: 4, name: "Transaction Management", weight: 20 },
    { id: 5, name: "File Organization & Indexing", weight: 20 },
  ],
  importantQuestions: [
    {
      id: 1,
      question: "Explain the three-level architecture of DBMS with a neat diagram.",
      marks: 10,
      frequency: "Very Frequent",
      unit: "Unit 1",
      hasTemplate: true,
    },
    {
      id: 2,
      question: "What is normalization? Explain 1NF, 2NF, 3NF, and BCNF with examples.",
      marks: 10,
      frequency: "Repeated",
      unit: "Unit 3",
      hasTemplate: true,
    },
    {
      id: 3,
      question: "Explain ACID properties of transactions with suitable examples.",
      marks: 7,
      frequency: "Very Frequent",
      unit: "Unit 4",
      hasTemplate: true,
    },
    {
      id: 4,
      question: "Write SQL queries for the following operations: JOIN, GROUP BY, HAVING, and subqueries.",
      marks: 10,
      frequency: "Repeated",
      unit: "Unit 2",
      hasTemplate: true,
    },
    {
      id: 5,
      question: "Differentiate between B-tree and B+ tree indexing with diagrams.",
      marks: 7,
      frequency: "Expected",
      unit: "Unit 5",
      hasTemplate: true,
    },
    {
      id: 6,
      question: "Explain deadlock detection and prevention techniques in DBMS.",
      marks: 10,
      frequency: "Repeated",
      unit: "Unit 4",
      hasTemplate: true,
    },
    {
      id: 7,
      question: "What is ER model? Draw an ER diagram for a university database system.",
      marks: 10,
      frequency: "Very Frequent",
      unit: "Unit 1",
      hasTemplate: true,
    },
    {
      id: 8,
      question: "Explain various types of joins in SQL with examples.",
      marks: 7,
      frequency: "Expected",
      unit: "Unit 2",
      hasTemplate: true,
    },
  ],
  notes: [
    {
      unit: "Unit 1: Introduction to DBMS",
      chapters: [
        {
          title: "Database Concepts",
          points: [
            "**Database**: Organized collection of interrelated data",
            "**DBMS**: Software system to manage databases efficiently",
            "**Data Independence**: Logical and Physical independence",
            "Advantages: Data sharing, integrity, security, backup",
          ],
        },
        {
          title: "Three-Level Architecture",
          points: [
            "**External Level**: User views, different for different users",
            "**Conceptual Level**: Logical structure of entire database",
            "**Internal Level**: Physical storage structure",
            "Mappings ensure data independence between levels",
          ],
        },
      ],
    },
    {
      unit: "Unit 2: Relational Model & SQL",
      chapters: [
        {
          title: "Relational Model Basics",
          points: [
            "**Relation**: Table with rows (tuples) and columns (attributes)",
            "**Domain**: Set of atomic values for an attribute",
            "**Keys**: Super key, Candidate key, Primary key, Foreign key",
            "Relational algebra: Select, Project, Join, Union, Difference",
          ],
        },
        {
          title: "SQL Fundamentals",
          points: [
            "**DDL**: CREATE, ALTER, DROP, TRUNCATE",
            "**DML**: SELECT, INSERT, UPDATE, DELETE",
            "**DCL**: GRANT, REVOKE",
            "**TCL**: COMMIT, ROLLBACK, SAVEPOINT",
          ],
        },
      ],
    },
    {
      unit: "Unit 3: Database Design & Normalization",
      chapters: [
        {
          title: "Normalization Forms",
          points: [
            "**1NF**: Eliminate repeating groups, atomic values only",
            "**2NF**: 1NF + No partial dependency on candidate key",
            "**3NF**: 2NF + No transitive dependency",
            "**BCNF**: Every determinant is a candidate key",
          ],
        },
      ],
    },
    {
      unit: "Unit 4: Transaction Management",
      chapters: [
        {
          title: "ACID Properties",
          points: [
            "**Atomicity**: All or nothing execution",
            "**Consistency**: Database remains in valid state",
            "**Isolation**: Concurrent transactions don't interfere",
            "**Durability**: Committed changes are permanent",
          ],
        },
      ],
    },
    {
      unit: "Unit 5: File Organization & Indexing",
      chapters: [
        {
          title: "Indexing Techniques",
          points: [
            "**Primary Index**: On ordering key field",
            "**Secondary Index**: On non-ordering field",
            "**B-Tree**: Balanced tree, keys in all nodes",
            "**B+ Tree**: Keys only in leaves, linked leaves",
          ],
        },
      ],
    },
  ],
  pyqs: [
    {
      year: "2023-24",
      questions: [
        { question: "Explain three-level architecture of DBMS.", marks: 10, unit: "Unit 1" },
        { question: "Write SQL queries using JOIN and GROUP BY.", marks: 10, unit: "Unit 2" },
        { question: "Normalize the given table to BCNF.", marks: 10, unit: "Unit 3" },
        { question: "Explain deadlock handling techniques.", marks: 7, unit: "Unit 4" },
      ],
    },
    {
      year: "2022-23",
      questions: [
        { question: "Draw ER diagram for hospital management system.", marks: 10, unit: "Unit 1" },
        { question: "Explain ACID properties with examples.", marks: 7, unit: "Unit 4" },
        { question: "Differentiate between B-tree and B+ tree.", marks: 7, unit: "Unit 5" },
        { question: "What is normalization? Explain up to 3NF.", marks: 10, unit: "Unit 3" },
      ],
    },
    {
      year: "2021-22",
      questions: [
        { question: "Explain relational algebra operations.", marks: 10, unit: "Unit 2" },
        { question: "What are different types of keys in DBMS?", marks: 7, unit: "Unit 2" },
        { question: "Explain concurrency control techniques.", marks: 10, unit: "Unit 4" },
        { question: "Write about file organization methods.", marks: 7, unit: "Unit 5" },
      ],
    },
  ],
  answerTemplates: [
    {
      id: 1,
      question: "Explain the three-level architecture of DBMS with a neat diagram.",
      template: {
        intro: "The three-level architecture, also known as ANSI-SPARC architecture, provides data abstraction and data independence in DBMS.",
        keyPoints: [
          "External Level (View Level): Describes user-specific views of the database. Different users see different portions of the database.",
          "Conceptual Level (Logical Level): Describes the logical structure of the entire database. Contains entities, relationships, and constraints.",
          "Internal Level (Physical Level): Describes physical storage of data. Includes file structures, indexing, and access paths.",
        ],
        keywords: ["Data Abstraction", "Data Independence", "Schema", "Mapping", "ANSI-SPARC"],
        diagramSuggestion: "Draw three horizontal layers with External at top, Conceptual in middle, Internal at bottom. Show multiple external views connecting to single conceptual schema.",
        conclusion: "This architecture ensures logical and physical data independence, making database systems flexible and maintainable.",
        wordLimit: "300-400 words for 10 marks",
      },
    },
    {
      id: 2,
      question: "Explain ACID properties of transactions with suitable examples.",
      template: {
        intro: "ACID properties ensure reliable processing of database transactions and maintain data integrity even in case of failures.",
        keyPoints: [
          "Atomicity: Transaction is treated as single unit. Either all operations complete or none. Example: Bank transfer - debit and credit must both succeed.",
          "Consistency: Database moves from one valid state to another. Constraints are maintained. Example: Total balance remains same after transfer.",
          "Isolation: Concurrent transactions don't interfere. Each sees consistent snapshot. Example: Two withdrawals from same account handled correctly.",
          "Durability: Once committed, changes are permanent. Survives system failures. Example: Transaction log ensures recovery.",
        ],
        keywords: ["Transaction", "Commit", "Rollback", "Integrity", "Recovery"],
        diagramSuggestion: "Show transaction states: Active → Partially Committed → Committed/Aborted with arrows.",
        conclusion: "ACID properties are fundamental to transaction processing and ensure database reliability in multi-user environments.",
        wordLimit: "250-300 words for 7 marks",
      },
    },
  ],
  progress: {
    overall: 45,
    notesRead: 60,
    pyqsSolved: 30,
    questionsAttempted: 40,
  },
  focusAreas: [
    { area: "Normalization (Unit 3)", priority: "High", reason: "20% weightage, frequently asked" },
    { area: "SQL Queries (Unit 2)", priority: "High", reason: "Numerical questions expected" },
    { area: "Transaction Management (Unit 4)", priority: "Medium", reason: "Theory questions common" },
  ],
};

const SubjectPage = () => {
  const { universityId, courseId, semesterId, subjectId } = useParams();
  const [activeTab, setActiveTab] = useState("questions");
  const [openUnits, setOpenUnits] = useState<string[]>([subjectData.notes[0]?.unit || ""]);
  const [openPyqYears, setOpenPyqYears] = useState<string[]>([subjectData.pyqs[0]?.year || ""]);
  const [aiMessage, setAiMessage] = useState("");
  const [aiMessages, setAiMessages] = useState<Array<{ role: string; content: string }>>([
    {
      role: "assistant",
      content: "Hello! I'm your DBMS exam assistant. Ask me anything about Database Management System - concepts, SQL queries, normalization, or exam preparation tips.",
    },
  ]);

  const toggleUnit = (unit: string) => {
    setOpenUnits((prev) =>
      prev.includes(unit) ? prev.filter((u) => u !== unit) : [...prev, unit]
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
    // Mock AI response
    setTimeout(() => {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Regarding "${aiMessage}":\n\n**Key Points for Exam:**\n1. Focus on the definition and core concept first\n2. Include relevant examples from AKTU previous years\n3. Use proper keywords that carry marks\n4. Draw diagrams wherever applicable\n\nWould you like me to explain this topic in more detail or provide an answer template?`,
        },
      ]);
    }, 1000);
    setAiMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link to="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link to={`/university/${universityId}`} className="hover:text-foreground">{subjectData.university}</Link>
          <ChevronRight className="h-4 w-4" />
          <span>{subjectData.course}</span>
          <ChevronRight className="h-4 w-4" />
          <span>{subjectData.semester}</span>
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
                      {subjectData.name}
                    </h1>
                    <Badge variant="secondary" className="text-xs">
                      {subjectData.code}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground">
                    {subjectData.university} · {subjectData.course} · {subjectData.semester}
                  </p>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">
                    Exam-focused
                  </Badge>
                </div>

                {/* Exam Info */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Award className="h-4 w-4" />
                    <span>{subjectData.examInfo.totalMarks} Marks</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{subjectData.examInfo.duration}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{subjectData.examInfo.pattern}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Strip */}
            <div className="bg-card border rounded-lg p-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  variant={activeTab === "notes" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("notes")}
                  className="gap-2"
                >
                  <BookOpen className="h-4 w-4" />
                  Notes
                </Button>
                <Button
                  variant={activeTab === "questions" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("questions")}
                  className="gap-2"
                >
                  <FileQuestion className="h-4 w-4" />
                  Important Questions
                </Button>
                <Button
                  variant={activeTab === "pyqs" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("pyqs")}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  PYQs
                </Button>
                <Button
                  variant={activeTab === "templates" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("templates")}
                  className="gap-2"
                >
                  <ClipboardList className="h-4 w-4" />
                  Answer Templates
                </Button>
                <Button
                  variant={activeTab === "ai" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveTab("ai")}
                  className="gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Ask AI
                </Button>
              </div>
            </div>

            {/* Tabbed Content */}
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              {/* Important Questions Tab */}
              <TabsContent value="questions" className="mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Important Questions</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Questions selected based on AKTU exam pattern analysis and frequency of repetition over past 5 years.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {subjectData.importantQuestions.map((q) => (
                      <div
                        key={q.id}
                        className="p-4 border rounded-lg bg-muted/30 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <p className="text-foreground font-medium">{q.question}</p>
                          <Badge variant="outline" className="shrink-0">
                            {q.marks} marks
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${getFrequencyColor(q.frequency)}`}>
                            {q.frequency}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {q.unit}
                          </Badge>
                          {q.hasTemplate && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs text-primary"
                              onClick={() => setActiveTab("templates")}
                            >
                              View Answer Template →
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
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
                    {subjectData.notes.map((unit) => (
                      <Collapsible
                        key={unit.unit}
                        open={openUnits.includes(unit.unit)}
                        onOpenChange={() => toggleUnit(unit.unit)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50">
                            <span className="font-medium text-foreground">{unit.unit}</span>
                            {openUnits.includes(unit.unit) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-3">
                          {unit.chapters.map((chapter, idx) => (
                            <div key={idx} className="ml-4 p-4 border-l-2 border-primary/20 bg-background">
                              <h4 className="font-medium text-foreground mb-3">{chapter.title}</h4>
                              <ul className="space-y-2">
                                {chapter.points.map((point, pidx) => (
                                  <li
                                    key={pidx}
                                    className="text-sm text-muted-foreground"
                                    dangerouslySetInnerHTML={{
                                      __html: point
                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>'),
                                    }}
                                  />
                                ))}
                              </ul>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* PYQs Tab */}
              <TabsContent value="pyqs" className="mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Previous Year Questions</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Actual questions from AKTU end semester examinations.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {subjectData.pyqs.map((yearData) => (
                      <Collapsible
                        key={yearData.year}
                        open={openPyqYears.includes(yearData.year)}
                        onOpenChange={() => togglePyqYear(yearData.year)}
                      >
                        <CollapsibleTrigger className="w-full">
                          <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30 hover:bg-muted/50">
                            <span className="font-medium text-foreground">{yearData.year}</span>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground">
                                {yearData.questions.length} questions
                              </span>
                              {openPyqYears.includes(yearData.year) ? (
                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-2 space-y-2">
                          {yearData.questions.map((q, idx) => (
                            <div key={idx} className="ml-4 p-4 border rounded-lg bg-background">
                              <div className="flex items-start justify-between gap-4">
                                <p className="text-foreground">{q.question}</p>
                                <div className="flex gap-2 shrink-0">
                                  <Badge variant="outline">{q.marks} marks</Badge>
                                  <Badge variant="secondary" className="text-xs">{q.unit}</Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </CollapsibleContent>
                      </Collapsible>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Answer Templates Tab */}
              <TabsContent value="templates" className="mt-0">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg">Answer Templates</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Structured answer formats for high-weightage questions. Follow these templates to maximize marks.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {subjectData.answerTemplates.map((template) => (
                      <div key={template.id} className="border rounded-lg overflow-hidden">
                        <div className="bg-muted/50 p-4 border-b">
                          <p className="font-medium text-foreground">{template.question}</p>
                        </div>
                        <div className="p-4 space-y-4">
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-2">Introduction</h5>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                              {template.template.intro}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-2">Key Points to Cover</h5>
                            <ul className="space-y-2">
                              {template.template.keyPoints.map((point, idx) => (
                                <li key={idx} className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                                  {point}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-2">Keywords (Mark-carriers)</h5>
                            <div className="flex flex-wrap gap-2">
                              {template.template.keywords.map((keyword, idx) => (
                                <Badge key={idx} variant="outline" className="bg-primary/5">
                                  {keyword}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-2">Diagram Suggestion</h5>
                            <p className="text-sm text-muted-foreground bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 rounded">
                              {template.template.diagramSuggestion}
                            </p>
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-foreground mb-2">Conclusion</h5>
                            <p className="text-sm text-muted-foreground bg-muted/30 p-3 rounded">
                              {template.template.conclusion}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <AlertCircle className="h-4 w-4" />
                            <span>Recommended: {template.template.wordLimit}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Ask AI Tab */}
              <TabsContent value="ai" className="mt-0">
                <Card className="h-[600px] flex flex-col">
                  <CardHeader className="pb-4 border-b">
                    <CardTitle className="text-lg">Ask AI</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Context: {subjectData.name} ({subjectData.code}) - {subjectData.university}
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
            {/* Exam Readiness */}
            <Card className="sticky top-24">
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Exam Readiness
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Overall Progress</span>
                    <span className="font-medium">{subjectData.progress.overall}%</span>
                  </div>
                  <Progress value={subjectData.progress.overall} className="h-2" />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Notes Read</span>
                    <span>{subjectData.progress.notesRead}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">PYQs Solved</span>
                    <span>{subjectData.progress.pyqsSolved}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Questions Attempted</span>
                    <span>{subjectData.progress.questionsAttempted}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Focus Areas */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Focus Next
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjectData.focusAreas.map((focus, idx) => (
                  <div key={idx} className="p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{focus.area}</span>
                      <Badge
                        variant="outline"
                        className={
                          focus.priority === "High"
                            ? "border-red-200 text-red-700 bg-red-50"
                            : "border-amber-200 text-amber-700 bg-amber-50"
                        }
                      >
                        {focus.priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{focus.reason}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Unit Weightage */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Unit Weightage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {subjectData.units.map((unit) => (
                  <div key={unit.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground truncate pr-2">Unit {unit.id}</span>
                      <span className="font-medium shrink-0">{unit.weight}%</span>
                    </div>
                    <Progress value={unit.weight} className="h-1.5" />
                  </div>
                ))}
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
