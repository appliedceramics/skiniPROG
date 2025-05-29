import { smbShares, fileItems, type SmbShare, type FileItem, type InsertSmbShare, type InsertFileItem } from "@shared/schema";
import { db } from "./db";
import { eq, and, like } from "drizzle-orm";

export interface IStorage {
  // SMB Share operations
  getSmbShares(): Promise<SmbShare[]>;
  getSmbShare(id: number): Promise<SmbShare | undefined>;
  createSmbShare(share: InsertSmbShare): Promise<SmbShare>;
  updateSmbShare(id: number, updates: Partial<SmbShare>): Promise<SmbShare | undefined>;
  deleteSmbShare(id: number): Promise<boolean>;
  
  // File operations
  getFileItems(shareId: number, path: string): Promise<FileItem[]>;
  createFileItem(item: InsertFileItem): Promise<FileItem>;
  deleteFileItem(id: number): Promise<boolean>;
  clearFileItems(shareId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeTestData();
  }

  private async initializeTestData() {
    try {
      // Check if test share exists
      const existingShare = await db.select().from(smbShares).where(eq(smbShares.name, "Test Server")).limit(1);
      
      if (existingShare.length === 0) {
        // Create Test Server
        const [testShare] = await db
          .insert(smbShares)
          .values({
            name: "Test Server",
            path: "//test.server/share",
            username: null,
            password: null,
            autoConnect: true,
            isConnected: true,
          })
          .returning();

        // Create sample files and folders
        const sampleItems = [
          {
            name: "ALGORITMOS",
            path: "/ALGORITMOS",
            type: "folder",
            shareId: testShare.id,
            size: null,
            mimeType: null,
            modifiedAt: new Date("2024-01-15"),
          },
          {
            name: "Banco departamentos", 
            path: "/Banco departamentos",
            type: "folder",
            shareId: testShare.id,
            size: null,
            mimeType: null,
            modifiedAt: new Date("2024-01-10"),
          },
          {
            name: "COMUNICACIONES",
            path: "/COMUNICACIONES",
            type: "folder",
            shareId: testShare.id,
            size: null,
            mimeType: null,
            modifiedAt: new Date("2024-01-20"),
          },
          {
            name: "ETC BINGO",
            path: "/ETC BINGO",
            type: "folder",
            shareId: testShare.id,
            size: null,
            mimeType: null,
            modifiedAt: new Date("2024-01-18"),
          },
          {
            name: "CERAMICA",
            path: "/CERAMICA",
            type: "folder",
            shareId: testShare.id,
            size: null,
            mimeType: null,
            modifiedAt: new Date("2024-01-12"),
          },
          {
            name: "PRESETS SPIN",
            path: "/PRESETS SPIN",
            type: "folder",
            shareId: testShare.id,
            size: null,
            mimeType: null,
            modifiedAt: new Date("2024-01-12"),
          },
          {
            name: "HASS publicidad videos",
            path: "/HASS publicidad videos",
            type: "folder",
            shareId: testShare.id,
            size: null,
            mimeType: null,
            modifiedAt: new Date("2024-01-12"),
          },
          {
            name: "MADRE",
            path: "/MADRE",
            type: "folder",
            shareId: testShare.id,
            size: null,
            mimeType: null,
            modifiedAt: new Date("2024-01-12"),
          },
          {
            name: "Manual presentacion.xlsx",
            path: "/Manual presentacion.xlsx",
            type: "file",
            shareId: testShare.id,
            size: 5242880,
            mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            modifiedAt: new Date("2024-01-12"),
          }
        ];

        await db.insert(fileItems).values(sampleItems);
      }
    } catch (error) {
      console.error("Failed to initialize test data:", error);
    }
  }

  async getSmbShares(): Promise<SmbShare[]> {
    return await db.select().from(smbShares);
  }

  async getSmbShare(id: number): Promise<SmbShare | undefined> {
    const [share] = await db.select().from(smbShares).where(eq(smbShares.id, id));
    return share || undefined;
  }

  async createSmbShare(insertShare: InsertSmbShare): Promise<SmbShare> {
    const [share] = await db
      .insert(smbShares)
      .values(insertShare)
      .returning();
    return share;
  }

  async updateSmbShare(id: number, updates: Partial<SmbShare>): Promise<SmbShare | undefined> {
    const [share] = await db
      .update(smbShares)
      .set(updates)
      .where(eq(smbShares.id, id))
      .returning();
    return share || undefined;
  }

  async deleteSmbShare(id: number): Promise<boolean> {
    const result = await db.delete(smbShares).where(eq(smbShares.id, id));
    return result.rowCount > 0;
  }

  async getFileItems(shareId: number, path: string): Promise<FileItem[]> {
    if (path === "") {
      // Root level - get items that are directly in root
      return await db.select().from(fileItems)
        .where(and(
          eq(fileItems.shareId, shareId),
          like(fileItems.path, "/%"),
          eq(fileItems.path, "/" + fileItems.name)
        ));
    } else {
      // Subfolder - get items that start with path + "/"
      return await db.select().from(fileItems)
        .where(and(
          eq(fileItems.shareId, shareId),
          like(fileItems.path, `${path}/%`)
        ));
    }
  }

  async createFileItem(insertItem: InsertFileItem): Promise<FileItem> {
    const [item] = await db
      .insert(fileItems)
      .values(insertItem)
      .returning();
    return item;
  }

  async deleteFileItem(id: number): Promise<boolean> {
    const result = await db.delete(fileItems).where(eq(fileItems.id, id));
    return result.rowCount > 0;
  }

  async clearFileItems(shareId: number): Promise<void> {
    await db.delete(fileItems).where(eq(fileItems.shareId, shareId));
  }
}

export const storage = new DatabaseStorage();