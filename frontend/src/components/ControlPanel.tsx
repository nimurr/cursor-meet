import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  background: #2d2d2d;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  border-top: 1px solid #444;
`;

const ControlButton = styled.button<{ isActive?: boolean; variant?: 'danger' | 'warning' }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  
  ${props => {
    if (props.variant === 'danger') {
      return `
        background: #f44336;
        color: white;
        &:hover {
          background: #d32f2f;
          transform: scale(1.1);
        }
      `;
    }
    if (props.variant === 'warning') {
      return `
        background: #ff9800;
        color: white;
        &:hover {
          background: #f57c00;
          transform: scale(1.1);
        }
      `;
    }
    if (props.isActive) {
      return `
        background: #4caf50;
        color: white;
        &:hover {
          background: #45a049;
          transform: scale(1.1);
        }
      `;
    }
    return `
      background: #666;
      color: white;
      &:hover {
        background: #777;
        transform: scale(1.1);
      }
    `;
  }}
`;

const ChatButton = styled(ControlButton)<{ hasNotification?: boolean }>`
  position: relative;
  
  ${props => props.hasNotification && `
    &::after {
      content: '';
      position: absolute;
      top: 5px;
      right: 5px;
      width: 10px;
      height: 10px;
      background: #ff4444;
      border-radius: 50%;
      border: 2px solid #2d2d2d;
    }
  `}
`;

const ControlGroup = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const Divider = styled.div`
  width: 1px;
  height: 40px;
  background: #444;
  margin: 0 10px;
`;

const RoomInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  margin: 0 20px;
`;

const RoomIdText = styled.span`
  color: #aaa;
  font-size: 0.8rem;
  font-family: monospace;
`;

const CopyButton = styled.button`
  background: none;
  border: 1px solid #666;
  color: #aaa;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.7rem;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #888;
    color: #ccc;
  }
`;

interface ControlPanelProps {
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
  showChat: boolean;
  onToggleAudio: () => void;
  onToggleVideo: () => void;
  onStartScreenShare: () => void;
  onStopScreenShare: () => void;
  onToggleChat: () => void;
  onLeaveRoom: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  isAudioEnabled,
  isVideoEnabled,
  isScreenSharing,
  showChat,
  onToggleAudio,
  onToggleVideo,
  onStartScreenShare,
  onStopScreenShare,
  onToggleChat,
  onLeaveRoom,
}) => {
  const copyRoomId = () => {
    const roomId = window.location.pathname.split('/').pop();
    if (roomId) {
      navigator.clipboard.writeText(roomId);
      // You could add a toast notification here
    }
  };

  return (
    <Container>
      <ControlGroup>
        <ControlButton
          isActive={isAudioEnabled}
          onClick={onToggleAudio}
          title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
        >
          {isAudioEnabled ? '🎤' : '🔇'}
        </ControlButton>
        
        <ControlButton
          isActive={isVideoEnabled}
          onClick={onToggleVideo}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {isVideoEnabled ? '📹' : '📷'}
        </ControlButton>
      </ControlGroup>

      <Divider />

      <ControlGroup>
        <ControlButton
          isActive={isScreenSharing}
          variant={isScreenSharing ? 'warning' : undefined}
          onClick={isScreenSharing ? onStopScreenShare : onStartScreenShare}
          title={isScreenSharing ? 'Stop screen sharing' : 'Start screen sharing'}
        >
          🖥️
        </ControlButton>
        
        <ChatButton
          isActive={showChat}
          onClick={onToggleChat}
          title={showChat ? 'Hide chat' : 'Show chat'}
        >
          💬
        </ChatButton>
      </ControlGroup>

      <Divider />

      <RoomInfo>
        <RoomIdText>
          Room ID: {window.location.pathname.split('/').pop()}
        </RoomIdText>
        <CopyButton onClick={copyRoomId} title="Copy room ID">
          Copy
        </CopyButton>
      </RoomInfo>

      <Divider />

      <ControlButton
        variant="danger"
        onClick={onLeaveRoom}
        title="Leave room"
      >
        📞
      </ControlButton>
    </Container>
  );
};

export default ControlPanel;