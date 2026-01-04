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
import { BulkImportDialog } from '@/components/admin/BulkImportDialog';
import { HierarchyBreadcrumb, BreadcrumbItem } from '@/components/admin/HierarchyBreadcrumb';
import { SelectionGrid, SelectionItem } from '@/components/admin/SelectionGrid';
import type { Subject, Semester, Course, University } from '@/types/database';

export default function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  
  // Hierarchy state
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  
  const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    unit_number: 1,
    chapter_title: '',
    points: '',
    order_index: 0,
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
      const [notesRes, subjectsRes, unitsRes, universitiesRes, coursesRes, semestersRes] = await Promise.all([
        supabase.from('notes').select('*, units(*, subjects(name))').order('order_index'),
        supabase.from('subjects').select('*').order('name'),
        supabase.from('units').select('*').order('number'),
        supabase.from('universities').select('*').order('name'),
        supabase.from('courses').select('*').order('name'),
        supabase.from('semesters').select('*').order('number'),
      ]);

      if (notesRes.error) throw notesRes.error;
      setNotes(notesRes.data || []);
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

    try {
      const pointsArray = formData.points.split('\n').filter(p => p.trim()).map(p => p.trim());
      
      // Find the unit by number for the selected subject
      const unit = filteredUnits.find(u => u.number === formData.unit_number);
      if (!unit) {
        toast({ title: 'Error', description: `Unit ${formData.unit_number} does not exist for this subject`, variant: 'destructive' });
        setSaving(false);
        return;
      }
      
      const dataToSave = {
        unit_id: unit.id,
        chapter_title: formData.chapter_title,
        points: pointsArray,
        order_index: formData.order_index,
      };

      if (editingNote) {
        const { error } = await supabase.from('notes').update(dataToSave).eq('id', editingNote.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Note updated' });
      } else {
        const { error } = await supabase.from('notes').insert([dataToSave]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Note created' });
      }

      setIsDialogOpen(false);
      setEditingNote(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note: any) => {
    setEditingNote(note);
    setFormData({
      unit_number: note.units?.number || 1,
      chapter_title: note.chapter_title,
      points: Array.isArray(note.points) ? note.points.join('\n') : '',
      order_index: note.order_index,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this note?')) return;
    try {
      const { error } = await supabase.from('notes').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Note deleted' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ unit_number: 1, chapter_title: '', points: '', order_index: 0 });
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

  // Get notes for selected subject (through units)
  const subjectUnits = selectedSubject
    ? units.filter(u => u.subject_id === selectedSubject.id)
    : [];
  
  const subjectNotes = subjectUnits.length > 0
    ? notes.filter(n => subjectUnits.some(u => u.id === n.unit_id))
    : [];

  const filteredNotes = subjectNotes.filter(n =>
    n.chapter_title.toLowerCase().includes(searchQuery.toLowerCase())
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

  const subjectItems: SelectionItem[] = semesterSubjects.map(sub => {
    const subUnits = units.filter(u => u.subject_id === sub.id);
    const noteCount = notes.filter(n => subUnits.some(u => u.id === n.unit_id)).length;
    return {
      id: sub.id,
      title: sub.name,
      subtitle: sub.code,
      badge: `${noteCount} notes`,
    };
  });

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
    return 'note';
  };

  const currentLevel = getCurrentLevel();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Notes</h2>
            <p className="text-muted-foreground">
              {currentLevel === 'university' && 'Select a university'}
              {currentLevel === 'course' && `Select a course from ${selectedUniversity?.name}`}
              {currentLevel === 'semester' && `Select a semester from ${selectedCourse?.name}`}
              {currentLevel === 'subject' && `Select a subject from ${selectedSemester?.name}`}
              {currentLevel === 'note' && `Manage notes for ${selectedSubject?.name}`}
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
                  <Button onClick={() => { setEditingNote(null); resetForm(); setIsDialogOpen(true); }}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Note
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Subject</Label>
                      <Input value={selectedSubject?.name} disabled />
                    </div>

                    <div className="space-y-2">
                      <Label>Unit (number)</Label>
                      {filteredUnits.length === 0 ? (
                        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20">
                          <p className="text-sm text-destructive">
                            No units exist for this subject. Please create units first in the Units page.
                          </p>
                        </div>
                      ) : (
                        <>
                          <Input
                            type="number"
                            min={1}
                            placeholder="e.g. 1, 2, 3..."
                            value={formData.unit_number}
                            onChange={(e) => setFormData({ ...formData, unit_number: parseInt(e.target.value) || 1 })}
                            required
                          />
                          <p className="text-xs text-muted-foreground">
                            Available units: {filteredUnits.map(u => u.number).join(', ')}
                          </p>
                        </>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Chapter Title</Label>
                      <Input
                        placeholder="Introduction to DBMS"
                        value={formData.chapter_title}
                        onChange={(e) => setFormData({ ...formData, chapter_title: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Points (one per line)</Label>
                      <Textarea
                        placeholder="Enter each point on a new line..."
                        value={formData.points}
                        onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                        rows={8}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Order Index</Label>
                      <Input
                        type="number"
                        min={0}
                        value={formData.order_index}
                        onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={saving || filteredUnits.length === 0}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingNote ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <BulkImportDialog
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                tableName="notes"
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

        {currentLevel === 'note' && (
          <Card>
            <CardHeader>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search notes..."
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
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No notes found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chapter Title</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Points</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell className="font-medium">{note.chapter_title}</TableCell>
                        <TableCell>Unit {note.units?.number}</TableCell>
                        <TableCell>{Array.isArray(note.points) ? note.points.length : 0} points</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(note)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(note.id)}>
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
