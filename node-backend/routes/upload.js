const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const logger = require('../utils/logger');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allowed extensions
const ALLOWED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp']);
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB limit

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'article-' + uniqueSuffix + ext);
  }
});

// File Filter (Strict Whitelist of Extensions & MIME types)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return cb(new Error('Only .jpg, .jpeg, .png, and .webp images are allowed!'));
  }

  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid image MIME type. Only JPEG, PNG, and WEBP images are allowed!'));
  }

  cb(null, true);
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: MAX_FILE_SIZE }
});

/**
 * Validates image magic bytes to protect against MIME/extension spoofing
 * @param {string} filePath 
 * @returns {boolean}
 */
function validateImageMagicBytes(filePath) {
  try {
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    try {
      const bytesRead = fs.readSync(fd, buffer, 0, 12, 0);
      if (bytesRead < 4) return false;
    } finally {
      fs.closeSync(fd);
    }

    // PNG signature: 89 50 4E 47
    if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) {
      return true;
    }

    // JPEG signature: FF D8 FF
    if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) {
      return true;
    }

    // WEBP signature: 'RIFF' .... 'WEBP'
    if (
      buffer[0] === 0x52 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x46 &&
      buffer[8] === 0x57 && buffer[9] === 0x45 && buffer[10] === 0x42 && buffer[11] === 0x50
    ) {
      return true;
    }

    return false;
  } catch (err) {
    return false;
  }
}

// Multer middleware wrapper with clean error handling
const handleMulterUpload = (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size exceeds 2MB limit.' });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
};

// POST /api/upload
router.post('/', authMiddleware, adminMiddleware, handleMulterUpload, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided.' });
    }

    // Validate magic bytes
    const isValidSignature = validateImageMagicBytes(req.file.path);
    if (!isValidSignature) {
      // Securely unlink invalid file
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (cleanupErr) {
        logger.error('Failed to remove invalid upload file:', cleanupErr);
      }
      return res.status(400).json({ error: 'Invalid file signature. Only valid PNG, JPEG, and WEBP images are allowed.' });
    }
    
    // Construct public URL
    const imageUrl = `/uploads/${req.file.filename}`;
    
    res.json({
      success: true,
      url: imageUrl
    });
  } catch (error) {
    logger.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload image.' });
  }
});

module.exports = router;
