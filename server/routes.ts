import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertSmbShareSchema, type FileSystemItem, type BreadcrumbItem, type ConnectionStatus } from "@shared/schema";
import { z } from "zod";
import SMB2 from 'smb2';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { Readable } from 'stream';

// SMB connection pool
const smbConnections = new Map<number, any>();

// Helper function to get file extension
function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

// Helper function to determine MIME type
function getMimeType(filename: string): string {
  const ext = getFileExtension(filename);
  const mimeTypes: Record<string, string> = {
    '.pdf': 'application/pdf',
    '.txt': 'text/plain',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.wmv': 'video/x-ms-wmv',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.zip': 'application/zip',
    '.rar': 'application/vnd.rar',
    '.7z': 'application/x-7z-compressed',
    '.js': 'text/javascript',
    '.ts': 'text/typescript',
    '.html': 'text/html',
    '.css': 'text/css',
    '.json': 'application/json',
    '.xml': 'application/xml',
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

// Mock SMB data for testing
const mockSmbData = new Map<string, any[]>();

// Initialize with some sample files and folders
mockSmbData.set('', [
  {
    Filename: 'Documents',
    FileAttributes: 0x10, // Directory
    EndOfFile: 0,
    LastWriteTime: new Date('2024-01-15')
  },
  {
    Filename: 'Images',
    FileAttributes: 0x10, // Directory
    EndOfFile: 0,
    LastWriteTime: new Date('2024-01-10')
  },
  {
    Filename: 'report.pdf',
    FileAttributes: 0x20, // Archive (file)
    EndOfFile: 2048576, // 2MB
    LastWriteTime: new Date('2024-01-20')
  },
  {
    Filename: 'data.xlsx',
    FileAttributes: 0x20,
    EndOfFile: 512000, // 500KB
    LastWriteTime: new Date('2024-01-18')
  }
]);

mockSmbData.set('Documents', [
  {
    Filename: 'contracts',
    FileAttributes: 0x10,
    EndOfFile: 0,
    LastWriteTime: new Date('2024-01-14')
  },
  {
    Filename: 'meeting_notes.docx',
    FileAttributes: 0x20,
    EndOfFile: 128000, // 125KB
    LastWriteTime: new Date('2024-01-16')
  },
  {
    Filename: 'presentation.pptx',
    FileAttributes: 0x20,
    EndOfFile: 3145728, // 3MB
    LastWriteTime: new Date('2024-01-12')
  }
]);

mockSmbData.set('Documents/contracts', [
  {
    Filename: 'contract_2024.pdf',
    FileAttributes: 0x20,
    EndOfFile: 1572864, // 1.5MB
    LastWriteTime: new Date('2024-01-14')
  },
  {
    Filename: 'vendor_agreement.pdf',
    FileAttributes: 0x20,
    EndOfFile: 2097152, // 2MB
    LastWriteTime: new Date('2024-01-13')
  }
]);

mockSmbData.set('Images', [
  {
    Filename: 'logo.png',
    FileAttributes: 0x20,
    EndOfFile: 204800, // 200KB
    LastWriteTime: new Date('2024-01-08')
  },
  {
    Filename: 'banner.jpg',
    FileAttributes: 0x20,
    EndOfFile: 1024000, // 1MB
    LastWriteTime: new Date('2024-01-09')
  },
  {
    Filename: 'screenshots',
    FileAttributes: 0x10,
    EndOfFile: 0,
    LastWriteTime: new Date('2024-01-07')
  }
]);

// Helper function to create SMB connection (now returns mock client)
function createSmbConnection(share: any): Promise<any> {
  return new Promise((resolve, reject) => {
    // Simulate connection validation
    if (!share.path || share.path === '//invalid/path') {
      reject(new Error('Invalid SMB share path'));
      return;
    }

    // Create mock SMB client with upload/download capabilities
    const mockClient = {
      readdir: (folderPath: string, callback: (err: any, files?: any[]) => void) => {
        // Simulate slight delay for realism
        setTimeout(() => {
          const files = mockSmbData.get(folderPath) || [];
          callback(null, files);
        }, 100);
      },
      createReadStream: (filePath: string) => {
        // Return a mock readable stream for file downloads
        const mockData = Buffer.from(`Mock content for file: ${filePath}\n\nThis is simulated file content from the virtual SMB share.\nFile path: ${filePath}\nGenerated at: ${new Date().toISOString()}`);
        return Readable.from([mockData]);
      },
      writeFile: (filePath: string, data: Buffer, callback: (err?: any) => void) => {
        // Simulate file upload to virtual SMB
        setTimeout(() => {
          const folderPath = path.dirname(filePath).replace(/\\/g, '/');
          const fileName = path.basename(filePath);
          
          // Add new file to mock data
          const currentFiles = mockSmbData.get(folderPath === '.' ? '' : folderPath) || [];
          const newFile = {
            Filename: fileName,
            FileAttributes: 0x20, // Archive (file)
            EndOfFile: data.length,
            LastWriteTime: new Date()
          };
          
          // Remove existing file with same name if it exists
          const filteredFiles = currentFiles.filter(f => f.Filename !== fileName);
          filteredFiles.push(newFile);
          
          mockSmbData.set(folderPath === '.' ? '' : folderPath, filteredFiles);
          callback(null);
        }, 200);
      },
      createFolder: (folderPath: string, callback: (err?: any) => void) => {
        // Simulate folder creation
        setTimeout(() => {
          const parentPath = path.dirname(folderPath).replace(/\\/g, '/');
          const folderName = path.basename(folderPath);
          
          const currentFiles = mockSmbData.get(parentPath === '.' ? '' : parentPath) || [];
          const newFolder = {
            Filename: folderName,
            FileAttributes: 0x10, // Directory
            EndOfFile: 0,
            LastWriteTime: new Date()
          };
          
          // Check if folder already exists
          if (!currentFiles.some(f => f.Filename === folderName)) {
            currentFiles.push(newFolder);
            mockSmbData.set(parentPath === '.' ? '' : parentPath, currentFiles);
            
            // Initialize empty folder
            mockSmbData.set(folderPath, []);
          }
          
          callback(null);
        }, 150);
      }
    };

    // Simulate connection success after brief delay
    setTimeout(() => {
      resolve(mockClient);
    }, 200);
  });
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all SMB shares
  app.get("/api/smb-shares", async (req, res) => {
    try {
      const shares = await storage.getSmbShares();
      res.json(shares);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch SMB shares" });
    }
  });

  // Create new SMB share
  app.post("/api/smb-shares", async (req, res) => {
    try {
      const validatedData = insertSmbShareSchema.parse(req.body);
      const share = await storage.createSmbShare(validatedData);
      res.json(share);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid share data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create SMB share" });
      }
    }
  });

  // Connect to SMB share
  app.post("/api/smb-shares/:id/connect", async (req, res) => {
    try {
      const shareId = parseInt(req.params.id);
      const share = await storage.getSmbShare(shareId);
      
      if (!share) {
        return res.status(404).json({ message: "SMB share not found" });
      }

      // Try to create connection
      const smbClient = await createSmbConnection(share);
      smbConnections.set(shareId, smbClient);
      
      // Update share status
      await storage.updateSmbShare(shareId, { isConnected: true });
      
      const connectionStatus: ConnectionStatus = {
        shareId,
        isConnected: true
      };
      
      res.json(connectionStatus);
    } catch (error) {
      const connectionStatus: ConnectionStatus = {
        shareId: parseInt(req.params.id),
        isConnected: false,
        error: error instanceof Error ? error.message : "Unknown connection error"
      };
      
      res.status(500).json(connectionStatus);
    }
  });

  // Disconnect from SMB share
  app.post("/api/smb-shares/:id/disconnect", async (req, res) => {
    try {
      const shareId = parseInt(req.params.id);
      
      // Close connection if exists
      if (smbConnections.has(shareId)) {
        const client = smbConnections.get(shareId);
        // SMB2 doesn't have explicit close, just remove from pool
        smbConnections.delete(shareId);
      }
      
      // Update share status
      await storage.updateSmbShare(shareId, { isConnected: false });
      
      const connectionStatus: ConnectionStatus = {
        shareId,
        isConnected: false
      };
      
      res.json(connectionStatus);
    } catch (error) {
      res.status(500).json({ message: "Failed to disconnect from SMB share" });
    }
  });

  // Delete SMB share
  app.delete("/api/smb-shares/:id", async (req, res) => {
    try {
      const shareId = parseInt(req.params.id);
      
      // Disconnect first
      if (smbConnections.has(shareId)) {
        smbConnections.delete(shareId);
      }
      
      const deleted = await storage.deleteSmbShare(shareId);
      if (!deleted) {
        return res.status(404).json({ message: "SMB share not found" });
      }
      
      res.json({ message: "SMB share deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete SMB share" });
    }
  });

  // Browse files in SMB share
  app.get("/api/smb-shares/:id/browse", async (req, res) => {
    try {
      const shareId = parseInt(req.params.id);
      const folderPath = (req.query.path as string) || '';
      
      const smbClient = smbConnections.get(shareId);
      if (!smbClient) {
        return res.status(400).json({ message: "SMB share not connected" });
      }

      // List files using SMB client
      smbClient.readdir(folderPath, (err: any, files: any[]) => {
        if (err) {
          return res.status(500).json({ message: `Failed to browse folder: ${err.message}` });
        }

        const fileSystemItems: FileSystemItem[] = files.map(file => ({
          name: file.Filename,
          path: path.posix.join(folderPath, file.Filename),
          type: file.FileAttributes & 0x10 ? 'folder' : 'file', // Directory attribute check
          size: file.FileAttributes & 0x10 ? undefined : file.EndOfFile,
          mimeType: file.FileAttributes & 0x10 ? undefined : getMimeType(file.Filename),
          modifiedAt: new Date(file.LastWriteTime)
        }));

        res.json(fileSystemItems);
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to browse SMB share" });
    }
  });

  // Download file from SMB share
  app.get("/api/smb-shares/:id/download", async (req, res) => {
    try {
      const shareId = parseInt(req.params.id);
      const filePath = req.query.path as string;
      
      if (!filePath) {
        return res.status(400).json({ message: "File path is required" });
      }

      const smbClient = smbConnections.get(shareId);
      if (!smbClient) {
        return res.status(400).json({ message: "SMB share not connected" });
      }

      const fileName = path.basename(filePath);
      
      // Set headers for file download
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      res.setHeader('Content-Type', getMimeType(fileName));

      // Create read stream from SMB
      const readStream = smbClient.createReadStream(filePath);
      
      readStream.on('error', (err: any) => {
        res.status(500).json({ message: `Failed to download file: ${err.message}` });
      });

      readStream.pipe(res);
    } catch (error) {
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  // Search files in SMB share
  app.get("/api/smb-shares/:id/search", async (req, res) => {
    try {
      const shareId = parseInt(req.params.id);
      const query = req.query.q as string;
      const folderPath = (req.query.path as string) || '';
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }

      const smbClient = smbConnections.get(shareId);
      if (!smbClient) {
        return res.status(400).json({ message: "SMB share not connected" });
      }

      // Simple search implementation - in real world, you'd want recursive search
      smbClient.readdir(folderPath, (err: any, files: any[]) => {
        if (err) {
          return res.status(500).json({ message: `Failed to search: ${err.message}` });
        }

        const filteredFiles = files.filter(file => 
          file.Filename.toLowerCase().includes(query.toLowerCase())
        );

        const fileSystemItems: FileSystemItem[] = filteredFiles.map(file => ({
          name: file.Filename,
          path: path.posix.join(folderPath, file.Filename),
          type: file.FileAttributes & 0x10 ? 'folder' : 'file',
          size: file.FileAttributes & 0x10 ? undefined : file.EndOfFile,
          mimeType: file.FileAttributes & 0x10 ? undefined : getMimeType(file.Filename),
          modifiedAt: new Date(file.LastWriteTime)
        }));

        res.json(fileSystemItems);
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to search files" });
    }
  });

  // Upload files to SMB share
  app.post("/api/smb-shares/:id/upload", upload.array('files'), async (req, res) => {
    try {
      const shareId = parseInt(req.params.id);
      const folderPath = (req.query.path as string) || '';
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files provided" });
      }

      const smbClient = smbConnections.get(shareId);
      if (!smbClient) {
        return res.status(400).json({ message: "SMB share not connected" });
      }

      const uploadResults = [];
      
      for (const file of files) {
        const filePath = path.posix.join(folderPath, file.originalname);
        
        await new Promise<void>((resolve, reject) => {
          smbClient.writeFile(filePath, file.buffer, (err: any) => {
            if (err) {
              reject(new Error(`Failed to upload ${file.originalname}: ${err.message}`));
            } else {
              resolve();
            }
          });
        });
        
        uploadResults.push({
          filename: file.originalname,
          size: file.size,
          path: filePath
        });
      }

      res.json({ 
        message: `Successfully uploaded ${files.length} file(s)`,
        files: uploadResults
      });
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to upload files" 
      });
    }
  });

  // Create new folder in SMB share
  app.post("/api/smb-shares/:id/folder", async (req, res) => {
    try {
      const shareId = parseInt(req.params.id);
      const { name, path: currentPath } = req.body;
      
      if (!name || !name.trim()) {
        return res.status(400).json({ message: "Folder name is required" });
      }

      const smbClient = smbConnections.get(shareId);
      if (!smbClient) {
        return res.status(400).json({ message: "SMB share not connected" });
      }

      const folderPath = path.posix.join(currentPath || '', name.trim());
      
      await new Promise<void>((resolve, reject) => {
        smbClient.createFolder(folderPath, (err: any) => {
          if (err) {
            reject(new Error(`Failed to create folder: ${err.message}`));
          } else {
            resolve();
          }
        });
      });

      res.json({ 
        message: `Folder "${name}" created successfully`,
        path: folderPath
      });
    } catch (error) {
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to create folder" 
      });
    }
  });

  // Get breadcrumb navigation
  app.get("/api/smb-shares/:id/breadcrumb", async (req, res) => {
    try {
      const shareId = parseInt(req.params.id);
      const currentPath = (req.query.path as string) || '';
      
      const share = await storage.getSmbShare(shareId);
      if (!share) {
        return res.status(404).json({ message: "SMB share not found" });
      }

      const breadcrumbs: BreadcrumbItem[] = [
        { name: share.name, path: '' }
      ];

      if (currentPath) {
        const pathParts = currentPath.split('/').filter(part => part.length > 0);
        let accumulatedPath = '';
        
        pathParts.forEach(part => {
          accumulatedPath = accumulatedPath ? `${accumulatedPath}/${part}` : part;
          breadcrumbs.push({
            name: part,
            path: accumulatedPath
          });
        });
      }

      res.json(breadcrumbs);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate breadcrumb" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
