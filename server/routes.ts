import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, insertApkSchema, insertAnalyticsSchema, insertAdSchema } from "@shared/schema";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Configure multer for file uploads
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Session user type
interface SessionUser {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

declare module "express-session" {
  interface SessionData {
    user?: SessionUser;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.user) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session.user || !req.session.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      const { password, ...userWithoutPassword } = user;
      
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Invalid user data" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(400).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.session.user) {
      res.json({ user: req.session.user });
    } else {
      res.status(401).json({ message: "Not authenticated" });
    }
  });

  // APK routes
  app.get("/api/apks", requireAuth, async (req, res) => {
    try {
      const apks = await storage.getApksByUserId(req.session.user!.id);
      res.json(apks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch APKs" });
    }
  });

  app.post("/api/apks", requireAuth, upload.single("file"), async (req, res) => {
    try {
      const apkData = insertApkSchema.parse(req.body);
      
      const apk = await storage.createApk({
        ...apkData,
        userId: req.session.user!.id,
      });

      // Handle file upload if present
      if (req.file) {
        await storage.updateApk(apk.id, { filePath: req.file.path });
      }

      // Create conversion job
      await storage.createConversionJob({ apkId: apk.id });

      // Start APK generation process (simulated)
      setTimeout(async () => {
        try {
          await generateApk(apk.id);
        } catch (error) {
          console.error("APK generation failed:", error);
        }
      }, 1000);

      res.json(apk);
    } catch (error) {
      res.status(400).json({ message: "Failed to create APK" });
    }
  });

  app.get("/api/apks/:id", requireAuth, async (req, res) => {
    try {
      const apkId = parseInt(req.params.id);
      const apk = await storage.getApk(apkId);
      
      if (!apk) {
        return res.status(404).json({ message: "APK not found" });
      }

      // Check if user owns the APK or is admin
      if (apk.userId !== req.session.user!.id && !req.session.user!.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(apk);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch APK" });
    }
  });

  app.delete("/api/apks/:id", requireAuth, async (req, res) => {
    try {
      const apkId = parseInt(req.params.id);
      const apk = await storage.getApk(apkId);
      
      if (!apk) {
        return res.status(404).json({ message: "APK not found" });
      }

      // Check if user owns the APK or is admin
      if (apk.userId !== req.session.user!.id && !req.session.user!.isAdmin) {
        return res.status(403).json({ message: "Access denied" });
      }

      await storage.deleteApk(apkId);
      res.json({ message: "APK deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete APK" });
    }
  });

  app.post("/api/apks/:id/download", requireAuth, async (req, res) => {
    try {
      const apkId = parseInt(req.params.id);
      const apk = await storage.getApk(apkId);
      
      if (!apk || apk.status !== "completed") {
        return res.status(404).json({ message: "APK not ready for download" });
      }

      // Increment download count
      await storage.incrementDownloadCount(apkId);
      
      // Track analytics
      await storage.createAnalytics({
        userId: req.session.user!.id,
        apkId: apkId,
        action: "download",
      });

      res.json({ downloadUrl: `/downloads/${apk.apkPath}` });
    } catch (error) {
      res.status(500).json({ message: "Download failed" });
    }
  });

  // Admin routes
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/apks", requireAdmin, async (req, res) => {
    try {
      const apks = await storage.getAllApks();
      res.json(apks);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch APKs" });
    }
  });

  app.get("/api/admin/stats", requireAdmin, async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      const apks = await storage.getAllApks();
      const downloads = await storage.getAnalyticsByAction("download");
      const ads = await storage.getActiveAds();
      
      const totalRevenue = ads.reduce((sum, ad) => sum + ad.revenue, 0);

      res.json({
        totalUsers: users.length,
        totalApks: apks.length,
        totalDownloads: downloads.length,
        adRevenue: totalRevenue / 100, // Convert cents to dollars
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Ad management routes
  app.get("/api/ads", async (req, res) => {
    try {
      const ads = await storage.getActiveAds();
      res.json(ads);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ads" });
    }
  });

  app.post("/api/admin/ads", requireAdmin, async (req, res) => {
    try {
      const adData = insertAdSchema.parse(req.body);
      const ad = await storage.createAd(adData);
      res.json(ad);
    } catch (error) {
      res.status(400).json({ message: "Failed to create ad" });
    }
  });

  // Analytics routes
  app.post("/api/analytics", requireAuth, async (req, res) => {
    try {
      const analyticsData = insertAnalyticsSchema.parse(req.body);
      const analytics = await storage.createAnalytics({
        ...analyticsData,
        userId: req.session.user!.id,
      });
      res.json(analytics);
    } catch (error) {
      res.status(400).json({ message: "Failed to record analytics" });
    }
  });

  // Conversion job status
  app.get("/api/conversion-jobs/:apkId", requireAuth, async (req, res) => {
    try {
      const apkId = parseInt(req.params.apkId);
      const job = await storage.getConversionJobByApkId(apkId);
      
      if (!job) {
        return res.status(404).json({ message: "Conversion job not found" });
      }

      res.json(job);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch conversion job" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// APK generation function using Capacitor
async function generateApk(apkId: number) {
  try {
    const apk = await storage.getApk(apkId);
    const job = await storage.getConversionJobByApkId(apkId);
    if (!job || !apk) return;

    // Update job status to processing
    await storage.updateConversionJob(job.id, { 
      status: "processing",
      progress: 10 
    });

    const projectDir = path.join(process.cwd(), 'temp_projects', `apk_${apkId}`);
    const webDir = path.join(projectDir, 'www');
    
    // Create project directory
    await fs.promises.mkdir(webDir, { recursive: true });
    
    // Update progress
    await storage.updateConversionJob(job.id, { progress: 20 });

    // Handle file extraction or URL download
    if (apk.filePath) {
      // Extract ZIP file
      await extractZipFile(apk.filePath, webDir);
    } else if (apk.originalUrl) {
      // Download website content
      await downloadWebsite(apk.originalUrl, webDir);
    } else {
      throw new Error("No source file or URL provided");
    }

    await storage.updateConversionJob(job.id, { progress: 40 });

    // Create Capacitor project
    await createCapacitorProject(projectDir, apk.name, webDir);
    
    await storage.updateConversionJob(job.id, { progress: 60 });

    // Build APK
    const apkPath = await buildApk(projectDir, apk.name, apk.mode);
    
    await storage.updateConversionJob(job.id, { progress: 80 });

    // Move APK to final location
    const finalApkPath = path.join('downloads', `${apk.name}_${apkId}.apk`);
    await fs.promises.mkdir(path.dirname(finalApkPath), { recursive: true });
    await fs.promises.copyFile(apkPath, finalApkPath);

    // Get file size
    const stats = await fs.promises.stat(finalApkPath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);

    // Update APK and job status
    await storage.updateApk(apkId, { 
      status: "completed",
      apkPath: finalApkPath,
      size: `${sizeInMB} MB`
    });

    await storage.updateConversionJob(job.id, { 
      status: "completed",
      progress: 100 
    });

    // Cleanup temp directory
    await fs.promises.rm(projectDir, { recursive: true, force: true });

  } catch (error) {
    console.error("APK generation error:", error);
    
    const job = await storage.getConversionJobByApkId(apkId);
    if (job) {
      await storage.updateConversionJob(job.id, { 
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error"
      });
    }

    await storage.updateApk(apkId, { status: "failed" });
  }
}

// Helper function to extract ZIP files
async function extractZipFile(zipPath: string, extractPath: string) {
  const { execAsync } = require('util').promisify(require('child_process').exec);
  await execAsync(`unzip -o "${zipPath}" -d "${extractPath}"`);
}

// Helper function to download website content
async function downloadWebsite(url: string, outputPath: string) {
  // Create a basic HTML file that loads the website
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Web App</title>
    <style>
        body, html { margin: 0; padding: 0; height: 100%; overflow: hidden; }
        iframe { width: 100%; height: 100vh; border: none; }
    </style>
</head>
<body>
    <iframe src="${url}" frameborder="0"></iframe>
</body>
</html>`;
  
  await fs.promises.writeFile(path.join(outputPath, 'index.html'), htmlContent);
}

// Helper function to create Capacitor project
async function createCapacitorProject(projectDir: string, appName: string, webDir: string) {
  const packageJson = {
    name: appName.toLowerCase().replace(/\s+/g, '-'),
    version: "1.0.0",
    description: `Generated APK for ${appName}`,
    main: "index.js",
    scripts: {
      "build": "echo 'Build complete'"
    },
    dependencies: {
      "@capacitor/android": "^5.0.0",
      "@capacitor/core": "^5.0.0",
      "@capacitor/cli": "^5.0.0"
    }
  };

  const capacitorConfig = `
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.cotoapp.${appName.toLowerCase().replace(/\s+/g, '')}',
  appName: '${appName}',
  webDir: 'www',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true
  }
};

export default config;
`;

  // Write configuration files
  await fs.promises.writeFile(
    path.join(projectDir, 'package.json'), 
    JSON.stringify(packageJson, null, 2)
  );
  
  await fs.promises.writeFile(
    path.join(projectDir, 'capacitor.config.ts'), 
    capacitorConfig
  );
}

// Helper function to build APK
async function buildApk(projectDir: string, appName: string, mode: string): Promise<string> {
  const isOffline = mode === 'offline';
  
  // Initialize Capacitor
  await execAsync('npx cap init', { cwd: projectDir });
  
  // Add Android platform
  await execAsync('npx cap add android', { cwd: projectDir });
  
  // Copy web assets
  await execAsync('npx cap copy android', { cwd: projectDir });
  
  // Build APK (this would require Android SDK to be properly configured)
  // For now, create a placeholder APK file
  const apkDir = path.join(projectDir, 'android', 'app', 'build', 'outputs', 'apk', 'release');
  await fs.promises.mkdir(apkDir, { recursive: true });
  
  const apkPath = path.join(apkDir, 'app-release.apk');
  
  // Create a placeholder APK file (in production, this would be the actual build)
  const placeholderContent = `PKG\x03\x04\x14\x00\x08\x08\x08\x00${appName}_${mode}_${Date.now()}`;
  await fs.promises.writeFile(apkPath, placeholderContent);
  
  return apkPath;
}
