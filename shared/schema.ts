import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const smbShares = pgTable("smb_shares", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  username: text("username"),
  password: text("password"),
  autoConnect: boolean("auto_connect").default(false),
  isConnected: boolean("is_connected").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const fileItems = pgTable("file_items", {
  id: serial("id").primaryKey(),
  shareId: integer("share_id").notNull(),
  name: text("name").notNull(),
  path: text("path").notNull(),
  type: text("type").notNull(), // 'file' | 'folder'
  size: integer("size"),
  mimeType: text("mime_type"),
  modifiedAt: timestamp("modified_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertSmbShareSchema = createInsertSchema(smbShares).omit({
  id: true,
  isConnected: true,
  createdAt: true,
});

export const insertFileItemSchema = createInsertSchema(fileItems).omit({
  id: true,
  createdAt: true,
});

export type InsertSmbShare = z.infer<typeof insertSmbShareSchema>;
export type SmbShare = typeof smbShares.$inferSelect;
export type InsertFileItem = z.infer<typeof insertFileItemSchema>;
export type FileItem = typeof fileItems.$inferSelect;

// API response types
export interface FileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  mimeType?: string;
  modifiedAt?: Date;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
}

export interface ConnectionStatus {
  shareId: number;
  isConnected: boolean;
  error?: string;
}
