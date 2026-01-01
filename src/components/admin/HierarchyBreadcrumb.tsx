import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface HierarchyBreadcrumbProps {
  items: BreadcrumbItem[];
  onHomeClick: () => void;
}

export function HierarchyBreadcrumb({ items, onHomeClick }: HierarchyBreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <Breadcrumb className="mb-6">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink 
            onClick={onHomeClick} 
            className="cursor-pointer flex items-center gap-1 hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span>All</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {items.map((item, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              {index === items.length - 1 ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink 
                  onClick={item.onClick} 
                  className="cursor-pointer hover:text-foreground"
                >
                  {item.label}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </div>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
