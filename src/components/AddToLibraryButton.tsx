import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useLibrary } from '@/hooks/useLibrary';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Bookmark, BookmarkCheck, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddToLibraryButtonProps {
  itemType: 'course' | 'subject' | 'note';
  itemId: string;
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showText?: boolean;
}

export function AddToLibraryButton({
  itemType,
  itemId,
  variant = 'outline',
  size = 'sm',
  showText = true
}: AddToLibraryButtonProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { isInLibrary, addToLibrary, removeFromLibrary } = useLibrary();
  const [loading, setLoading] = useState(false);

  const inLibrary = isInLibrary(itemType, itemId);

  const handleClick = async () => {
    if (!user) {
      toast.error('Please sign in to save items to your library');
      navigate('/auth');
      return;
    }

    setLoading(true);
    
    if (inLibrary) {
      const success = await removeFromLibrary(itemType, itemId);
      if (success) {
        toast.success('Removed from library');
      }
    } else {
      const success = await addToLibrary(itemType, itemId);
      if (success) {
        toast.success('Added to library');
      }
    }
    
    setLoading(false);
  };

  if (loading) {
    return (
      <Button variant={variant} size={size} disabled>
        <Loader2 className="h-4 w-4 animate-spin" />
        {showText && <span className="ml-2">Saving...</span>}
      </Button>
    );
  }

  return (
    <Button
      variant={inLibrary ? 'secondary' : variant}
      size={size}
      onClick={handleClick}
    >
      {inLibrary ? (
        <BookmarkCheck className="h-4 w-4" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )}
      {showText && (
        <span className="ml-2">{inLibrary ? 'Saved' : 'Save'}</span>
      )}
    </Button>
  );
}
