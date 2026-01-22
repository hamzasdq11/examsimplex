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
  DialogFooter,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Plus, Pencil, Trash2, Loader2, Search, Upload, AlertCircle } from 'lucide-react';
import { BulkImportDialog } from '@/components/admin/BulkImportDialog';
import { useAdminContext } from '@/contexts/AdminContext';
import type { Course } from '@/types/database';

interface CourseWithUniversity extends Course {
  universities?: { name: string } | null;
}

export default function Courses() {
  const { selectedUniversityId, selectedUniversity, refreshData } = useAdminContext();

  const [courses, setCourses] = useState<CourseWithUniversity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [existingSemesterCount, setExistingSemesterCount] = useState<number>(0);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    duration_years: 4,
    total_semesters: 8,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedUniversityId) {
      fetchCourses();
    } else {
      setCourses([]);
      setLoading(false);
    }
  }, [selectedUniversityId]);

  async function fetchCourses() {
    if (!selectedUniversityId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*, universities(name)')
        .eq('university_id', selectedUniversityId)
        .order('name');

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to fetch courses', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUniversityId) return;

    setSaving(true);

    try {
      const courseData = {
        name: formData.name,
        code: formData.code,
        duration_years: formData.duration_years,
        university_id: selectedUniversityId,
      };

      if (editingCourse) {
        const { error } = await supabase
          .from('courses')
          .update(courseData)
          .eq('id', editingCourse.id);

        if (error) throw error;

        // Handle semester updates if count changed
        const newCount = formData.total_semesters;
        if (newCount !== existingSemesterCount) {
          if (newCount > existingSemesterCount) {
            const newSemesters = Array.from(
              { length: newCount - existingSemesterCount },
              (_, i) => ({
                course_id: editingCourse.id,
                number: existingSemesterCount + i + 1,
                name: `Semester ${existingSemesterCount + i + 1}`,
              })
            );
            await supabase.from('semesters').insert(newSemesters);
          } else {
            await supabase
              .from('semesters')
              .delete()
              .eq('course_id', editingCourse.id)
              .gt('number', newCount);
          }
        }

        toast({ title: 'Success', description: 'Course updated successfully' });
      } else {
        const { data: newCourse, error } = await supabase
          .from('courses')
          .insert([courseData])
          .select()
          .single();

        if (error) throw error;

        // Auto-create semesters
        if (newCourse && formData.total_semesters > 0) {
          const semesters = Array.from({ length: formData.total_semesters }, (_, i) => ({
            course_id: newCourse.id,
            number: i + 1,
            name: `Semester ${i + 1}`,
          }));

          await supabase.from('semesters').insert(semesters);
        }

        toast({ title: 'Success', description: `Course created with ${formData.total_semesters} semesters` });
      }

      setIsDialogOpen(false);
      setEditingCourse(null);
      resetForm();
      fetchCourses();
      refreshData(); // Refresh context data
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (course: CourseWithUniversity) => {
    setEditingCourse(course);

    const { count } = await supabase
      .from('semesters')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course.id);

    const semCount = count || 0;
    setExistingSemesterCount(semCount);

    setFormData({
      name: course.name,
      code: course.code,
      duration_years: course.duration_years,
      total_semesters: semCount,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this course and all its semesters?')) return;

    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Course deleted' });
      fetchCourses();
      refreshData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ name: '', code: '', duration_years: 4, total_semesters: 8 });
    setExistingSemesterCount(0);
  };

  const openNewDialog = () => {
    setEditingCourse(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredCourses = courses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show alert if no university selected
  if (!selectedUniversityId) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Courses</h2>
            <p className="text-muted-foreground">Manage courses for universities</p>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a <strong>University</strong> from the context bar above to manage courses.
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
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Courses</h2>
            <p className="text-muted-foreground">
              Managing courses for <strong>{selectedUniversity?.name}</strong>
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search courses..."
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
            ) : filteredCourses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No courses found' : 'No courses yet. Add one to get started!'}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCourses.map((course) => (
                    <TableRow key={course.id}>
                      <TableCell className="font-medium">{course.name}</TableCell>
                      <TableCell>{course.code}</TableCell>
                      <TableCell>{course.duration_years} years</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(course)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(course.id)}>
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="university">University</Label>
                <Input id="university" value={selectedUniversity?.name || ''} disabled />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Course Name</Label>
                  <Input
                    id="name"
                    placeholder="B.Tech CSE"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Course Code</Label>
                  <Input
                    id="code"
                    placeholder="btech-cse"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="duration">Duration (years)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min={1}
                    max={12}
                    value={formData.duration_years}
                    onChange={(e) => setFormData({ ...formData, duration_years: parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="semesters">Total Semesters</Label>
                  <Input
                    id="semesters"
                    type="number"
                    min={1}
                    max={12}
                    value={formData.total_semesters}
                    onChange={(e) => setFormData({ ...formData, total_semesters: parseInt(e.target.value) })}
                    required
                  />
                  {editingCourse && formData.total_semesters !== existingSemesterCount && (
                    <p className="text-xs text-destructive">
                      Will {formData.total_semesters > existingSemesterCount ? 'add' : 'remove'} {Math.abs(formData.total_semesters - existingSemesterCount)} semester(s)
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingCourse ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <BulkImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          tableName="courses"
          onImportComplete={() => { fetchCourses(); refreshData(); }}
        />
      </div>
    </AdminLayout>
  );
}
