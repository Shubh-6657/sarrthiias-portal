import { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuth } from './AuthContext';

const Ctx = createContext(null);

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!user || !token) return;
    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', { auth: { token } });
    socketRef.current = socket;
    socket.on('connect', () => console.log('Socket connected'));
    socket.on('notification', (n) => {
      toast.success(`🔔 ${n.title}: ${n.message}`, { duration: 5000 });
    });
    return () => socket.disconnect();
  }, [user]);

  return <Ctx.Provider value={socketRef}>{children}</Ctx.Provider>;
}

export const useSocket = () => useContext(Ctx);
