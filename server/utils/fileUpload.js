const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { formatFileSize } = require('./helpers');

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = crypto.randomBytes(16).toString('hex');
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF and PDF files are allowed.'), false);
  }
};

// Configure upload limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 // Allow only 1 file per upload
  }
});

// Validate file size
const validateFileSize = (file) => {
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error(`File size exceeds limit. Maximum size is ${formatFileSize(maxSize)}`);
  }
  return true;
};

// Validate file type
const validateFileType = (file) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.mimetype)) {
    throw new Error('Invalid file type. Only JPEG, PNG, GIF and PDF files are allowed.');
  }
  return true;
};

// Clean up uploaded files
const cleanupUploadedFiles = (files) => {
  if (!files) return;
  
  const fs = require('fs');
  const path = require('path');
  
  if (Array.isArray(files)) {
    files.forEach(file => {
      const filePath = path.join(__dirname, '../../uploads', file.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
  } else if (files.filename) {
    const filePath = path.join(__dirname, '../../uploads', files.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  }
};

// Get file extension
const getFileExtension = (filename) => {
  return path.extname(filename).toLowerCase();
};

// Get file type category
const getFileTypeCategory = (mimetype) => {
  if (mimetype.startsWith('image/')) return 'image';
  if (mimetype === 'application/pdf') return 'document';
  return 'other';
};

module.exports = {
  upload,
  validateFileSize,
  validateFileType,
  cleanupUploadedFiles,
  getFileExtension,
  getFileTypeCategory
}; 