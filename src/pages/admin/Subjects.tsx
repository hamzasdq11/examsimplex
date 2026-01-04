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
import { Plus, Pencil, Trash2, Loader2, Search, Upload } from 'lucide-react';
import { BulkImportDialog } from '@/components/admin/BulkImportDialog';
import { HierarchyBreadcrumb, BreadcrumbItem } from '@/components/admin/HierarchyBreadcrumb';
import { SelectionGrid, SelectionItem } from '@/components/admin/SelectionGrid';
import type { Subject, Semester, Course, University } from '@/types/database';

export default function Subjects() {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  
  // Hierarchy state
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  
  const [formData, setFormData] = useState({
    semester_id: '',
    name: '',
    code: '',
    slug: '',
    exam_type: 'End Semester',
    total_marks: 100,
    theory_marks: 70,
    internal_marks: 30,
    duration: '3 Hours',
    pattern: 'Theory',
    gradient_from: '#3B82F6',
    gradient_to: '#8B5CF6',
    icon: 'BookOpen',
    units: 5, // Number of units to create
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [subjectsRes, universitiesRes, coursesRes, semestersRes] = await Promise.all([
        supabase.from('subjects').select('*, semesters(*, courses(*, universities(*)))').order('name'),
        supabase.from('universities').select('*').order('name'),
        supabase.from('courses').select('*').order('name'),
        supabase.from('semesters').select('*').order('number'),
      ]);

      if (subjectsRes.error) throw subjectsRes.error;
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
      const { units: unitCount, ...subjectData } = formData;
      const dataToSave = {
        ...subjectData,
        semester_id: selectedSemester?.id || formData.semester_id,
      };

      if (editingSubject) {
        const { error } = await supabase.from('subjects').update(dataToSave).eq('id', editingSubject.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Subject updated successfully' });
      } else {
        // Create subject first
        const { data: newSubject, error: subjectError } = await supabase
          .from('subjects')
          .insert([dataToSave])
          .select()
          .single();
        
        if (subjectError) throw subjectError;

        // Create units for the subject
        if (unitCount > 0 && newSubject) {
          const unitsToCreate = Array.from({ length: unitCount }, (_, i) => ({
            subject_id: newSubject.id,
            number: i + 1,
            name: `Unit ${i + 1}`,
            weight: Math.floor(100 / unitCount),
          }));

          const { error: unitsError } = await supabase.from('units').insert(unitsToCreate);
          if (unitsError) throw unitsError;
        }

        toast({ title: 'Success', description: `Subject created with ${unitCount} units` });
      }

      setIsDialogOpen(false);
      setEditingSubject(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (subject: any) => {
    setEditingSubject(subject);
    setFormData({
      semester_id: subject.semester_id,
      name: subject.name,
      code: subject.code,
      slug: subject.slug,
      exam_type: subject.exam_type,
      total_marks: subject.total_marks,
      theory_marks: subject.theory_marks,
      internal_marks: subject.internal_marks,
      duration: subject.duration,
      pattern: subject.pattern,
      gradient_from: subject.gradient_from || '#3B82F6',
      gradient_to: subject.gradient_to || '#8B5CF6',
      icon: subject.icon || 'BookOpen',
      units: 5, // Not editable for existing subjects
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    try {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Subject deleted' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({
      semester_id: '',
      name: '',
      code: '',
      slug: '',
      exam_type: 'End Semester',
      total_marks: 100,
      theory_marks: 70,
      internal_marks: 30,
      duration: '3 Hours',
      pattern: 'Theory',
      gradient_from: '#3B82F6',
      gradient_to: '#8B5CF6',
      icon: 'BookOpen',
      units: 5,
    });
  };

  const openNewDialog = () => {
    setEditingSubject(null);
    resetForm();
    if (selectedSemester) {
      setFormData(prev => ({ ...prev, semester_id: selectedSemester.id }));
    }
    setIsDialogOpen(true);
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

  const filteredSubjects = semesterSubjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform data for selection grids
  const universityItems: SelectionItem[] = universities.map(uni => ({
    id: uni.id,
    title: uni.name,
    subtitle: uni.full_name,
    metadata: uni.location,
    badge: `${courses.filter(c => c.university_id === uni.id).length} courses`,
  }));

  const courseItems: SelectionItem[] = universityCourses.map(course => ({
    id: course.id,
    title: course.name,
    subtitle: course.code,
    metadata: `${course.duration_years} years`,
    badge: `${semesters.filter(s => s.course_id === course.id).length} semesters`,
  }));

  const semesterItems: SelectionItem[] = courseSemesters.map(sem => ({
    id: sem.id,
    title: sem.name,
    subtitle: `Semester ${sem.number}`,
    badge: `${subjects.filter(s => s.semester_id === sem.id).length} subjects`,
  }));

  // Breadcrumb items
  const breadcrumbItems: BreadcrumbItem[] = [];
  if (selectedUniversity) {
    breadcrumbItems.push({
      label: selectedUniversity.name,
      onClick: () => {
        setSelectedCourse(null);
        setSelectedSemester(null);
      },
    });
  }
  if (selectedCourse) {
    breadcrumbItems.push({
      label: selectedCourse.name,
      onClick: () => {
        setSelectedSemester(null);
      },
    });
  }
  if (selectedSemester) {
    breadcrumbItems.push({ label: selectedSemester.name });
  }

  const handleHomeClick = () => {
    setSelectedUniversity(null);
    setSelectedCourse(null);
    setSelectedSemester(null);
  };

  const getCurrentLevel = () => {
    if (!selectedUniversity) return 'university';
    if (!selectedCourse) return 'course';
    if (!selectedSemester) return 'semester';
    return 'subject';
  };

  const currentLevel = getCurrentLevel();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Subjects</h2>
            <p className="text-muted-foreground">
              {currentLevel === 'university' && 'Select a university'}
              {currentLevel === 'course' && `Select a course from ${selectedUniversity?.name}`}
              {currentLevel === 'semester' && `Select a semester from ${selectedCourse?.name}`}
              {currentLevel === 'subject' && `Manage subjects for ${selectedSemester?.name}`}
            </p>
          </div>
          {selectedSemester && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openNewDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Subject
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Semester</Label>
                      <Input value={`${selectedUniversity?.name} > ${selectedCourse?.name} > ${selectedSemester?.name}`} disabled />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Subject Name</Label>
                        <Input
                          placeholder="Database Management System"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Code</Label>
                        <Input
                          placeholder="BCS501"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Slug</Label>
                        <Input
                          placeholder="dbms"
                          value={formData.slug}
                          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                          required
                        />
                      </div>
                      {!editingSubject && (
                        <div className="space-y-2">
                          <Label>Units</Label>
                          <Input
                            type="number"
                            min={1}
                            max={10}
                            placeholder="5"
                            value={formData.units}
                            onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 5 })}
                            required
                          />
                          <p className="text-xs text-muted-foreground">Number of units to create (1-10)</p>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Total Marks</Label>
                        <Input
                          type="number"
                          value={formData.total_marks}
                          onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Theory Marks</Label>
                        <Input
                          type="number"
                          value={formData.theory_marks}
                          onChange={(e) => setFormData({ ...formData, theory_marks: parseInt(e.target.value) })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Internal Marks</Label>
                        <Input
                          type="number"
                          value={formData.internal_marks}
                          onChange={(e) => setFormData({ ...formData, internal_marks: parseInt(e.target.value) })}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Gradient From</Label>
                        <Input
                          type="color"
                          value={formData.gradient_from}
                          onChange={(e) => setFormData({ ...formData, gradient_from: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Gradient To</Label>
                        <Input
                          type="color"
                          value={formData.gradient_to}
                          onChange={(e) => setFormData({ ...formData, gradient_to: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                      <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingSubject ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <BulkImportDialog
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                tableName="subjects"
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
            emptyMessage="No courses found for this university"
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
            emptyMessage="No semesters found for this course"
            columns={4}
          />
        )}

        {currentLevel === 'subject' && (
          <Card>
            <CardHeader>
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search subjects..."
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
              ) : filteredSubjects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">No subjects found</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Code</TableHead>
                      <TableHead>Marks</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredSubjects.map((subject) => (
                      <TableRow key={subject.id}>
                        <TableCell className="font-medium">{subject.name}</TableCell>
                        <TableCell>{subject.code}</TableCell>
                        <TableCell>{subject.total_marks}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(subject)}>
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => handleDelete(subject.id)}>
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
