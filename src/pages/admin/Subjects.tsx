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
  
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [filteredSemesters, setFilteredSemesters] = useState<Semester[]>([]);
  
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
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
      setFilteredCourses(courses.filter(c => c.university_id === selectedUniversity));
      setSelectedCourse('');
      setFilteredSemesters([]);
    }
  }, [selectedUniversity, courses]);

  useEffect(() => {
    if (selectedCourse) {
      setFilteredSemesters(semesters.filter(s => s.course_id === selectedCourse));
    }
  }, [selectedCourse, semesters]);

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
      if (editingSubject) {
        const { error } = await supabase.from('subjects').update(formData).eq('id', editingSubject.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Subject updated successfully' });
      } else {
        const { error } = await supabase.from('subjects').insert([formData]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Subject created successfully' });
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
    const sem = subject.semesters;
    const course = sem?.courses;
    const uni = course?.universities;
    
    if (uni) setSelectedUniversity(uni.id);
    if (course) {
      setFilteredCourses(courses.filter(c => c.university_id === uni?.id));
      setSelectedCourse(course.id);
    }
    if (course) {
      setFilteredSemesters(semesters.filter(s => s.course_id === course?.id));
    }
    
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
    });
    setSelectedUniversity('');
    setSelectedCourse('');
    setFilteredCourses([]);
    setFilteredSemesters([]);
  };

  const openNewDialog = () => {
    setEditingSubject(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Subjects</h2>
            <p className="text-muted-foreground">Manage subjects for courses</p>
          </div>
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
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>University</Label>
                    <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {universities.map((u) => (
                          <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Course</Label>
                    <Select value={selectedCourse} onValueChange={setSelectedCourse} disabled={!selectedUniversity}>
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {filteredCourses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select 
                      value={formData.semester_id} 
                      onValueChange={(v) => setFormData({ ...formData, semester_id: v })} 
                      disabled={!selectedCourse}
                    >
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {filteredSemesters.map((s) => (
                          <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
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
                
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    placeholder="dbms"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    required
                  />
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
          </div>
          <BulkImportDialog
            open={isImportOpen}
            onOpenChange={setIsImportOpen}
            tableName="subjects"
            onImportComplete={fetchData}
          />
        </div>

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
                    <TableHead>Course</TableHead>
                    <TableHead>Semester</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.semesters?.courses?.name}</TableCell>
                      <TableCell>{subject.semesters?.name}</TableCell>
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
      </div>
    </AdminLayout>
  );
}
