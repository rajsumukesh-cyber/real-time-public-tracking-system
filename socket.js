import { io } from 'socket.io-client';

let socket = null;

// Creates (or returns the existing) authenticated socket connection.
export const getSocket = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  if (!socket) {
    socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      autoConnect: false,
    });
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
