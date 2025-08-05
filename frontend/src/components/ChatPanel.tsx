import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 350px;
  background: #2d2d2d;
  border-left: 1px solid #444;
  display: flex;
  flex-direction: column;
  height: 100vh;
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid #444;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h3`
  color: white;
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #aaa;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  
  &:hover {
    background: #444;
    color: white;
  }
`;

const MessagesContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: #1a1a1a;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #666;
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: #888;
  }
`;

const Message = styled.div<{ isOwn: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => props.isOwn ? 'flex-end' : 'flex-start'};
`;

const MessageBubble = styled.div<{ isOwn: boolean }>`
  max-width: 80%;
  padding: 12px 16px;
  border-radius: 18px;
  word-wrap: break-word;
  
  ${props => props.isOwn ? `
    background: #667eea;
    color: white;
    border-bottom-right-radius: 4px;
  ` : `
    background: #404040;
    color: white;
    border-bottom-left-radius: 4px;
  `}
`;

const MessageInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
  font-size: 0.75rem;
  color: #aaa;
`;

const UserName = styled.span`
  font-weight: 600;
`;

const Timestamp = styled.span`
  opacity: 0.7;
`;

const MessageText = styled.p`
  margin: 0;
  line-height: 1.4;
`;

const InputContainer = styled.form`
  padding: 20px;
  border-top: 1px solid #444;
  display: flex;
  gap: 10px;
`;

const MessageInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid #555;
  border-radius: 25px;
  background: #1a1a1a;
  color: white;
  font-size: 0.9rem;
  outline: none;
  
  &:focus {
    border-color: #667eea;
  }
  
  &::placeholder {
    color: #888;
  }
`;

const SendButton = styled.button`
  background: #667eea;
  color: white;
  border: none;
  border-radius: 50%;
  width: 44px;
  height: 44px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  transition: all 0.2s ease;
  
  &:hover:not(:disabled) {
    background: #5a6fd8;
    transform: scale(1.05);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #888;
  text-align: center;
  padding: 40px 20px;
`;

const EmptyIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
`;

const EmptyText = styled.p`
  margin: 0;
  font-size: 0.9rem;
`;

interface ChatMessage {
  message: string;
  userName: string;
  timestamp: string;
  socketId: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ messages, onSendMessage, onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserName = localStorage.getItem('userName') || '';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInputValue('');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  };

  return (
    <Container>
      <Header>
        <Title>Chat</Title>
        <CloseButton onClick={onClose} title="Close chat">
          ✕
        </CloseButton>
      </Header>

      <MessagesContainer>
        {messages.length === 0 ? (
          <EmptyState>
            <EmptyIcon>💬</EmptyIcon>
            <EmptyText>No messages yet</EmptyText>
            <EmptyText>Start the conversation!</EmptyText>
          </EmptyState>
        ) : (
          messages.map((message, index) => {
            const isOwn = message.userName === currentUserName;
            
            return (
              <Message key={index} isOwn={isOwn}>
                {!isOwn && (
                  <MessageInfo>
                    <UserName>{message.userName}</UserName>
                    <Timestamp>{formatTime(message.timestamp)}</Timestamp>
                  </MessageInfo>
                )}
                <MessageBubble isOwn={isOwn}>
                  <MessageText>{message.message}</MessageText>
                </MessageBubble>
                {isOwn && (
                  <MessageInfo>
                    <Timestamp>{formatTime(message.timestamp)}</Timestamp>
                  </MessageInfo>
                )}
              </Message>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </MessagesContainer>

      <InputContainer onSubmit={handleSubmit}>
        <MessageInput
          type="text"
          placeholder="Type a message..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          maxLength={500}
        />
        <SendButton
          type="submit"
          disabled={!inputValue.trim()}
          title="Send message"
        >
          ➤
        </SendButton>
      </InputContainer>
    </Container>
  );
};

export default ChatPanel;