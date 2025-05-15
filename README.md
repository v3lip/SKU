# SKU (Simple Keybased Upload)

A secure file upload system that uses key-based authentication for file uploads. Users need a valid key to upload files, and administrators can manage these keys through a user-friendly interface.

## Features

- 🔐 Key-based authentication for file uploads
- 📤 Drag-and-drop file upload interface
- 👥 Admin panel for key management
- 🔑 Key generation, validation, and deletion
- 📱 Responsive design
- 🔒 Secure file handling

## Tech Stack

### Frontend
- React.js
- React Router DOM
- Modern UI components
- Drag-and-drop functionality

### Backend
- Node.js
- Express.js
- LowDB for data persistence
- Multer for file handling
- JWT for authentication
- bcrypt for security

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sku.git
cd sku
```

2. Install frontend dependencies:
```bash
cd client
npm install
```

3. Install backend dependencies:
```bash
cd ../server
npm install
```

## Configuration

### Client Configuration
The client configuration is in `client/src/config.js`:
```javascript
const config = {
  API_URL: 'http://your-server-ip:5000',  // Change this to your server's IP and port
  CHUNK_SIZE: 1 * 1024 * 1024,            // Adjust chunk size if needed
  // ... other settings
};
```

### Server Configuration
1. Copy the example environment file:
```bash
cd server
cp .env.example .env
```

2. Edit the `.env` file with your settings:
```env
PORT=5000
HOST=0.0.0.0
JWT_SECRET=your_secure_secret_here
```

3. For production, make sure to:
   - Set a strong JWT_SECRET
   - Configure CORS_ORIGINS in `server/config.js` with your client URLs
   - Change the default admin password after first login

### Quick Deployment

1. Clone and install:
```bash
git clone https://github.com/v3lip/SKU.git
cd SKU
```

2. Configure the client:
```bash
cd client
# Edit src/config.js with your server's IP and port
npm install
```

3. Configure the server:
```bash
cd ../server
cp .env.example .env
# Edit .env with your settings
npm install
```

4. Start the services:
```bash
# Terminal 1 - Server
cd server
node index.js

# Terminal 2 - Client
cd client
npm start
```

The application will be available at:
- Client: http://localhost:3000
- Server: http://your-server-ip:5000

## Project Structure
```
sku/
├── client/ # Frontend React application
│ ├── public/ # Static files
│ └── src/ # React source code
├── server/ # Backend Node.js application
│ ├── uploads/ # Permanent file storage
│ ├── tmpUploads/ # Temporary file storage
│ └── index.js # Main server file
└── README.md
```

## Security Features

- Key-based authentication system
- Secure file upload handling
- Temporary file storage for processing
- Admin-only key management
- JWT-based authentication for admin panel

## Images

![image](https://github.com/user-attachments/assets/b830d4eb-f332-4349-9af9-375b6244e357)
![image](https://github.com/user-attachments/assets/1246d677-c06f-46c4-bb51-fd96d8d0d427)
![image](https://github.com/user-attachments/assets/04f3ec5c-bb82-494c-b764-5ff515063249)


## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License - see the LICENSE file for details.

## Author

- v3lip

## Acknowledgments

- Thanks to all contributors who have helped shape this project
- Special thanks to the open-source community for the amazing tools and libraries

