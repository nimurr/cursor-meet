# Video Meet (MERN Stack)

A lightweight Google-Meet-style video conferencing web app built with MongoDB (future persistence), Express, React, and Node.js. It leverages WebRTC (via `simple-peer`) for real-time audio/video communication and Socket.IO for signaling between peers.

---

## Features

1. Create a new meeting with a single click
2. Join an existing meeting via Room ID link
3. Peer-to-peer **group** video & audio powered by WebRTC
4. Responsive grid layout for participant videos
5. Clean, minimal UI built with vanilla CSS (easy to theme)

> **Note**: For simplicity the current version keeps room/participant state in-memory on the server. It works great for development and small deployments. To make it production-ready you can plug in MongoDB or Redis for persistent/clustered room management.

---

## Project Structure

```
/ (workspace root)
│
├── server/              ← Express + Socket.IO backend
│   ├── index.js
│   └── package.json
│
├── client/              ← React + Vite frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── styles.css
│       ├── components/
│       │   └── Video.jsx
│       └── pages/
│           ├── Landing.jsx
│           └── Room.jsx
│
└── README.md            ← This file
```

---

## Prerequisites

• **Node.js ≥ 16** and **npm** installed on your machine.

---

## Quick Start (Local Development)

1. **Clone / open** this repository in your dev environment.
2. **Install server dependencies**:
   ```bash
   cd server
   npm install
   ```
3. **Install client dependencies** (in a new terminal tab):
   ```bash
   cd client
   npm install
   ```
4. **Run the backend** (port `5000` by default):
   ```bash
   cd server
   npm run dev   # hot-reload via nodemon
   ```
5. **Run the frontend** (port `3000` by default):
   ```bash
   cd client
   npm run dev
   ```
6. Open **http://localhost:3000** in your browser. Create a meeting and share the URL with a friend on the same network (or deploy the server online) to start a call!

---

## Environment Variables

| App        | File        | Key               | Default                 | Description                         |
|------------|-------------|-------------------|-------------------------|-------------------------------------|
| **Server** | n/a         | `PORT`            | `5000`                  | Express listening port              |
| **Client** | `.env`      | `VITE_SERVER_URL` | `http://localhost:5000` | Socket.IO backend base URL          |

Client already falls back to `http://localhost:5000` if the env var is missing, so `.env` is optional for local dev.

---

## Deployment Guide

1. **Build the React app**:
   ```bash
   cd client
   npm run build # output in client/dist
   ```
2. **Serve static files from Express** (optional):
   Copy the generated `dist` folder into `server/public` and add the following to `server/index.js` _before_ the route handlers:
   ```js
   import path from "path";
   const __dirname = path.resolve();
   app.use(express.static(path.join(__dirname, "public")));

   app.get("*", (_req, res) => {
     res.sendFile(path.join(__dirname, "public", "index.html"));
   });
   ```
3. **Provision HTTPS**: WebRTC requires HTTPS in production. Use Let’s Encrypt certificates (or a reverse proxy like Nginx) to terminate TLS.
4. **Scale**: For multi-server deployments you’ll need a Socket.IO adapter (Redis) to sync events across instances.

---

## Extending the App

• **Screen-sharing**: Integrate `getDisplayMedia()` and send display streams over existing peers.
• **Chat & reactions**: Add datachannels via `simple-peer` or a separate Socket.IO namespace.
• **Authentication**: Protect rooms with JWT or social login.
• **Database**: Persist room history, participants, and settings in MongoDB.

---

## Troubleshooting

1. **Camera/Mic blocked** ➜ Check browser permission prompt.
2. **Blank video** ➜ Verify both peers are over HTTPS or `localhost` and ports 3000/5000 are reachable.
3. **Multiple participants** ➜ The current design connects every peer to every other peer (mesh). Large rooms may stress bandwidth; consider using an SFU like LiveKit/mediasoup for scalability.

---

## License

MIT © 2024 Your Name