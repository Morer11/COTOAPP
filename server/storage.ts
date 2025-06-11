import { 
  users, 
  apks, 
  conversionJobs, 
  analytics, 
  ads,
  type User, 
  type InsertUser,
  type Apk,
  type InsertApk,
  type ConversionJob,
  type InsertConversionJob,
  type Analytics,
  type InsertAnalytics,
  type Ad,
  type InsertAd
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;

  // APK operations
  getApk(id: number): Promise<Apk | undefined>;
  getApksByUserId(userId: number): Promise<Apk[]>;
  createApk(apk: InsertApk & { userId: number }): Promise<Apk>;
  updateApk(id: number, updates: Partial<Apk>): Promise<Apk | undefined>;
  deleteApk(id: number): Promise<boolean>;
  getAllApks(): Promise<Apk[]>;
  incrementDownloadCount(apkId: number): Promise<void>;

  // Conversion job operations
  getConversionJob(id: number): Promise<ConversionJob | undefined>;
  getConversionJobByApkId(apkId: number): Promise<ConversionJob | undefined>;
  createConversionJob(job: InsertConversionJob): Promise<ConversionJob>;
  updateConversionJob(id: number, updates: Partial<ConversionJob>): Promise<ConversionJob | undefined>;

  // Analytics operations
  createAnalytics(analytics: InsertAnalytics): Promise<Analytics>;
  getAnalyticsByUserId(userId: number): Promise<Analytics[]>;
  getAnalyticsByApkId(apkId: number): Promise<Analytics[]>;
  getAnalyticsByAction(action: string): Promise<Analytics[]>;

  // Ad operations
  getAd(id: number): Promise<Ad | undefined>;
  getAllAds(): Promise<Ad[]>;
  getActiveAds(): Promise<Ad[]>;
  createAd(ad: InsertAd): Promise<Ad>;
  updateAd(id: number, updates: Partial<Ad>): Promise<Ad | undefined>;
  deleteAd(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private apks: Map<number, Apk>;
  private conversionJobs: Map<number, ConversionJob>;
  private analytics: Map<number, Analytics>;
  private ads: Map<number, Ad>;
  private currentUserId: number;
  private currentApkId: number;
  private currentJobId: number;
  private currentAnalyticsId: number;
  private currentAdId: number;

  constructor() {
    this.users = new Map();
    this.apks = new Map();
    this.conversionJobs = new Map();
    this.analytics = new Map();
    this.ads = new Map();
    this.currentUserId = 1;
    this.currentApkId = 1;
    this.currentJobId = 1;
    this.currentAnalyticsId = 1;
    this.currentAdId = 1;

    // Create default admin user
    this.createUser({
      username: "admin",
      email: "aliyuaadam1111@gmail.com",
      password: "Mamana11@"
    }).then(user => {
      this.updateUser(user.id, { isAdmin: true });
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  // APK operations
  async getApk(id: number): Promise<Apk | undefined> {
    return this.apks.get(id);
  }

  async getApksByUserId(userId: number): Promise<Apk[]> {
    return Array.from(this.apks.values()).filter(apk => apk.userId === userId);
  }

  async createApk(apkData: InsertApk & { userId: number }): Promise<Apk> {
    const id = this.currentApkId++;
    const apk: Apk = {
      id,
      userId: apkData.userId,
      name: apkData.name,
      originalUrl: apkData.originalUrl || null,
      mode: apkData.mode,
      status: "pending",
      downloadCount: 0,
      filePath: null,
      iconPath: null,
      size: null,
      apkPath: null,
      createdAt: new Date(),
    };
    this.apks.set(id, apk);
    return apk;
  }

  async updateApk(id: number, updates: Partial<Apk>): Promise<Apk | undefined> {
    const apk = this.apks.get(id);
    if (!apk) return undefined;
    
    const updatedApk = { ...apk, ...updates };
    this.apks.set(id, updatedApk);
    return updatedApk;
  }

  async deleteApk(id: number): Promise<boolean> {
    return this.apks.delete(id);
  }

  async getAllApks(): Promise<Apk[]> {
    return Array.from(this.apks.values());
  }

  async incrementDownloadCount(apkId: number): Promise<void> {
    const apk = this.apks.get(apkId);
    if (apk) {
      apk.downloadCount++;
      this.apks.set(apkId, apk);
    }
  }

  // Conversion job operations
  async getConversionJob(id: number): Promise<ConversionJob | undefined> {
    return this.conversionJobs.get(id);
  }

  async getConversionJobByApkId(apkId: number): Promise<ConversionJob | undefined> {
    return Array.from(this.conversionJobs.values()).find(job => job.apkId === apkId);
  }

  async createConversionJob(jobData: InsertConversionJob): Promise<ConversionJob> {
    const id = this.currentJobId++;
    const job: ConversionJob = {
      ...jobData,
      id,
      status: "queued",
      progress: 0,
      errorMessage: null,
      createdAt: new Date(),
      completedAt: null,
    };
    this.conversionJobs.set(id, job);
    return job;
  }

  async updateConversionJob(id: number, updates: Partial<ConversionJob>): Promise<ConversionJob | undefined> {
    const job = this.conversionJobs.get(id);
    if (!job) return undefined;
    
    const updatedJob = { ...job, ...updates };
    if (updates.status === "completed" || updates.status === "failed") {
      updatedJob.completedAt = new Date();
    }
    this.conversionJobs.set(id, updatedJob);
    return updatedJob;
  }

  // Analytics operations
  async createAnalytics(analyticsData: InsertAnalytics): Promise<Analytics> {
    const id = this.currentAnalyticsId++;
    const analytics: Analytics = {
      id,
      userId: analyticsData.userId || null,
      apkId: analyticsData.apkId || null,
      action: analyticsData.action,
      timestamp: new Date(),
    };
    this.analytics.set(id, analytics);
    return analytics;
  }

  async getAnalyticsByUserId(userId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(a => a.userId === userId);
  }

  async getAnalyticsByApkId(apkId: number): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(a => a.apkId === apkId);
  }

  async getAnalyticsByAction(action: string): Promise<Analytics[]> {
    return Array.from(this.analytics.values()).filter(a => a.action === action);
  }

  // Ad operations
  async getAd(id: number): Promise<Ad | undefined> {
    return this.ads.get(id);
  }

  async getAllAds(): Promise<Ad[]> {
    return Array.from(this.ads.values());
  }

  async getActiveAds(): Promise<Ad[]> {
    return Array.from(this.ads.values()).filter(ad => ad.isActive);
  }

  async createAd(adData: InsertAd): Promise<Ad> {
    const id = this.currentAdId++;
    const ad: Ad = {
      id,
      name: adData.name,
      content: adData.content,
      placement: adData.placement,
      isActive: adData.isActive !== undefined ? adData.isActive : true,
      revenue: 0,
      createdAt: new Date(),
    };
    this.ads.set(id, ad);
    return ad;
  }

  async updateAd(id: number, updates: Partial<Ad>): Promise<Ad | undefined> {
    const ad = this.ads.get(id);
    if (!ad) return undefined;
    
    const updatedAd = { ...ad, ...updates };
    this.ads.set(id, updatedAd);
    return updatedAd;
  }

  async deleteAd(id: number): Promise<boolean> {
    return this.ads.delete(id);
  }
}

import { SQLiteStorage } from "./database";

export const storage = new SQLiteStorage();
