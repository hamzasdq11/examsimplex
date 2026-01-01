import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Search, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { BulkImportDialog } from '@/components/admin/BulkImportDialog';
import { HierarchyBreadcrumb, BreadcrumbItem } from '@/components/admin/HierarchyBreadcrumb';
import { SelectionGrid, SelectionItem } from '@/components/admin/SelectionGrid';
import type { Subject, Semester, Course, University } from '@/types/database';

export default function Questions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
  
  // Hierarchy state
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    subject_id: '',
    unit_id: '',
    question: '',
    marks: 10,
    frequency: 'Expected',
    answer_template: '',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedSubject) {
      setFilteredUnits(units.filter(u => u.subject_id === selectedSubject.id));
    }
  }, [selectedSubject, units]);

  async function fetchData() {
    try {
      const [questionsRes, subjectsRes, unitsRes, universitiesRes, coursesRes, semestersRes] = await Promise.all([
        supabase.from('important_questions').select('*, subjects(name), units(name)').order('created_at', { ascending: false }),
        supabase.from('subjects').select('*').order('name'),
        supabase.from('units').select('*').order('number'),
        supabase.from('universities').select('*').order('name'),
        supabase.from('courses').select('*').order('name'),
        supabase.from('semesters').select('*').order('number'),
      ]);

      if (questionsRes.error) throw questionsRes.error;
      setQuestions(questionsRes.data || []);
      setSubjects(subjectsRes.data || []);
      setUnits(unitsRes.data || []);
      setUniversities(universitiesRes.data || []);
      setCourses(coursesRes.data || []);
      setSemesters(semestersRes.data || []);
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

    const dataToSave = {
      ...formData,
      subject_id: selectedSubject?.id || formData.subject_id,
      unit_id: formData.unit_id || null,
      answer_template: formData.answer_template ? JSON.parse(formData.answer_template) : null,
    };

    try {
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
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (question: any) => {
    setEditingQuestion(question);
    setFormData({
      subject_id: question.subject_id,
      unit_id: question.unit_id || '',
      question: question.question,
      marks: question.marks,
      frequency: question.frequency,
      answer_template: question.answer_template ? JSON.stringify(question.answer_template, null, 2) : '',
    });
    setFilteredUnits(units.filter(u => u.subject_id === question.subject_id));
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this question?')) return;
    try {
      const { error } = await supabase.from('important_questions').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Question deleted' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      subject_id: '',
      unit_id: '',
      question: '',
      marks: 10,
      frequency: 'Expected',
      answer_template: '',
    });
    setFilteredUnits([]);
  };

  const getFrequencyColor = (freq: string) => {
    switch (freq) {
      case 'Very Frequent': return 'destructive';
      case 'Repeated': return 'default';
      default: return 'secondary';
    }
  };

  // Filter data based on hierarchy
  const universityCourses = selectedUniversity 
    ? courses.filter(c => c.university_id === selectedUniversity.id)
    : [];

  const courseSemesters = selectedCourse
    ? semesters.filter(s => s.course_id === selectedCourse.id)
    : [];

  const semesterSubjects = selectedSemester
    ? subjects.filter(s => s.semester_id === selectedSemester.id)
    : [];

  const subjectQuestions = selectedSubject
    ? questions.filter(q => q.subject_id === selectedSubject.id)
    : [];

  const filteredQuestions = subjectQuestions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform data for selection grids
  const universityItems: SelectionItem[] = universities.map(uni => ({
    id: uni.id,
    title: uni.name,
    subtitle: uni.full_name,
    metadata: uni.location,
  }));

  const courseItems: SelectionItem[] = universityCourses.map(course => ({
    id: course.id,
    title: course.name,
    subtitle: course.code,
  }));

  const semesterItems: SelectionItem[] = courseSemesters.map(sem => ({
    id: sem.id,
    title: sem.name,
    subtitle: `Semester ${sem.number}`,
  }));

  const subjectItems: SelectionItem[] = semesterSubjects.map(sub => ({
    id: sub.id,
    title: sub.name,
    subtitle: sub.code,
    badge: `${questions.filter(q => q.subject_id === sub.id).length} questions`,
  }));

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [];
  if (selectedUniversity) {
    breadcrumbItems.push({
      label: selectedUniversity.name,
      onClick: () => {
        setSelectedCourse(null);
        setSelectedSemester(null);
        setSelectedSubject(null);
      },
    });
  }
  if (selectedCourse) {
    breadcrumbItems.push({
      label: selectedCourse.name,
      onClick: () => {
        setSelectedSemester(null);
        setSelectedSubject(null);
      },
    });
  }
  if (selectedSemester) {
    breadcrumbItems.push({
      label: selectedSemester.name,
      onClick: () => {
        setSelectedSubject(null);
      },
    });
  }
  if (selectedSubject) {
    breadcrumbItems.push({ label: selectedSubject.name });
  }

  const handleHomeClick = () => {
    setSelectedUniversity(null);
    setSelectedCourse(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
  };

  const getCurrentLevel = () => {
    if (!selectedUniversity) return 'university';
    if (!selectedCourse) return 'course';
    if (!selectedSemester) return 'semester';
    if (!selectedSubject) return 'subject';
    return 'question';
  };

  const currentLevel = getCurrentLevel();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Important Questions</h2>
            <p className="text-muted-foreground">
              {currentLevel === 'university' && 'Select a university'}
              {currentLevel === 'course' && `Select a course from ${selectedUniversity?.name}`}
              {currentLevel === 'semester' && `Select a semester from ${selectedCourse?.name}`}
              {currentLevel === 'subject' && `Select a subject from ${selectedSemester?.name}`}
              {currentLevel === 'question' && `Manage questions for ${selectedSubject?.name}`}
            </p>
          </div>
          {selectedSubject && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingQuestion(null); resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Question
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingQuestion ? 'Edit Question' : 'Add New Question'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input value={selectedSubject?.name} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit (optional)</Label>
                      <Select 
                        value={formData.unit_id} 
                        onValueChange={(v) => setFormData({ ...formData, unit_id: v })}
                      >
                        <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                        <SelectContent>
                          {filteredUnits.map((u) => (
                            <SelectItem key={u.id} value={u.id}>Unit {u.number}: {u.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Question</Label>
                      <Textarea
                        placeholder="Enter the question..."
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                        required
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Marks</Label>
                        <Input
                          type="number"
                          min={1}
                          value={formData.marks}
                          onChange={(e) => setFormData({ ...formData, marks: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Frequency</Label>
                        <Select value={formData.frequency} onValueChange={(v) => setFormData({ ...formData, frequency: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Very Frequent">Very Frequent</SelectItem>
                            <SelectItem value="Repeated">Repeated</SelectItem>
                            <SelectItem value="Expected">Expected</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Answer Template (JSON, optional)</Label>
                      <Textarea
                        placeholder='{"answer": "Your answer here", "keywords": ["key1", "key2"]}'
                        value={formData.answer_template}
                        onChange={(e) => setFormData({ ...formData, answer_template: e.target.value })}
                        rows={4}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingQuestion ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <BulkImportDialog
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                tableName="important_questions"
                onImportComplete={fetchData}
              />
            </div>
          )}
        </div>

        <HierarchyBreadcrumb items={breadcrumbItems} onHomeClick={handleHomeClick} />

        {currentLevel === 'university' && (
          <SelectionGrid
            items={universityItems}
            onSelect={(item) => {
              const uni = universities.find(u => u.id === item.id);
              if (uni) setSelectedUniversity(uni);
            }}
            loading={loading}
            emptyMessage="No universities found"
          />
        )}

        {currentLevel === 'course' && (
          <SelectionGrid
            items={courseItems}
            onSelect={(item) => {
              const course = courses.find(c => c.id === item.id);
              if (course) setSelectedCourse(course);
            }}
            loading={loading}
            emptyMessage="No courses found"
          />
        )}

        {currentLevel === 'semester' && (
          <SelectionGrid
            items={semesterItems}
            onSelect={(item) => {
              const sem = semesters.find(s => s.id === item.id);
              if (sem) setSelectedSemester(sem);
            }}
            loading={loading}
            emptyMessage="No semesters found"
            columns={4}
          />
        )}

        {currentLevel === 'subject' && (
          <SelectionGrid
            items={subjectItems}
            onSelect={(item) => {
              const sub = subjects.find(s => s.id === item.id);
              if (sub) setSelectedSubject(sub);
            }}
            loading={loading}
            emptyMessage="No subjects found"
          />
        )}

        {currentLevel === 'question' && (
          <Card>
            <CardHeader>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredQuestions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No questions found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50%]">Question</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredQuestions.map((q) => (
                      <TableRow key={q.id}>
                        <TableCell className="font-medium">{q.question}</TableCell>
                        <TableCell>{q.marks}</TableCell>
                        <TableCell>
                          <Badge variant={getFrequencyColor(q.frequency)}>{q.frequency}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(q)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(q.id)}>
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
      </div>
    </AdminLayout>
  );
}
