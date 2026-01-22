import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Search, Upload, AlertCircle } from 'lucide-react';
import { BulkImportDialog } from '@/components/admin/BulkImportDialog';
import { useAdminContext } from '@/contexts/AdminContext';
import type { Subject, Unit } from '@/types/database';

export default function Questions() {
  const {
    selectedUniversityId,
    selectedCourseId,
    selectedSemesterId,
    selectedUniversity,
    selectedCourse,
    selectedSemester,
    isContextComplete,
  } = useAdminContext();

  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);

  // Subject filter
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const [formData, setFormData] = useState({
    unit_id: '',
    question: '',
    marks: 5,
    frequency: 'Medium',
    answer_template: '',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedSemesterId) {
      fetchSubjects();
    } else {
      setSubjects([]);
      setQuestions([]);
      setLoading(false);
    }
  }, [selectedSemesterId]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchQuestionsAndUnits();
    } else {
      setQuestions([]);
      setUnits([]);
    }
  }, [selectedSubjectId]);

  async function fetchSubjects() {
    if (!selectedSemesterId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('semester_id', selectedSemesterId)
        .order('name');

      if (error) throw error;
      setSubjects(data || []);

      // Auto-select first subject
      if (data && data.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(data[0].id);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchQuestionsAndUnits() {
    if (!selectedSubjectId) return;

    setLoading(true);
    try {
      const [questionsRes, unitsRes] = await Promise.all([
        supabase
          .from('important_questions')
          .select('*, subjects(name), units(name)')
          .eq('subject_id', selectedSubjectId)
          .order('created_at', { ascending: false }),
        supabase
          .from('units')
          .select('*')
          .eq('subject_id', selectedSubjectId)
          .order('number'),
      ]);

      if (questionsRes.error) throw questionsRes.error;
      setQuestions(questionsRes.data || []);
      setUnits(unitsRes.data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let answerTemplate = null;
      if (formData.answer_template.trim()) {
        try {
          answerTemplate = JSON.parse(formData.answer_template);
        } catch {
          answerTemplate = { content: formData.answer_template };
        }
      }

      const dataToSave = {
        subject_id: selectedSubjectId,
        unit_id: formData.unit_id || null,
        question: formData.question,
        marks: formData.marks,
        frequency: formData.frequency,
        answer_template: answerTemplate,
      };

      if (editingQuestion) {
        const { error } = await supabase.from('important_questions').update(dataToSave).eq('id', editingQuestion.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Question updated' });
      } else {
        const { error } = await supabase.from('important_questions').insert([dataToSave]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Question created' });
      }

      setIsDialogOpen(false);
      setEditingQuestion(null);
      resetForm();
      fetchQuestionsAndUnits();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setFormData({
      unit_id: question.unit_id || '',
      question: question.question,
      marks: question.marks,
      frequency: question.frequency,
      answer_template: question.answer_template ? JSON.stringify(question.answer_template, null, 2) : '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      const { error } = await supabase.from('important_questions').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Question deleted' });
      fetchQuestionsAndUnits();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      unit_id: '',
      question: '',
      marks: 5,
      frequency: 'Medium',
      answer_template: '',
    });
  };

  const openNewDialog = () => {
    setEditingQuestion(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show alert if context is incomplete
  if (!isContextComplete) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Important Questions</h2>
            <p className="text-muted-foreground">Manage important questions for subjects</p>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a <strong>University</strong>, <strong>Course</strong>, and <strong>Semester</strong> from the context bar above.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Important Questions</h2>
            <p className="text-muted-foreground">
              {selectedUniversity?.name} / {selectedCourse?.name} / {selectedSemester?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button onClick={openNewDialog} disabled={!selectedSubjectId}>
              <Plus className="mr-2 h-4 w-4" />
              Add Question
            </Button>
          </div>
        </div>

        {/* Subject Filter & Search */}
        <div className="flex flex-wrap gap-4">
          <Select value={selectedSubjectId} onValueChange={setSelectedSubjectId}>
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
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {!selectedSubjectId ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a subject to view and manage questions.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No questions found. Add your first question to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Question</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">
                          <p className="line-clamp-2">{question.question}</p>
                        </TableCell>
                        <TableCell>{question.units?.name || '-'}</TableCell>
                        <TableCell>{question.marks}</TableCell>
                        <TableCell>{question.frequency}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(question)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(question.id)}>
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit (Optional)</Label>
                  <Select
                    value={formData.unit_id || "none"}
                    onValueChange={(val) => setFormData({ ...formData, unit_id: val === "none" ? "" : val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Unit</SelectItem>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          Unit {unit.number}: {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marks">Marks</Label>
                    <Input
                      id="marks"
                      type="number"
                      value={formData.marks}
                      onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select
                      value={formData.frequency}
                      onValueChange={(val) => setFormData({ ...formData, frequency: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="question">Question</Label>
                <Textarea
                  id="question"
                  placeholder="Enter the question..."
                  value={formData.question}
                  onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                  rows={3}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="answer">Answer Template (Optional, JSON)</Label>
                <Textarea
                  id="answer"
                  placeholder='{"content": "Answer here..."}'
                  value={formData.answer_template}
                  onChange={(e) => setFormData({ ...formData, answer_template: e.target.value })}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingQuestion ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <BulkImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          tableName="important_questions"
          onImportComplete={fetchQuestionsAndUnits}
        />
      </div>
    </AdminLayout>
  );
}
