import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useStudylists } from '@/hooks/useStudylists';
import { CreateStudylistDialog } from '@/components/CreateStudylistDialog';
import { SEO } from '@/components/SEO';
import {
  FolderPlus,
  Plus,
  Trash2,
  ExternalLink,
  Loader2,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

export default function Studylists() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { studylists, loading, deleteStudylist } = useStudylists();
  const [createOpen, setCreateOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    const success = await deleteStudylist(id);
    if (success) {
      toast.success('Studylist deleted');
    } else {
      toast.error('Failed to delete');
    }
    setDeletingId(null);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md w-full mx-4">
          <CardHeader className="text-center">
            <FolderPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Sign in to create studylists</CardTitle>
            <CardDescription>
              Organize your study materials into custom collections.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <SEO
        title="My Studylists | EXAM Simplex"
        description="Organize your study materials into custom collections."
      />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold">Studylists</h1>
              </div>
              <Button onClick={() => setCreateOpen(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                New Studylist
              </Button>
            </div>
          </header>
          
          <div className="p-6">
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : studylists.length === 0 ? (
              <div className="text-center py-12">
                <FolderPlus className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                <h2 className="text-xl font-semibold mb-2">No studylists yet</h2>
                <p className="text-muted-foreground mb-6">
                  Create your first studylist to organize your study materials.
                </p>
                <Button onClick={() => setCreateOpen(true)} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Studylist
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {studylists.map((list) => (
                  <Card key={list.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-primary" />
                          <CardTitle className="text-base line-clamp-1">
                            {list.name}
                          </CardTitle>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(list.id)}
                          disabled={deletingId === list.id}
                        >
                          {deletingId === list.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 text-destructive" />
                          )}
                        </Button>
                      </div>
                      {list.description && (
                        <CardDescription className="text-xs line-clamp-2">
                          {list.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span>{list.item_count} items</span>
                        <span>Updated {formatDistanceToNow(new Date(list.updated_at))} ago</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        asChild
                      >
                        <Link to={`/studylists/${list.id}`}>
                          <ExternalLink className="h-4 w-4" />
                          Open
                        </Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <CreateStudylistDialog open={createOpen} onOpenChange={setCreateOpen} />
    </SidebarProvider>
  );
}
