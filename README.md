# 🎥 Google Meet Clone

A full-featured video conferencing application built with the MERN stack (MongoDB, Express.js, React, Node.js) that provides real-time video calling, audio communication, screen sharing, and chat functionality.

## ✨ Features

### 🎯 Core Features
- **Real-time Video Conferencing**: High-quality peer-to-peer video communication using WebRTC
- **Audio Communication**: Crystal clear audio with mute/unmute controls
- **Screen Sharing**: Share your entire screen or specific application windows
- **Real-time Chat**: Send and receive messages during video calls
- **Room Management**: Create new rooms or join existing ones with room IDs
- **Responsive Design**: Works seamlessly on desktop and mobile devices

### 🛠 Technical Features
- **WebRTC Integration**: Direct peer-to-peer communication for low latency
- **Socket.io**: Real-time bidirectional communication
- **MongoDB**: Persistent storage for rooms and user data
- **TypeScript**: Type-safe development experience
- **Styled Components**: Modern CSS-in-JS styling
- **Responsive Grid Layout**: Automatic video grid adjustment based on participant count

## 🏗 Architecture

```
google-meet-clone/
├── backend/                 # Express.js server
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   └── server.js           # Main server file
├── frontend/               # React application
│   ├── public/             # Static assets
│   └── src/
│       ├── components/     # React components
│       ├── hooks/          # Custom React hooks
│       ├── services/       # API and Socket services
│       └── utils/          # Utility functions
└── package.json            # Root package.json
```

## 🚀 Installation & Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (v4.4 or higher)
- **npm** or **yarn**

### 1. Clone the Repository
```bash
git clone <repository-url>
cd google-meet-clone
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all dependencies (backend + frontend)
npm run install-deps
```

### 3. Environment Setup

Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/google-meet-clone
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 4. Start MongoDB
Make sure MongoDB is running on your system:
```bash
# On macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# On Ubuntu/Debian
sudo systemctl start mongod

# Or run directly
mongod
```

### 5. Run the Application
```bash
# Start both backend and frontend concurrently
npm run dev

# Or start separately:
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📖 Usage Guide

### Creating a Room
1. Open http://localhost:3000
2. Enter your name and a room name
3. Click "Create New Room"
4. Share the generated Room ID with participants

### Joining a Room
1. Open http://localhost:3000
2. Enter your name
3. Click "Join Existing Room"
4. Enter the Room ID provided by the room creator
5. Click "Join Room"

### During a Meeting

#### Video Controls
- **Camera Toggle**: Turn your camera on/off
- **Microphone Toggle**: Mute/unmute your microphone
- **Screen Share**: Share your screen with other participants
- **Leave Room**: Exit the meeting

#### Chat Feature
- Click the chat icon to open the chat panel
- Send messages to all participants
- Messages are displayed in real-time

#### Video Grid
- Automatically adjusts layout based on participant count
- Shows participant names and status indicators
- Displays audio/video status for each participant

## 🛠 API Reference

### Rooms API

#### Create Room
```http
POST /api/rooms/create
Content-Type: application/json

{
  "roomName": "My Meeting Room",
  "createdBy": "user-id"
}
```

#### Join Room
```http
POST /api/rooms/join
Content-Type: application/json

{
  "roomId": "room-uuid"
}
```

#### Get Room Details
```http
GET /api/rooms/:roomId
```

#### End Room
```http
POST /api/rooms/:roomId/end
```

### Users API

#### Create User
```http
POST /api/users/create
Content-Type: application/json

{
  "userName": "John Doe",
  "email": "john@example.com"
}
```

#### Get User
```http
GET /api/users/:userId
```

#### Update Meeting History
```http
POST /api/users/:userId/meeting-history
Content-Type: application/json

{
  "roomId": "room-uuid",
  "roomName": "Meeting Room",
  "action": "join" | "leave"
}
```

## 🔧 WebRTC Configuration

The application uses WebRTC for peer-to-peer communication with the following configuration:

```javascript
const iceServers = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ],
};
```

For production deployment, consider adding TURN servers for better connectivity across different network configurations.

## 🎨 Customization

### Styling
The application uses styled-components for styling. You can customize the theme by modifying the color variables in the component files:

```javascript
// Example color scheme
const theme = {
  primary: '#667eea',
  secondary: '#764ba2',
  background: '#1a1a1a',
  surface: '#2d2d2d',
  text: '#ffffff',
  textSecondary: '#aaaaaa'
};
```

### Adding Features
1. **Recording**: Integrate MediaRecorder API for call recording
2. **Virtual Backgrounds**: Add background blur/replacement
3. **Breakout Rooms**: Create separate sub-rooms
4. **File Sharing**: Allow participants to share files
5. **Polls/Reactions**: Add interactive elements

## 🌐 Deployment

### Backend Deployment (Heroku/Railway/Render)
1. Set environment variables in your hosting platform
2. Ensure MongoDB is accessible (use MongoDB Atlas for cloud)
3. Update CORS settings for your frontend domain

### Frontend Deployment (Vercel/Netlify)
1. Build the production version: `npm run build`
2. Update API endpoints to point to your deployed backend
3. Deploy the `build` folder

### Docker Deployment
Create a `docker-compose.yml`:
```yaml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    depends_on:
      - mongodb
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/google-meet-clone
    
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

## 🐛 Troubleshooting

### Common Issues

#### Camera/Microphone Not Working
- Ensure browser permissions are granted
- Check if other applications are using the camera/microphone
- Try refreshing the page and re-granting permissions

#### Connection Issues
- Check if both users are on the same network or behind NAT
- Verify STUN servers are accessible
- Consider adding TURN servers for production

#### Build Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### MongoDB Connection Errors
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Check connection string in .env file
# Ensure database is accessible
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **WebRTC** for peer-to-peer communication
- **Socket.io** for real-time messaging
- **React** and **Node.js** communities
- **MongoDB** for data persistence
- **Google Meet** for inspiration

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#🐛-troubleshooting) section
2. Search existing issues in the repository
3. Create a new issue with detailed information
4. Join our community discussions

---

Built with ❤️ using the MERN stack