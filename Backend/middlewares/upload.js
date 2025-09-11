const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Cloudinary configuration
let cloudinary;
let storage;

if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  // ✅ CLOUDINARY STORAGE
  try {
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
        folder: 'stories',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
          { width: 1080, height: 1920, crop: 'limit' },
          { quality: 'auto:good' }
        ],
      },
    });

    console.log('✅ Cloudinary storage configured successfully');
    
  } catch (error) {
    console.error('❌ Cloudinary configuration failed:', error);
    console.log('Falling back to disk storage...');
    cloudinary = null;
    storage = createDiskStorage();
  }
} else {
  // ✅ DISK STORAGE FALLBACK
  console.log('⚠️ Cloudinary credentials not found, using disk storage');
  cloudinary = null;
  storage = createDiskStorage();
}

function createDiskStorage() {
  return multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadDir = path.join(__dirname, '..', 'uploads', 'stories');
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
        console.log(`📁 Created upload directory: ${uploadDir}`);
      }
      
      cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const extension = path.extname(file.originalname).toLowerCase();
      cb(null, `story_${uniqueSuffix}${extension}`);
    }
  });
}

// ✅ FIX: Export the actual multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    console.log(`📤 Uploading file: ${file.originalname} (${file.mimetype})`);
    
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'), false);
    }
    
    const allowedFormats = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedFormats.includes(file.mimetype)) {
      return cb(new Error('Invalid image format. Allowed: JPEG, PNG, GIF, WebP'), false);
    }
    
    cb(null, true);
  }
});

// ✅ EXPORT: Export the actual multer instance
module.exports = { 
  upload, // ✅ This is now the actual multer instance
  cloudinary
};
