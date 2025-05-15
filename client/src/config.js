// Server configuration
const config = {
  // Server connection
  API_URL: 'http://192.168.1.163:5000',  // Change this to your server's IP and port
  
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

export default config;

// You can change the IP address here to point to your server
// Example: export const API_URL = 'http://192.168.1.100:5000'; 