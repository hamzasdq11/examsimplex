import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { useLibrary } from '@/hooks/useLibrary';
import { SEO } from '@/components/SEO';
import {
  BookOpen,
  GraduationCap,
  FileText,
  Trash2,
  ExternalLink,
  Library as LibraryIcon,
  Loader2,
  Search,
  SortAsc,
} from 'lucide-react';
import { toast } from 'sonner';

type SortOption = 'recent' | 'alphabetical' | 'type';

export default function Library() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { libraryItems, loading, removeFromLibrary } = useLibrary();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  const filteredAndSortedItems = useMemo(() => {
    let items = [...libraryItems];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      items = items.filter(item => 
        (item.name?.toLowerCase().includes(query)) ||
        (item.code?.toLowerCase().includes(query)) ||
        item.item_type.toLowerCase().includes(query)
      );
    }

    // Sort items
    switch (sortBy) {
      case 'alphabetical':
        items.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        break;
      case 'type':
        items.sort((a, b) => a.item_type.localeCompare(b.item_type));
        break;
      case 'recent':
      default:
        // Already sorted by created_at desc from the hook
        break;
    }

    return items;
  }, [libraryItems, searchQuery, sortBy]);

  const courseItems = filteredAndSortedItems.filter(item => item.item_type === 'course');
  const subjectItems = filteredAndSortedItems.filter(item => item.item_type === 'subject');
  const noteItems = filteredAndSortedItems.filter(item => item.item_type === 'note');

  const handleRemove = async (item: typeof libraryItems[0]) => {
    setRemovingId(item.id);
    const success = await removeFromLibrary(item.item_type, item.item_id);
    if (success) {
      toast.success('Removed from library');
    } else {
      toast.error('Failed to remove');
    }
    setRemovingId(null);
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
            <LibraryIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <CardTitle>Sign in to access your library</CardTitle>
            <CardDescription>
              Save courses, subjects, and notes to access them anytime.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button onClick={() => navigate('/auth')}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const renderItems = (items: typeof libraryItems, emptyMessage: string) => {
    if (loading) {
      return (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <LibraryIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <Card key={item.id} className="group hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {item.item_type === 'course' && <GraduationCap className="h-4 w-4 text-primary" />}
                  {item.item_type === 'subject' && <BookOpen className="h-4 w-4 text-primary" />}
                  {item.item_type === 'note' && <FileText className="h-4 w-4 text-primary" />}
                  <CardTitle className="text-base line-clamp-1">
                    {item.name || item.code || 'Unknown'}
                  </CardTitle>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemove(item)}
                  disabled={removingId === item.id}
                >
                  {removingId === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-destructive" />
                  )}
                </Button>
              </div>
              {item.code && item.name && (
                <CardDescription className="text-xs">{item.code}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2"
                asChild
              >
                <Link to={item.url || '#'}>
                  <ExternalLink className="h-4 w-4" />
                  Open
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <SidebarProvider>
      <SEO
        title="My Library | EXAM Simplex"
        description="Access your saved courses, subjects, and notes."
      />
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
            <div className="flex items-center gap-4 p-4">
              <SidebarTrigger />
              <h1 className="text-xl font-semibold">My Library</h1>
            </div>
          </header>
          
          <div className="p-6">
            {/* Search and Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, code, or type..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SortAsc className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Recently Added</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="type">By Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-6">
                <TabsTrigger value="all">
                  All ({filteredAndSortedItems.length})
                </TabsTrigger>
                <TabsTrigger value="courses">
                  Courses ({courseItems.length})
                </TabsTrigger>
                <TabsTrigger value="subjects">
                  Subjects ({subjectItems.length})
                </TabsTrigger>
                <TabsTrigger value="notes">
                  Notes ({noteItems.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {renderItems(filteredAndSortedItems, searchQuery ? 'No items match your search.' : 'Your library is empty. Browse universities to save items.')}
              </TabsContent>
              <TabsContent value="courses">
                {renderItems(courseItems, searchQuery ? 'No courses match your search.' : 'No courses saved yet.')}
              </TabsContent>
              <TabsContent value="subjects">
                {renderItems(subjectItems, searchQuery ? 'No subjects match your search.' : 'No subjects saved yet.')}
              </TabsContent>
              <TabsContent value="notes">
                {renderItems(noteItems, searchQuery ? 'No notes match your search.' : 'No notes saved yet.')}
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
