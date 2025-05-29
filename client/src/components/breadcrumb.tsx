import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BreadcrumbItem } from "@shared/schema";

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onNavigate: (path: string) => void;
}

export function Breadcrumb({ items, onNavigate }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-2 text-sm">
      <Button
        variant="ghost"
        size="sm"
        className="text-slate-600 hover:text-slate-800 px-2"
        onClick={() => onNavigate('')}
      >
        <Home className="h-4 w-4" />
      </Button>
      
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <ChevronRight className="h-4 w-4 text-slate-400" />
          {index === items.length - 1 ? (
            <span className="text-slate-800 font-medium">{item.name}</span>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-600 hover:text-slate-800 px-2"
              onClick={() => onNavigate(item.path)}
            >
              {item.name}
            </Button>
          )}
        </div>
      ))}
    </nav>
  );
}
