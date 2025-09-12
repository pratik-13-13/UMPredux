const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const postRoutes = require('./routes/postRoutes');
const storyRoutes = require('./routes/storyRoutes')
const path = require('path');

require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// ✅ FIXED: Serve both uploads folders statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ✅ ADDED: Specific static serving for stories and posts
app.use('/uploads/stories', express.static(path.join(__dirname, 'uploads', 'stories')));
app.use('/uploads/posts', express.static(path.join(__dirname, 'uploads', 'posts')));

// ✅ ADDED: Debug middleware to log static file requests
app.use('/uploads', (req, res, next) => {
  console.log(`📁 Static file request: ${req.url}`);
  next();
});

// Connect to MongoDB
console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose.connect(
    "mongodb+srv://pithiyapratik13:%40123456789@cluster12.bmre8jf.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster12",
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/stories', storyRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
