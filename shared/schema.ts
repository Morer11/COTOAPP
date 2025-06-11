import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const apks = pgTable("apks", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  originalUrl: text("original_url"),
  filePath: text("file_path"),
  iconPath: text("icon_path"),
  mode: text("mode").notNull().default("online"), // online or offline
  status: text("status").notNull().default("pending"), // pending, processing, completed, failed
  downloadCount: integer("download_count").notNull().default(0),
  size: text("size"),
  apkPath: text("apk_path"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const conversionJobs = pgTable("conversion_jobs", {
  id: serial("id").primaryKey(),
  apkId: integer("apk_id").notNull(),
  status: text("status").notNull().default("queued"), // queued, processing, completed, failed
  progress: integer("progress").notNull().default(0),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export const analytics = pgTable("analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id"),
  apkId: integer("apk_id"),
  action: text("action").notNull(), // download, view, share
  timestamp: timestamp("timestamp").notNull().defaultNow(),
});

export const ads = pgTable("ads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  placement: text("placement").notNull(), // header, footer, sidebar, content
  isActive: boolean("is_active").notNull().default(true),
  revenue: integer("revenue").notNull().default(0), // in cents
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertApkSchema = createInsertSchema(apks).pick({
  name: true,
  originalUrl: true,
  mode: true,
}).extend({
  name: z.string().min(1, "App name is required"),
  mode: z.enum(["online", "offline"]),
});

export const insertConversionJobSchema = createInsertSchema(conversionJobs).pick({
  apkId: true,
  status: true,
  progress: true,
  errorMessage: true,
});

export const insertAnalyticsSchema = createInsertSchema(analytics).pick({
  userId: true,
  apkId: true,
  action: true,
});

export const insertAdSchema = createInsertSchema(ads).pick({
  name: true,
  content: true,
  placement: true,
  isActive: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertApk = z.infer<typeof insertApkSchema>;
export type Apk = typeof apks.$inferSelect;
export type InsertConversionJob = z.infer<typeof insertConversionJobSchema>;
export type ConversionJob = typeof conversionJobs.$inferSelect;
export type InsertAnalytics = z.infer<typeof insertAnalyticsSchema>;
export type Analytics = typeof analytics.$inferSelect;
export type InsertAd = z.infer<typeof insertAdSchema>;
export type Ad = typeof ads.$inferSelect;
