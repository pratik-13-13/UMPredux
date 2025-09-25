const followSocketHandler = (io, socket) => {
  // Join user to their personal notification room
  socket.on('joinUser', (userId) => {
    socket.join(userId);
    console.log(`User ${userId} joined their notification room`);
  });

  // Handle follow request notifications
  socket.on('sendFollowRequest', ({ targetUserId, fromUser }) => {
    // Emit to target user's room
    io.to(targetUserId).emit('newFollowRequest', {
      from: fromUser,
      message: `${fromUser.name} sent you a follow request`,
      timestamp: new Date()
    });
  });

  // Handle follow request acceptance
  socket.on('acceptFollowRequest', ({ userId, acceptedBy }) => {
    io.to(userId).emit('followRequestAccepted', {
      acceptedBy: acceptedBy,
      message: `${acceptedBy.name} accepted your follow request`,
      timestamp: new Date()
    });
  });

  // Handle follow request rejection
  socket.on('rejectFollowRequest', ({ userId, rejectedBy }) => {
    io.to(userId).emit('followRequestRejected', {
      rejectedBy: rejectedBy,
      message: `${rejectedBy.name} rejected your follow request`,
      timestamp: new Date()
    });
  });
};

module.exports = followSocketHandler;
