const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { type: String, default: 'user' }, // admin or user
  password: { type: String, required: true },
  
  // Instagram-like profile fields
  profilePic: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  
  // Follow System Fields - Instagram Style
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  following: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  followerCount: {
    type: Number,
    default: 0
  },
  followingCount: {
    type: Number,
    default: 0
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  
  // Additional Instagram-like features
  isVerified: {
    type: Boolean,
    default: false
  },
  website: {
    type: String,
    default: ''
  },

  followRequests: [{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}],

  sentRequests: [{
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}],
}, { timestamps: true });

const announcementSchema = new mongoose.Schema({
  title: String,
  message: String,
  date: { type: Date, default: Date.now },
});

const activitySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  action: String,
  timestamp: { type: Date, default: Date.now },
});

// New Follow Activity Schema for tracking follow/unfollow actions
const followActivitySchema = new mongoose.Schema({
  follower: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  following: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, enum: ['follow', 'unfollow'], required: true },
  timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Announcement = mongoose.model('Announcement', announcementSchema);
const Activity = mongoose.model('Activity', activitySchema);
const FollowActivity = mongoose.model('FollowActivity', followActivitySchema);

module.exports = { User, Announcement, Activity, FollowActivity };
