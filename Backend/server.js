
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json()); // parse JSON body

// Connect to MongoDB
console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose.connect(
    "mongodb+srv://pithiyapratik13:%40123456789@cluster12.bmre8jf.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster12",
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

// Routes
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
const postRoutes = require('./routes/Post');
app.use('/api/posts', postRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));



