import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useStudylists } from '@/hooks/useStudylists';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { ListPlus, Check, Plus, Loader2, FolderPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddToStudylistButtonProps {
  itemType: 'subject' | 'note' | 'question';
  itemId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function AddToStudylistButton({
  itemType,
  itemId,
  variant = 'outline',
  size = 'sm',
  showText = true
}: AddToStudylistButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { studylists, addItemToStudylist, createStudylist, loading: listsLoading } = useStudylists();
  const [addingTo, setAddingTo] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDescription, setNewListDescription] = useState('');
  const [creating, setCreating] = useState(false);

  const handleAddToList = async (studylistId: string) => {
    setAddingTo(studylistId);
    const success = await addItemToStudylist(studylistId, itemType, itemId);
    if (success) {
      toast.success('Added to studylist');
    } else {
      toast.error('Failed to add');
    }
    setAddingTo(null);
  };

  const handleCreateAndAdd = async () => {
    if (!newListName.trim()) {
      toast.error('Name is required');
      return;
    }

    setCreating(true);
    const newList = await createStudylist(newListName.trim(), newListDescription.trim() || undefined);
    
    if (newList) {
      const success = await addItemToStudylist(newList.id, itemType, itemId);
      if (success) {
        toast.success(`Created "${newListName}" and added item`);
      } else {
        toast.success(`Created "${newListName}" but failed to add item`);
      }
      setShowCreateDialog(false);
      setNewListName('');
      setNewListDescription('');
    } else {
      toast.error('Failed to create studylist');
    }
    setCreating(false);
  };

  if (!user) {
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => {
          toast.error('Please sign in to use studylists');
          navigate('/auth');
        }}
      >
        <ListPlus className="h-4 w-4" />
        {showText && <span className="ml-2">Add to List</span>}
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={variant} size={size}>
            <ListPlus className="h-4 w-4" />
            {showText && <span className="ml-2">Add to List</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {listsLoading ? (
            <DropdownMenuItem disabled>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </DropdownMenuItem>
          ) : studylists.length === 0 ? (
            <DropdownMenuItem disabled className="text-muted-foreground">
              No studylists yet
            </DropdownMenuItem>
          ) : (
            studylists.map((list) => (
              <DropdownMenuItem
                key={list.id}
                onClick={() => handleAddToList(list.id)}
                disabled={addingTo === list.id}
              >
                {addingTo === list.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Check className="h-4 w-4 mr-2 opacity-0" />
                )}
                <span className="truncate">{list.name}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {list.item_count || 0}
                </span>
              </DropdownMenuItem>
            ))
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create new studylist
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderPlus className="h-5 w-5" />
              Create New Studylist
            </DialogTitle>
            <DialogDescription>
              Create a new studylist and add this item to it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name *
              </label>
              <Input
                id="name"
                placeholder="e.g., DBMS Final Prep"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description (optional)
              </label>
              <Textarea
                id="description"
                placeholder="What's this studylist for?"
                value={newListDescription}
                onChange={(e) => setNewListDescription(e.target.value)}
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateAndAdd} disabled={creating || !newListName.trim()}>
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create & Add'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
