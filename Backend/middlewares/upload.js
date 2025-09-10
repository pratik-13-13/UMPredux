const multer = require('multer');
const path = require('path');

// Try to configure Cloudinary, but don't fail if credentials are missing
let cloudinary;
let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  // Use Cloudinary if credentials are available
  const { CloudinaryStorage } = require('multer-storage-cloudinary');
  cloudinary = require('cloudinary').v2;
  
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'posts',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto' }
      ]
    },
  });
} else {
  // Fallback to memory storage (temporary solution)
  console.log('Cloudinary credentials not found, using memory storage');
  storage = multer.memoryStorage();
}

// Create multer upload middleware
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = { upload, cloudinary };
