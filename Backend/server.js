const express = require('express');
const http = require('http'); // NEW: For WebSocket
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const storyRoutes = require('./routes/storyRoutes');
const followRoutes = require('./routes/followRoute');
const chatRoutes = require('./routes/chatRoutes');


// NEW: Import WebSocket initialization
const initializeSocket = require('./sockets/index.js');

const app = express();


// NEW: Create HTTP server for WebSocket
const server = http.createServer(app);

// Middlewares (SAME as before - no changes)
app.use(cors());
app.use(express.json({limit : "20mb"}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve both uploads folders statically (SAME as before)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Specific static serving for stories and posts (SAME as before)
app.use('/uploads/stories', express.static(path.join(__dirname, 'uploads', 'stories')));
app.use('/uploads/posts', express.static(path.join(__dirname, 'uploads', 'posts')));

// Debug middleware to log static file requests (SAME as before)
app.use('/uploads', (req, res, next) => {
  console.log(`📁 Static file request: ${req.url}`);
  next();
});

// Connect to MongoDB (SAME as before - no changes)
console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose.connect(
    "mongodb+srv://pithiyapratik13:%40123456789@cluster12.bmre8jf.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster12",
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log(" MongoDB connected"))
    .catch(err => console.error(" MongoDB connection error:", err));

// NEW: Initialize WebSocket
const io = initializeSocket(server);

// NEW: Make io accessible in routes/controllers (for emitting events)
app.use((req, res, next) => {
  req.io = io;
  next();
});

// user routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/follow', followRoutes); 
//chat routes
app.use("/api/chat",chatRoutes)

// Start server (CHANGED: Use server instead of app for WebSocket)
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(` Server running on port ${PORT}`);
  console.log(` WebSocket support enabled`);
  console.log(`📱 Ready for real-time notifications`);
});
