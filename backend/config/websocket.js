/**
 * WebSocket Configuration for Real-time Updates
 * Handles all socket.io setup and event routing
 */

const socketIO = require('socket.io');
const WebSocketEventsManager = require('../services/WebSocketEventsManager');

let io;
let eventsManager;

const initializeWebSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5000',
      credentials: true
    },
    transports: ['websocket', 'polling']
  });

  // Initialize Events Manager
  eventsManager = new WebSocketEventsManager(io);

  io.on('connection', (socket) => {
    // WebSocket connection established - tracked via eventsManager

    // ========== USER ROOM MANAGEMENT ==========

    /**
     * Join user personal room (for personal notifications)
     */
    socket.on('join-user', (userId) => {
      if (userId) {
        socket.join(`user-${userId}`);
        eventsManager.registerUserConnection(userId, socket.id);
        // User connection tracked by eventsManager
        
        // Emit user online status
        eventsManager.emitUserOnline(userId);
      }
    });

    /**
     * Join tender room (for tender-specific updates)
     */
    socket.on('join-tender', (tenderId) => {
      if (tenderId) {
        socket.join(`tender-${tenderId}`);
        // Room join tracked
      }
    });

    /**
     * Leave tender room
     */
    socket.on('leave-tender', (tenderId) => {
      if (tenderId) {
        socket.leave(`tender-${tenderId}`);
        // Room leave tracked
      }
    });

    // ========== OFFER EVENTS ==========

    /**
     * Broadcast new offer creation
     */
    socket.on('new-offer', (data) => {
      if (data.tenderId) {
        eventsManager.emitOfferCreated(data.tenderId, data);
        // Offer event handled by eventsManager
      }
    });

    /**
     * Broadcast offer status change
     */
    socket.on('offer-status-changed', (data) => {
      if (data.tenderId && data.offerId) {
        io.to(`tender-${data.tenderId}`).emit('offer-status-updated', {
          type: 'offer-status-updated',
          offerId: data.offerId,
          status: data.status,
          timestamp: new Date()
        });
        console.log(`[WebSocket] 📦 Offer ${data.offerId} status changed to ${data.status}`);
      }
    });

    // ========== TENDER EVENTS ==========

    /**
     * Broadcast tender status change
     */
    socket.on('tender-status-changed', (data) => {
      if (data.tenderId) {
        eventsManager.emitTenderStatusChanged(data.tenderId, data.status, data.changedBy);
        console.log(`[WebSocket] 🎯 Tender ${data.tenderId} status changed to ${data.status}`);
      }
    });

    /**
     * Broadcast tender update (any field)
     */
    socket.on('tender-updated', (data) => {
      if (data.tenderId) {
        eventsManager.emitTenderUpdated(data.tenderId, data);
        console.log(`[WebSocket] 🎯 Tender ${data.tenderId} updated: ${data.field}`);
      }
    });

    // ========== MESSAGE EVENTS ==========

    /**
     * Broadcast new message
     */
    socket.on('new-message', (data) => {
      if (data.recipientId) {
        eventsManager.emitNewMessage(data.recipientId, data);
        console.log(`[WebSocket] 💬 Message from ${data.senderId} to ${data.recipientId}`);
      }
    });

    /**
     * Broadcast typing indicator
     */
    socket.on('user-typing', (data) => {
      if (data.recipientId) {
        io.to(`user-${data.recipientId}`).emit('user-typing', {
          type: 'user-typing',
          userId: data.userId,
          timestamp: new Date()
        });
      }
    });

    /**
     * Broadcast typing stopped
     */
    socket.on('user-stop-typing', (data) => {
      if (data.recipientId) {
        io.to(`user-${data.recipientId}`).emit('user-stop-typing', {
          type: 'user-stop-typing',
          userId: data.userId,
          timestamp: new Date()
        });
      }
    });

    // ========== RATING & REVIEW EVENTS ==========

    /**
     * Broadcast new rating
     */
    socket.on('new-rating', (data) => {
      if (data.supplierId) {
        eventsManager.emitRatingReceived(data.supplierId, data);
        console.log(`[WebSocket] ⭐ New rating for supplier ${data.supplierId}`);
      }
    });

    /**
     * Broadcast new review
     */
    socket.on('new-review', (data) => {
      if (data.supplierId) {
        io.to(`user-${data.supplierId}`).emit('review-received', {
          type: 'review-received',
          reviewer: data.reviewer,
          title: data.title,
          content: data.content,
          timestamp: new Date()
        });
        console.log(`[WebSocket] ✍️  New review for supplier ${data.supplierId}`);
      }
    });

    // ========== NOTIFICATION EVENTS ==========

    /**
     * Send generic notification
     */
    socket.on('send-notification', (data) => {
      if (data.userId) {
        eventsManager.emitNotification(data.userId, data);
        // Notification event tracked by eventsManager
      }
    });

    /**
     * Send critical alert
     */
    socket.on('send-alert', (data) => {
      if (data.userId) {
        eventsManager.emitCriticalAlert(data.userId, data);
        // Alert event tracked by eventsManager
      }
    });

    // ========== STATISTICS EVENTS ==========

    /**
     * Broadcast statistics update
     */
    socket.on('statistics-update', (data) => {
      if (data.userId) {
        eventsManager.emitStatisticsUpdate(data.userId, data.stats);
        // Statistics update tracked by eventsManager
      }
    });

    // ========== CONNECTION MANAGEMENT ==========

    /**
     * Handle user disconnect with safe error handling
     */
    socket.on('disconnect', () => {
      try {
        // Find and remove user connection
        for (const [userId, connections] of eventsManager.userConnections) {
          if (connections.includes(socket.id)) {
            eventsManager.removeUserConnection(userId, socket.id);
            if (!eventsManager.isUserOnline(userId)) {
              eventsManager.emitUserOffline(userId);
            }
            break;
          }
        }
      } catch (e) {
        // Safely handle disconnect errors
      }
    });

    /**
     * Error handling with safe logging
     */
    socket.on('error', (error) => {
      try {
        // WebSocket error occurred - track safely
        if (typeof error === 'object' && error.message) {
          // Log error with limited context to prevent exposure
        }
      } catch (e) {
        // Silently handle error logging failures
      }
    });
  });

  return io;
};

/**
 * Get IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('WebSocket not initialized');
  }
  return io;
};

/**
 * Get Events Manager instance
 */
const getEventsManager = () => {
  if (!eventsManager) {
    throw new Error('WebSocket Events Manager not initialized');
  }
  return eventsManager;
};

module.exports = {
  initializeWebSocket,
  getIO,
  getEventsManager
};
