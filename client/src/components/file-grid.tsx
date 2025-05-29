import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Grid, List, Upload, FolderPlus, Loader2 } from "lucide-react";
import { getFileIcon, getFileIconColor, formatFileSize, formatDate } from "@/lib/file-icons";
import { ContextMenu } from "./context-menu";
import type { FileSystemItem } from "@shared/schema";

interface FileGridProps {
  files: FileSystemItem[];
  loading: boolean;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  onFolderOpen: (folderPath: string) => void;
  onFileSelect: (file: FileSystemItem) => void;
  onDownload: (file: FileSystemItem) => void;
}

export function FileGrid({ 
  files, 
  loading, 
  viewMode, 
  onViewModeChange, 
  onFolderOpen, 
  onFileSelect,
  onDownload 
}: FileGridProps) {
  const [selectedFile, setSelectedFile] = useState<FileSystemItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    item: FileSystemItem | null;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    item: null
  });

  const handleDoubleClick = (item: FileSystemItem) => {
    if (item.type === 'folder') {
      onFolderOpen(item.path);
    } else {
      onFileSelect(item);
    }
  };

  const handleRightClick = (e: React.MouseEvent, item: FileSystemItem) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      position: { x: e.pageX, y: e.pageY },
      item
    });
  };

  const handleFileClick = (item: FileSystemItem) => {
    setSelectedFile(item);
    onFileSelect(item);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">Loading files...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-16">
        <FolderPlus className="h-16 w-16 text-slate-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-slate-600 mb-2">This folder is empty</h3>
        <p className="text-slate-500 mb-6">Upload files or create a new folder to get started</p>
        <Button className="bg-primary text-white hover:bg-blue-600">
          <Upload className="mr-2 h-4 w-4" />
          Upload Files
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-end mb-4 space-x-2">
        <Button
          variant={viewMode === 'grid' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('grid')}
        >
          <Grid className="h-4 w-4" />
        </Button>
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => onViewModeChange('list')}
        >
          <List className="h-4 w-4" />
        </Button>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
          {files.map((file, index) => {
            const Icon = getFileIcon(file.name, file.type);
            const iconColor = getFileIconColor(file.name, file.type);
            const isSelected = selectedFile?.path === file.path;
            
            return (
              <Card
                key={index}
                className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'border-primary bg-blue-50' : 'hover:border-slate-300'
                }`}
                onClick={() => handleFileClick(file)}
                onDoubleClick={() => handleDoubleClick(file)}
                onContextMenu={(e) => handleRightClick(e, file)}
              >
                <div className="p-4 text-center">
                  <Icon className={`h-10 w-10 mx-auto mb-2 ${iconColor}`} />
                  <p className="text-sm font-medium text-slate-800 truncate" title={file.name}>
                    {file.name}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {file.type === 'folder' ? formatDate(file.modifiedAt!) : formatFileSize(file.size)}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        <div className="space-y-1">
          {files.map((file, index) => {
            const Icon = getFileIcon(file.name, file.type);
            const iconColor = getFileIconColor(file.name, file.type);
            const isSelected = selectedFile?.path === file.path;
            
            return (
              <div
                key={index}
                className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50 border border-primary' : 'hover:bg-slate-50'
                }`}
                onClick={() => handleFileClick(file)}
                onDoubleClick={() => handleDoubleClick(file)}
                onContextMenu={(e) => handleRightClick(e, file)}
              >
                <Icon className={`h-6 w-6 mr-3 flex-shrink-0 ${iconColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 truncate">{file.name}</p>
                </div>
                <div className="flex items-center space-x-4 text-xs text-slate-500">
                  {file.type === 'file' && (
                    <span className="w-20 text-right">{formatFileSize(file.size)}</span>
                  )}
                  <span className="w-24 text-right">{formatDate(file.modifiedAt!)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        selectedItem={contextMenu.item}
        onClose={() => setContextMenu(prev => ({ ...prev, isOpen: false }))}
        onDownload={onDownload}
      />
    </>
  );
}
