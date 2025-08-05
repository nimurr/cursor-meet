# MERN Meet

A Google Meet-like video conferencing app built with the MERN stack (MongoDB, Express, React, Node.js) and WebRTC.

## Features
- User authentication (sign up, login)
- Create/join meeting rooms (unique URLs)
- Real-time video/audio (WebRTC)
- Real-time chat in meeting
- Participant list
- Responsive UI

## Project Structure
```
/workspace
  /client   # React frontend
  /server   # Express backend
```

## Prerequisites
- Node.js (v18+ recommended)
- npm
- MongoDB (local or Atlas)

## Backend Setup
1. Go to the backend folder:
   ```bash
   cd /workspace/server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables in `.env`:
   ```env
   MONGO_URI=mongodb://localhost:27017/meet
   JWT_SECRET=supersecretkey
   PORT=5000
   ```
4. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend runs on [http://localhost:5000](http://localhost:5000)

## Frontend Setup
1. Go to the frontend folder:
   ```bash
   cd /workspace/client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React app:
   ```bash
   npm start
   ```
   The frontend runs on [http://localhost:3000](http://localhost:3000)

## Usage
- Open the frontend in your browser.
- Sign up or log in.
- Create a new meeting or join with a code.
- Share the meeting URL with others to join.
- Use video, audio, and chat features in the meeting room.

## Extending
- Add more features (screen sharing, recording, etc.)
- Deploy to cloud (Heroku, Vercel, etc.)
- Secure with HTTPS and production best practices

---

**This is a starter template. The core backend and frontend are scaffolded. Continue development to add authentication, meeting logic, and WebRTC integration.**