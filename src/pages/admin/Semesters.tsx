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
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import type { Semester, Course, University } from '@/types/database';

export default function Semesters() {
  const [semesters, setSemesters] = useState<any[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSemester, setEditingSemester] = useState<Semester | null>(null);
  
  const [selectedUniversity, setSelectedUniversity] = useState('');
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  
  const [formData, setFormData] = useState({
    course_id: '',
    number: 1,
    name: 'Semester 1',
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedUniversity) {
      setFilteredCourses(courses.filter(c => c.university_id === selectedUniversity));
    }
  }, [selectedUniversity, courses]);

  async function fetchData() {
    try {
      const [semestersRes, universitiesRes, coursesRes] = await Promise.all([
        supabase.from('semesters').select('*, courses(*, universities(name))').order('number'),
        supabase.from('universities').select('*').order('name'),
        supabase.from('courses').select('*').order('name'),
      ]);

      if (semestersRes.error) throw semestersRes.error;
      setSemesters(semestersRes.data || []);
      setUniversities(universitiesRes.data || []);
      setCourses(coursesRes.data || []);
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
      if (editingSemester) {
        const { error } = await supabase.from('semesters').update(formData).eq('id', editingSemester.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Semester updated' });
      } else {
        const { error } = await supabase.from('semesters').insert([formData]);
        if (error) throw error;
        toast({ title: 'Success', description: 'Semester created' });
      }

      setIsDialogOpen(false);
      setEditingSemester(null);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (semester: any) => {
    setEditingSemester(semester);
    const course = semester.courses;
    const uni = course?.universities;
    
    if (uni) {
      const uniObj = universities.find(u => u.name === uni.name);
      if (uniObj) {
        setSelectedUniversity(uniObj.id);
        setFilteredCourses(courses.filter(c => c.university_id === uniObj.id));
      }
    }
    
    setFormData({
      course_id: semester.course_id,
      number: semester.number,
      name: semester.name,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this semester?')) return;
    try {
      const { error } = await supabase.from('semesters').delete().eq('id', id);
      if (error) throw error;
      toast({ title: 'Success', description: 'Semester deleted' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const resetForm = () => {
    setFormData({ course_id: '', number: 1, name: 'Semester 1' });
    setSelectedUniversity('');
    setFilteredCourses([]);
  };

  const openNewDialog = () => {
    setEditingSemester(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredSemesters = semesters.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.courses?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Semesters</h2>
            <p className="text-muted-foreground">Manage semesters for courses</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openNewDialog}>
                <Plus className="mr-2 h-4 w-4" />
                Add Semester
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>{editingSemester ? 'Edit Semester' : 'Add New Semester'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
                    <Select 
                      value={formData.course_id} 
                      onValueChange={(v) => setFormData({ ...formData, course_id: v })} 
                      disabled={!selectedUniversity}
                    >
                      <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                      <SelectContent>
                        {filteredCourses.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Semester Number</Label>
                    <Input
                      type="number"
                      min={1}
                      max={12}
                      value={formData.number}
                      onChange={(e) => {
                        const num = parseInt(e.target.value);
                        setFormData({ ...formData, number: num, name: `Semester ${num}` });
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      placeholder="Semester 1"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingSemester ? 'Update' : 'Create'}
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
                placeholder="Search semesters..."
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
            ) : filteredSemesters.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">No semesters found</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Number</TableHead>
                    <TableHead>Course</TableHead>
                    <TableHead>University</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSemesters.map((semester) => (
                    <TableRow key={semester.id}>
                      <TableCell className="font-medium">{semester.name}</TableCell>
                      <TableCell>{semester.number}</TableCell>
                      <TableCell>{semester.courses?.name}</TableCell>
                      <TableCell>{semester.courses?.universities?.name}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(semester)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(semester.id)}>
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
