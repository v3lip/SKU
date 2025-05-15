# SKU (Simple Keybased Upload)

A secure file upload system that uses key-based authentication for file uploads. Users need a valid key to upload files, and administrators can manage these keys through a user-friendly interface.

## Features

- 🔐 Key-based authentication for file uploads
- 📤 Drag-and-drop file upload interface
- 👥 Admin panel for key management
- 🔑 Key generation, validation, and deletion
- 📱 Responsive design
- 🔒 Secure file handling
- 📁 File preview support for images, videos, and PDFs
- ⚡ Chunked file uploads for large files
- 🔄 Real-time upload progress tracking

## Tech Stack

### Frontend
- React.js
- React Router DOM
- Modern UI components
- Drag-and-drop functionality
- Chunked file upload handling

### Backend
- Node.js
- Express.js
- LowDB for data persistence
- Multer for file handling
- JWT for authentication
- bcrypt for security
- MIME type detection

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/v3lip/SKU.git
cd SKU
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
node index.js
```

2. Start the frontend development server:
```bash
cd client
npm start
```

When starting the server for the first time, a default admin user will be created with:
- Username: `admin`
- Password: `admin`

The application will be available at `http://localhost:3000`
If you run the server externaly you will have to change the IP here `client/src/config.js` to the correct IP to the server.

## Project Structure
```
SKU/
├── client/ # Frontend React application
│ ├── public/ # Static files
│ └── src/ # React source code
│ ├── pages/ # Page components
│ ├── components/ # Reusable components
│ └── config.js # Configuration file
├── server/ # Backend Node.js application
│ ├── uploads/ # Permanent file storage
│ ├── tmpUploads/ # Temporary file storage
│ ├── db.json # Database file
│ └── index.js # Main server file
└── README.md
```


## Security Features

- Key-based authentication system
- Secure file upload handling
- Temporary file storage for processing
- Admin-only key management
- JWT-based authentication for admin panel
- Role-based access control (Admin, Moderator, User)
- Password reset enforcement capability
- Secure file type validation

## File Management

- Support for all file types
- Preview functionality for:
  - Images (all formats)
  - Videos (all formats)
  - PDF documents
- Chunked upload support for large files
- Progress tracking during upload
- File metadata management
- Secure file storage

## Images
![image](https://github.com/user-attachments/assets/99cded14-b8a9-47a8-b87c-f69fed48849e)
![image](https://github.com/user-attachments/assets/36563d56-dcff-4e0a-b689-d41993fc377d)


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

- Special thanks to the open-source community for the amazing tools and libraries

