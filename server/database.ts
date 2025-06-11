import Database from 'better-sqlite3';
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
import { IStorage } from "./storage";

export class SQLiteStorage implements IStorage {
  private db: Database.Database;

  constructor(dbPath: string = './data/cotoapp.sqlite') {
    this.db = new Database(dbPath);
    this.initializeDatabase();
    this.seedDefaultData();
  }

  private initializeDatabase() {
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        is_admin INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS apks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        name TEXT NOT NULL,
        original_url TEXT,
        file_path TEXT,
        icon_path TEXT,
        mode TEXT NOT NULL DEFAULT 'online',
        status TEXT NOT NULL DEFAULT 'pending',
        download_count INTEGER NOT NULL DEFAULT 0,
        size TEXT,
        apk_path TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      );

      CREATE TABLE IF NOT EXISTS conversion_jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        apk_id INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'queued',
        progress INTEGER NOT NULL DEFAULT 0,
        error_message TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        completed_at DATETIME,
        FOREIGN KEY (apk_id) REFERENCES apks (id)
      );

      CREATE TABLE IF NOT EXISTS analytics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        apk_id INTEGER,
        action TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (apk_id) REFERENCES apks (id)
      );

      CREATE TABLE IF NOT EXISTS ads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        placement TEXT NOT NULL,
        is_active INTEGER NOT NULL DEFAULT 1,
        revenue INTEGER NOT NULL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);
  }

  private seedDefaultData() {
    // Check if admin user exists
    const adminExists = this.db.prepare('SELECT id FROM users WHERE email = ?').get('aliyuaadam1111@gmail.com');
    
    if (!adminExists) {
      // Create default admin user
      this.db.prepare(`
        INSERT INTO users (username, email, password, is_admin)
        VALUES (?, ?, ?, ?)
      `).run('admin', 'aliyuaadam1111@gmail.com', 'Mamana11@', 1);

      // Create sample ads
      this.db.prepare(`
        INSERT INTO ads (name, content, placement, is_active)
        VALUES (?, ?, ?, ?)
      `).run('Header Ad', 'Google AdSense Header Banner', 'header', 1);

      this.db.prepare(`
        INSERT INTO ads (name, content, placement, is_active)
        VALUES (?, ?, ?, ?)
      `).run('Content Ad', 'Google AdSense Content Banner', 'content', 1);

      this.db.prepare(`
        INSERT INTO ads (name, content, placement, is_active)
        VALUES (?, ?, ?, ?)
      `).run('Sidebar Ad', 'Google AdSense Sidebar Banner', 'sidebar', 1);
    }
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(id) as any;
    return row ? this.mapUserRow(row) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const row = this.db.prepare('SELECT * FROM users WHERE username = ?').get(username) as any;
    return row ? this.mapUserRow(row) : undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const row = this.db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    return row ? this.mapUserRow(row) : undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const stmt = this.db.prepare(`
      INSERT INTO users (username, email, password)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(user.username, user.email, user.password);
    return this.getUser(result.lastInsertRowid as number) as Promise<User>;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const fields = Object.keys(updates).map(key => `${this.camelToSnake(key)} = ?`).join(', ');
    const values = Object.values(updates);
    
    if (fields.length === 0) return this.getUser(id);
    
    this.db.prepare(`UPDATE users SET ${fields} WHERE id = ?`).run(...values, id);
    return this.getUser(id);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = this.db.prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  async getAllUsers(): Promise<User[]> {
    const rows = this.db.prepare('SELECT * FROM users ORDER BY created_at DESC').all() as any[];
    return rows.map(row => this.mapUserRow(row));
  }

  // APK operations
  async getApk(id: number): Promise<Apk | undefined> {
    const row = this.db.prepare('SELECT * FROM apks WHERE id = ?').get(id) as any;
    return row ? this.mapApkRow(row) : undefined;
  }

  async getApksByUserId(userId: number): Promise<Apk[]> {
    const rows = this.db.prepare('SELECT * FROM apks WHERE user_id = ? ORDER BY created_at DESC').all(userId) as any[];
    return rows.map(row => this.mapApkRow(row));
  }

  async createApk(apk: InsertApk & { userId: number }): Promise<Apk> {
    const stmt = this.db.prepare(`
      INSERT INTO apks (user_id, name, original_url, mode)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(apk.userId, apk.name, apk.originalUrl || null, apk.mode);
    return this.getApk(result.lastInsertRowid as number) as Promise<Apk>;
  }

  async updateApk(id: number, updates: Partial<Apk>): Promise<Apk | undefined> {
    const fields = Object.keys(updates).map(key => `${this.camelToSnake(key)} = ?`).join(', ');
    const values = Object.values(updates);
    
    if (fields.length === 0) return this.getApk(id);
    
    this.db.prepare(`UPDATE apks SET ${fields} WHERE id = ?`).run(...values, id);
    return this.getApk(id);
  }

  async deleteApk(id: number): Promise<boolean> {
    const result = this.db.prepare('DELETE FROM apks WHERE id = ?').run(id);
    return result.changes > 0;
  }

  async getAllApks(): Promise<Apk[]> {
    const rows = this.db.prepare('SELECT * FROM apks ORDER BY created_at DESC').all() as any[];
    return rows.map(row => this.mapApkRow(row));
  }

  async incrementDownloadCount(apkId: number): Promise<void> {
    this.db.prepare('UPDATE apks SET download_count = download_count + 1 WHERE id = ?').run(apkId);
  }

  // Conversion job operations
  async getConversionJob(id: number): Promise<ConversionJob | undefined> {
    const row = this.db.prepare('SELECT * FROM conversion_jobs WHERE id = ?').get(id) as any;
    return row ? this.mapConversionJobRow(row) : undefined;
  }

  async getConversionJobByApkId(apkId: number): Promise<ConversionJob | undefined> {
    const row = this.db.prepare('SELECT * FROM conversion_jobs WHERE apk_id = ?').get(apkId) as any;
    return row ? this.mapConversionJobRow(row) : undefined;
  }

  async createConversionJob(job: InsertConversionJob): Promise<ConversionJob> {
    const stmt = this.db.prepare(`
      INSERT INTO conversion_jobs (apk_id, status, progress, error_message)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(job.apkId, job.status || 'queued', job.progress || 0, job.errorMessage || null);
    return this.getConversionJob(result.lastInsertRowid as number) as Promise<ConversionJob>;
  }

  async updateConversionJob(id: number, updates: Partial<ConversionJob>): Promise<ConversionJob | undefined> {
    const fields = Object.keys(updates).map(key => `${this.camelToSnake(key)} = ?`).join(', ');
    const values = Object.values(updates);
    
    if (fields.length === 0) return this.getConversionJob(id);
    
    this.db.prepare(`UPDATE conversion_jobs SET ${fields} WHERE id = ?`).run(...values, id);
    return this.getConversionJob(id);
  }

  // Analytics operations
  async createAnalytics(analytics: InsertAnalytics): Promise<Analytics> {
    const stmt = this.db.prepare(`
      INSERT INTO analytics (user_id, apk_id, action)
      VALUES (?, ?, ?)
    `);
    const result = stmt.run(analytics.userId || null, analytics.apkId || null, analytics.action);
    return this.getAnalytics(result.lastInsertRowid as number) as Promise<Analytics>;
  }

  async getAnalytics(id: number): Promise<Analytics | undefined> {
    const row = this.db.prepare('SELECT * FROM analytics WHERE id = ?').get(id) as any;
    return row ? this.mapAnalyticsRow(row) : undefined;
  }

  async getAnalyticsByUserId(userId: number): Promise<Analytics[]> {
    const rows = this.db.prepare('SELECT * FROM analytics WHERE user_id = ?').all(userId) as any[];
    return rows.map(row => this.mapAnalyticsRow(row));
  }

  async getAnalyticsByApkId(apkId: number): Promise<Analytics[]> {
    const rows = this.db.prepare('SELECT * FROM analytics WHERE apk_id = ?').all(apkId) as any[];
    return rows.map(row => this.mapAnalyticsRow(row));
  }

  async getAnalyticsByAction(action: string): Promise<Analytics[]> {
    const rows = this.db.prepare('SELECT * FROM analytics WHERE action = ?').all(action) as any[];
    return rows.map(row => this.mapAnalyticsRow(row));
  }

  // Ad operations
  async getAd(id: number): Promise<Ad | undefined> {
    const row = this.db.prepare('SELECT * FROM ads WHERE id = ?').get(id) as any;
    return row ? this.mapAdRow(row) : undefined;
  }

  async getAllAds(): Promise<Ad[]> {
    const rows = this.db.prepare('SELECT * FROM ads ORDER BY created_at DESC').all() as any[];
    return rows.map(row => this.mapAdRow(row));
  }

  async getActiveAds(): Promise<Ad[]> {
    const rows = this.db.prepare('SELECT * FROM ads WHERE is_active = 1').all() as any[];
    return rows.map(row => this.mapAdRow(row));
  }

  async createAd(ad: InsertAd): Promise<Ad> {
    const stmt = this.db.prepare(`
      INSERT INTO ads (name, content, placement, is_active)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(ad.name, ad.content, ad.placement, ad.isActive ? 1 : 0);
    return this.getAd(result.lastInsertRowid as number) as Promise<Ad>;
  }

  async updateAd(id: number, updates: Partial<Ad>): Promise<Ad | undefined> {
    const fields = Object.keys(updates).map(key => `${this.camelToSnake(key)} = ?`).join(', ');
    const values = Object.values(updates);
    
    if (fields.length === 0) return this.getAd(id);
    
    this.db.prepare(`UPDATE ads SET ${fields} WHERE id = ?`).run(...values, id);
    return this.getAd(id);
  }

  async deleteAd(id: number): Promise<boolean> {
    const result = this.db.prepare('DELETE FROM ads WHERE id = ?').run(id);
    return result.changes > 0;
  }

  // Helper methods
  private mapUserRow(row: any): User {
    return {
      id: row.id,
      username: row.username,
      email: row.email,
      password: row.password,
      isAdmin: Boolean(row.is_admin),
      createdAt: new Date(row.created_at)
    };
  }

  private mapApkRow(row: any): Apk {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      originalUrl: row.original_url,
      filePath: row.file_path,
      iconPath: row.icon_path,
      mode: row.mode,
      status: row.status,
      downloadCount: row.download_count,
      size: row.size,
      apkPath: row.apk_path,
      createdAt: new Date(row.created_at)
    };
  }

  private mapConversionJobRow(row: any): ConversionJob {
    return {
      id: row.id,
      apkId: row.apk_id,
      status: row.status,
      progress: row.progress,
      errorMessage: row.error_message,
      createdAt: new Date(row.created_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : null
    };
  }

  private mapAnalyticsRow(row: any): Analytics {
    return {
      id: row.id,
      userId: row.user_id,
      apkId: row.apk_id,
      action: row.action,
      timestamp: new Date(row.timestamp)
    };
  }

  private mapAdRow(row: any): Ad {
    return {
      id: row.id,
      name: row.name,
      content: row.content,
      placement: row.placement,
      isActive: Boolean(row.is_active),
      revenue: row.revenue,
      createdAt: new Date(row.created_at)
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }
}
