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

export default function Notes() {
  const [notes, setNotes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    unit_id: '',
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
      setFilteredUnits(units.filter(u => u.subject_id === selectedSubject));
    }
  }, [selectedSubject, units]);

  async function fetchData() {
    try {
      const [notesRes, subjectsRes, unitsRes] = await Promise.all([
        supabase.from('notes').select('*, units(*, subjects(name))').order('order_index'),
        supabase.from('subjects').select('*').order('name'),
        supabase.from('units').select('*').order('number'),
      ]);

      if (notesRes.error) throw notesRes.error;
      setNotes(notesRes.data || []);
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

    try {
      const pointsArray = formData.points.split('\n').filter(p => p.trim()).map(p => p.trim());
      
      const dataToSave = {
        unit_id: formData.unit_id,
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
    const unit = note.units;
    if (unit) {
      setSelectedSubject(unit.subject_id);
      setFilteredUnits(units.filter(u => u.subject_id === unit.subject_id));
    }
    
    setFormData({
      unit_id: note.unit_id,
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
    setFormData({ unit_id: '', chapter_title: '', points: '', order_index: 0 });
    setSelectedSubject('');
    setFilteredUnits([]);
  };

  const filteredNotes = notes.filter(n =>
    n.chapter_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Notes</h2>
            <p className="text-muted-foreground">Manage chapter notes for units</p>
          </div>
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
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject</Label>
                    <Select 
                      value={selectedSubject} 
                      onValueChange={(v) => { setSelectedSubject(v); setFormData({ ...formData, unit_id: '' }); }}
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
                    <Label>Unit</Label>
                    <Select 
                      value={formData.unit_id} 
                      onValueChange={(v) => setFormData({ ...formData, unit_id: v })}
                      disabled={!selectedSubject}
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
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingNote ? 'Update' : 'Create'}
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
                    <TableHead>Subject</TableHead>
                    <TableHead>Unit</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredNotes.map((note) => (
                    <TableRow key={note.id}>
                      <TableCell className="font-medium">{note.chapter_title}</TableCell>
                      <TableCell>{note.units?.subjects?.name}</TableCell>
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
      </div>
    </AdminLayout>
  );
}
