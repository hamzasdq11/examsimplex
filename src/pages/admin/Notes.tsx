import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
import { Plus, Pencil, Trash2, Loader2, Search, Upload, AlertCircle, FileText, RotateCw } from 'lucide-react';
import { BulkImportDialog } from '@/components/admin/BulkImportDialog';
import { useAdminContext } from '@/contexts/AdminContext';
import type { Subject, Unit } from '@/types/database';
import * as mammoth from 'mammoth';
import DOMPurify from 'dompurify';

export default function Notes() {
  const {
    selectedUniversityId,
    selectedCourseId,
    selectedSemesterId,
    selectedUniversity,
    selectedCourse,
    selectedSemester,
    isContextComplete,
  } = useAdminContext();

  const [notes, setNotes] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<any>(null);
  const [previewKey, setPreviewKey] = useState(0);

  // Delete confirmation
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Subject filter
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');

  const [formData, setFormData] = useState({
    unit_id: '',
    chapter_title: '',
    points: '',
    html_content: '',
    css_content: '',
    js_content: '',
    order_index: 0,
  });
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (selectedSemesterId) {
      fetchSubjects();
    } else {
      setSubjects([]);
      setNotes([]);
      setLoading(false);
    }
  }, [selectedSemesterId]);

  useEffect(() => {
    if (selectedSubjectId) {
      fetchNotesAndUnits();
    } else {
      setNotes([]);
      setUnits([]);
    }
  }, [selectedSubjectId]);

  async function fetchSubjects() {
    if (!selectedSemesterId) return;

    setLoading(true);
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

  async function fetchNotesAndUnits() {
    if (!selectedSubjectId) return;

    setLoading(true);
    try {
      const [unitsRes] = await Promise.all([
        supabase
          .from('units')
          .select('*')
          .eq('subject_id', selectedSubjectId)
          .order('number'),
      ]);

      if (unitsRes.error) throw unitsRes.error;
      const subjectUnits = unitsRes.data || [];
      setUnits(subjectUnits);

      // Fetch notes for all units of this subject
      if (subjectUnits.length > 0) {
        const unitIds = subjectUnits.map(u => u.id);
        const { data: notesData, error: notesError } = await supabase
          .from('notes')
          .select('*, units(name, number)')
          .in('unit_id', unitIds)
          .order('order_index');

        if (notesError) throw notesError;
        setNotes(notesData || []);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error:', error);
      toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'html' | 'css' | 'js') => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      let htmlContent = '';

      if (file.name.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();

        const options = {
          styleMap: [
            "p[style-name='Heading 1'] => h1:fresh",
            "p[style-name='Heading 2'] => h2:fresh",
            "p[style-name='Heading 3'] => h3:fresh",
            "p[style-name='Heading 4'] => h4:fresh",
            "p[style-name='List Paragraph'] => li:fresh",
            "b => strong"
          ]
        };

        const result = await mammoth.convertToHtml({ arrayBuffer }, options);
        htmlContent = result.value;

        if (result.messages.length > 0) {
          console.log("Mammoth messages:", result.messages);
        }
      } else if (file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        htmlContent = await file.text();
      } else {
        toast({ title: "Error", description: "Unsupported file type", variant: "destructive" });
        return;
      }

      setFormData(prev => ({
        ...prev,
        html_content: htmlContent,
      }));

      toast({ title: "Success", description: "File loaded successfully" });
    } catch (error) {
      console.error("Error reading file:", error);
      toast({ title: "Error", description: "Failed to read file", variant: "destructive" });
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      let pointsData = [];
      if (formData.points.trim()) {
        try {
          pointsData = JSON.parse(formData.points);
        } catch {
          pointsData = formData.points.split('\n').filter(p => p.trim());
        }
      }

      const dataToSave = {
        unit_id: formData.unit_id,
        chapter_title: formData.chapter_title,
        points: pointsData,
        html_content: formData.html_content || null,
        css_content: formData.css_content || null,
        js_content: formData.js_content || null,
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
      fetchNotesAndUnits();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (note: any) => {
    setEditingNote(note);
    setFormData({
      unit_id: note.unit_id,
      chapter_title: note.chapter_title,
      points: Array.isArray(note.points) ? JSON.stringify(note.points, null, 2) : '',
      html_content: note.html_content || '',
      css_content: note.css_content || '',
      js_content: note.js_content || '',
      order_index: note.order_index,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setNoteToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!noteToDelete) return;

    console.log('Attempting to delete note:', noteToDelete);
    try {
      const { error } = await supabase.from('notes').delete().eq('id', noteToDelete);

      if (error) {
        console.error('Supabase delete error:', error);
        throw error;
      }

      console.log('Note deleted successfully');
      toast({ title: 'Success', description: 'Note deleted' });
      fetchNotesAndUnits();
    } catch (error: any) {
      console.error('Delete operation failed:', error);
      toast({ title: 'Error', description: error.message || 'Failed to delete note', variant: 'destructive' });
    } finally {
      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const resetForm = () => {
    setFormData({
      unit_id: units.length > 0 ? units[0].id : '',
      chapter_title: '',
      points: '',
      html_content: '',
      css_content: '',
      js_content: '',
      order_index: notes.length,
    });
  };

  const openNewDialog = () => {
    setEditingNote(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const filteredNotes = notes.filter(n =>
    n.chapter_title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Show alert if context is incomplete
  if (!isContextComplete) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Notes</h2>
            <p className="text-muted-foreground">Manage study notes for subjects</p>
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
            <h2 className="text-3xl font-bold tracking-tight text-foreground">Notes</h2>
            <p className="text-muted-foreground">
              {selectedUniversity?.name} / {selectedCourse?.name} / {selectedSemester?.name}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsImportOpen(true)}>
              <Upload className="mr-2 h-4 w-4" />
              Import
            </Button>
            <Button onClick={openNewDialog} disabled={!selectedSubjectId || units.length === 0}>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
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
              placeholder="Search notes..."
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
              Please select a subject to view and manage notes.
            </AlertDescription>
          </Alert>
        ) : (
          <Card>
            <CardContent className="pt-6">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No notes found. Add your first note to get started.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Chapter Title</TableHead>
                      <TableHead>Unit</TableHead>
                      <TableHead>Content Type</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredNotes.map((note) => (
                      <TableRow key={note.id}>
                        <TableCell className="font-medium">{note.chapter_title}</TableCell>
                        <TableCell>Unit {note.units?.number}: {note.units?.name}</TableCell>
                        <TableCell>
                          {note.html_content ? (
                            <div className="flex items-center gap-1 text-blue-600">
                              <FileText className="h-4 w-4" />
                              <span className="text-xs">Rich Text</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-slate-500">
                              <span className="text-xs">Points ({Array.isArray(note.points) ? note.points.length : 0})</span>
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{note.order_index}</TableCell>
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

        {/* Add/Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingNote ? 'Edit Note' : 'Add New Note'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit</Label>
                  <Select
                    value={formData.unit_id || "none"}
                    onValueChange={(val) => setFormData({ ...formData, unit_id: val === "none" ? "" : val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select Unit</SelectItem>
                      {units.map((unit) => (
                        <SelectItem key={unit.id} value={unit.id}>
                          Unit {unit.number}: {unit.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Order Index</Label>
                  <Input
                    id="order"
                    type="number"
                    value={formData.order_index}
                    onChange={(e) => setFormData({ ...formData, order_index: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Chapter Title</Label>
                <Input
                  id="title"
                  placeholder="Introduction to DBMS"
                  value={formData.chapter_title}
                  onChange={(e) => setFormData({ ...formData, chapter_title: e.target.value })}
                  required
                />
              </div>

              <div className="p-4 border rounded-md bg-muted/20 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Content Source</Label>
                </div>

                <Tabs defaultValue="html" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="html">HTML Structure</TabsTrigger>
                    <TabsTrigger value="css">CSS Styles</TabsTrigger>
                    <TabsTrigger value="js">JavaScript</TabsTrigger>
                  </TabsList>

                  {/* HTML Content Tab */}
                  <TabsContent value="html" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="html-upload">Upload Structure (.html or .docx)</Label>
                        {formData.html_content && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive"
                            onClick={() => setFormData(prev => ({ ...prev, html_content: '' }))}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <Input
                        id="html-upload"
                        type="file"
                        accept=".docx,.html,.htm"
                        onChange={(e) => handleFileUpload(e, 'html')}
                        className="cursor-pointer"
                      />
                      <p className="text-xs text-muted-foreground">
                        Upload .docx for auto-conversion or .html for raw structure.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>HTML Preview / Edit</Label>
                      <Textarea
                        value={formData.html_content}
                        onChange={(e) => setFormData(prev => ({ ...prev, html_content: e.target.value }))}
                        placeholder="<h1>Hello World</h1>"
                        className="font-mono text-xs min-h-[200px]"
                      />
                    </div>
                  </TabsContent>

                  {/* CSS Content Tab */}
                  <TabsContent value="css" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="css-upload">Upload Styles (.css)</Label>
                        {formData.css_content && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive"
                            onClick={() => setFormData(prev => ({ ...prev, css_content: '' }))}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <Input
                        id="css-upload"
                        type="file"
                        accept=".css"
                        onChange={(e) => handleFileUpload(e, 'css')}
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>CSS Code</Label>
                      <Textarea
                        value={formData.css_content || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, css_content: e.target.value }))}
                        placeholder=".my-class { color: red; }"
                        className="font-mono text-xs min-h-[200px]"
                      />
                    </div>
                  </TabsContent>

                  {/* JS Content Tab */}
                  <TabsContent value="js" className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="js-upload">Upload Script (.js)</Label>
                        {formData.js_content && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive"
                            onClick={() => setFormData(prev => ({ ...prev, js_content: '' }))}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      <Input
                        id="js-upload"
                        type="file"
                        accept=".js"
                        onChange={(e) => handleFileUpload(e, 'js')}
                        className="cursor-pointer"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>JavaScript Code</Label>
                      <Textarea
                        value={formData.js_content || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, js_content: e.target.value }))}
                        placeholder="console.log('Hello');"
                        className="font-mono text-xs min-h-[200px]"
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Live Preview Section */}
                {formData.html_content && (
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <Label>Live Preview (Scoped)</Label>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 gap-1"
                        onClick={() => setPreviewKey(k => k + 1)}
                      >
                        <RotateCw className="h-3 w-3" />
                        Refresh
                      </Button>
                    </div>
                    <div key={previewKey} className="h-60 overflow-y-auto w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background prose prose-sm max-w-none dark:prose-invert relative">
                      {/* Inject CSS for preview */}
                      {formData.css_content && (
                        <style>{formData.css_content}</style>
                      )}

                      <div dangerouslySetInnerHTML={{
                        __html: DOMPurify.sanitize(formData.html_content, {
                          ADD_TAGS: ['img', 'style', 'center', 'font'],
                          ADD_ATTR: ['src', 'alt', 'style', 'class', 'width', 'height', 'align', 'face', 'size', 'color', 'id'],
                          ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
                        })
                      }} />
                    </div>
                    <p className="text-[10px] text-muted-foreground">
                      * JS is not executed in preview for security. CSS is applied.
                    </p>
                  </div>
                )}

              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saving || !formData.unit_id}>
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingNote ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <BulkImportDialog
          open={isImportOpen}
          onOpenChange={setIsImportOpen}
          tableName="notes"
          onImportComplete={fetchNotesAndUnits}
        />

        <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the note.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
