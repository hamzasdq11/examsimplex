import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Plus, Pencil, Trash2, Loader2, Search, FileText, Upload, AlertCircle } from 'lucide-react';
import { BulkImportDialog } from '@/components/admin/BulkImportDialog';
import { useAdminContext } from '@/contexts/AdminContext';
import type { Subject } from '@/types/database';

export default function PYQs() {
  const { 
    selectedUniversityId, 
    selectedCourseId, 
    selectedSemesterId,
    universities,
    courses,
    semesters,
    isContextComplete 
  } = useAdminContext();
  
  const selectedUniversity = universities.find(u => u.id === selectedUniversityId);
  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const selectedSemester = semesters.find(s => s.id === selectedSemesterId);

  const [papers, setPapers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<any>(null);
  
  // Subject filter
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    year: '',
    paper_code: '',
    pdf_url: '',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedSemesterId) {
      fetchSubjects();
    }
  }, [selectedSemesterId]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchPapers();
    }
  }, [selectedSubjectId]);

  async function fetchSubjects() {
    if (!selectedSemesterId) return;
    
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

  async function fetchPapers() {
    if (!selectedSubjectId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('pyq_papers')
        .select('*, subjects(name)')
        .eq('subject_id', selectedSubjectId)
        .order('year', { ascending: false });

      if (error) throw error;
      setPapers(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to fetch papers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubjectId) return;
    
    setSaving(true);

    try {
      const dataToSave = {
        subject_id: selectedSubjectId,
        year: formData.year,
        paper_code: formData.paper_code || null,
        pdf_url: formData.pdf_url || null,
      };

      if (editingPaper) {
        const { error } = await supabase.from('pyq_papers').update(dataToSave).eq('id', editingPaper.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Paper updated' });
      } else {
        const { error } = await supabase.from('pyq_papers').insert([dataToSave]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Paper created' });
      }

      setIsDialogOpen(false);
      setEditingPaper(null);
      resetForm();
      fetchPapers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (paper: any) => {
    setEditingPaper(paper);
    setFormData({
      year: paper.year,
      paper_code: paper.paper_code || '',
      pdf_url: paper.pdf_url || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this paper?')) return;
    try {
      const { error } = await supabase.from('pyq_papers').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Paper deleted' });
      fetchPapers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ year: '', paper_code: '', pdf_url: '' });
  };

  const openNewDialog = () => {
    setEditingPaper(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredPapers = papers.filter(p =>
    p.year.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show alert if context is incomplete
  if (!isContextComplete) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">PYQ Papers</h2>
            <p className="text-muted-foreground">Manage previous year question papers</p>
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
            <h2 className="text-3xl font-bold tracking-tight text-foreground">PYQ Papers</h2>
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
              Add Paper
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
              placeholder="Search by year..."
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
              Please select a subject to view and manage PYQ papers.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredPapers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No papers found. Add your first PYQ paper to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Paper Code</TableHead>
                      <TableHead>PDF</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPapers.map((paper) => (
                      <TableRow key={paper.id}>
                        <TableCell className="font-medium">{paper.year}</TableCell>
                        <TableCell>{paper.paper_code || '-'}</TableCell>
                        <TableCell>
                          {paper.pdf_url ? (
                            <a href={paper.pdf_url} target="_blank" rel="noopener noreferrer">
                              <FileText className="h-4 w-4 text-primary" />
                            </a>
                          ) : '-'}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(paper)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(paper.id)}>
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
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingPaper ? 'Edit Paper' : 'Add New Paper'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year</Label>
                  <Input
                    id="year"
                    placeholder="2023"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paper_code">Paper Code (optional)</Label>
                  <Input
                    id="paper_code"
                    placeholder="BCS501"
                    value={formData.paper_code}
                    onChange={(e) => setFormData({ ...formData, paper_code: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdf_url">PDF URL (optional)</Label>
                <Input
                  id="pdf_url"
                  placeholder="https://..."
                  value={formData.pdf_url}
                  onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingPaper ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <BulkImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          tableName="pyq_papers"
          onImportComplete={fetchPapers}
        />
      </div>
    </AdminLayout>
  );
}
