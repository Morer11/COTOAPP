// Import modules
const express = require('express');
const session = require('express-session');
const SQLiteStore = require('connect-sqlite3')(session);
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs-extra');
const unzipper = require('unzipper');
const { exec } = require('child_process');
const xml2js = require('xml2js');
const sharp = require('sharp');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure system folders exist
const sessionsDir = path.join(__dirname, 'sessions');
const userApksDir = path.join(__dirname, 'user_apks');
fs.ensureDirSync(sessionsDir);
fs.ensureDirSync(userApksDir);

// Setup SQLite DB and tables
const db = new sqlite3.Database('./users.db');
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      email TEXT UNIQUE,
      googleId TEXT UNIQUE,
      verified INTEGER DEFAULT 0,
      verifyCode TEXT,
      verifyCodeExpiry INTEGER,
      isAdmin INTEGER DEFAULT 0
    )
  `);
  // Uncomment the following line to set a specific user as admin
  db.run(`INSERT OR IGNORE INTO users (username, email, verified, isAdmin)
        VALUES (?, ?, 1, 1)`, ['Morer11', 'aliyuaadam1111@gmail.com']);


});

// Configure SMTP (replace below with your SMTP credentials)
const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  secure: false,
  auth: { user: 'your-email@example.com', pass: 'your-email-password' }
});

// Middleware setup
app.use(express.static(path.join(__dirname, '..', 'frontend')));
app.use(fileUpload({ createParentPath: true, limits: { fileSize: 100 * 1024 * 1024 } }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(session({
  store: new SQLiteStore({ db: 'sessions.sqlite', dir: sessionsDir, concurrentDB: true }),
  secret: 'replace-with-a-strong-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 7 * 24 * 3600 * 1000 }
}));

app.use(passport.initialize());
app.use(passport.session());

// Passport configuration
passport.serializeUser ((user, done) => done(null, user.id));
passport.deserializeUser ((id, done) =>
  db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => done(err, user))
);

passport.use(new GoogleStrategy({
  clientID: 'YOUR_GOOGLE_CLIENT_ID',
  clientSecret: 'YOUR_GOOGLE_CLIENT_SECRET',
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  db.get('SELECT * FROM users WHERE googleId = ?', [profile.id], (err, user) => {
    if (err) return done(err);
    if (user) return done(null, user);
    const username = profile.displayName || profile.emails[0].value;
    const email = (profile.emails?.[0]?.value) || null;
    db.run('INSERT INTO users (username, email, googleId, verified) VALUES (?, ?, ?, 1)',
      [username, email, profile.id], function (err2) {
        if (err2) return done(err2);
        db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err3, newUser ) => done(err3, newUser ));
      });
  });
}));

// Helper functions
function execCommand(cmd, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = exec(cmd, opts, (e, so, se) => e ? reject(se || so || e.message) : resolve(so));
    p.stdout.pipe(process.stdout);
    p.stderr.pipe(process.stderr);
  });
}

async function validateExtractedFiles(dir) {
  const files = await fs.readdir(dir);
  if (files.includes('index.html')) return true;
  for (const f of files) {
    let stat = await fs.stat(path.join(dir, f));
    if (stat.isDirectory()) {
      let subFiles = await fs.readdir(path.join(dir, f));
      if (subFiles.includes('index.html')) return true;
    }
  }
  return false;
}

async function saveAppIcons(iconFile, outDir) {
  const sizes = { ldpi: 36, mdpi: 48, hdpi: 72, xhdpi: 96, xxhdpi: 144, xxxhdpi: 192 };
  await fs.ensureDir(outDir);
  for (const [density, size] of Object.entries(sizes)) {
    await sharp(iconFile.data).resize(size, size).toFile(path.join(outDir, `${density}.png`));
  }
}

function requireLogin(req, res, next) {
  if (req.session.userId || (req.isAuthenticated && req.isAuthenticated())) return next();
  res.status(401).send('Unauthorized');
}

function requireAdmin(req, res, next) {
  if (!req.session.userId) return res.status(401).send('Unauthorized');
  db.get('SELECT isAdmin FROM users WHERE id = ?', [req.session.userId], (err, row) => {
    if (err || !row || row.isAdmin !== 1) return res.status(403).send('Forbidden');
    next();
  });
}

function sendVerificationEmail(email, code) {
  transporter.sendMail({
    from: '"COTOAPP" <your-cotoapp@gmail.com>',
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}. It expires in 10 minutes.`
  }, (err) => { if (err) console.error('Verification email failed:', err); });
}

