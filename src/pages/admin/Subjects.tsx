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
import { Plus, Pencil, Trash2, Loader2, Search, Upload, AlertCircle, Layers } from 'lucide-react';
import { BulkImportDialog } from '@/components/admin/BulkImportDialog';
import { useAdminContext } from '@/contexts/AdminContext';
import type { Subject, Unit } from '@/types/database';

export default function Subjects() {
  const {
    selectedUniversityId,
    selectedCourseId,
    selectedSemesterId,
    selectedUniversity,
    selectedCourse,
    selectedSemester,
    isContextComplete,
  } = useAdminContext();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUnitsDialogOpen, setIsUnitsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [selectedSubjectForUnits, setSelectedSubjectForUnits] = useState<Subject | null>(null);
  const [subjectUnits, setSubjectUnits] = useState<Unit[]>([]);
  const [newUnitName, setNewUnitName] = useState('');
  const [editingUnit, setEditingUnit] = useState<Unit | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    slug: '',
    total_marks: 100,
    theory_marks: 70,
    internal_marks: 30,
    duration: '3 hours',
    pattern: 'Theory',
    exam_type: 'Written',
    initial_units: 5,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedSemesterId) {
      fetchData();
    } else {
      setSubjects([]);
      setUnits([]);
      setLoading(false);
    }
  }, [selectedSemesterId]);

  async function fetchData() {
    if (!selectedSemesterId) return;

    setLoading(true);
    try {
      const [subjectsRes, unitsRes] = await Promise.all([
        supabase.from('subjects').select('*').eq('semester_id', selectedSemesterId).order('name'),
        supabase.from('units').select('*').order('number'),
      ]);

      if (subjectsRes.error) throw subjectsRes.error;
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
    if (!selectedSemesterId) return;

    setSaving(true);

    try {
      const dataToSave = {
        name: formData.name,
        code: formData.code,
        slug: formData.slug || formData.code.toLowerCase().replace(/\s+/g, '-'),
        total_marks: formData.total_marks,
        theory_marks: formData.theory_marks,
        internal_marks: formData.internal_marks,
        duration: formData.duration,
        pattern: formData.pattern,
        exam_type: formData.exam_type,
        semester_id: selectedSemesterId,
      };

      if (editingSubject) {
        const { error } = await supabase.from('subjects').update(dataToSave).eq('id', editingSubject.id);
        if (error) throw error;
        toast({ title: 'Success', description: 'Subject updated' });
      } else {
        const { data: newSubject, error } = await supabase.from('subjects').insert([dataToSave]).select().single();
        if (error) throw error;

        // Create initial units
        await createInitialUnits(newSubject.id, formData.initial_units);
        toast({ title: 'Success', description: 'Subject created with units' });
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

  const createInitialUnits = async (subjectId: string, count: number) => {
    const unitsToCreate = [];
    for (let i = 1; i <= count; i++) {
      unitsToCreate.push({
        subject_id: subjectId,
        number: i,
        name: `Unit ${i}`,
        weight: 1,
      });
    }
    await supabase.from('units').insert(unitsToCreate);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      slug: subject.slug,
      total_marks: subject.total_marks,
      theory_marks: subject.theory_marks,
      internal_marks: subject.internal_marks,
      duration: subject.duration,
      pattern: subject.pattern,
      exam_type: subject.exam_type,
      initial_units: 5,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subject and all its content?')) return;
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
      name: '',
      code: '',
      slug: '',
      total_marks: 100,
      theory_marks: 70,
      internal_marks: 30,
      duration: '3 hours',
      pattern: 'Theory',
      exam_type: 'Written',
      initial_units: 5,
    });
  };

  const openNewDialog = () => {
    setEditingSubject(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openUnitsDialog = (subject: Subject) => {
    setSelectedSubjectForUnits(subject);
    setSubjectUnits(units.filter(u => u.subject_id === subject.id));
    setIsUnitsDialogOpen(true);
  };

  const handleAddUnit = async () => {
    if (!selectedSubjectForUnits || !newUnitName.trim()) return;

    try {
      const nextNumber = subjectUnits.length + 1;
      const { data, error } = await supabase.from('units').insert([{
        subject_id: selectedSubjectForUnits.id,
        number: nextNumber,
        name: newUnitName.trim(),
        weight: 1,
      }]).select().single();

      if (error) throw error;
      setSubjectUnits([...subjectUnits, data]);
      setNewUnitName('');
      toast({ title: 'Success', description: 'Unit added' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleUpdateUnit = async (unit: Unit, updates: Partial<Unit>) => {
    try {
      const { error } = await supabase.from('units').update(updates).eq('id', unit.id);
      if (error) throw error;
      setSubjectUnits(subjectUnits.map(u => u.id === unit.id ? { ...u, ...updates } : u));
      setEditingUnit(null);
      toast({ title: 'Success', description: 'Unit updated' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDeleteUnit = async (unitId: string) => {
    if (!confirm('Delete this unit?')) return;
    try {
      const { error } = await supabase.from('units').delete().eq('id', unitId);
      if (error) throw error;
      setSubjectUnits(subjectUnits.filter(u => u.id !== unitId));
      toast({ title: 'Success', description: 'Unit deleted' });
      fetchData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const filteredSubjects = subjects.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSubjectUnitCount = (subjectId: string) => {
    return units.filter(u => u.subject_id === subjectId).length;
  };

  // Show alert if context is incomplete
  if (!isContextComplete) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Subjects</h2>
            <p className="text-muted-foreground">Manage subjects and their units</p>
          </div>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select a <strong>University</strong>, <strong>Course</strong>, and <strong>Semester</strong> from the context bar above to manage subjects.
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
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Subjects</h2>
            <p className="text-muted-foreground">
              {selectedUniversity?.name} / {selectedCourse?.name} / {selectedSemester?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button onClick={openNewDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Add Subject
            </Button>
          </div>
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
              <div className="text-center py-8 text-muted-foreground">
                No subjects found. Add your first subject to get started.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Units</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubjects.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>{subject.code}</TableCell>
                      <TableCell>{subject.total_marks}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUnitsDialog(subject)}
                          className="gap-1"
                        >
                          <Layers className="h-4 w-4" />
                          {getSubjectUnitCount(subject.id)}
                        </Button>
                      </TableCell>
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

        {/* Add/Edit Subject Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingSubject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Subject Name</Label>
                  <Input
                    id="name"
                    placeholder="Database Management"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    placeholder="BCS501"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input
                  id="slug"
                  placeholder="dbms"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_marks">Total Marks</Label>
                  <Input
                    id="total_marks"
                    type="number"
                    value={formData.total_marks}
                    onChange={(e) => setFormData({ ...formData, total_marks: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="theory_marks">Theory</Label>
                  <Input
                    id="theory_marks"
                    type="number"
                    value={formData.theory_marks}
                    onChange={(e) => setFormData({ ...formData, theory_marks: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="internal_marks">Internal</Label>
                  <Input
                    id="internal_marks"
                    type="number"
                    value={formData.internal_marks}
                    onChange={(e) => setFormData({ ...formData, internal_marks: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              {!editingSubject && (
                <div className="space-y-2">
                  <Label htmlFor="initial_units">Initial Units</Label>
                  <Input
                    id="initial_units"
                    type="number"
                    min={1}
                    max={10}
                    value={formData.initial_units}
                    onChange={(e) => setFormData({ ...formData, initial_units: parseInt(e.target.value) })}
                  />
                  <p className="text-xs text-muted-foreground">Units can be edited later</p>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSubject ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Units Management Dialog */}
        <Dialog open={isUnitsDialogOpen} onOpenChange={setIsUnitsDialogOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Manage Units - {selectedSubjectForUnits?.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="New unit name..."
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddUnit()}
                />
                <Button onClick={handleAddUnit} disabled={!newUnitName.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {subjectUnits.map((unit) => (
                  <div key={unit.id} className="flex items-center gap-2 p-2 rounded-md border">
                    <span className="text-sm text-muted-foreground w-8">#{unit.number}</span>
                    {editingUnit?.id === unit.id ? (
                      <Input
                        value={editingUnit.name}
                        onChange={(e) => setEditingUnit({ ...editingUnit, name: e.target.value })}
                        onBlur={() => handleUpdateUnit(unit, { name: editingUnit.name })}
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdateUnit(unit, { name: editingUnit.name })}
                        className="flex-1"
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1 cursor-pointer" onClick={() => setEditingUnit(unit)}>
                        {unit.name}
                      </span>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => handleDeleteUnit(unit.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <BulkImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          tableName="subjects"
          onImportComplete={fetchData}
        />
      </div>
    </AdminLayout>
  );
}
