// Server configuration
const config = {
  // Server connection
  API_URL: process.env.NODE_ENV === 'development' 
    ? 'http://localhost:5000'  // Development server
    : 'http://192.168.1.163:5000',  // Production server
  
  // Upload settings
  CHUNK_SIZE: 1 * 1024 * 1024,  // 1MB chunks for file uploads
  
  // UI settings
  MAX_FILE_NAME_LENGTH: 50,     // Maximum length for displayed file names
  UPLOAD_TIMEOUT: 30000,        // Upload timeout in milliseconds (30 seconds)
  
  // Preview settings
  PREVIEWABLE_TYPES: [
    'image/',
    'video/',
    'application/pdf'
  ]
};

// Export individual values
export const { API_URL, CHUNK_SIZE, MAX_FILE_NAME_LENGTH, UPLOAD_TIMEOUT, PREVIEWABLE_TYPES } = config;

// Also export the entire config object as default for backward compatibility
export default config;

// You can change the IP address here to point to your server
// Example: export const API_URL = 'http://192.168.1.100:5000'; 