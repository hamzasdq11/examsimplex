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
import { HierarchyBreadcrumb } from '@/components/admin/HierarchyBreadcrumb';
import { SelectionGrid, SelectionItem } from '@/components/admin/SelectionGrid';
import type { Course, University } from '@/types/database';

interface CourseWithUniversity extends Course {
  universities?: { name: string } | null;
}

export default function Courses() {
  const [courses, setCourses] = useState<CourseWithUniversity[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [existingSemesterCount, setExistingSemesterCount] = useState<number>(0);
  
  // Hierarchy state
  const [selectedUniversity, setSelectedUniversity] = useState<University | null>(null);
  
  const [formData, setFormData] = useState({
    university_id: '',
    name: '',
    code: '',
    duration_years: 4,
    total_semesters: 8,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [coursesRes, universitiesRes] = await Promise.all([
        supabase.from('courses').select('*, universities(name)').order('name'),
        supabase.from('universities').select('*').order('name'),
      ]);

      if (coursesRes.error) throw coursesRes.error;
      if (universitiesRes.error) throw universitiesRes.error;

      setCourses(coursesRes.data || []);
      setUniversities(universitiesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const courseData = {
        ...formData,
        university_id: selectedUniversity?.id || formData.university_id,
      };
      
      if (editingCourse) {
        const { total_semesters, ...updateData } = courseData;
        const { error } = await supabase
          .from('courses')
          .update(updateData)
          .eq('id', editingCourse.id);

        if (error) throw error;
        toast({ title: 'Success', description: 'Course updated successfully' });
      } else {
        const { total_semesters, ...insertData } = courseData;
        const { data: newCourse, error } = await supabase
          .from('courses')
          .insert([insertData])
          .select()
          .single();

        if (error) throw error;

        // Auto-create semesters for the new course
        if (newCourse && total_semesters > 0) {
          const semesters = Array.from({ length: total_semesters }, (_, i) => ({
            course_id: newCourse.id,
            number: i + 1,
            name: `Semester ${i + 1}`,
          }));

          const { error: semError } = await supabase
            .from('semesters')
            .insert(semesters);

          if (semError) {
            console.error('Error creating semesters:', semError);
            toast({
              title: 'Warning',
              description: 'Course created but failed to create semesters',
              variant: 'destructive',
            });
          }
        }

        toast({ title: 'Success', description: `Course created with ${total_semesters} semesters` });
      }

      setIsDialogOpen(false);
      setEditingCourse(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save course',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async (course: CourseWithUniversity) => {
    setEditingCourse(course);
    
    // Fetch existing semester count
    const { count } = await supabase
      .from('semesters')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', course.id);
    
    const semCount = count || 0;
    setExistingSemesterCount(semCount);
    
    setFormData({
      university_id: course.university_id,
      name: course.name,
      code: course.code,
      duration_years: course.duration_years,
      total_semesters: semCount,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const { error } = await supabase.from('courses').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Course deleted successfully' });
      fetchData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete course',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({ university_id: '', name: '', code: '', duration_years: 4, total_semesters: 8 });
  };

  const openNewDialog = () => {
    setEditingCourse(null);
    setExistingSemesterCount(0);
    resetForm();
    if (selectedUniversity) {
      setFormData(prev => ({ ...prev, university_id: selectedUniversity.id }));
    }
    setIsDialogOpen(true);
  };

  // Filter courses for selected university
  const universityCourses = selectedUniversity 
    ? courses.filter(c => c.university_id === selectedUniversity.id)
    : [];

  const filteredCourses = universityCourses.filter(c =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Transform universities for selection grid
  const universityItems: SelectionItem[] = universities.map(uni => ({
    id: uni.id,
    title: uni.name,
    subtitle: uni.full_name,
    metadata: uni.location,
    badge: `${courses.filter(c => c.university_id === uni.id).length} courses`,
  }));

  const handleSelectUniversity = (item: SelectionItem) => {
    const uni = universities.find(u => u.id === item.id);
    if (uni) setSelectedUniversity(uni);
  };

  const breadcrumbItems = selectedUniversity
    ? [{ label: selectedUniversity.name }]
    : [];

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Courses</h2>
            <p className="text-muted-foreground">
              {selectedUniversity 
                ? `Manage courses for ${selectedUniversity.name}`
                : 'Select a university to manage its courses'
              }
            </p>
          </div>
          {selectedUniversity && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsImportOpen(true)}>
                <Upload className="mr-2 h-4 w-4" />
                Import
              </Button>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openNewDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Course
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{editingCourse ? 'Edit Course' : 'Add New Course'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>University</Label>
                      <Input value={selectedUniversity.name} disabled />
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
                      {editingCourse ? (
                        <div className="space-y-2">
                          <Label>Total Semesters</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min={1}
                              max={12}
                              value={formData.total_semesters || existingSemesterCount}
                              onChange={(e) => setFormData({ ...formData, total_semesters: parseInt(e.target.value) })}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={async () => {
                                const newCount = formData.total_semesters || existingSemesterCount;
                                if (newCount === existingSemesterCount) return;
                                
                                setSaving(true);
                                try {
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
                                  setExistingSemesterCount(newCount);
                                  toast({ title: 'Success', description: 'Semesters updated' });
                                } catch (err: any) {
                                  toast({ title: 'Error', description: err.message, variant: 'destructive' });
                                } finally {
                                  setSaving(false);
                                }
                              }}
                            >
                              Update
                            </Button>
                          </div>
                        </div>
                      ) : (
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
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={saving}>
                        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {editingCourse ? 'Update' : 'Create'}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
              <BulkImportDialog
                open={isImportOpen}
                onOpenChange={setIsImportOpen}
                tableName="courses"
                onImportComplete={fetchData}
              />
            </div>
          )}
        </div>

        <HierarchyBreadcrumb 
          items={breadcrumbItems} 
          onHomeClick={() => setSelectedUniversity(null)} 
        />

        {!selectedUniversity ? (
          // University Selection View
          <SelectionGrid
            items={universityItems}
            onSelect={handleSelectUniversity}
            loading={loading}
            emptyMessage="No universities found. Add one first!"
          />
        ) : (
          // Courses Table View
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
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
        )}
      </div>
    </AdminLayout>
  );
}
