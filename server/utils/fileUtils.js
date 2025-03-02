// utils/fileUtils.js
const multer = require('multer');
const path = require('path');
const fs = require('node:fs/promises');
const config = require('../config/config')

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', config.uploadDir); // Go up one level to project root
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (err) {
            console.error("Failed to ensure uploads directory:", err);
            cb(err);
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

module.exports = {
  upload
}