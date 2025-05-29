import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Eye, Download, Edit, Copy, Scissors, Trash2 } from "lucide-react";
import type { FileSystemItem } from "@shared/schema";

interface ContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  selectedItem: FileSystemItem | null;
  onClose: () => void;
  onDownload: (item: FileSystemItem) => void;
}

export function ContextMenu({ isOpen, position, selectedItem, onClose, onDownload }: ContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose]);

  if (!isOpen || !selectedItem) return null;

  const handleAction = (action: string) => {
    switch (action) {
      case 'download':
        if (selectedItem.type === 'file') {
          onDownload(selectedItem);
        }
        break;
      case 'open':
        // For folders, this would navigate into them
        console.log('Open:', selectedItem.name);
        break;
      case 'rename':
        console.log('Rename:', selectedItem.name);
        break;
      case 'copy':
        console.log('Copy:', selectedItem.name);
        break;
      case 'cut':
        console.log('Cut:', selectedItem.name);
        break;
      case 'delete':
        console.log('Delete:', selectedItem.name);
        break;
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="fixed bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50"
      style={{
        left: position.x,
        top: position.y,
        minWidth: '160px'
      }}
    >
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        onClick={() => handleAction('open')}
      >
        <Eye className="mr-3 h-4 w-4" />
        Open
      </Button>
      
      {selectedItem.type === 'file' && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
          onClick={() => handleAction('download')}
        >
          <Download className="mr-3 h-4 w-4" />
          Download
        </Button>
      )}
      
      <div className="border-t border-slate-200 my-1" />
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        onClick={() => handleAction('rename')}
      >
        <Edit className="mr-3 h-4 w-4" />
        Rename
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        onClick={() => handleAction('copy')}
      >
        <Copy className="mr-3 h-4 w-4" />
        Copy
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
        onClick={() => handleAction('cut')}
      >
        <Scissors className="mr-3 h-4 w-4" />
        Cut
      </Button>
      
      <div className="border-t border-slate-200 my-1" />
      
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start px-4 py-2 text-sm text-red-600 hover:bg-red-50"
        onClick={() => handleAction('delete')}
      >
        <Trash2 className="mr-3 h-4 w-4" />
        Delete
      </Button>
    </div>
  );
}
