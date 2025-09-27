const socketIo = require('socket.io');

const initializeSocket = (server) => {
  const io = socketIo(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://api-umpredux.onrender.com', 'https://instagram-two-brown.vercel.app']
        : ['http://192.168.1.7:5173', 'http://192.168.1.7:3000', 'http://localhost:5173', 'http://localhost:3000'],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Import socket handlers
  const followSocketHandler = require('./followSocket');
  const chatSocketHandler = require('./chatSocket'); // NEW

  io.on('connection', (socket) => {

    // Initialize different socket handlers
    followSocketHandler(io, socket);
    chatSocketHandler(io, socket); // NEW

    socket.on('disconnect', (reason) => {
    });
  });

  return io;
};

module.exports = initializeSocket;
