import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useStudylists } from '@/hooks/useStudylists';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface CreateStudylistDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated?: (studylist: any) => void;
}

export function CreateStudylistDialog({
  open,
  onOpenChange,
  onCreated
}: CreateStudylistDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const { createStudylist } = useStudylists();

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error('Please enter a name for your studylist');
      return;
    }

    setCreating(true);
    const result = await createStudylist(name.trim(), description.trim());
    setCreating(false);

    if (result) {
      toast.success('Studylist created successfully');
      setName('');
      setDescription('');
      onOpenChange(false);
      onCreated?.(result);
    } else {
      toast.error('Failed to create studylist');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Studylist</DialogTitle>
          <DialogDescription>
            Create a collection to organize your study materials.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="e.g., Exam Prep Week 1"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="What's this studylist for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating}>
            {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
