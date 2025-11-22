// WebSocket Configuration for Real-time Updates - TURN 3 ENHANCEMENT
const socketIO = require('socket.io');

let io;

const initializeWebSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5000',
      credentials: true
    }
  });

  io.on('connection', (socket) => {
    console.log(`[WebSocket] User connected: ${socket.id}`);

    // Join user to personal room
    socket.on('join-user', (userId) => {
      socket.join(`user-${userId}`);
      console.log(`[WebSocket] User ${userId} joined personal room`);
    });

    // Join tender room (for real-time bid updates)
    socket.on('join-tender', (tenderId) => {
      socket.join(`tender-${tenderId}`);
      console.log(`[WebSocket] User joined tender ${tenderId} room`);
    });

    // Broadcast new offer
    socket.on('new-offer', (data) => {
      io.to(`tender-${data.tenderId}`).emit('offer-created', {
        tenderId: data.tenderId,
        offerId: data.offerId,
        supplier: data.supplier,
        price: data.price,
        timestamp: new Date()
      });
    });

    // Broadcast tender status update
    socket.on('tender-status-changed', (data) => {
      io.to(`tender-${data.tenderId}`).emit('tender-updated', {
        tenderId: data.tenderId,
        status: data.status,
        timestamp: new Date()
      });
    });

    // Broadcast message notification
    socket.on('new-message', (data) => {
      io.to(`user-${data.recipientId}`).emit('message-received', {
        senderId: data.senderId,
        message: data.message,
        timestamp: new Date()
      });
    });

    // Broadcast rating update
    socket.on('new-rating', (data) => {
      io.to(`user-${data.supplierId}`).emit('rating-updated', {
        rating: data.rating,
        reviewer: data.reviewer,
        timestamp: new Date()
      });
    });

    socket.on('disconnect', () => {
      console.log(`[WebSocket] User disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => io;

module.exports = {
  initializeWebSocket,
  getIO
};
