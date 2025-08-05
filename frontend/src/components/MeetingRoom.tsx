import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import socketService from '../services/socket';
import useWebRTC from '../hooks/useWebRTC';
import VideoPlayer from './VideoPlayer';
import ChatPanel from './ChatPanel';
import ControlPanel from './ControlPanel';
import { getRoomDetails, updateMeetingHistory } from '../services/api';

const Container = styled.div`
  display: flex;
  height: 100vh;
  background: #1a1a1a;
`;

const MainContent = styled.div<{ showChat: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  width: ${props => props.showChat ? 'calc(100% - 350px)' : '100%'};
`;

const Header = styled.div`
  background: #2d2d2d;
  padding: 15px 20px;
  color: white;
  display: flex;
  justify-content: between;
  align-items: center;
  border-bottom: 1px solid #444;
`;

const RoomInfo = styled.div`
  flex: 1;
`;

const RoomName = styled.h2`
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
`;

const RoomId = styled.p`
  margin: 5px 0 0 0;
  font-size: 0.9rem;
  color: #aaa;
`;

const ParticipantCount = styled.div`
  background: #667eea;
  color: white;
  padding: 5px 12px;
  border-radius: 15px;
  font-size: 0.9rem;
  font-weight: 500;
`;

const VideoGrid = styled.div<{ participantCount: number }>`
  flex: 1;
  display: grid;
  gap: 10px;
  padding: 20px;
  grid-template-columns: ${props => {
    if (props.participantCount === 1) return '1fr';
    if (props.participantCount === 2) return '1fr 1fr';
    if (props.participantCount <= 4) return '1fr 1fr';
    if (props.participantCount <= 6) return '1fr 1fr 1fr';
    return '1fr 1fr 1fr 1fr';
  }};
  grid-template-rows: ${props => {
    if (props.participantCount <= 2) return '1fr';
    if (props.participantCount <= 4) return '1fr 1fr';
    if (props.participantCount <= 6) return '1fr 1fr';
    return 'repeat(auto-fit, minmax(200px, 1fr))';
  }};
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #1a1a1a;
  color: white;
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 4px solid #333;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: #1a1a1a;
  color: white;
  text-align: center;
  padding: 20px;
`;

const ErrorMessage = styled.p`
  font-size: 1.1rem;
  margin-bottom: 20px;
  color: #ff6b6b;
`;

const BackButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  
  &:hover {
    background: #5a6fd8;
  }
`;

interface ChatMessage {
  message: string;
  userName: string;
  timestamp: string;
  socketId: string;
}

const MeetingRoom: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  
  const [roomName, setRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  
  const userId = localStorage.getItem('userId') || '';
  const userName = localStorage.getItem('userName') || '';

  const {
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
  } = useWebRTC({ roomId: roomId!, userId, userName });

  useEffect(() => {
    if (!roomId || !userId || !userName) {
      setError('Missing required information. Please start from home page.');
      setIsLoading(false);
      return;
    }

    const initializeRoom = async () => {
      try {
        // Get room details
        const roomResponse = await getRoomDetails(roomId);
        if (!roomResponse.success) {
          throw new Error('Room not found');
        }
        
        setRoomName(roomResponse.room.roomName);

        // Connect to socket
        socketService.connect();
        
        // Initialize media stream
        await initializeLocalStream();
        
        // Join the room
        socketService.joinRoom(roomId, userId, userName);
        
        // Update meeting history
        await updateMeetingHistory(userId, roomId, roomResponse.room.roomName, 'join');
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error initializing room:', error);
        setError(error instanceof Error ? error.message : 'Failed to join room');
        setIsLoading(false);
      }
    };

    initializeRoom();

    // Cleanup function
    return () => {
      if (userId && roomId && roomName) {
        updateMeetingHistory(userId, roomId, roomName, 'leave').catch(console.error);
      }
      socketService.disconnect();
    };
  }, [roomId, userId, userName, initializeLocalStream, roomName]);

  useEffect(() => {
    // Set up chat message listener
    socketService.onChatMessage((data: ChatMessage) => {
      setChatMessages(prev => [...prev, data]);
    });

    // Set up participant tracking
    socketService.onUserJoined((data) => {
      setParticipants(prev => [...prev, data.userName]);
    });

    socketService.onUserLeft((data) => {
      setParticipants(prev => prev.filter(name => name !== data.userName));
    });

    socketService.onCurrentUsers((users) => {
      setParticipants(users.map(user => user.userName));
    });
  }, []);

  const handleSendMessage = (message: string) => {
    socketService.sendChatMessage(roomId!, message, userName);
    
    // Add to local messages
    setChatMessages(prev => [...prev, {
      message,
      userName,
      timestamp: new Date().toISOString(),
      socketId: 'local'
    }]);
  };

  const handleLeaveRoom = () => {
    navigate('/');
  };

  const handleToggleChat = () => {
    setShowChat(!showChat);
  };

  if (isLoading) {
    return (
      <LoadingContainer>
        <LoadingSpinner />
        <h2>Joining room...</h2>
        <p>Setting up your video connection</p>
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <ErrorContainer>
        <h2>Unable to join room</h2>
        <ErrorMessage>{error}</ErrorMessage>
        <BackButton onClick={() => navigate('/')}>
          Back to Home
        </BackButton>
      </ErrorContainer>
    );
  }

  const totalParticipants = participants.length + 1; // +1 for current user

  return (
    <Container>
      <MainContent showChat={showChat}>
        <Header>
          <RoomInfo>
            <RoomName>{roomName}</RoomName>
            <RoomId>Room ID: {roomId}</RoomId>
          </RoomInfo>
          <ParticipantCount>
            {totalParticipants} participant{totalParticipants !== 1 ? 's' : ''}
          </ParticipantCount>
        </Header>

        <VideoGrid participantCount={totalParticipants}>
          {/* Local video */}
          <VideoPlayer
            ref={localVideoRef}
            userName={userName}
            isLocal={true}
            isMuted={true}
            isAudioEnabled={isAudioEnabled}
            isVideoEnabled={isVideoEnabled}
            isScreenSharing={isScreenSharing}
          />
          
          {/* Remote videos */}
          {Array.from(peers.values()).map((peer) => (
            <VideoPlayer
              key={peer.socketId}
              stream={peer.stream}
              userName={peer.userName}
              isLocal={false}
              isMuted={false}
              isAudioEnabled={true}
              isVideoEnabled={true}
              isScreenSharing={false}
            />
          ))}
        </VideoGrid>

        <ControlPanel
          isAudioEnabled={isAudioEnabled}
          isVideoEnabled={isVideoEnabled}
          isScreenSharing={isScreenSharing}
          showChat={showChat}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onStartScreenShare={startScreenShare}
          onStopScreenShare={stopScreenShare}
          onToggleChat={handleToggleChat}
          onLeaveRoom={handleLeaveRoom}
        />
      </MainContent>

      {showChat && (
        <ChatPanel
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onClose={() => setShowChat(false)}
        />
      )}
    </Container>
  );
};

export default MeetingRoom;