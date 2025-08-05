import React, { forwardRef, useEffect, useRef } from 'react';
import styled from 'styled-components';

const VideoContainer = styled.div`
  position: relative;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  aspect-ratio: 16/9;
  min-height: 200px;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Overlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const UserName = styled.span`
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
`;

const StatusIndicators = styled.div`
  display: flex;
  gap: 8px;
`;

const StatusIcon = styled.div<{ isActive: boolean; type: 'audio' | 'video' | 'screen' }>`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  
  ${props => {
    if (props.type === 'audio') {
      return props.isActive
        ? 'background: #4caf50; color: white;'
        : 'background: #f44336; color: white;';
    }
    if (props.type === 'video') {
      return props.isActive
        ? 'background: #2196f3; color: white;'
        : 'background: #9e9e9e; color: white;';
    }
    if (props.type === 'screen') {
      return props.isActive
        ? 'background: #ff9800; color: white;'
        : 'display: none;';
    }
  }}
`;

const NoVideoPlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
`;

const Avatar = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 10px;
`;

const NoVideoText = styled.p`
  font-size: 1rem;
  opacity: 0.9;
  margin: 0;
`;

interface VideoPlayerProps {
  stream?: MediaStream;
  userName: string;
  isLocal: boolean;
  isMuted: boolean;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isScreenSharing: boolean;
}

const VideoPlayer = forwardRef<HTMLVideoElement, VideoPlayerProps>(
  ({ stream, userName, isLocal, isMuted, isAudioEnabled, isVideoEnabled, isScreenSharing }, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const internalRef = ref || videoRef;

    useEffect(() => {
      if (stream && internalRef && 'current' in internalRef && internalRef.current) {
        internalRef.current.srcObject = stream;
      }
    }, [stream, internalRef]);

    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    };

    return (
      <VideoContainer>
        {isVideoEnabled && (stream || isLocal) ? (
          <Video
            ref={internalRef}
            autoPlay
            playsInline
            muted={isMuted}
          />
        ) : (
          <NoVideoPlaceholder>
            <Avatar>{getInitials(userName)}</Avatar>
            <NoVideoText>{userName}</NoVideoText>
            {!isVideoEnabled && <NoVideoText>Camera off</NoVideoText>}
          </NoVideoPlaceholder>
        )}
        
        <Overlay>
          <UserName>
            {userName} {isLocal && '(You)'}
          </UserName>
          
          <StatusIndicators>
            <StatusIcon isActive={isAudioEnabled} type="audio">
              {isAudioEnabled ? '🎤' : '🔇'}
            </StatusIcon>
            <StatusIcon isActive={isVideoEnabled} type="video">
              {isVideoEnabled ? '📹' : '📷'}
            </StatusIcon>
            {isScreenSharing && (
              <StatusIcon isActive={true} type="screen">
                🖥️
              </StatusIcon>
            )}
          </StatusIndicators>
        </Overlay>
      </VideoContainer>
    );
  }
);

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;