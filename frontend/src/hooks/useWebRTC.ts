import { useCallback, useEffect, useRef, useState } from 'react';
import socketService from '../services/socket';

interface Peer {
  socketId: string;
  userName: string;
  connection: RTCPeerConnection;
  stream?: MediaStream;
}

interface UseWebRTCProps {
  roomId: string;
  userId: string;
  userName: string;
}

const useWebRTC = ({ roomId, userId, userName }: UseWebRTCProps) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Map<string, Peer>>(new Map());
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const peersRef = useRef<Map<string, Peer>>(new Map());

  // ICE servers configuration
  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  };

  // Initialize local media stream
  const initializeLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw error;
    }
  }, []);

  // Create peer connection
  const createPeerConnection = useCallback((targetSocketId: string, targetUserName: string): RTCPeerConnection => {
    const peerConnection = new RTCPeerConnection(iceServers);

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    peerConnection.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setPeers(prevPeers => {
        const newPeers = new Map(prevPeers);
        const peer = newPeers.get(targetSocketId);
        if (peer) {
          peer.stream = remoteStream;
          newPeers.set(targetSocketId, peer);
        }
        return newPeers;
      });
    };

    // Handle ICE candidates
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socketService.sendIceCandidate(roomId, targetSocketId, event.candidate);
      }
    };

    // Store peer connection
    const peer: Peer = {
      socketId: targetSocketId,
      userName: targetUserName,
      connection: peerConnection,
    };

    setPeers(prevPeers => {
      const newPeers = new Map(prevPeers);
      newPeers.set(targetSocketId, peer);
      peersRef.current = newPeers;
      return newPeers;
    });

    return peerConnection;
  }, [localStream, roomId]);

  // Create offer
  const createOffer = useCallback(async (targetSocketId: string, targetUserName: string) => {
    const peerConnection = createPeerConnection(targetSocketId, targetUserName);
    
    try {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socketService.sendOffer(roomId, targetSocketId, offer);
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }, [createPeerConnection, roomId]);

  // Handle received offer
  const handleOffer = useCallback(async (callerSocketId: string, offer: RTCSessionDescriptionInit) => {
    const peer = peersRef.current.get(callerSocketId);
    if (!peer) return;

    try {
      await peer.connection.setRemoteDescription(offer);
      const answer = await peer.connection.createAnswer();
      await peer.connection.setLocalDescription(answer);
      socketService.sendAnswer(roomId, callerSocketId, answer);
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }, [roomId]);

  // Handle received answer
  const handleAnswer = useCallback(async (answererSocketId: string, answer: RTCSessionDescriptionInit) => {
    const peer = peersRef.current.get(answererSocketId);
    if (!peer) return;

    try {
      await peer.connection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }, []);

  // Handle received ICE candidate
  const handleIceCandidate = useCallback(async (senderSocketId: string, candidate: RTCIceCandidate) => {
    const peer = peersRef.current.get(senderSocketId);
    if (!peer) return;

    try {
      await peer.connection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
    }
  }, []);

  // Toggle audio
  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
        socketService.toggleAudio(roomId, audioTrack.enabled);
      }
    }
  }, [localStream, roomId]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
        socketService.toggleVideo(roomId, videoTrack.enabled);
      }
    }
  }, [localStream, roomId]);

  // Start screen sharing
  const startScreenShare = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // Replace video track for all peer connections
      const videoTrack = screenStream.getVideoTracks()[0];
      
      peersRef.current.forEach(peer => {
        const sender = peer.connection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      setIsScreenSharing(true);
      socketService.startScreenShare(roomId);

      // Handle screen share end
      videoTrack.onended = () => {
        stopScreenShare();
      };

    } catch (error) {
      console.error('Error starting screen share:', error);
    }
  }, [roomId]);

  // Stop screen sharing
  const stopScreenShare = useCallback(async () => {
    try {
      // Get camera stream back
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      const videoTrack = cameraStream.getVideoTracks()[0];

      // Replace video track for all peer connections
      peersRef.current.forEach(peer => {
        const sender = peer.connection.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack);
        }
      });

      // Update local video
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = cameraStream;
      }

      setLocalStream(cameraStream);
      setIsScreenSharing(false);
      socketService.stopScreenShare(roomId);

    } catch (error) {
      console.error('Error stopping screen share:', error);
    }
  }, [roomId]);

  // Handle user joined
  const handleUserJoined = useCallback((data: { userId: string; userName: string; socketId: string }) => {
    createOffer(data.socketId, data.userName);
  }, [createOffer]);

  // Handle user left
  const handleUserLeft = useCallback((data: { socketId: string }) => {
    setPeers(prevPeers => {
      const newPeers = new Map(prevPeers);
      const peer = newPeers.get(data.socketId);
      if (peer) {
        peer.connection.close();
        newPeers.delete(data.socketId);
      }
      peersRef.current = newPeers;
      return newPeers;
    });
  }, []);

  // Handle current users
  const handleCurrentUsers = useCallback((users: any[]) => {
    users.forEach(user => {
      createPeerConnection(user.socketId, user.userName);
    });
  }, [createPeerConnection]);

  // Setup socket event listeners
  useEffect(() => {
    socketService.onUserJoined(handleUserJoined);
    socketService.onUserLeft(handleUserLeft);
    socketService.onCurrentUsers(handleCurrentUsers);
    socketService.onOffer(({ offer, callerSocketId }) => {
      handleOffer(callerSocketId, offer);
    });
    socketService.onAnswer(({ answer, answererSocketId }) => {
      handleAnswer(answererSocketId, answer);
    });
    socketService.onIceCandidate(({ candidate, senderSocketId }) => {
      handleIceCandidate(senderSocketId, candidate);
    });

    return () => {
      // Cleanup event listeners would go here if socketService supported it
    };
  }, [handleUserJoined, handleUserLeft, handleCurrentUsers, handleOffer, handleAnswer, handleIceCandidate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Close all peer connections
      peersRef.current.forEach(peer => {
        peer.connection.close();
      });
      
      // Stop local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localStream]);

  return {
    localStream,
    peers,
    localVideoRef,
    isAudioEnabled,
    isVideoEnabled,
    isScreenSharing,
    initializeLocalStream,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
  };
};

export default useWebRTC;