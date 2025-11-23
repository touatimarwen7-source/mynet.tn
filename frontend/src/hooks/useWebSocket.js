/**
 * Enhanced WebSocket Hook for Real-time Updates
 * Provides real-time notifications and bidirectional communication
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import io from 'socket.io-client';

// Get socket URL from environment or use default
const getSocketURL = () => {
  // Get domain from environment
  const domain = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const port = window.location.port || (window.location.protocol === 'https:' ? 443 : 3000);
  return import.meta.env.VITE_SOCKET_URL || `http://${domain}:3000`;
};

export const useWebSocket = (userId) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  useEffect(() => {
    if (!userId) return;

    try {
      // Initialize WebSocket connection
      const token = localStorage.getItem('token');
      const newSocket = io(getSocketURL(), {
        auth: {
          token
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: maxReconnectAttempts,
        transports: ['websocket', 'polling']
      });

      socketRef.current = newSocket;

      // ========== CONNECTION EVENTS ==========

      newSocket.on('connect', () => {
        // Debug: removed;
        setConnected(true);
        reconnectAttempts.current = 0;

        // Join user personal room
        if (userId) {
          newSocket.emit('join-user', userId);
        }
      });

      newSocket.on('disconnect', () => {
        // Debug: removed;
        setConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        // Error tracked;
        reconnectAttempts.current += 1;
      });

      // ========== OFFER EVENTS ==========

      newSocket.on('offer-created', (data) => {
        // Debug: removed;
        addNotification({
          type: 'offer',
          title: 'Nouvelle Offre',
          message: `Offre de ${data.supplierName || 'Fournisseur'} - ${data.price} ${data.currency}`,
          data,
          icon: '📦'
        });
        setLastUpdate(data.timestamp);
      });

      newSocket.on('offer-status-updated', (data) => {
        // Debug: removed;
        addNotification({
          type: 'offer-status',
          title: 'Statut de l\'Offre Modifié',
          message: `Statut: ${data.status}`,
          data,
          icon: '📋'
        });
        setLastUpdate(data.timestamp);
      });

      // ========== TENDER EVENTS ==========

      newSocket.on('tender-status-changed', (data) => {
        // Debug: removed;
        addNotification({
          type: 'tender',
          title: 'Appel d\'Offres Modifié',
          message: `Statut: ${data.status}`,
          data,
          icon: '🎯'
        });
        setLastUpdate(data.timestamp);
      });

      newSocket.on('tender-updated', (data) => {
        // Debug: removed;
        addNotification({
          type: 'tender-update',
          title: 'Appel d\'Offres Mis à Jour',
          message: `${data.field} a été modifié`,
          data,
          icon: '📝'
        });
        setLastUpdate(data.timestamp);
      });

      // ========== MESSAGE EVENTS ==========

      newSocket.on('message-received', (data) => {
        // Debug: removed;
        addNotification({
          type: 'message',
          title: 'Nouveau Message',
          message: `De: ${data.senderName || 'Utilisateur'}`,
          data,
          icon: '💬'
        });
        setLastUpdate(data.timestamp);
      });

      newSocket.on('user-typing', (data) => {
        // Debug: removed;
      });

      newSocket.on('user-stop-typing', (data) => {
        // Debug: removed;
      });

      // ========== RATING & REVIEW EVENTS ==========

      newSocket.on('rating-received', (data) => {
        // Debug: removed;
        addNotification({
          type: 'rating',
          title: 'Nouvelle Évaluation',
          message: `${data.rating}⭐ de ${data.reviewer}`,
          data,
          icon: '⭐'
        });
        setLastUpdate(data.timestamp);
      });

      newSocket.on('review-received', (data) => {
        // Debug: removed;
        addNotification({
          type: 'review',
          title: 'Nouvel Avis',
          message: `${data.title} - ${data.reviewer}`,
          data,
          icon: '✍️'
        });
        setLastUpdate(data.timestamp);
      });

      // ========== NOTIFICATION EVENTS ==========

      newSocket.on('notification', (data) => {
        // Debug: removed;
        addNotification({
          type: 'notification',
          title: data.title,
          message: data.message,
          data,
          icon: data.icon || '🔔'
        });
        setLastUpdate(data.timestamp);
      });

      newSocket.on('critical-alert', (data) => {
        // Debug: removed;
        addNotification({
          type: 'alert',
          title: data.title,
          message: data.message,
          data,
          icon: '🚨',
          severity: 'critical'
        });
        setLastUpdate(data.timestamp);
      });

      // ========== STATISTICS EVENTS ==========

      newSocket.on('statistics-updated', (data) => {
        // Debug: removed;
        setLastUpdate(data.timestamp);
      });

      // ========== USER STATUS EVENTS ==========

      newSocket.on('user-online', (data) => {
        // Debug: removed;
        setOnlineUsers(prev => new Set([...prev, data.userId]));
      });

      newSocket.on('user-offline', (data) => {
        // Debug: removed;
        setOnlineUsers(prev => {
          const updated = new Set(prev);
          updated.delete(data.userId);
          return updated;
        });
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) {
          newSocket.disconnect();
        }
      };
    } catch (error) {
      // Error tracked;
    }
  }, [userId]);

  // ========== HELPER FUNCTIONS ==========

  /**
   * Add notification to state
   */
  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const notificationWithId = { ...notification, id };
    
    setNotifications(prev => [...prev, notificationWithId]);

    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  }, []);

  /**
   * Remove notification
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // ========== EMIT FUNCTIONS ==========

  /**
   * Join tender room
   */
  const joinTender = useCallback((tenderId) => {
    if (socket) {
      socket.emit('join-tender', tenderId);
    }
  }, [socket]);

  /**
   * Leave tender room
   */
  const leaveTender = useCallback((tenderId) => {
    if (socket) {
      socket.emit('leave-tender', tenderId);
    }
  }, [socket]);

  /**
   * Send new offer
   */
  const sendOffer = useCallback((tenderId, offerData) => {
    if (socket) {
      socket.emit('new-offer', { tenderId, ...offerData });
    }
  }, [socket]);

  /**
   * Update tender status
   */
  const updateTenderStatus = useCallback((tenderId, status, changedBy) => {
    if (socket) {
      socket.emit('tender-status-changed', { tenderId, status, changedBy });
    }
  }, [socket]);

  /**
   * Send message
   */
  const sendMessage = useCallback((recipientId, message, senderName) => {
    if (socket) {
      socket.emit('new-message', { recipientId, message, senderName });
    }
  }, [socket]);

  /**
   * Emit typing indicator
   */
  const emitTyping = useCallback((recipientId, userId) => {
    if (socket) {
      socket.emit('user-typing', { recipientId, userId });
    }
  }, [socket]);

  /**
   * Emit stop typing
   */
  const emitStopTyping = useCallback((recipientId, userId) => {
    if (socket) {
      socket.emit('user-stop-typing', { recipientId, userId });
    }
  }, [socket]);

  /**
   * Send rating
   */
  const sendRating = useCallback((supplierId, rating, reviewer, comment) => {
    if (socket) {
      socket.emit('new-rating', { supplierId, rating, reviewer, comment });
    }
  }, [socket]);

  /**
   * Send review
   */
  const sendReview = useCallback((supplierId, title, content, reviewer) => {
    if (socket) {
      socket.emit('new-review', { supplierId, title, content, reviewer });
    }
  }, [socket]);

  /**
   * Send notification (admin)
   */
  const sendNotification = useCallback((recipientId, notification) => {
    if (socket) {
      socket.emit('send-notification', { userId: recipientId, ...notification });
    }
  }, [socket]);

  /**
   * Send alert (admin)
   */
  const sendAlert = useCallback((recipientId, alert) => {
    if (socket) {
      socket.emit('send-alert', { userId: recipientId, ...alert });
    }
  }, [socket]);

  return {
    socket,
    connected,
    notifications,
    onlineUsers,
    lastUpdate,
    addNotification,
    removeNotification,
    clearNotifications,
    joinTender,
    leaveTender,
    sendOffer,
    updateTenderStatus,
    sendMessage,
    emitTyping,
    emitStopTyping,
    sendRating,
    sendReview,
    sendNotification,
    sendAlert
  };
};

export default useWebSocket;
