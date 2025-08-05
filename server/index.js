import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 5000;

// In-memory room users map: roomId -> array of user objects { socketId, userId }
const rooms = new Map();

io.on("connection", (socket) => {
  console.log("New socket connected", socket.id);

  socket.on("join_room", ({ roomId, userId }) => {
    console.log(`${userId} joined room ${roomId}`);

    // Add user to room map
    if (!rooms.has(roomId)) {
      rooms.set(roomId, []);
    }
    const participants = rooms.get(roomId);
    participants.push({ socketId: socket.id, userId });

    // Join Socket.IO room
    socket.join(roomId);

    // Inform the new user about existing users in the room
    const otherUsers = participants.filter((u) => u.socketId !== socket.id);
    socket.emit("all_users", otherUsers.map((u) => ({ socketId: u.socketId, userId: u.userId })));

    // Notify others that a new user has joined
    socket.to(roomId).emit("user_joined_notification", { socketId: socket.id, userId });
  });

  socket.on("sending_signal", ({ userToSignal, callerId, signal }) => {
    io.to(userToSignal).emit("user_joined", { signal, callerId, socketId: socket.id });
  });

  socket.on("returning_signal", ({ callerId, signal }) => {
    io.to(callerId).emit("receiving_returned_signal", { signal, id: socket.id });
  });

  socket.on("disconnecting", () => {
    // Remove user from any rooms they were in
    rooms.forEach((participants, roomId) => {
      const index = participants.findIndex((u) => u.socketId === socket.id);
      if (index !== -1) {
        const [leavingUser] = participants.splice(index, 1);
        // Notify remaining users
        socket.to(roomId).emit("user_left", { socketId: socket.id, userId: leavingUser.userId });
        if (participants.length === 0) {
          rooms.delete(roomId);
        }
      }
    });
  });
});

app.get("/", (_req, res) => {
  res.send("Video Meet Backend is running");
});

server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});