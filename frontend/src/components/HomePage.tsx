import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { createRoom, createUser } from '../services/api';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
`;

const Card = styled.div`
  background: white;
  border-radius: 20px;
  padding: 40px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  text-align: center;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 10px;
  font-size: 2.5rem;
  font-weight: 700;
`;

const Subtitle = styled.p`
  color: #666;
  margin-bottom: 40px;
  font-size: 1.1rem;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const Input = styled.input`
  padding: 15px;
  border: 2px solid #e1e5e9;
  border-radius: 10px;
  font-size: 16px;
  transition: border-color 0.3s;

  &:focus {
    outline: none;
    border-color: #667eea;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 15px;
  margin-top: 20px;
`;

const Button = styled.button<{ primary?: boolean }>`
  flex: 1;
  padding: 15px 30px;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  ${props => props.primary ? `
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
    }
  ` : `
    background: #f8f9fa;
    color: #333;
    border: 2px solid #e1e5e9;
    
    &:hover {
      background: #e9ecef;
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  margin-top: 10px;
  padding: 10px;
  background: #f8d7da;
  border-radius: 5px;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled.div`
  color: #155724;
  margin-top: 10px;
  padding: 10px;
  background: #d4edda;
  border-radius: 5px;
  border: 1px solid #c3e6cb;
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  margin: 30px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e1e5e9;
  }
  
  span {
    margin: 0 20px;
    color: #666;
    font-weight: 500;
  }
`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userName.trim() || !roomName.trim()) {
      setError('Please enter both name and room name');
      return;
    }

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Create user
      const userResponse = await createUser(userName);
      if (!userResponse.success) {
        throw new Error('Failed to create user');
      }

      // Create room
      const roomResponse = await createRoom(roomName, userResponse.user.userId);
      if (!roomResponse.success) {
        throw new Error('Failed to create room');
      }

      setSuccess('Room created successfully! Redirecting...');
      
      // Store user data in localStorage
      localStorage.setItem('userId', userResponse.user.userId);
      localStorage.setItem('userName', userName);

      setTimeout(() => {
        navigate(`/room/${roomResponse.roomId}`);
      }, 1500);

    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = () => {
    if (!userName.trim()) {
      setError('Please enter your name');
      return;
    }

    // Store user name and navigate to join page
    localStorage.setItem('userName', userName);
    navigate('/join');
  };

  return (
    <Container>
      <Card>
        <Title>🎥 Meet Clone</Title>
        <Subtitle>Connect with others through high-quality video calls</Subtitle>
        
        <Form onSubmit={handleCreateRoom}>
          <Input
            type="text"
            placeholder="Enter your name"
            value={userName}
            onChange={(e) => setUserName(e.target.value)}
            required
          />
          
          <Input
            type="text"
            placeholder="Enter room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            required
          />
          
          <Button type="submit" primary disabled={isLoading}>
            {isLoading ? 'Creating Room...' : 'Create New Room'}
          </Button>
        </Form>

        <OrDivider>
          <span>OR</span>
        </OrDivider>

        <ButtonContainer>
          <Button onClick={handleJoinRoom} disabled={!userName.trim() || isLoading}>
            Join Existing Room
          </Button>
        </ButtonContainer>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
      </Card>
    </Container>
  );
};

export default HomePage;