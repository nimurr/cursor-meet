import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;

  connect(serverPath: string = 'http://localhost:5000'): Socket {
    this.socket = io(serverPath);
    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Room methods
  joinRoom(roomId: string, userId: string, userName: string): void {
    if (this.socket) {
      this.socket.emit('join-room', { roomId, userId, userName });
    }
  }

  leaveRoom(roomId: string): void {
    if (this.socket) {
      this.socket.emit('leave-room', { roomId });
    }
  }

  // WebRTC signaling methods
  sendOffer(roomId: string, targetSocketId: string, offer: RTCSessionDescriptionInit): void {
    if (this.socket) {
      this.socket.emit('offer', { roomId, targetSocketId, offer });
    }
  }

  sendAnswer(roomId: string, targetSocketId: string, answer: RTCSessionDescriptionInit): void {
    if (this.socket) {
      this.socket.emit('answer', { roomId, targetSocketId, answer });
    }
  }

  sendIceCandidate(roomId: string, targetSocketId: string, candidate: RTCIceCandidate): void {
    if (this.socket) {
      this.socket.emit('ice-candidate', { roomId, targetSocketId, candidate });
    }
  }

  // Chat methods
  sendChatMessage(roomId: string, message: string, userName: string): void {
    if (this.socket) {
      this.socket.emit('chat-message', { roomId, message, userName });
    }
  }

  // Media control methods
  toggleAudio(roomId: string, isAudioEnabled: boolean): void {
    if (this.socket) {
      this.socket.emit('toggle-audio', { roomId, isAudioEnabled });
    }
  }

  toggleVideo(roomId: string, isVideoEnabled: boolean): void {
    if (this.socket) {
      this.socket.emit('toggle-video', { roomId, isVideoEnabled });
    }
  }

  startScreenShare(roomId: string): void {
    if (this.socket) {
      this.socket.emit('start-screen-share', { roomId });
    }
  }

  stopScreenShare(roomId: string): void {
    if (this.socket) {
      this.socket.emit('stop-screen-share', { roomId });
    }
  }

  // Event listeners
  onUserJoined(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-joined', callback);
    }
  }

  onUserLeft(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-left', callback);
    }
  }

  onCurrentUsers(callback: (users: any[]) => void): void {
    if (this.socket) {
      this.socket.on('current-users', callback);
    }
  }

  onOffer(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('offer', callback);
    }
  }

  onAnswer(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('answer', callback);
    }
  }

  onIceCandidate(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('ice-candidate', callback);
    }
  }

  onChatMessage(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('chat-message', callback);
    }
  }

  onUserAudioToggle(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-audio-toggle', callback);
    }
  }

  onUserVideoToggle(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-video-toggle', callback);
    }
  }

  onUserScreenShareStart(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-screen-share-start', callback);
    }
  }

  onUserScreenShareStop(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on('user-screen-share-stop', callback);
    }
  }
}

export default new SocketService();