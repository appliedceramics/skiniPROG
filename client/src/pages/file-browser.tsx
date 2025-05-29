import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { PasswordDialog } from "@/components/password-dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import gepardLogo from "@assets/gepard-192.png";
import blitzLogo from "@assets/blitz_small.png";
import { useLocation } from "wouter";
import { 
  Search, 
  Upload, 
  FolderPlus, 
  Download,
  Home, 
  Folder, 
  Settings,
  File,
  FileText,
  Menu,
  Image,
  Video,
  Music,
  Archive,
  Code,
  ChevronDown,
  Grid3x3,
  List,
  MoreHorizontal
} from "lucide-react";
import { useBrowseFiles, useBreadcrumb, useSearchFiles, useDownloadFile, useUploadFiles, useCreateFolder, useSmbShares, useConnectShare } from "@/hooks/use-smb";
import { useToast } from "@/hooks/use-toast";
import { getFileIcon, getFileIconColor, formatFileSize, formatDate } from "@/lib/file-icons";
import type { SmbShare, FileSystemItem } from "@shared/schema";

export default function FileBrowser() {
  const [selectedShare, setSelectedShare] = useState<SmbShare | null>(null);
  const [currentPath, setCurrentPath] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState<Array<{name: string, path: string, type: string}>>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [newFolderName, setNewFolderName] = useState("");
  const [virtualFolders, setVirtualFolders] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{name: string, path: string, type: string, size: number, mimeType: string, modifiedAt: Date}>>([]);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [defaultMyFilesPath, setDefaultMyFilesPath] = useState("//test");
  
  // Password protection states
  const [showAdminPasswordDialog, setShowAdminPasswordDialog] = useState(false);
  const [showManagerPasswordDialog, setShowManagerPasswordDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'upload' | 'newFolder' | 'selectAll' | 'selectFolder' | null>(null);
  const [pendingFolderSelection, setPendingFolderSelection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Password constants
  const ADMIN_PASSWORD = "Hfix4ACC";
  const MANAGER_PASSWORD = "$isak044";
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const [location, setLocation] = useLocation();
  const downloadFile = useDownloadFile();
  const uploadFiles = useUploadFiles();
  const createFolder = useCreateFolder();
  const { data: shares = [] } = useSmbShares();
  const connectShare = useConnectShare();

  // Auto-select My Files on startup
  useEffect(() => {
    if (!selectedShare) {
      setSelectedShare({
        id: 1,
        name: "My Files",
        path: "//localhost/myfiles",
        username: null,
        password: null,
        autoConnect: true,
        isConnected: true,
        createdAt: new Date()
      });
    }
  }, []);

  // Create virtual file system data with proper folder navigation
  const getAllFiles = () => {
    const allFiles = [
      // Root level files and folders
      { name: "ALGORITMOS", path: "/ALGORITMOS", type: "folder" as const, size: null, mimeType: null, modifiedAt: new Date("2024-01-15") },
      { name: "Banco departamentos", path: "/Banco departamentos", type: "folder" as const, size: null, mimeType: null, modifiedAt: new Date("2024-01-10") },
      { name: "COMUNICACIONES", path: "/COMUNICACIONES", type: "folder" as const, size: null, mimeType: null, modifiedAt: new Date("2024-01-20") },
      { name: "ETC BINGO", path: "/ETC BINGO", type: "folder" as const, size: null, mimeType: null, modifiedAt: new Date("2024-01-18") },
      { name: "CERAMICA", path: "/CERAMICA", type: "folder" as const, size: null, mimeType: null, modifiedAt: new Date("2024-01-12") },
      { name: "PRESETS SPIN", path: "/PRESETS SPIN", type: "folder" as const, size: null, mimeType: null, modifiedAt: new Date("2024-01-12") },
      { name: "HASS publicidad videos", path: "/HASS publicidad videos", type: "folder" as const, size: null, mimeType: null, modifiedAt: new Date("2024-01-12") },
      { name: "MADRE", path: "/MADRE", type: "folder" as const, size: null, mimeType: null, modifiedAt: new Date("2024-01-12") },
      { name: "METALIZACIÓN", path: "/METALIZACIÓN", type: "folder" as const, size: null, mimeType: null, modifiedAt: new Date("2024-01-12") },
      { name: "MUESTRANS BUTA EN ALTA DEF…", path: "/MUESTANS BUTA EN ALTA DEF", type: "folder" as const, size: null, mimeType: null, modifiedAt: new Date("2024-01-12") },
      { name: "Manual presentacion.xlsx", path: "/Manual presentacion.xlsx", type: "file" as const, size: 5242880, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", modifiedAt: new Date("2024-01-12") },
      
      // Files inside ALGORITMOS folder
      { name: "algoritmo1.py", path: "/ALGORITMOS/algoritmo1.py", type: "file" as const, size: 2048, mimeType: "text/x-python", modifiedAt: new Date("2024-01-10") },
      { name: "algoritmo2.py", path: "/ALGORITMOS/algoritmo2.py", type: "file" as const, size: 3072, mimeType: "text/x-python", modifiedAt: new Date("2024-01-11") },
      { name: "README.md", path: "/ALGORITMOS/README.md", type: "file" as const, size: 1024, mimeType: "text/markdown", modifiedAt: new Date("2024-01-12") },
      
      // Files inside COMUNICACIONES folder
      { name: "presentacion.pptx", path: "/COMUNICACIONES/presentacion.pptx", type: "file" as const, size: 8192000, mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", modifiedAt: new Date("2024-01-15") },
      { name: "informe.docx", path: "/COMUNICACIONES/informe.docx", type: "file" as const, size: 4096000, mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", modifiedAt: new Date("2024-01-16") },
      
      // Files inside CERAMICA folder
      { name: "ceramica_productos.pdf", path: "/CERAMICA/ceramica_productos.pdf", type: "file" as const, size: 6144000, mimeType: "application/pdf", modifiedAt: new Date("2024-01-08") },
      { name: "catalogo.jpg", path: "/CERAMICA/catalogo.jpg", type: "file" as const, size: 2048000, mimeType: "image/jpeg", modifiedAt: new Date("2024-01-09") },
      
      // Add dynamically created folders
      ...virtualFolders.map(folderName => ({
        name: folderName,
        path: `/${folderName}`,
        type: "folder" as const,
        size: null,
        mimeType: null,
        modifiedAt: new Date(),
      })),

      // Add uploaded files
      ...uploadedFiles
    ];
    return allFiles;
  };

  const virtualFiles = selectedShare ? getAllFiles().filter(file => {
    if (currentPath === "") {
      // Root level - show files that don't have a parent folder
      return !file.path.includes("/", 1) || file.path.lastIndexOf("/") === 0;
    } else {
      // Inside a folder - show files that are direct children of current path
      const pathPrefix = currentPath + "/";
      return file.path.startsWith(pathPrefix) && 
             file.path.indexOf("/", pathPrefix.length) === -1;
    }
  }) : [];

  const displayFiles = searchQuery 
    ? virtualFiles.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : virtualFiles;

  // Generate search suggestions based on current files
  useEffect(() => {
    if (searchQuery.length > 0 && selectedShare) {
      const allFiles = getAllFiles();
      const suggestions = allFiles
        .filter(file => file.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .map(file => ({ name: file.name, path: file.path, type: file.type }))
        .slice(0, 5); // Limit to 5 suggestions
      setSearchSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery, selectedShare]);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSuggestionClick = (suggestion: {name: string, path: string, type: string}) => {
    if (suggestion.type === 'folder') {
      // Navigate to folder
      setCurrentPath(suggestion.path);
      setSearchQuery("");
    } else {
      // For files, navigate to the parent folder and highlight the file
      const parentPath = suggestion.path.substring(0, suggestion.path.lastIndexOf('/'));
      setCurrentPath(parentPath);
      setSearchQuery("");
      // Select the file
      setTimeout(() => {
        setSelectedFiles(new Set([suggestion.path]));
      }, 100);
    }
    setShowSuggestions(false);
  };

  const handleSearchFocus = () => {
    if (searchSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding suggestions to allow clicking
    setTimeout(() => setShowSuggestions(false), 200);
  };

  const breadcrumbs = selectedShare ? [
    { name: selectedShare.name, path: "" },
    ...(currentPath ? currentPath.split("/").filter(Boolean).map((segment, index, array) => ({
      name: segment,
      path: "/" + array.slice(0, index + 1).join("/")
    })) : [])
  ] : [];

  const filesLoading = false;

  const handleFileSelect = (filePath: string, isSelected: boolean, fileType?: string) => {
    if (isSelected && fileType === 'folder') {
      // Store the folder path for after password confirmation
      setPendingFolderSelection(filePath);
      setPendingAction('selectFolder');
      setShowManagerPasswordDialog(true);
    } else {
      const newSelected = new Set(selectedFiles);
      if (isSelected) {
        newSelected.add(filePath);
      } else {
        newSelected.delete(filePath);
      }
      setSelectedFiles(newSelected);
    }
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      setPendingAction('selectAll');
      setShowManagerPasswordDialog(true);
    } else {
      setSelectedFiles(new Set());
    }
  };

  const handleSelectAllSuccess = () => {
    setSelectedFiles(new Set(displayFiles.map(f => f.path)));
  };

  const handleFolderOpen = (folderPath: string) => {
    console.log("Opening folder:", folderPath); // Debug log
    setCurrentPath(folderPath);
    setSelectedFiles(new Set());
    toast({
      title: "Folder Opened",
      description: `Navigated to ${folderPath}`,
    });
  };

  const handleBreadcrumbNavigate = (path: string) => {
    setCurrentPath(path);
    setSelectedFiles(new Set());
  };

  const handleDownload = async () => {
    const selectedItems = displayFiles.filter(f => selectedFiles.has(f.path));
    for (const file of selectedItems) {
      if (file.type === 'file') {
        toast({
          title: "Download Started",
          description: `Downloading ${file.name}`,
        });
        // Simulate file download
        const blob = new Blob([`This is a sample file: ${file.name}`], { type: file.mimeType || 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    }
    setSelectedFiles(new Set());
  };

  const handleUploadClick = () => {
    setPendingAction('upload');
    setShowManagerPasswordDialog(true);
  };

  const handleNewFolderClick = () => {
    setPendingAction('newFolder');
    setShowManagerPasswordDialog(true);
  };

  const handleSettingsClick = () => {
    setShowAdminPasswordDialog(true);
  };

  const handleAdminPasswordSuccess = () => {
    setLocation('/settings');
  };

  const handleManagerPasswordSuccess = () => {
    if (pendingAction === 'upload') {
      fileInputRef.current?.click();
    } else if (pendingAction === 'newFolder') {
      setShowNewFolderDialog(true);
    } else if (pendingAction === 'selectAll') {
      handleSelectAllSuccess();
    } else if (pendingAction === 'selectFolder' && pendingFolderSelection) {
      const newSelected = new Set(selectedFiles);
      newSelected.add(pendingFolderSelection);
      setSelectedFiles(newSelected);
      setPendingFolderSelection(null);
    }
    setPendingAction(null);
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && selectedShare) {
      const newFiles = Array.from(files).map(file => ({
        name: file.name,
        path: currentPath ? `${currentPath}/${file.name}` : `/${file.name}`,
        type: "file" as const,
        size: file.size,
        mimeType: file.type || "application/octet-stream",
        modifiedAt: new Date()
      }));
      
      setUploadedFiles(prev => [...prev, ...newFiles]);
      
      toast({
        title: "Upload Successful",
        description: `Uploaded ${files.length} file(s) to ${selectedShare.name}${currentPath ? `/${currentPath}` : ''}`,
      });
    }
    // Reset the input
    if (event.target) {
      event.target.value = '';
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim() || !selectedShare) return;

    // Add new folder to virtual folder list
    setVirtualFolders(prev => [...prev, newFolderName]);
    
    toast({
      title: "Folder Created",
      description: `Created folder "${newFolderName}" in ${selectedShare.name}`,
    });
    setShowNewFolderDialog(false);
    setNewFolderName("");
  };

  const selectedCount = selectedFiles.size;
  const downloadableCount = displayFiles.filter(f => selectedFiles.has(f.path) && f.type === 'file').length;

  return (
    <div className="flex h-screen bg-white">
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="bg-white shadow-md"
        >
          <Menu className="h-4 w-4" />
        </Button>
      </div>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Left Sidebar */}
      <div className={`
        w-64 bg-gray-50 border-r border-gray-200 flex flex-col
        lg:relative lg:translate-x-0
        ${mobileMenuOpen ? 'fixed inset-y-0 left-0 z-50 translate-x-0' : 'fixed inset-y-0 left-0 z-50 -translate-x-full lg:translate-x-0'}
        transition-transform duration-300 ease-in-out
      `}>
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-lg bg-white shadow-sm flex items-center justify-center">
              <img 
                src={gepardLogo} 
                alt="skiniPROG Logo" 
                className="w-13 h-13 object-contain"
              />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold">
                <span className="italic text-blue-600">skini</span>
                <span className="text-gray-800">PROG</span>
              </h1>
              <p className="text-xs text-gray-500">{t.appSubtitle}</p>
            </div>
          </div>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            <div 
              className={`flex items-center px-3 py-2 text-sm rounded cursor-pointer ${
                selectedShare?.name === "My Files" ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => {
                setSelectedShare({
                  id: 1,
                  name: "My Files",
                  path: "//localhost/myfiles",
                  username: null,
                  password: null,
                  autoConnect: true,
                  isConnected: true,
                  createdAt: new Date()
                });
                setCurrentPath("");
              }}
            >
              <Home className="h-4 w-4 mr-3" />
              {t.myFiles}
            </div>
            <div 
              className="flex items-center px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded cursor-pointer"
              onClick={handleSettingsClick}
            >
              <Settings className="h-4 w-4 mr-3" />
              {t.settings}
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-xs font-medium text-gray-500 px-3 py-2 uppercase tracking-wide">
              SMB Shares
            </h3>
            <div className="space-y-1">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className={`flex items-center px-3 py-2 text-sm rounded cursor-pointer ${
                    selectedShare?.id === share.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => share.isConnected && setSelectedShare(share)}
                >
                  <Folder className="h-4 w-4 mr-3" />
                  <span className="flex-1 truncate">{share.name}</span>
                  {!share.isConnected && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="ml-auto h-6 w-6 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        connectShare.mutate(share.id, {
                          onSuccess: () => {
                            setSelectedShare(share);
                            toast({
                              title: "Connected",
                              description: `Connected to ${share.name}`,
                            });
                          },
                          onError: (error) => {
                            toast({
                              variant: "destructive",
                              title: "Connection Failed",
                              description: error.message,
                            });
                          }
                        });
                      }}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 px-4 lg:px-6 py-4 lg:pt-4 pt-16">
          <div className="flex items-center justify-between">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 z-10" />
                <Input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  className="pl-10"
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                />
                
                {/* Auto-complete Suggestions */}
                {showSuggestions && searchSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                    {searchSuggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-b-0 flex items-center"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        <Search className="h-3 w-3 text-gray-400 mr-2" />
                        <span className="truncate">{suggestion.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 lg:space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewFolderClick}
                disabled={!selectedShare}
                className="hidden sm:flex"
              >
                <FolderPlus className="h-4 w-4 mr-2" />
                {t.newFolder}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleNewFolderClick}
                disabled={!selectedShare}
                className="sm:hidden"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                disabled={!selectedShare || uploadFiles.isPending}
                className="hidden sm:flex"
              >
                <Upload className="h-4 w-4 mr-2" />
                {uploadFiles.isPending ? t.uploading : t.upload}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleUploadClick}
                disabled={!selectedShare || uploadFiles.isPending}
                className="sm:hidden"
              >
                <Upload className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={downloadableCount === 0}
                className="relative hidden sm:flex"
              >
                <Download className="h-4 w-4 mr-2" />
                {t.download}
                {downloadableCount > 0 && (
                  <Badge variant="secondary" className="rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-[#d03233] text-[#f5f9fc]">
                    {downloadableCount}
                  </Badge>
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={downloadableCount === 0}
                className="relative sm:hidden"
              >
                <Download className="h-4 w-4" />
                {downloadableCount > 0 && (
                  <Badge variant="secondary" className="rounded-full border font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent hover:bg-secondary/80 ml-1 h-4 w-4 p-0 flex items-center justify-center text-xs bg-[#d03233] text-[#f5f9fc]">
                    {downloadableCount}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Breadcrumb */}
        {selectedShare && (
          <div className="bg-gray-50 border-b border-gray-200 px-6 py-2">
            <div className="flex items-center text-sm text-gray-600">
              <span 
                className="hover:text-blue-600 cursor-pointer"
                onClick={() => handleBreadcrumbNavigate("")}
              >
                {selectedShare.name}
              </span>
              {breadcrumbs.slice(1).map((item, index) => (
                <div key={index} className="flex items-center">
                  <span className="mx-2">/</span>
                  <span 
                    className="hover:text-blue-600 cursor-pointer"
                    onClick={() => handleBreadcrumbNavigate(item.path)}
                  >
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Selection Bar */}
        {selectedCount > 0 && (
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-blue-700">
                {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFiles(new Set())}
                className="text-blue-700 hover:text-blue-800"
              >
                Clear selection
              </Button>
            </div>
          </div>
        )}

        {/* File Content */}
        <div className="flex-1 overflow-auto bg-white">
          {selectedShare ? (
            <div className="p-6">
              {filesLoading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading files...</p>
                  </div>
                </div>
              ) : displayFiles.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">{t.noFilesFound}</h3>
                    <p className="text-gray-500">{t.noFilesDescription}</p>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Select All */}
                  <div className="flex items-center mb-4 pb-2 border-b border-gray-200">
                    <Checkbox
                      checked={selectedCount === displayFiles.length && displayFiles.length > 0}
                      onCheckedChange={handleSelectAll}
                      className="mr-3"
                    />
                    <span className="text-sm text-gray-600">
                      {t.selectAll} ({displayFiles.length} {t.items})
                    </span>
                  </div>

                  {/* File Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-6">
                    {displayFiles.map((file, index) => {
                      const Icon = getFileIcon(file.name, file.type);
                      const isSelected = selectedFiles.has(file.path);
                      
                      return (
                        <div
                          key={index}
                          className={`relative group p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            isSelected 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-transparent hover:border-gray-200 hover:bg-gray-50'
                          }`}
                          onClick={() => {
                            if (file.type === 'file') {
                              handleFileSelect(file.path, !isSelected, file.type);
                            }
                          }}
                          onDoubleClick={() => {
                            if (file.type === 'folder') {
                              handleFolderOpen(file.path);
                            } else {
                              handleFileSelect(file.path, !isSelected, file.type);
                            }
                          }}
                        >
                          {/* Selection Checkbox */}
                          <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Checkbox
                              checked={isSelected}
                              onCheckedChange={(checked) => handleFileSelect(file.path, !!checked, file.type)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>

                          {/* File Icon */}
                          <div className="flex flex-col items-center text-center">
                            <div className="w-12 h-12 lg:w-16 lg:h-16 mb-2 lg:mb-3 flex items-center justify-center">
                              {file.type === 'folder' ? (
                                <Folder className="h-12 w-12 lg:h-16 lg:w-16 text-blue-500" />
                              ) : (
                                <Icon className={`h-12 w-12 lg:h-16 lg:w-16 ${getFileIconColor(file.name, file.type)}`} />
                              )}
                            </div>
                            <p className="text-xs lg:text-sm font-medium text-gray-900 truncate w-full" title={file.name}>
                              {file.name}
                            </p>
                            {file.type === 'file' && file.size && (
                              <p className="text-xs text-gray-500 mt-1">
                                {formatFileSize(file.size)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Folder className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Select a share</h3>
                <p className="text-gray-500">Choose an SMB share from the sidebar to browse files</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* New Folder Dialog */}
      <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t.newDirectoryTitle}</DialogTitle>
            <DialogDescription>
              {t.newDirectoryDescription}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder={t.folderNamePlaceholder}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateFolder();
                  }
                }}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setNewFolderName("");
                }}
              >
                CANCEL
              </Button>
              <Button 
                type="button" 
                onClick={handleCreateFolder}
                disabled={createFolder.isPending || !newFolderName.trim()}
              >
                {createFolder.isPending ? t.creating : t.create}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
            <DialogDescription>
              Configure your file browser preferences
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="default-path" className="text-sm font-medium">
                Default "My Files" Location
              </Label>
              <Input
                id="default-path"
                type="text"
                placeholder="//test"
                value={defaultMyFilesPath}
                onChange={(e) => setDefaultMyFilesPath(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-gray-500 mt-1">
                This path will be used as the default location for "My Files" section
              </p>
            </div>
            
            <div className="flex items-center justify-end space-x-3">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setShowSettingsDialog(false);
                  setDefaultMyFilesPath("//test"); // Reset to default
                }}
              >
                CANCEL
              </Button>
              <Button 
                type="button" 
                onClick={() => {
                  toast({
                    title: "Settings Saved",
                    description: `Default My Files path set to: ${defaultMyFilesPath}`,
                  });
                  setShowSettingsDialog(false);
                }}
              >
                SAVE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Admin Password Dialog */}
      <PasswordDialog
        open={showAdminPasswordDialog}
        onClose={() => setShowAdminPasswordDialog(false)}
        onSuccess={handleAdminPasswordSuccess}
        title={t.adminAccessRequired}
        description={t.adminAccessDescription}
        correctPassword={ADMIN_PASSWORD}
      />

      {/* Manager Password Dialog */}
      <PasswordDialog
        open={showManagerPasswordDialog}
        onClose={() => {
          setShowManagerPasswordDialog(false);
          setPendingAction(null);
        }}
        onSuccess={handleManagerPasswordSuccess}
        title={t.managerAccessRequired}
        description={`${t.managerAccessRequired.toLowerCase()} ${
          pendingAction === 'upload' ? t.uploadFilesAction : 
          pendingAction === 'newFolder' ? t.createFoldersAction : 
          pendingAction === 'selectFolder' ? t.selectFoldersAction :
          t.selectAllFilesAction
        }.`}
        correctPassword={MANAGER_PASSWORD}
      />

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex-1"></div>
        <div className="text-center text-sm text-gray-600">
          Product of Motava Corporation | www.motava.com
        </div>
        <div className="flex-1 flex justify-end">
          <img src={blitzLogo} alt="Blitz" className="h-8" />
        </div>
      </footer>
    </div>
  );
}