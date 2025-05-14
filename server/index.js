const express = require('express');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const mime = require('mime-types');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Setup database
const dbFile = path.join(__dirname, 'db.json');
const adapter = new JSONFile(dbFile);
const defaultData = { users: [], files: [], uploadKeys: [] };
const db = new Low(adapter, defaultData);

async function initDB() {
  await db.read();
  db.data = db.data || defaultData;
  // Migrate existing users to include forcePasswordReset flag
  db.data.users = db.data.users.map(u => ({
    ...u,
    forcePasswordReset: u.forcePasswordReset ?? false,
  }));
  // Create default admin if none exists
  if (db.data.users.length === 0) {
    const defaultPass = 'admin';
    const hashed = await bcrypt.hash(defaultPass, 10);
    const id = uuidv4();
    db.data.users.push({ id, username: 'admin', password: hashed, role: 'admin', forcePasswordReset: false });
    console.log(`Default admin created. Username: admin, Password: ${defaultPass}`);
  }
  await db.write();
}
initDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Auth middleware
const auth = (allowedRoles = []) => async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'No authorization header' });
  const token = authHeader.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    await db.read();
    const user = db.data.users.find(u => u.id === payload.id);
    if (!user) return res.status(401).json({ message: 'User not found' });
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Setup uploads directory
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const id = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, id + ext);
  },
});
const upload = multer({ storage });

// Serve uploaded files statically
app.use('/uploads', express.static(uploadDir));

// Chunked upload setup
const tmpDir = path.join(__dirname, 'tmpUploads');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
const chunkUpload = multer({ dest: tmpDir });
const uploadsInProgress = {};

// Routes

// Admin login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(400).json({ message: 'Invalid credentials' });
  // Allow all roles (user, moderator, admin) to login for key generation and file management based on role
  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
  res.json({
    id: user.id,
    username: user.username,
    role: user.role,
    forcePasswordReset: user.forcePasswordReset,
    token
  });
});

// Generate upload key (allow any authenticated user)
app.post('/api/admin/upload-key', auth(), async (req, res) => {
  await db.read();
  const key = uuidv4();
  db.data.uploadKeys.push({ key, createdAt: new Date().toISOString() });
  await db.write();
  res.json({ key });
});

// List upload keys (allow any authenticated user)
app.get('/api/admin/upload-keys', auth(), async (req, res) => {
  await db.read();
  res.json(db.data.uploadKeys);
});

// Delete an upload key (allow any authenticated user)
app.delete('/api/admin/upload-keys/:key', auth(), async (req, res) => {
  const { key } = req.params;
  await db.read();
  const exists = db.data.uploadKeys.some(k => k.key === key);
  if (!exists) {
    return res.status(404).json({ message: 'Upload key not found' });
  }
  db.data.uploadKeys = db.data.uploadKeys.filter(k => k.key !== key);
  await db.write();
  res.json({ message: 'Upload key deleted' });
});

// User management
app.get('/api/admin/users', auth(['admin']), async (req, res) => {
  await db.read();
  const users = db.data.users.map(u => ({ id: u.id, username: u.username, role: u.role, forcePasswordReset: u.forcePasswordReset }));
  res.json(users);
});

app.post('/api/admin/users', auth(['admin']), async (req, res) => {
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  await db.read();
  if (db.data.users.some(u => u.username === username)) {
    return res.status(400).json({ message: 'Username already exists' });
  }
  const hashed = await bcrypt.hash(password, 10);
  const id = uuidv4();
  db.data.users.push({ id, username, password: hashed, role, forcePasswordReset: false });
  await db.write();
  res.json({ id, username, role });
});

app.put('/api/admin/users/:id', auth(['admin']), async (req, res) => {
  const { id } = req.params;
  const { username, password, role, forcePasswordReset } = req.body;
  await db.read();
  const user = db.data.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (username) user.username = username;
  if (password) user.password = await bcrypt.hash(password, 10);
  if (role) user.role = role;
  // Update forcePasswordReset flag if provided
  if (forcePasswordReset !== undefined) {
    user.forcePasswordReset = forcePasswordReset;
  }
  await db.write();
  res.json({ id: user.id, username: user.username, role: user.role });
});

app.delete('/api/admin/users/:id', auth(['admin']), async (req, res) => {
  const { id } = req.params;
  await db.read();
  db.data.users = db.data.users.filter(u => u.id !== id);
  await db.write();
  res.json({ message: 'User deleted' });
});

// File management (allow admin and moderator)
app.get('/api/admin/files', auth(['admin', 'moderator']), async (req, res) => {
  await db.read();
  res.json(db.data.files);
});

app.delete('/api/admin/files/:id', auth(['admin', 'moderator']), async (req, res) => {
  const { id } = req.params;
  await db.read();
  const fileMeta = db.data.files.find(f => f.id === id);
  if (!fileMeta) return res.status(404).json({ message: 'File not found' });
  const filePath = path.join(uploadDir, fileMeta.storageName);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  db.data.files = db.data.files.filter(f => f.id !== id);
  await db.write();
  res.json({ message: 'File deleted' });
});

// Update file metadata (original name)
app.put('/api/admin/files/:id', auth(['admin', 'moderator']), async (req, res) => {
  const { id } = req.params;
  const { originalName } = req.body;
  await db.read();
  const fileMeta = db.data.files.find(f => f.id === id);
  if (!fileMeta) return res.status(404).json({ message: 'File not found' });
  if (originalName) fileMeta.originalName = originalName;
  await db.write();
  res.json(fileMeta);
});