// Routes

// Google OAuth login entry
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', { failureRedirect: '/login.html' }),
  (req, res) => {
    // Check if the user is an admin
    db.get('SELECT isAdmin FROM users WHERE id = ?', [req.user.id], (err, row) => {
      if (err) {
        return res.status(500).send('Database error');
      }
      if (row && row.isAdmin) {
        // Redirect admin to admin.html
        return res.redirect('/admin.html');
      } else {
        // Redirect regular user to upload.html
        return res.redirect('/upload.html');
      }
    });
  }
);

// Send email verification code
app.post('/send-code', (req, res) => {
  const { username, email } = req.body;
  if (!username || !email) return res.status(400).send('Username and email required');

  // Generate verification code and expiry
  const code = ('' + Math.floor(100000 + Math.random() * 900000));
  const expiry = Date.now() + 10 * 60 * 1000;

  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (user) {
      db.run('UPDATE users SET username=?, verifyCode=?, verifyCodeExpiry=? WHERE email=?',
        [username, code, expiry, email]);
    } else {
      db.run('INSERT INTO users (username, email, verified, verifyCode, verifyCodeExpiry) VALUES (?, ?, 0, ?, ?)',
        [username, email, code, expiry]);
    }
    sendVerificationEmail(email, code);
    res.send('Verification code sent');
  });
});


// Verify email code
app.get('/verify-email', (req, res) => {
  const token = req.query.token;
  if (!token) return res.status(400).send('Token required');

  db.run('UPDATE users SET verified=1, verifyCode=NULL, verifyCodeExpiry=NULL WHERE verifyCode=? AND verifyCodeExpiry > ?',
    [token, Date.now()], function (err) {
      if (err) return res.status(500).send('Verification failed');
      if (this.changes === 0) return res.status(400).send('Invalid or expired token');
      res.send('Email verified');
    });
});

// Email login (no password)
app.post('/login-email', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send('Email required');

  db.get('SELECT * FROM users WHERE email=?', [email], (err, user) => {
    if (err || !user) return res.status(400).send('User  not found');
    if (!user.verified) return res.status(400).send('Email not verified');
    req.session.userId = user.id;
    res.send('Login successful');
  });
});

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(() => { req.logout && req.logout(); res.send('Logged out'); });
});

// Admin: List users
app.get('/admin/users', requireAdmin, (req, res) => {
  db.all('SELECT id, username, email, verified, isAdmin FROM users', [], (err, rows) => {
    if (err) return res.status(500).send('DB error');
    res.json(rows);
  });
});

// Admin: Update user
app.put('/admin/users/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const { username, email, verified, isAdmin } = req.body;
  db.run('UPDATE users SET username=?, email=?, verified=?, isAdmin=? WHERE id=?',
    [username, email, verified ? 1 : 0, isAdmin ? 1 : 0, id], function (err) {
      if (err) return res.status(500).send('Update failed');
      res.send('User  updated');
    });
});

// Admin: Delete user
app.delete('/admin/users/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  db.run('DELETE FROM users WHERE id=?', [id], function (err) {
    if (err) return res.status(500).send('Delete failed');
    res.send('User  deleted');
  });
});

