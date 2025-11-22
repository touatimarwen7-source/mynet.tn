// WebSocket Hook for Real-time Updates - TURN 3 OPTIONAL
import { useEffect, useState, useCallback } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Initialize WebSocket connection
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5
    });

    // Connection events
    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected');
      setConnected(true);

      // Join user room
      const userId = localStorage.getItem('userId');
      if (userId) {
        newSocket.emit('join-user', userId);
      }
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setConnected(false);
    });

    // Listen for notifications
    newSocket.on('offer-created', (data) => {
      setNotifications(prev => [...prev, {
        type: 'offer',
        message: `New offer from ${data.supplier} for ${data.price}`,
        data
      }]);
    });

    newSocket.on('tender-updated', (data) => {
      setNotifications(prev => [...prev, {
        type: 'tender',
        message: `Tender status changed to ${data.status}`,
        data
      }]);
    });

    newSocket.on('message-received', (data) => {
      setNotifications(prev => [...prev, {
        type: 'message',
        message: `New message from ${data.senderId}`,
        data
      }]);
    });

    newSocket.on('rating-updated', (data) => {
      setNotifications(prev => [...prev, {
        type: 'rating',
        message: `You received a ${data.rating}-star rating from ${data.reviewer}`,
        data
      }]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  // Emit functions
  const joinTender = useCallback((tenderId) => {
    if (socket) {
      socket.emit('join-tender', tenderId);
    }
  }, [socket]);

  const sendOffer = useCallback((tenderId, offer) => {
    if (socket) {
      socket.emit('new-offer', { tenderId, ...offer });
    }
  }, [socket]);

  const updateTenderStatus = useCallback((tenderId, status) => {
    if (socket) {
      socket.emit('tender-status-changed', { tenderId, status });
    }
  }, [socket]);

  const sendMessage = useCallback((recipientId, message) => {
    if (socket) {
      socket.emit('new-message', { recipientId, message });
    }
  }, [socket]);

  const broadcastRating = useCallback((supplierId, rating, reviewer) => {
    if (socket) {
      socket.emit('new-rating', { supplierId, rating, reviewer });
    }
  }, [socket]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    socket,
    connected,
    notifications,
    joinTender,
    sendOffer,
    updateTenderStatus,
    sendMessage,
    broadcastRating,
    clearNotifications
  };
};

export default useWebSocket;