// Validate upload key
app.post('/api/upload/validate', async (req, res) => {
  const { key } = req.body;
  if (!key) {
    return res.status(401).json({ message: 'No upload key provided' });
  }
  await db.read();
  const keyEntry = db.data.uploadKeys.find(k => k.key === key);
  if (!keyEntry) {
    return res.status(403).json({ message: 'Invalid upload key' });
  }
  const now = new Date();
  const createdAt = new Date(keyEntry.createdAt);
  // Check key expiry (24 hours)
  if (now - createdAt > 24 * 60 * 60 * 1000) {
    // Remove expired key
    db.data.uploadKeys = db.data.uploadKeys.filter(k => k.key !== key);
    await db.write();
    return res.status(403).json({ message: 'Upload key expired' });
  }
  // Prevent revalidation on the same key
  if (keyEntry.validated) {
    return res.status(403).json({ message: 'Upload key already used' });
  }
  // Mark key as validated
  keyEntry.validated = true;
  await db.write();
  return res.json({ valid: true });
});

// File upload
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const key = req.body.key;
  if (!key) {
    return res.status(401).json({ message: 'No upload key provided' });
  }
  await db.read();
  const keyEntry = db.data.uploadKeys.find(k => k.key === key);
  if (!keyEntry) {
    return res.status(403).json({ message: 'Invalid upload key' });
  }
  const now = new Date();
  const createdAt = new Date(keyEntry.createdAt);
  // Check key expiry (24 hours)
  if (now - createdAt > 24 * 60 * 60 * 1000) {
    // Remove expired key
    db.data.uploadKeys = db.data.uploadKeys.filter(k => k.key !== key);
    await db.write();
    return res.status(403).json({ message: 'Upload key expired' });
  }
  // Ensure the key was validated first
  if (!keyEntry.validated) {
    return res.status(403).json({ message: 'Upload key not validated' });
  }
  // Consume key (single use)
  db.data.uploadKeys = db.data.uploadKeys.filter(k => k.key !== key);
  const file = req.file;
  const id = path.parse(file.filename).name;
  const meta = {
    id,
    originalName: file.originalname,
    storageName: file.filename,
    size: file.size,
    mimeType: file.mimetype,
    uploadedAt: now.toISOString(),
  };
  db.data.files.push(meta);
  await db.write();
  res.json({ id, originalName: meta.originalName });
});

// Initialize chunked upload session
app.post('/api/upload/init', async (req, res) => {
  const { key, originalName, totalChunks } = req.body;
  // Validate upload key
  if (!key) return res.status(401).json({ message: 'No upload key provided' });
  await db.read();
  const keyEntry = db.data.uploadKeys.find(k => k.key === key);
  if (!keyEntry) return res.status(403).json({ message: 'Invalid upload key' });
  const now = new Date();
  const createdAt = new Date(keyEntry.createdAt);
  if (now - createdAt > 24 * 60 * 60 * 1000) {
    db.data.uploadKeys = db.data.uploadKeys.filter(k => k.key !== key);
    await db.write();
    return res.status(403).json({ message: 'Upload key expired' });
  }
  // Mark key validated for chunked upload
  keyEntry.validated = true;
  await db.write();
  // Create upload session
  const uploadId = uuidv4();
  uploadsInProgress[uploadId] = { originalName, totalChunks: Number(totalChunks), received: 0 };
  res.json({ uploadId });
});

// Receive file chunk
app.post('/api/upload/chunk', chunkUpload.single('chunk'), async (req, res) => {
  const { uploadId, chunkIndex } = req.body;
  const upload = uploadsInProgress[uploadId];
  if (!upload) return res.status(400).json({ message: 'Invalid uploadId' });
  const tmpPath = path.join(tmpDir, `${uploadId}_${chunkIndex}`);
  fs.renameSync(req.file.path, tmpPath);
  upload.received++;
  res.json({ message: 'Chunk received' });
});

// Complete chunked upload and assemble file
app.post('/api/upload/complete', async (req, res) => {
  const { uploadId, key } = req.body;
  const upload = uploadsInProgress[uploadId];
  if (!upload) return res.status(400).json({ message: 'Invalid uploadId' });
  if (!key) return res.status(401).json({ message: 'No upload key provided' });
  await db.read();
  const keyEntry = db.data.uploadKeys.find(k => k.key === key);
  if (!keyEntry || !keyEntry.validated) return res.status(403).json({ message: 'Invalid or not validated key' });
  // Consume key
  db.data.uploadKeys = db.data.uploadKeys.filter(k => k.key !== key);
  await db.write();
  // Assemble chunks
  const id = uuidv4();
  const ext = path.extname(upload.originalName);
  const storageName = id + ext;
  const finalPath = path.join(uploadDir, storageName);
  const writeStream = fs.createWriteStream(finalPath);
  for (let i = 0; i < upload.totalChunks; i++) {
    const chunkPath = path.join(tmpDir, `${uploadId}_${i}`);
    if (!fs.existsSync(chunkPath)) {
      return res.status(400).json({ message: `Missing chunk ${i}` });
    }
    writeStream.write(fs.readFileSync(chunkPath));
    fs.unlinkSync(chunkPath);
  }
  writeStream.end();
  // Save metadata
  await db.read();
  db.data.files.push({
    id,
    originalName: upload.originalName,
    storageName,
    size: fs.statSync(finalPath).size,
    mimeType: mime.lookup(upload.originalName) || 'application/octet-stream',
    uploadedAt: new Date().toISOString(),
  });
  await db.write();
  delete uploadsInProgress[uploadId];
  res.json({ id, originalName: upload.originalName });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 