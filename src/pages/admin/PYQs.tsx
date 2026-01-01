import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Search, FileText, Upload } from 'lucide-react';
import { BulkImportDialog } from '@/components/admin/BulkImportDialog';
import { HierarchyBreadcrumb, BreadcrumbItem } from '@/components/admin/HierarchyBreadcrumb';
import { SelectionGrid, SelectionItem } from '@/components/admin/SelectionGrid';
import type { Subject, Semester, Course, University } from '@/types/database';

export default function PYQs() {
  const [papers, setPapers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<any>(null);
  
  // Hierarchy state
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const [formData, setFormData] = useState({
    subject_id: '',
    year: '',
    paper_code: '',
    pdf_url: '',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [papersRes, subjectsRes, universitiesRes, coursesRes, semestersRes] = await Promise.all([
        supabase.from('pyq_papers').select('*, subjects(name)').order('year', { ascending: false }),
        supabase.from('subjects').select('*').order('name'),
        supabase.from('universities').select('*').order('name'),
        supabase.from('courses').select('*').order('name'),
        supabase.from('semesters').select('*').order('number'),
      ]);

      if (papersRes.error) throw papersRes.error;
      setPapers(papersRes.data || []);
      setSubjects(subjectsRes.data || []);
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

    try {
      const dataToSave = {
        ...formData,
        subject_id: selectedSubject?.id || formData.subject_id,
        pdf_url: formData.pdf_url || null,
        paper_code: formData.paper_code || null,
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
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (paper: any) => {
    setEditingPaper(paper);
    setFormData({
      subject_id: paper.subject_id,
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
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ subject_id: '', year: '', paper_code: '', pdf_url: '' });
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

  const subjectPapers = selectedSubject
    ? papers.filter(p => p.subject_id === selectedSubject.id)
    : [];

  const filteredPapers = subjectPapers.filter(p =>
    p.year.toLowerCase().includes(searchQuery.toLowerCase())
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
    badge: `${papers.filter(p => p.subject_id === sub.id).length} papers`,
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
    return 'paper';
  };

  const currentLevel = getCurrentLevel();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">PYQ Papers</h2>
            <p className="text-muted-foreground">
              {currentLevel === 'university' && 'Select a university'}
              {currentLevel === 'course' && `Select a course from ${selectedUniversity?.name}`}
              {currentLevel === 'semester' && `Select a semester from ${selectedCourse?.name}`}
              {currentLevel === 'subject' && `Select a subject from ${selectedSemester?.name}`}
              {currentLevel === 'paper' && `Manage PYQ papers for ${selectedSubject?.name}`}
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
                  <Button onClick={() => { setEditingPaper(null); resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Paper
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{editingPaper ? 'Edit Paper' : 'Add New Paper'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input value={selectedSubject?.name} disabled />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Year</Label>
                        <Input
                          placeholder="2023"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Paper Code (optional)</Label>
                        <Input
                          placeholder="BCS501"
                          value={formData.paper_code}
                          onChange={(e) => setFormData({ ...formData, paper_code: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>PDF URL (optional)</Label>
                      <Input
                        placeholder="https://..."
                        value={formData.pdf_url}
                        onChange={(e) => setFormData({ ...formData, pdf_url: e.target.value })}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingPaper ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <BulkImportDialog
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                tableName="pyq_papers"
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

        {currentLevel === 'paper' && (
          <Card>
            <CardHeader>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search papers..."
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
              ) : filteredPapers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No papers found</div>
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
      </div>
    </AdminLayout>
  );
}
