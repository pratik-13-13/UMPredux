const notificationSocketHandler = (io, socket) => {
  // Handle post like notifications
  socket.on('likePost', ({ postOwnerId, likedBy, postId }) => {
    io.to(postOwnerId).emit('postLiked', {
      user: likedBy,
      postId: postId,
      message: `${likedBy.name} liked your post`,
      timestamp: new Date()
    });
  });

  // Handle comment notifications
  socket.on('commentPost', ({ postOwnerId, commentedBy, postId }) => {
    io.to(postOwnerId).emit('postCommented', {
      user: commentedBy,
      postId: postId,
      message: `${commentedBy.name} commented on your post`,
      timestamp: new Date()
    });
  });
};

module.exports = notificationSocketHandler;
