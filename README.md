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

1. Create necessary directories in the server folder:
```bash
mkdir uploads tmpUploads
```

2. Configure environment variables (if needed) in the server's `.env` file.

## Running the Application

1. Start the backend server:
```bash
cd server
npm start
```

2. Start the frontend development server:
```bash
cd client
npm start
```

The application will be available at `http://localhost:3000`

## Project Structure
sku/
├── client/ # Frontend React application
│ ├── public/ # Static files
│ └── src/ # React source code
├── server/ # Backend Node.js application
│ ├── uploads/ # Permanent file storage
│ ├── tmpUploads/ # Temporary file storage
│ └── index.js # Main server file
└── README.md

## Security Features

- Key-based authentication system
- Secure file upload handling
- Temporary file storage for processing
- Admin-only key management
- JWT-based authentication for admin panel

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

