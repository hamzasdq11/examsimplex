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
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function Questions() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<any>(null);
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
    if (formData.subject_id) {
      setFilteredUnits(units.filter(u => u.subject_id === formData.subject_id));
    }
  }, [formData.subject_id, units]);

  async function fetchData() {
    try {
      const [questionsRes, subjectsRes, unitsRes] = await Promise.all([
        supabase.from('important_questions').select('*, subjects(name), units(name)').order('created_at', { ascending: false }),
        supabase.from('subjects').select('*').order('name'),
        supabase.from('units').select('*').order('number'),
      ]);

      if (questionsRes.error) throw questionsRes.error;
      setQuestions(questionsRes.data || []);
      setSubjects(subjectsRes.data || []);
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

    const dataToSave = {
      ...formData,
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

  const filteredQuestions = questions.filter(q =>
    q.question.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Important Questions</h2>
            <p className="text-muted-foreground">Manage important questions for subjects</p>
          </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select 
                      value={formData.subject_id} 
                      onValueChange={(v) => setFormData({ ...formData, subject_id: v, unit_id: '' })}
                    >
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Unit (optional)</Label>
                    <Select 
                      value={formData.unit_id} 
                      onValueChange={(v) => setFormData({ ...formData, unit_id: v })}
                      disabled={!formData.subject_id}
                    >
                      <SelectTrigger><SelectValue placeholder="Select unit" /></SelectTrigger>
                      <SelectContent>
                        {filteredUnits.map((u) => (
                          <SelectItem key={u.id} value={u.id}>Unit {u.number}: {u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
        </div>

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
                    <TableHead className="w-[40%]">Question</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredQuestions.map((q) => (
                    <TableRow key={q.id}>
                      <TableCell className="font-medium truncate max-w-xs">{q.question}</TableCell>
                      <TableCell>{q.subjects?.name}</TableCell>
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
      </div>
    </AdminLayout>
  );
}
