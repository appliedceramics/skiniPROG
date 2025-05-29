import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { SmbShare, FileSystemItem, BreadcrumbItem, ConnectionStatus } from "@shared/schema";

export function useSmbShares() {
  return useQuery<SmbShare[]>({
    queryKey: ["/api/smb-shares"],
  });
}

export function useConnectShare() {
  const queryClient = useQueryClient();
  
  return useMutation<ConnectionStatus, Error, number>({
    mutationFn: async (shareId: number) => {
      const response = await apiRequest("POST", `/api/smb-shares/${shareId}/connect`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smb-shares"] });
    },
  });
}

export function useDisconnectShare() {
  const queryClient = useQueryClient();
  
  return useMutation<ConnectionStatus, Error, number>({
    mutationFn: async (shareId: number) => {
      const response = await apiRequest("POST", `/api/smb-shares/${shareId}/disconnect`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smb-shares"] });
    },
  });
}

export function useCreateShare() {
  const queryClient = useQueryClient();
  
  return useMutation<SmbShare, Error, { name: string; path: string; username?: string; password?: string; autoConnect?: boolean }>({
    mutationFn: async (shareData) => {
      const response = await apiRequest("POST", "/api/smb-shares", shareData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smb-shares"] });
    },
  });
}

export function useDeleteShare() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, number>({
    mutationFn: async (shareId: number) => {
      await apiRequest("DELETE", `/api/smb-shares/${shareId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/smb-shares"] });
    },
  });
}

export function useBrowseFiles(shareId: number, path: string) {
  return useQuery<FileSystemItem[]>({
    queryKey: ["/api/smb-shares", shareId, "browse", path],
    queryFn: async () => {
      const response = await fetch(`/api/smb-shares/${shareId}/browse?path=${encodeURIComponent(path)}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to browse files");
      }
      return response.json();
    },
    enabled: shareId > 0,
  });
}

export function useSearchFiles(shareId: number, query: string, path: string) {
  return useQuery<FileSystemItem[]>({
    queryKey: ["/api/smb-shares", shareId, "search", query, path],
    queryFn: async () => {
      const response = await fetch(`/api/smb-shares/${shareId}/search?q=${encodeURIComponent(query)}&path=${encodeURIComponent(path)}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to search files");
      }
      return response.json();
    },
    enabled: shareId > 0 && query.length > 0,
  });
}

export function useBreadcrumb(shareId: number, path: string) {
  return useQuery<BreadcrumbItem[]>({
    queryKey: ["/api/smb-shares", shareId, "breadcrumb", path],
    queryFn: async () => {
      const response = await fetch(`/api/smb-shares/${shareId}/breadcrumb?path=${encodeURIComponent(path)}`, {
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to get breadcrumb");
      }
      return response.json();
    },
    enabled: shareId > 0,
  });
}

export function useDownloadFile() {
  return useMutation<void, Error, { shareId: number; path: string }>({
    mutationFn: async ({ shareId, path }) => {
      const response = await fetch(`/api/smb-shares/${shareId}/download?path=${encodeURIComponent(path)}`, {
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to download file");
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const filename = path.split('/').pop() || 'download';
      
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    },
  });
}

export function useUploadFiles() {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { shareId: number; files: FileList; path: string }>({
    mutationFn: async ({ shareId, files, path }) => {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      const response = await fetch(`/api/smb-shares/${shareId}/upload?path=${encodeURIComponent(path)}`, {
        method: 'POST',
        body: formData,
        credentials: "include",
      });
      
      if (!response.ok) {
        throw new Error("Failed to upload files");
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate the file list for the current path
      queryClient.invalidateQueries({ 
        queryKey: ["/api/smb-shares", variables.shareId, "browse", variables.path] 
      });
    },
  });
}

export function useCreateFolder() {
  const queryClient = useQueryClient();
  
  return useMutation<any, Error, { shareId: number; name: string; path: string }>({
    mutationFn: async ({ shareId, name, path }) => {
      const response = await apiRequest("POST", `/api/smb-shares/${shareId}/folder`, {
        name,
        path
      });
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate the file list for the current path
      queryClient.invalidateQueries({ 
        queryKey: ["/api/smb-shares", variables.shareId, "browse", variables.path] 
      });
    },
  });
}
