const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/users', require('./routes/users'));

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/google-meet-clone')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Socket.io for real-time communication
const rooms = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Join room
  socket.on('join-room', ({ roomId, userId, userName }) => {
    socket.join(roomId);
    
    if (!rooms.has(roomId)) {
      rooms.set(roomId, new Map());
    }
    
    rooms.get(roomId).set(socket.id, {
      userId,
      userName,
      socketId: socket.id
    });

    // Notify others in the room
    socket.to(roomId).emit('user-joined', {
      userId,
      userName,
      socketId: socket.id
    });

    // Send current users to the new user
    const currentUsers = Array.from(rooms.get(roomId).values()).filter(user => user.socketId !== socket.id);
    socket.emit('current-users', currentUsers);

    console.log(`User ${userName} joined room ${roomId}`);
  });

  // Handle WebRTC signaling
  socket.on('offer', ({ roomId, targetSocketId, offer }) => {
    socket.to(targetSocketId).emit('offer', {
      offer,
      callerSocketId: socket.id
    });
  });

  socket.on('answer', ({ roomId, targetSocketId, answer }) => {
    socket.to(targetSocketId).emit('answer', {
      answer,
      answererSocketId: socket.id
    });
  });

  socket.on('ice-candidate', ({ roomId, targetSocketId, candidate }) => {
    socket.to(targetSocketId).emit('ice-candidate', {
      candidate,
      senderSocketId: socket.id
    });
  });

  // Handle chat messages
  socket.on('chat-message', ({ roomId, message, userName }) => {
    socket.to(roomId).emit('chat-message', {
      message,
      userName,
      timestamp: new Date().toISOString(),
      socketId: socket.id
    });
  });

  // Handle media controls
  socket.on('toggle-audio', ({ roomId, isAudioEnabled }) => {
    socket.to(roomId).emit('user-audio-toggle', {
      socketId: socket.id,
      isAudioEnabled
    });
  });

  socket.on('toggle-video', ({ roomId, isVideoEnabled }) => {
    socket.to(roomId).emit('user-video-toggle', {
      socketId: socket.id,
      isVideoEnabled
    });
  });

  // Handle screen sharing
  socket.on('start-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('user-screen-share-start', {
      socketId: socket.id
    });
  });

  socket.on('stop-screen-share', ({ roomId }) => {
    socket.to(roomId).emit('user-screen-share-stop', {
      socketId: socket.id
    });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    
    // Remove user from all rooms
    for (const [roomId, users] of rooms.entries()) {
      if (users.has(socket.id)) {
        const user = users.get(socket.id);
        users.delete(socket.id);
        
        // Notify others in the room
        socket.to(roomId).emit('user-left', {
          socketId: socket.id,
          userName: user.userName
        });

        // Clean up empty rooms
        if (users.size === 0) {
          rooms.delete(roomId);
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});