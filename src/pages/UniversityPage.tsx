import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { 
  Home, 
  BookOpen, 
  StickyNote, 
  MessageSquare, 
  HelpCircle, 
  Clock, 
  FolderOpen, 
  List,
  ChevronDown,
  ChevronRight,
  Plus,
  User,
  MapPin,
  FileText,
  Download,
  ExternalLink,
  Brain,
  Sparkles,
  ClipboardList,
  GraduationCap,
  BarChart3,
  Filter
} from "lucide-react";
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
import AIToolDialog from "@/components/AIToolDialog";

// Mock data for universities
const universityData: Record<string, {
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

// Mock course data
const courseData = {
  undergraduate: [
    {
      degree: "B.Com",
      semesters: [
        { 
          name: "Semester 1", 
          subjects: 6,
          subjectList: [
            { name: "Financial Accounting", type: "Theory", notes: 24, pyqs: 8 },
            { name: "Business Economics", type: "Theory", notes: 18, pyqs: 6 },
            { name: "Business Communication", type: "Theory", notes: 12, pyqs: 5 },
            { name: "Business Mathematics", type: "Theory", notes: 15, pyqs: 7 },
            { name: "Computer Applications", type: "Practical", notes: 8, pyqs: 4 },
            { name: "Environmental Studies", type: "Theory", notes: 10, pyqs: 3 },
          ]
        },
        { 
          name: "Semester 2", 
          subjects: 6,
          subjectList: [
            { name: "Corporate Accounting", type: "Theory", notes: 22, pyqs: 9 },
            { name: "Business Law", type: "Theory", notes: 16, pyqs: 6 },
            { name: "Cost Accounting", type: "Theory", notes: 20, pyqs: 8 },
            { name: "Micro Economics", type: "Theory", notes: 14, pyqs: 5 },
            { name: "Statistics for Business", type: "Theory", notes: 12, pyqs: 6 },
            { name: "Principles of Management", type: "Theory", notes: 11, pyqs: 4 },
          ]
        },
        { name: "Semester 3", subjects: 6, subjectList: [] },
        { name: "Semester 4", subjects: 6, subjectList: [] },
        { name: "Semester 5", subjects: 5, subjectList: [] },
        { name: "Semester 6", subjects: 5, subjectList: [] },
      ]
    },
    {
      degree: "BA",
      semesters: [
        { name: "Semester 1", subjects: 5, subjectList: [] },
        { name: "Semester 2", subjects: 5, subjectList: [] },
        { name: "Semester 3", subjects: 5, subjectList: [] },
        { name: "Semester 4", subjects: 5, subjectList: [] },
        { name: "Semester 5", subjects: 4, subjectList: [] },
        { name: "Semester 6", subjects: 4, subjectList: [] },
      ]
    },
    {
      degree: "B.Sc",
      semesters: [
        { name: "Semester 1", subjects: 6, subjectList: [] },
        { name: "Semester 2", subjects: 6, subjectList: [] },
        { name: "Semester 3", subjects: 6, subjectList: [] },
        { name: "Semester 4", subjects: 6, subjectList: [] },
        { name: "Semester 5", subjects: 5, subjectList: [] },
        { name: "Semester 6", subjects: 5, subjectList: [] },
      ]
    },
    {
      degree: "B.Tech",
      semesters: [
        { name: "Semester 1", subjects: 7, subjectList: [] },
        { name: "Semester 2", subjects: 7, subjectList: [] },
        { name: "Semester 3", subjects: 6, subjectList: [] },
        { name: "Semester 4", subjects: 6, subjectList: [] },
        { name: "Semester 5", subjects: 6, subjectList: [] },
        { name: "Semester 6", subjects: 6, subjectList: [] },
        { name: "Semester 7", subjects: 5, subjectList: [] },
        { name: "Semester 8", subjects: 4, subjectList: [] },
      ]
    },
    {
      degree: "BBA",
      semesters: [
        { name: "Semester 1", subjects: 5, subjectList: [] },
        { name: "Semester 2", subjects: 5, subjectList: [] },
        { name: "Semester 3", subjects: 5, subjectList: [] },
        { name: "Semester 4", subjects: 5, subjectList: [] },
        { name: "Semester 5", subjects: 5, subjectList: [] },
        { name: "Semester 6", subjects: 5, subjectList: [] },
      ]
    },
    {
      degree: "BCA",
      semesters: [
        { name: "Semester 1", subjects: 6, subjectList: [] },
        { name: "Semester 2", subjects: 6, subjectList: [] },
        { name: "Semester 3", subjects: 6, subjectList: [] },
        { name: "Semester 4", subjects: 6, subjectList: [] },
        { name: "Semester 5", subjects: 5, subjectList: [] },
        { name: "Semester 6", subjects: 5, subjectList: [] },
      ]
    },
  ],
  postgraduate: [
    {
      degree: "M.Com",
      semesters: [
        { name: "Semester 1", subjects: 5, subjectList: [] },
        { name: "Semester 2", subjects: 5, subjectList: [] },
        { name: "Semester 3", subjects: 4, subjectList: [] },
        { name: "Semester 4", subjects: 4, subjectList: [] },
      ]
    },
    {
      degree: "MA",
      semesters: [
        { name: "Semester 1", subjects: 4, subjectList: [] },
        { name: "Semester 2", subjects: 4, subjectList: [] },
        { name: "Semester 3", subjects: 4, subjectList: [] },
        { name: "Semester 4", subjects: 4, subjectList: [] },
      ]
    },
    {
      degree: "MBA",
      semesters: [
        { name: "Semester 1", subjects: 6, subjectList: [] },
        { name: "Semester 2", subjects: 6, subjectList: [] },
        { name: "Semester 3", subjects: 5, subjectList: [] },
        { name: "Semester 4", subjects: 5, subjectList: [] },
      ]
    },
    {
      degree: "M.Tech",
      semesters: [
        { name: "Semester 1", subjects: 5, subjectList: [] },
        { name: "Semester 2", subjects: 5, subjectList: [] },
        { name: "Semester 3", subjects: 4, subjectList: [] },
        { name: "Semester 4", subjects: 3, subjectList: [] },
      ]
    },
  ]
};

// Mock exam packs
const examPacks = [
  { degree: "B.Com", semester: "Semester 2", subject: "Financial Accounting", exam: "End Sem", includes: ["Important Questions", "Answer Templates", "PYQs (5 years)"], price: 149 },
  { degree: "B.Com", semester: "Semester 2", subject: "Corporate Accounting", exam: "End Sem", includes: ["Important Questions", "Answer Templates", "PYQs (5 years)"], price: 149 },
  { degree: "B.Com", semester: "Semester 2", subject: "Cost Accounting", exam: "Mid Sem", includes: ["Important Questions", "Answer Templates", "PYQs (3 years)"], price: 99 },
  { degree: "BA", semester: "Semester 1", subject: "Political Science", exam: "End Sem", includes: ["Important Questions", "Answer Templates", "PYQs (5 years)"], price: 129 },
  { degree: "B.Sc", semester: "Semester 3", subject: "Organic Chemistry", exam: "End Sem", includes: ["Important Questions", "Answer Templates", "PYQs (5 years)", "Lab Viva Questions"], price: 179 },
  { degree: "B.Tech", semester: "Semester 4", subject: "Data Structures", exam: "End Sem", includes: ["Important Questions", "Answer Templates", "PYQs (5 years)", "Code Solutions"], price: 199 },
];

// Mock notes
const studyNotes = [
  { title: "Complete Financial Accounting Notes", subject: "Financial Accounting", degree: "B.Com", semester: "Semester 1", uploadedBy: "Platform", format: "PDF", pages: 156 },
  { title: "Business Economics - All Chapters", subject: "Business Economics", degree: "B.Com", semester: "Semester 1", uploadedBy: "Student", format: "PDF", pages: 89 },
  { title: "Cost Accounting Formulas & Examples", subject: "Cost Accounting", degree: "B.Com", semester: "Semester 2", uploadedBy: "Faculty", format: "PDF", pages: 45 },
  { title: "AI Generated - Corporate Law Summary", subject: "Business Law", degree: "B.Com", semester: "Semester 2", uploadedBy: "Platform", format: "AI Notes", pages: 32 },
  { title: "Physics Mechanics Complete Notes", subject: "Physics", degree: "B.Sc", semester: "Semester 1", uploadedBy: "Student", format: "PDF", pages: 124 },
  { title: "Data Structures with C++ Examples", subject: "Data Structures", degree: "B.Tech", semester: "Semester 3", uploadedBy: "Faculty", format: "PDF", pages: 210 },
];

// Types for past papers
type PaperEntry = { year: number; type: string };
type SubjectPapers = Record<string, PaperEntry[]>;
type SemesterPapers = Record<string, SubjectPapers>;
type DegreePapers = Record<string, SemesterPapers>;

// Mock past papers
const pastPapers: DegreePapers = {
  "B.Com": {
    "Semester 2": {
      "Financial Accounting": [
        { year: 2024, type: "End Sem" },
        { year: 2024, type: "Mid Sem" },
        { year: 2023, type: "End Sem" },
        { year: 2023, type: "Mid Sem" },
        { year: 2022, type: "End Sem" },
        { year: 2022, type: "Mid Sem" },
        { year: 2021, type: "End Sem" },
      ],
      "Corporate Accounting": [
        { year: 2024, type: "End Sem" },
        { year: 2023, type: "End Sem" },
        { year: 2023, type: "Mid Sem" },
        { year: 2022, type: "End Sem" },
      ],
      "Cost Accounting": [
        { year: 2024, type: "End Sem" },
        { year: 2023, type: "End Sem" },
        { year: 2022, type: "End Sem" },
      ],
    }
  },
  "B.Sc": {
    "Semester 1": {
      "Physics": [
        { year: 2024, type: "End Sem" },
        { year: 2023, type: "End Sem" },
        { year: 2022, type: "End Sem" },
      ],
      "Chemistry": [
        { year: 2024, type: "End Sem" },
        { year: 2023, type: "End Sem" },
      ],
    }
  }
};


const UniversityPage = () => {
  const { universityId } = useParams<{ universityId: string }>();
  const [expandedSemester, setExpandedSemester] = useState<string | null>("B.Com-Semester 1");
  const [selectedDegree, setSelectedDegree] = useState<string>("all");
  const [selectedSemester, setSelectedSemester] = useState<string>("all");
  
  // AI Tool dialog states
  const [askAIOpen, setAskAIOpen] = useState(false);
  const [notesAIOpen, setNotesAIOpen] = useState(false);
  const [quizAIOpen, setQuizAIOpen] = useState(false);

  // Get university data or use default
  const university = universityData[universityId || ""] || {
    name: universityId?.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") || "University",
    location: "India",
    type: "Central University",
    description: "Browse courses, notes, past papers, and exam resources.",
    stats: { courses: 120, subjects: 650, pastPapers: 1200 }
  };

  const sidebarItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: BookOpen, label: "My Library", href: "#" },
    { icon: StickyNote, label: "AI Notes", href: "#" },
    { icon: MessageSquare, label: "Ask AI", href: "#" },
    { icon: HelpCircle, label: "AI Quiz", href: "#" },
  ];

  const toggleSemester = (key: string) => {
    setExpandedSemester(expandedSemester === key ? null : key);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border bg-background flex flex-col sticky top-0 h-screen overflow-y-auto">
        {/* User Profile */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
              <User className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground">Guest user</p>
              <button className="text-sm text-primary hover:underline">
                + Add your course
              </button>
            </div>
          </div>
          
          <Button className="w-full mt-4 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full">
            <Plus className="h-4 w-4 mr-2" />
            New
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            >
              <item.icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          ))}
          
          <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              <span className="text-sm font-medium">Recent</span>
            </div>
            <ChevronDown className="h-4 w-4" />
          </button>

          <div className="pt-4">
            <p className="px-3 text-sm font-medium text-muted-foreground mb-2">My Library</p>
            
            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <div className="flex items-center gap-3">
                <FolderOpen className="h-5 w-5" />
                <span className="text-sm font-medium">Courses</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>

            <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
              <div className="flex items-center gap-3">
                <List className="h-5 w-5" />
                <span className="text-sm font-medium">Studylists</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </button>
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex">
        <div className="flex-1 overflow-y-auto">
          {/* University Header */}
          <div className="bg-background border-b border-border px-8 py-6">
            <div className="max-w-5xl">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-2">
                    {university.name}
                  </h1>
                  <div className="flex items-center gap-4 text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {university.location}
                    </span>
                    <Badge variant="secondary" className="font-medium">
                      {university.type}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground max-w-2xl">
                    {university.description}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tabs Navigation */}
          <div className="px-8 py-4">
            <Tabs defaultValue="courses" className="w-full">
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
                  Courses at {university.name}
                </h2>

                {/* Undergraduate */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Undergraduate
                  </h3>
                  
                  <Accordion type="multiple" className="space-y-3">
                    {courseData.undergraduate.map((program) => (
                      <AccordionItem 
                        key={program.degree} 
                        value={program.degree}
                        className="border border-border rounded-lg px-4 bg-card"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <span className="font-medium text-foreground">{program.degree}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="grid gap-3">
                            {program.semesters.map((semester) => (
                              <div key={`${program.degree}-${semester.name}`}>
                                <div 
                                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                  onClick={() => toggleSemester(`${program.degree}-${semester.name}`)}
                                >
                                  <div className="flex items-center gap-3">
                                    {expandedSemester === `${program.degree}-${semester.name}` ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )}
                                    <div>
                                      <p className="font-medium text-foreground">{semester.name}</p>
                                      <p className="text-sm text-muted-foreground">{semester.subjects} subjects</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <Badge variant="outline" className="text-xs">Exam-focused</Badge>
                                    <Button size="sm" variant="outline">View Subjects</Button>
                                  </div>
                                </div>

                                {/* Subject List */}
                                {expandedSemester === `${program.degree}-${semester.name}` && semester.subjectList.length > 0 && (
                                  <div className="mt-3 border border-border rounded-lg overflow-hidden">
                                    <table className="w-full">
                                      <thead className="bg-muted/30">
                                        <tr className="text-left text-sm">
                                          <th className="px-4 py-3 font-medium text-muted-foreground">Subject Name</th>
                                          <th className="px-4 py-3 font-medium text-muted-foreground">Type</th>
                                          <th className="px-4 py-3 font-medium text-muted-foreground text-center">Notes</th>
                                          <th className="px-4 py-3 font-medium text-muted-foreground text-center">PYQs</th>
                                          <th className="px-4 py-3 font-medium text-muted-foreground">Action</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border">
                                        {semester.subjectList.map((subject, idx) => (
                                          <tr key={idx} className="hover:bg-muted/20">
                                            <td className="px-4 py-3 font-medium text-foreground">{subject.name}</td>
                                            <td className="px-4 py-3">
                                              <Badge variant={subject.type === "Theory" ? "secondary" : "outline"} className="text-xs">
                                                {subject.type}
                                              </Badge>
                                            </td>
                                            <td className="px-4 py-3 text-center text-muted-foreground">{subject.notes}</td>
                                            <td className="px-4 py-3 text-center text-muted-foreground">{subject.pyqs}</td>
                                            <td className="px-4 py-3">
                                              <Button size="sm" variant="ghost" className="text-primary">
                                                Open Subject <ExternalLink className="h-3 w-3 ml-1" />
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
                </div>

                {/* Postgraduate */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Postgraduate
                  </h3>
                  
                  <Accordion type="multiple" className="space-y-3">
                    {courseData.postgraduate.map((program) => (
                      <AccordionItem 
                        key={program.degree} 
                        value={program.degree}
                        className="border border-border rounded-lg px-4 bg-card"
                      >
                        <AccordionTrigger className="hover:no-underline py-4">
                          <span className="font-medium text-foreground">{program.degree}</span>
                        </AccordionTrigger>
                        <AccordionContent className="pb-4">
                          <div className="grid gap-3">
                            {program.semesters.map((semester) => (
                              <div 
                                key={`${program.degree}-${semester.name}`}
                                className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                              >
                                <div>
                                  <p className="font-medium text-foreground">{semester.name}</p>
                                  <p className="text-sm text-muted-foreground">{semester.subjects} subjects</p>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge variant="outline" className="text-xs">Exam-focused</Badge>
                                  <Button size="sm" variant="outline">View Subjects</Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </TabsContent>

              {/* TAB 3: NOTES */}
              <TabsContent value="notes" className="mt-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Study Notes – {university.name.split(" ").slice(-1)[0]}
                </h2>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studyNotes.map((note, idx) => (
                    <Card key={idx} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-muted rounded-lg">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-sm font-medium line-clamp-2">{note.title}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">{note.subject}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <Badge variant="outline" className="text-xs">{note.degree}</Badge>
                          <Badge variant="outline" className="text-xs">{note.semester}</Badge>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs ${note.format === "AI Notes" ? "bg-purple-100 text-purple-700" : ""}`}
                          >
                            {note.format}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <span>by {note.uploadedBy}</span>
                          <span>{note.pages} pages</span>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button size="sm" variant="outline" className="flex-1">
                            <BookOpen className="h-4 w-4 mr-1" /> View
                          </Button>
                          <Button size="sm" variant="ghost">
                            Save
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* TAB 4: PAST PAPERS */}
              <TabsContent value="past-papers" className="mt-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  Past Year Question Papers
                </h2>

                <Accordion type="multiple" className="space-y-3">
                  {Object.entries(pastPapers).map(([degree, semesters]) => (
                    <AccordionItem 
                      key={degree} 
                      value={degree}
                      className="border border-border rounded-lg px-4 bg-card"
                    >
                      <AccordionTrigger className="hover:no-underline py-4">
                        <span className="font-medium text-foreground">{degree}</span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-4">
                        <Accordion type="multiple" className="space-y-2">
                          {Object.entries(semesters).map(([semester, subjects]) => (
                            <AccordionItem 
                              key={semester} 
                              value={semester}
                              className="border border-border rounded-lg px-3 bg-muted/30"
                            >
                              <AccordionTrigger className="hover:no-underline py-3 text-sm">
                                <span className="font-medium text-foreground">{semester}</span>
                              </AccordionTrigger>
                              <AccordionContent className="pb-3">
                                <Accordion type="multiple" className="space-y-2">
                                  {Object.entries(subjects).map(([subject, papers]) => (
                                    <AccordionItem 
                                      key={subject} 
                                      value={subject}
                                      className="border-0 bg-background rounded-lg px-3"
                                    >
                                      <AccordionTrigger className="hover:no-underline py-2 text-sm">
                                        <span className="text-foreground">{subject}</span>
                                      </AccordionTrigger>
                                      <AccordionContent className="pb-2">
                                        <div className="space-y-2">
                                          {papers.map((paper, idx) => (
                                            <div 
                                              key={idx}
                                              className="flex items-center justify-between p-2 bg-muted/50 rounded"
                                            >
                                              <div className="flex items-center gap-3">
                                                <FileText className="h-4 w-4 text-muted-foreground" />
                                                <span className="text-sm text-foreground">{paper.year}</span>
                                                <Badge variant="outline" className="text-xs">{paper.type}</Badge>
                                              </div>
                                              <div className="flex gap-2">
                                                <Button size="sm" variant="ghost" className="h-7 px-2">
                                                  <ExternalLink className="h-3 w-3" />
                                                </Button>
                                                <Button size="sm" variant="ghost" className="h-7 px-2">
                                                  <Download className="h-3 w-3" />
                                                </Button>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </AccordionContent>
                                    </AccordionItem>
                                  ))}
                                </Accordion>
                              </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </TabsContent>

              {/* TAB 5: AI TOOLS */}
              <TabsContent value="ai-tools" className="mt-6">
                <h2 className="text-xl font-semibold text-foreground mb-6">
                  AI Tools for {university.name.split(" ").slice(-1)[0]} Students
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
          {/* University Stats */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              University Stats
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Courses</span>
                <span className="font-medium text-foreground">{university.stats.courses}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Subjects</span>
                <span className="font-medium text-foreground">{university.stats.subjects}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Past Papers</span>
                <span className="font-medium text-foreground">{university.stats.pastPapers}</span>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Quick Filters */}
          <div className="mb-8">
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Quick Filters
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Degree</label>
                <Select value={selectedDegree} onValueChange={setSelectedDegree}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Degrees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Degrees</SelectItem>
                    <SelectItem value="bcom">B.Com</SelectItem>
                    <SelectItem value="ba">BA</SelectItem>
                    <SelectItem value="bsc">B.Sc</SelectItem>
                    <SelectItem value="btech">B.Tech</SelectItem>
                    <SelectItem value="mba">MBA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1.5 block">Semester</label>
                <Select value={selectedSemester} onValueChange={setSelectedSemester}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Semesters" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Semesters</SelectItem>
                    <SelectItem value="sem1">Semester 1</SelectItem>
                    <SelectItem value="sem2">Semester 2</SelectItem>
                    <SelectItem value="sem3">Semester 3</SelectItem>
                    <SelectItem value="sem4">Semester 4</SelectItem>
                    <SelectItem value="sem5">Semester 5</SelectItem>
                    <SelectItem value="sem6">Semester 6</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Your Context */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Context
            </h3>
            <Card className="bg-muted/50 border-dashed">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground mb-3">
                  Add your course to personalize content
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Set Your Course
                </Button>
              </CardContent>
            </Card>
          </div>
        </aside>
      </main>

      {/* AI Tool Dialogs */}
      <AIToolDialog
        open={askAIOpen}
        onOpenChange={setAskAIOpen}
        type="ask"
        title="Ask AI"
        subtitle="Get answers aligned with your university syllabus"
        placeholder="Ask any question about your course material, concepts, or exam topics..."
        universityName={university.name}
      />
      <AIToolDialog
        open={notesAIOpen}
        onOpenChange={setNotesAIOpen}
        type="notes"
        title="AI Notes Generator"
        subtitle="Generate structured, exam-ready notes"
        placeholder="Enter a topic to generate comprehensive study notes (e.g., 'Supply and Demand in Microeconomics')..."
        universityName={university.name}
      />
      <AIToolDialog
        open={quizAIOpen}
        onOpenChange={setQuizAIOpen}
        type="quiz"
        title="AI Quiz Generator"
        subtitle="Practice with exam-style questions"
        placeholder="Enter a topic to generate practice MCQs (e.g., 'Financial Accounting: Journal Entries')..."
        universityName={university.name}
      />
    </div>
  );
};

export default UniversityPage;
