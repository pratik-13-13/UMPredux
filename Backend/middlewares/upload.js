const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Declare variables at the top so they are in scope later
let cloudinary;
let storyCloudinaryStorage;
let postCloudinaryStorage;

// ✅ Cloudinary configuration
if (
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  try {
    const { CloudinaryStorage } = require('multer-storage-cloudinary');
    cloudinary = require('cloudinary').v2;

    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });

    // ✅ CLOUDINARY STORAGE FOR STORIES
    storyCloudinaryStorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'stories',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 1080, height: 1920, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      },
    });

    // ✅ CLOUDINARY STORAGE FOR POSTS
    postCloudinaryStorage = new CloudinaryStorage({
      cloudinary: cloudinary,
      params: {
        folder: 'posts',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 1200, height: 1200, crop: 'limit' },
          { quality: 'auto:good' },
        ],
      },
    });

   
  } catch (error) {
    console.error('❌ Cloudinary configuration failed:', error);
    cloudinary = null;
  }
}

// ✅ Disk storage fallback for stories
function createStoryDiskStorage() {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '..', 'uploads', 'stories');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `story_${uniqueSuffix}${extension}`);
    },
  });
}

// ✅ Disk storage fallback for posts
function createPostDiskStorage() {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '..', 'uploads', 'posts');

      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `post_${uniqueSuffix}${extension}`);
    },
  });
}

// ✅ Create upload configuration
const createUpload = (storage) => {
  return multer({
    storage: storage,
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
      files: 1,
    },
    fileFilter: (req, file, cb) => {
     if (!file.mimetype.startsWith('image/')) {
    console.log('❌ UPLOAD ERROR: Not an image file');
    return cb(new Error('Only image files are allowed!'), false);
  }

      const allowedFormats = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ];
     if (!allowedFormats.includes(file.mimetype)) {
    console.log('❌ UPLOAD ERROR: Invalid format');
    return cb(
      new Error('Invalid image format. Allowed: JPEG, PNG, GIF, WebP'),
      false
    );
  }

  console.log('✅ UPLOAD: File accepted');

      cb(null, true);
    },
  });
};

// ✅ Create upload instances
let upload, postUpload;

if (cloudinary) {
  upload = createUpload(storyCloudinaryStorage);
  postUpload = createUpload(postCloudinaryStorage);
} else {
  upload = createUpload(createStoryDiskStorage());
  postUpload = createUpload(createPostDiskStorage());
}

// ✅ Export both instances
module.exports = {
  upload,
  postUpload,
  cloudinary,
};
