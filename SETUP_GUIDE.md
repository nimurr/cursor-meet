# 🚀 Quick Setup Guide

## Prerequisites
- Node.js (v16+)
- MongoDB (v4.4+)
- npm

## Installation (5 minutes)

### 1. Install Dependencies
```bash
npm install
npm run install-deps
```

### 2. Setup Environment
Create `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/google-meet-clone
JWT_SECRET=your-secret-key
NODE_ENV=development
```

### 3. Start MongoDB
```bash
# macOS (Homebrew)
brew services start mongodb/brew/mongodb-community

# Ubuntu/Debian
sudo systemctl start mongod

# Manual
mongod
```

### 4. Run Application
```bash
npm run dev
```

## Access
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000

## Quick Test
1. Open http://localhost:3000
2. Enter name: "Test User"
3. Enter room name: "Test Room"
4. Click "Create New Room"
5. Copy room ID and test in new browser tab

## Troubleshooting
- **Port conflicts**: Change PORT in backend/.env
- **MongoDB errors**: Check if service is running
- **Permission errors**: Grant camera/mic permissions
- **Build failures**: Clear npm cache and reinstall

Need help? Check the full [README.md](README.md) for detailed documentation.