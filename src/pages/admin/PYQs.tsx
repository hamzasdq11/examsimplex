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
import { Plus, Pencil, Trash2, Loader2, Search, FileText, Upload } from 'lucide-react';
import { BulkImportDialog } from '@/components/admin/BulkImportDialog';

export default function PYQs() {
  const [papers, setPapers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [editingPaper, setEditingPaper] = useState<any>(null);
  
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
      const [papersRes, subjectsRes] = await Promise.all([
        supabase.from('pyq_papers').select('*, subjects(name)').order('year', { ascending: false }),
        supabase.from('subjects').select('*').order('name'),
      ]);

      if (papersRes.error) throw papersRes.error;
      setPapers(papersRes.data || []);
      setSubjects(subjectsRes.data || []);
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

  const filteredPapers = papers.filter(p =>
    p.year.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subjects?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground">PYQ Papers</h2>
            <p className="text-muted-foreground">Manage previous year question papers</p>
          </div>
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
                  <Select 
                    value={formData.subject_id} 
                    onValueChange={(v) => setFormData({ ...formData, subject_id: v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                    <SelectContent>
                      {subjects.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
          </div>
          <BulkImportDialog
            open={isImportOpen}
            onOpenChange={setIsImportOpen}
            tableName="pyq_papers"
            onImportComplete={fetchData}
          />
        </div>

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
                    <TableHead>Subject</TableHead>
                    <TableHead>Paper Code</TableHead>
                    <TableHead>PDF</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPapers.map((paper) => (
                    <TableRow key={paper.id}>
                      <TableCell className="font-medium">{paper.year}</TableCell>
                      <TableCell>{paper.subjects?.name}</TableCell>
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
      </div>
    </AdminLayout>
  );
}
