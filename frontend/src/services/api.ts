import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface User {
  userId: string;
  userName: string;
  email?: string;
}

export interface Room {
  roomId: string;
  roomName: string;
  createdBy: string;
  participantCount?: number;
}

export interface CreateRoomResponse {
  success: boolean;
  roomId: string;
  roomName: string;
  message: string;
}

export interface JoinRoomResponse {
  success: boolean;
  room: Room;
}

export interface CreateUserResponse {
  success: boolean;
  user: User;
}

// Room API calls
export const createRoom = async (roomName: string, createdBy: string): Promise<CreateRoomResponse> => {
  const response = await api.post('/rooms/create', { roomName, createdBy });
  return response.data;
};

export const joinRoom = async (roomId: string): Promise<JoinRoomResponse> => {
  const response = await api.post('/rooms/join', { roomId });
  return response.data;
};

export const getRoomDetails = async (roomId: string): Promise<{ success: boolean; room: Room }> => {
  const response = await api.get(`/rooms/${roomId}`);
  return response.data;
};

export const endRoom = async (roomId: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/rooms/${roomId}/end`);
  return response.data;
};

// User API calls
export const createUser = async (userName: string, email?: string): Promise<CreateUserResponse> => {
  const response = await api.post('/users/create', { userName, email });
  return response.data;
};

export const getUser = async (userId: string): Promise<{ success: boolean; user: User }> => {
  const response = await api.get(`/users/${userId}`);
  return response.data;
};

export const updateMeetingHistory = async (
  userId: string, 
  roomId: string, 
  roomName: string, 
  action: 'join' | 'leave'
): Promise<{ success: boolean; message: string }> => {
  const response = await api.post(`/users/${userId}/meeting-history`, {
    roomId,
    roomName,
    action
  });
  return response.data;
};

export default api;