const multer = require("multer");

// Configure storage to keep file in memory
const storage = multer.memoryStorage();

// Setup file size limits and file filtering
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // limit to 5MB
  },
  fileFilter: (req, file, cb) => {
    // Accept only PDF files
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

module.exports = upload;