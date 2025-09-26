const chatSocketHandler = (io, socket) => {
  // Join user's personal room (for direct message delivery)
  socket.on('joinUser', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`👤 User ${userId} joined personal room user_${userId}`);
  });

  // Join chat room
  socket.on('joinChat', ({ chatId, userId }) => {
    socket.join(chatId);
    socket.join(`user_${userId}`); // Also join personal room
    console.log(`💬 User ${userId} joined chat ${chatId} and personal room`);
  });

  // Leave chat room
  socket.on('leaveChat', ({ chatId, userId }) => {
    socket.leave(chatId);
    console.log(`💬 User ${userId} left chat ${chatId}`);
  });

  // Handle typing indicators
  socket.on('typing', ({ chatId, user }) => {
    socket.to(chatId).emit('userTyping', { user });
  });

  socket.on('stopTyping', ({ chatId, user }) => {
    socket.to(chatId).emit('userStoppedTyping', { user });
  });

  // Handle message read status
  socket.on('messageRead', ({ chatId, messageId, userId }) => {
    socket.to(chatId).emit('messageRead', { messageId, userId });
  });

  console.log('✅ Chat socket handlers initialized');
};

module.exports = chatSocketHandler;
