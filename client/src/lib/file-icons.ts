import { 
  FileText, 
  File, 
  Folder, 
  Image, 
  Video, 
  Music, 
  Archive, 
  FileCode, 
  FileSpreadsheet,
  Presentation
} from 'lucide-react';

export function getFileIcon(fileName: string, type: 'file' | 'folder' = 'file') {
  if (type === 'folder') {
    return Folder;
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    // Documents
    case 'pdf':
      return FileText;
    case 'doc':
    case 'docx':
    case 'txt':
    case 'rtf':
      return FileText;
    
    // Spreadsheets
    case 'xls':
    case 'xlsx':
    case 'csv':
      return FileSpreadsheet;
    
    // Presentations
    case 'ppt':
    case 'pptx':
      return Presentation;
    
    // Images
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
    case 'webp':
    case 'ico':
      return Image;
    
    // Videos
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'webm':
    case 'mkv':
      return Video;
    
    // Audio
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
    case 'wma':
      return Music;
    
    // Archives
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
    case 'bz2':
      return Archive;
    
    // Code files
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
    case 'scss':
    case 'json':
    case 'xml':
    case 'php':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'h':
    case 'cs':
    case 'rb':
    case 'go':
    case 'rs':
    case 'sh':
    case 'bat':
      return FileCode;
    
    default:
      return File;
  }
}

export function getFileIconColor(fileName: string, type: 'file' | 'folder' = 'file'): string {
  if (type === 'folder') {
    return 'text-blue-500';
  }

  const extension = fileName.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'text-red-500';
    case 'doc':
    case 'docx':
      return 'text-blue-600';
    case 'xls':
    case 'xlsx':
      return 'text-green-600';
    case 'ppt':
    case 'pptx':
      return 'text-orange-600';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
    case 'bmp':
    case 'svg':
    case 'webp':
      return 'text-green-500';
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
      return 'text-indigo-500';
    case 'mp3':
    case 'wav':
    case 'flac':
      return 'text-purple-500';
    case 'zip':
    case 'rar':
    case '7z':
      return 'text-orange-500';
    case 'js':
    case 'ts':
    case 'jsx':
    case 'tsx':
    case 'html':
    case 'css':
    case 'json':
      return 'text-purple-500';
    case 'txt':
      return 'text-slate-500';
    default:
      return 'text-slate-500';
  }
}

export function formatFileSize(bytes?: number): string {
  if (!bytes) return '';
  
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours === 0) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      return diffMinutes <= 1 ? 'Just now' : `${diffMinutes} minutes ago`;
    }
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  } else if (diffDays === 1) {
    return '1 day ago';
  } else if (diffDays < 7) {
    return `${diffDays} days ago`;
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7);
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  } else {
    return d.toLocaleDateString();
  }
}