// Upload and APK build with user-specific storage
app.post('/upload', requireLogin, async (req, res) => {
  if (!req.files || !req.files.zipFile || !req.files.iconFile)
    return res.status(400).send('ZIP and icon required');

  const zipFile = req.files.zipFile;
  const iconFile = req.files.iconFile;
  const apkName = req.body.apkName || 'MyApp';

  if (!zipFile.name.toLowerCase().endsWith('.zip'))
    return res.status(400).send('Only ZIP allowed');

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'upload-'));
  const zipPath = path.join(tmpDir, zipFile.name);
  const extractPath = path.join(tmpDir, 'extracted');

  try {
    await zipFile.mv(zipPath);
    await fs.mkdirp(extractPath);
    await fs.createReadStream(zipPath).pipe(unzipper.Extract({ path: extractPath })).promise();

    if (!await validateExtractedFiles(extractPath)) {
      await fs.remove(tmpDir);
      return res.status(400).send('ZIP must contain index.html');
    }

    const cordovaProjectPath = path.join(__dirname, 'cordova_project');

    if (!await fs.pathExists(path.join(cordovaProjectPath, 'config.xml'))) {
      await execCommand(`cordova create . com.example.webwrapper "${apkName}"`, { cwd: cordovaProjectPath });
    }
    if (!await fs.pathExists(path.join(cordovaProjectPath, 'platforms', 'android'))) {
      await execCommand('cordova platform add android', { cwd: cordovaProjectPath });
    }

    const wwwPath = path.join(cordovaProjectPath, 'www');
    await fs.remove(wwwPath);
    await fs.copy(extractPath, wwwPath);

    const iconsDir = path.join(cordovaProjectPath, 'res', 'android');
    await saveAppIcons(iconFile, iconsDir);

    // Update config.xml with apkName
    const cfgPath = path.join(cordovaProjectPath, 'config.xml');
    const xmlText = await fs.readFile(cfgPath, 'utf8');
    const parser = new xml2js.Parser();
    const builder = new xml2js.Builder();
    const cfgObj = await parser.parseStringPromise(xmlText);
    cfgObj.widget.name[0] = apkName;
    const updatedXml = builder.buildObject(cfgObj);
    await fs.writeFile(cfgPath, updatedXml);

    await execCommand('cordova build android --release', { cwd: cordovaProjectPath });

    const apkSource = path.join(cordovaProjectPath, 'platforms/android/app/build/outputs/apk/release/app-release.apk');
    if (!await fs.pathExists(apkSource)) {
      await fs.remove(tmpDir);
      return res.status(500).send('APK build failed');
    }

    // Save in user-specific folder
    const userFolder = path.join(userApksDir, String(req.session.userId));
    await fs.ensureDir(userFolder);
    const filenameSafe = apkName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'app';
    const apkFilename = `${filenameSafe}_${Date.now()}.apk`;
    const userApkPath = path.join(userFolder, apkFilename);
    await fs.copy(apkSource, userApkPath);

    res.download(userApkPath, apkFilename, async (err) => {
      await fs.remove(tmpDir);
      if (err) console.error('Error sending APK:', err);
    });
  }
  catch (err) {
    console.error(err);
    await fs.remove(tmpDir);
    res.status(500).send('Server error: ' + err.message);
  }
});

// List user's APKs
app.get('/myapks', requireLogin, async (req, res) => {
  try {
    const folder = path.join(userApksDir, String(req.session.userId));
    if (!(await fs.pathExists(folder))) return res.json([]);
    const files = await fs.readdir(folder);
    const apks = [];
    for (const file of files.filter(f => f.endsWith('.apk'))) {
      const stat = await fs.stat(path.join(folder, file));
      apks.push({ name: file, url: `/user_apks/${req.session.userId}/${encodeURIComponent(file)}`, date: stat.mtime });
    }
    apks.sort((a, b) => b.date - a.date);
    res.json(apks);
  }
  catch {
    res.status(500).send('Failed to list APKs');
  }
});

// Serve APK files
app.use('/user_apks', express.static(userApksDir));

// Start server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
