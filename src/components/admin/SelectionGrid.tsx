import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export interface SelectionItem {
  id: string;
  title: string;
  subtitle?: string;
  metadata?: string;
  badge?: string;
}

interface SelectionGridProps {
  items: SelectionItem[];
  onSelect: (item: SelectionItem) => void;
  loading?: boolean;
  emptyMessage?: string;
  columns?: 2 | 3 | 4;
}

export function SelectionGrid({ 
  items, 
  onSelect, 
  loading = false, 
  emptyMessage = 'No items found',
  columns = 3
}: SelectionGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4`}>
      {items.map((item) => (
        <Card
          key={item.id}
          className="cursor-pointer transition-all hover:shadow-md hover:border-primary/50 hover:bg-accent/50"
          onClick={() => onSelect(item)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                {item.subtitle && (
                  <p className="text-sm text-muted-foreground truncate mt-1">{item.subtitle}</p>
                )}
                {item.metadata && (
                  <p className="text-xs text-muted-foreground mt-2">{item.metadata}</p>
                )}
              </div>
              {item.badge && (
                <span className="shrink-0 inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                  {item.badge}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
