import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useStudylists, StudylistItem } from '@/hooks/useStudylists';
import { supabase } from '@/integrations/supabase/client';
import { SEO } from '@/components/SEO';
import {
  ArrowLeft,
  Trash2,
  Loader2,
  BookOpen,
  FileText,
  HelpCircle,
  Pencil,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface EnrichedItem extends StudylistItem {
  name?: string;
  details?: string;
}

export default function StudylistDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { studylists, updateStudylist, deleteStudylist, getStudylistItems, removeItemFromStudylist } = useStudylists();
  
  const [items, setItems] = useState<EnrichedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const studylist = studylists.find(s => s.id === id);

  useEffect(() => {
    if (studylist) {
      setName(studylist.name);
      setDescription(studylist.description || '');
    }
  }, [studylist]);

  useEffect(() => {
    const fetchItems = async () => {
      if (!id) return;
      
      setLoading(true);
      const rawItems = await getStudylistItems(id);
      
      // Enrich items with names
      const enriched: EnrichedItem[] = [];
      
      for (const item of rawItems) {
        let enrichedItem: EnrichedItem = { ...item };
        
        if (item.item_type === 'subject') {
          const { data } = await supabase
            .from('subjects')
            .select('name, code')
            .eq('id', item.item_id)
            .single();
          if (data) {
            enrichedItem.name = data.name;
            enrichedItem.details = data.code;
          }
        } else if (item.item_type === 'note') {
          const { data } = await supabase
            .from('notes')
            .select('chapter_title')
            .eq('id', item.item_id)
            .single();
          if (data) {
            enrichedItem.name = data.chapter_title;
          }
        } else if (item.item_type === 'question') {
          const { data } = await supabase
            .from('important_questions')
            .select('question')
            .eq('id', item.item_id)
            .single();
          if (data) {
            enrichedItem.name = data.question.slice(0, 100) + (data.question.length > 100 ? '...' : '');
          }
        }
        
        enriched.push(enrichedItem);
      }
      
      setItems(enriched);
      setLoading(false);
    };

    fetchItems();
  }, [id, getStudylistItems]);

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    setSaving(true);
    const success = await updateStudylist(id!, { name: name.trim(), description: description.trim() });
    setSaving(false);
    
    if (success) {
      toast.success('Studylist updated');
      setEditing(false);
    } else {
      toast.error('Failed to update');
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this studylist?')) return;
    
    const success = await deleteStudylist(id!);
    if (success) {
      toast.success('Studylist deleted');
      navigate('/studylists');
    } else {
      toast.error('Failed to delete');
    }
  };

  const handleRemoveItem = async (item: EnrichedItem) => {
    setRemovingId(item.id);
    const success = await removeItemFromStudylist(id!, item.item_type, item.item_id);
    if (success) {
      setItems(items.filter(i => i.id !== item.id));
      toast.success('Item removed');
    } else {
      toast.error('Failed to remove');
    }
    setRemovingId(null);
  };

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'subject': return <BookOpen className="h-4 w-4" />;
      case 'note': return <FileText className="h-4 w-4" />;
      case 'question': return <HelpCircle className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  if (!studylist && !loading) {
    return (
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <main className="flex-1 flex items-center justify-center">
            <Card className="max-w-md w-full mx-4">
              <CardHeader className="text-center">
                <CardTitle>Studylist not found</CardTitle>
                <CardDescription>
                  This studylist doesn't exist or you don't have access to it.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button onClick={() => navigate('/studylists')}>
                  Back to Studylists
                </Button>
              </CardContent>
            </Card>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <SEO
        title={`${studylist?.name || 'Studylist'} | EXAM Simplex`}
        description={studylist?.description || 'View and manage your studylist.'}
      />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <Button variant="ghost" size="icon" onClick={() => navigate('/studylists')}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                {editing ? (
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="max-w-xs"
                    placeholder="Studylist name"
                  />
                ) : (
                  <h1 className="text-xl font-semibold">{studylist?.name}</h1>
                )}
              </div>
              <div className="flex items-center gap-2">
                {editing ? (
                  <>
                    <Button variant="ghost" size="icon" onClick={() => setEditing(false)}>
                      <X className="h-4 w-4" />
                    </Button>
                    <Button size="icon" onClick={handleSave} disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button variant="outline" size="icon" onClick={() => setEditing(true)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="icon" onClick={handleDelete}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </header>
          
          <div className="p-6">
            {editing && (
              <div className="mb-6">
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={2}
                />
              </div>
            )}
            
            {studylist?.description && !editing && (
              <p className="text-muted-foreground mb-6">{studylist.description}</p>
            )}

            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-xl font-semibold mb-2">No items yet</h2>
                <p className="text-muted-foreground">
                  Add subjects, notes, or questions to this studylist.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={item.id} className="group">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {getItemIcon(item.item_type)}
                        </div>
                        <div>
                          <p className="font-medium">{item.name || 'Unknown item'}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {item.item_type}
                            {item.details && ` • ${item.details}`}
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveItem(item)}
                        disabled={removingId === item.id}
                      >
                        {removingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-destructive" />
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
