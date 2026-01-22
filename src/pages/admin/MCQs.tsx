import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Plus, Pencil, Trash2, Search, Upload, Loader2, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { BulkImportDialog } from "@/components/admin/BulkImportDialog";
import { useAdminContext } from "@/contexts/AdminContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Subject, Unit } from "@/types/database";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface MCQQuestion {
  id: string;
  subject_id: string;
  unit_id: string | null;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string | null;
  difficulty: string;
  created_at: string;
  updated_at: string;
}

export default function MCQs() {
  const { toast } = useToast();
  const {
    selectedSemesterId,
    selectedUniversity,
    selectedCourse,
    selectedSemester,
    isContextComplete,
  } = useAdminContext();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Data
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [mcqs, setMcqs] = useState<MCQQuestion[]>([]);

  // Filters
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    question: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "A",
    explanation: "",
    difficulty: "medium",
    unit_id: "",
  });

  useEffect(() => {
    if (selectedSemesterId) {
      fetchData();
    }
  }, [selectedSemesterId]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchMCQs();
    }
  }, [selectedSubjectId]);

  const fetchData = async () => {
    if (!selectedSemesterId) return;

    setLoading(true);
    try {
      const [{ data: subjectData }, { data: unitData }] = await Promise.all([
        supabase.from("subjects").select("*").eq("semester_id", selectedSemesterId).order("name"),
        supabase.from("units").select("*").order("number"),
      ]);

      setSubjects(subjectData || []);
      setUnits(unitData || []);

      // Auto-select first subject if available
      if (subjectData && subjectData.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subjectData[0].id);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchMCQs = async () => {
    if (!selectedSubjectId) return;

    try {
      const { data } = await supabase
        .from("mcq_questions")
        .select("*")
        .eq("subject_id", selectedSubjectId)
        .order("created_at", { ascending: false });
      
      setMcqs((data as MCQQuestion[]) || []);
    } catch (error) {
      console.error("Error fetching MCQs:", error);
    }
  };

  const handleSubmit = async () => {
    if (!selectedSubjectId) return;
    if (!formData.question || !formData.option_a || !formData.option_b || !formData.option_c || !formData.option_d) {
      toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        subject_id: selectedSubjectId,
        unit_id: formData.unit_id || null,
        question: formData.question,
        option_a: formData.option_a,
        option_b: formData.option_b,
        option_c: formData.option_c,
        option_d: formData.option_d,
        correct_option: formData.correct_option,
        explanation: formData.explanation || null,
        difficulty: formData.difficulty,
      };

      if (editingId) {
        const { error } = await supabase.from("mcq_questions").update(payload).eq("id", editingId);
        if (error) throw error;
        toast({ title: "Success", description: "MCQ updated successfully" });
      } else {
        const { error } = await supabase.from("mcq_questions").insert(payload);
        if (error) throw error;
        toast({ title: "Success", description: "MCQ created successfully" });
      }

      setDialogOpen(false);
      resetForm();
      fetchMCQs();
    } catch (error) {
      console.error("Error saving MCQ:", error);
      toast({ title: "Error", description: "Failed to save MCQ", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (mcq: MCQQuestion) => {
    setEditingId(mcq.id);
    setFormData({
      question: mcq.question,
      option_a: mcq.option_a,
      option_b: mcq.option_b,
      option_c: mcq.option_c,
      option_d: mcq.option_d,
      correct_option: mcq.correct_option,
      explanation: mcq.explanation || "",
      difficulty: mcq.difficulty,
      unit_id: mcq.unit_id || "",
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this MCQ?")) return;

    try {
      const { error } = await supabase.from("mcq_questions").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "MCQ deleted successfully" });
      fetchMCQs();
    } catch (error) {
      console.error("Error deleting MCQ:", error);
      toast({ title: "Error", description: "Failed to delete MCQ", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      question: "",
      option_a: "",
      option_b: "",
      option_c: "",
      option_d: "",
      correct_option: "A",
      explanation: "",
      difficulty: "medium",
      unit_id: "",
    });
  };

  const filteredUnits = selectedSubjectId ? units.filter((u) => u.subject_id === selectedSubjectId) : [];
  const filteredMcqs = mcqs.filter((m) =>
    searchQuery ? m.question.toLowerCase().includes(searchQuery.toLowerCase()) : true
  );

  const getDifficultyBadge = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300">Easy</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">Medium</Badge>;
      case "hard":
        return <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300">Hard</Badge>;
      default:
        return <Badge variant="secondary">{difficulty}</Badge>;
    }
  };

  // Show context requirement message
  if (!isContextComplete) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">MCQs</h1>
            <p className="text-muted-foreground">Manage multiple choice questions</p>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a <strong>University</strong>, <strong>Course</strong>, and <strong>Semester</strong> from the context bar above to manage MCQs.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  if (loading && subjects.length === 0) {
    return (
      <AdminLayout>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">MCQs</h1>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">MCQs</h1>
            <p className="text-muted-foreground">
              {selectedUniversity?.name} / {selectedCourse?.name} / {selectedSemester?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setImportDialogOpen(true)} disabled={!selectedSubjectId}>
              <Upload className="h-4 w-4 mr-2" /> Import
            </Button>
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button disabled={!selectedSubjectId}><Plus className="h-4 w-4 mr-2" /> Add MCQ</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingId ? "Edit MCQ" : "Add New MCQ"}</DialogTitle>
                  <DialogDescription>
                    {editingId ? "Update the MCQ details below" : "Fill in the MCQ details below"}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label htmlFor="question">Question *</Label>
                    <Textarea
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      placeholder="Enter the question..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="option_a">Option A *</Label>
                      <Input
                        id="option_a"
                        value={formData.option_a}
                        onChange={(e) => setFormData({ ...formData, option_a: e.target.value })}
                        placeholder="Option A"
                      />
                    </div>
                    <div>
                      <Label htmlFor="option_b">Option B *</Label>
                      <Input
                        id="option_b"
                        value={formData.option_b}
                        onChange={(e) => setFormData({ ...formData, option_b: e.target.value })}
                        placeholder="Option B"
                      />
                    </div>
                    <div>
                      <Label htmlFor="option_c">Option C *</Label>
                      <Input
                        id="option_c"
                        value={formData.option_c}
                        onChange={(e) => setFormData({ ...formData, option_c: e.target.value })}
                        placeholder="Option C"
                      />
                    </div>
                    <div>
                      <Label htmlFor="option_d">Option D *</Label>
                      <Input
                        id="option_d"
                        value={formData.option_d}
                        onChange={(e) => setFormData({ ...formData, option_d: e.target.value })}
                        placeholder="Option D"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Correct Answer *</Label>
                      <Select
                        value={formData.correct_option}
                        onValueChange={(v) => setFormData({ ...formData, correct_option: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A">Option A</SelectItem>
                          <SelectItem value="B">Option B</SelectItem>
                          <SelectItem value="C">Option C</SelectItem>
                          <SelectItem value="D">Option D</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Difficulty</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(v) => setFormData({ ...formData, difficulty: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Unit (Optional)</Label>
                      <Select
                        value={formData.unit_id}
                        onValueChange={(v) => setFormData({ ...formData, unit_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select unit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No Unit</SelectItem>
                          {filteredUnits.map((unit) => (
                            <SelectItem key={unit.id} value={unit.id}>
                              Unit {unit.number}: {unit.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="explanation">Explanation (Optional)</Label>
                    <Textarea
                      id="explanation"
                      value={formData.explanation}
                      onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
                      placeholder="Explain why this answer is correct..."
                      rows={2}
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingId ? "Update" : "Create"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={selectedSubjectId || ""} onValueChange={(v) => setSelectedSubjectId(v || null)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Subject" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((subject) => (
                <SelectItem key={subject.id} value={subject.id}>
                  {subject.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* MCQ Table */}
        {!selectedSubjectId ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            Select a subject to view MCQs
          </div>
        ) : filteredMcqs.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground border rounded-lg">
            No MCQ questions found. Add your first question!
          </div>
        ) : (
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50%]">Question</TableHead>
                  <TableHead>Answer</TableHead>
                  <TableHead>Difficulty</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMcqs.map((mcq) => (
                  <TableRow key={mcq.id}>
                    <TableCell className="font-medium">
                      <p className="line-clamp-2">{mcq.question}</p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{mcq.correct_option}</Badge>
                    </TableCell>
                    <TableCell>{getDifficultyBadge(mcq.difficulty)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(mcq)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(mcq.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <BulkImportDialog
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          tableName="mcq_questions"
          onImportComplete={fetchMCQs}
        />
      </div>
    </AdminLayout>
  );
}
