const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true, trim: true },
    image: { type: String, default: null },
  },
  { timestamps: true }
);

const Post = mongoose.model('Post', postSchema);

module.exports = { Post };


