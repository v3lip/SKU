// Server configuration
const config = {
  // Server settings
  PORT: process.env.PORT || 5000,
  HOST: process.env.HOST || '0.0.0.0',  // Listen on all network interfaces
  
  // Security
  JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',  // Change this in production!
  JWT_EXPIRY: '1h',  // JWT token expiry time
  
  // File upload settings
  UPLOAD_DIR: 'uploads',
  TMP_UPLOAD_DIR: 'tmpUploads',
  MAX_FILE_SIZE: 1024 * 1024 * 1024,  // 1GB max file size
  ALLOWED_FILE_TYPES: '*',  // Allow all file types, or specify like: ['image/*', 'video/*', 'application/pdf']
  
  // Key settings
  KEY_EXPIRY: 24 * 60 * 60 * 1000,  // 24 hours in milliseconds
  
  // Database
  DB_FILE: 'db.json',
  
  // CORS settings
  CORS_ORIGINS: [
    'http://localhost:3000',
    'http://192.168.1.163:3000'  // Add your client URLs here
  ],
  
  // Default admin account (created on first run)
  DEFAULT_ADMIN: {
    username: 'admin',
    password: 'admin',
    role: 'admin'
  }
};

module.exports = config; 