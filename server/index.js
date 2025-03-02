const express = require('express');
const path = require('path');
const fs = require('node:fs/promises');
const fsSync = require('node:fs'); //For createReadStream
const app = express();
const port = 5000;
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const config = require('./config/config'); // Import config
const uploadRoutes = require('./routes/uploads');
const driveService = require('./services/driveService');
const sequelize = require("./config/database_pg");
const User = require("./models/User");
const authRoutes = require('./routes/authRoutes');

// --- Middleware ---
app.use(cors({
    origin: true, // Adjust in production
    credentials: true
}));
app.use(express.json());

// --- Routes ---
app.use('/upload', uploadRoutes); // Use the upload routes
app.use('/api', authRoutes);


//list files
app.get('/list-drive-files', async (req, res) => {
    try {
        const files = await driveService.listFiles();
        if (files.length > 0) {
            res.json(files);
        } else {
            res.json({ message: 'No files found.', files: [] });
        }
    } catch (error) {
        console.error('Error listing files:', error);
        res.status(500).json({ message: 'Error listing files', error: error.message });
    }
});

//delete file
app.delete('/delete/:fileId', async (req, res) => {
    const fileId = req.params.fileId;

    if (!fileId) {
        return res.status(400).json({ message: 'Missing fileId parameter.' });
    }

    try {
        await driveService.deleteFileFromDrive(fileId);
        res.status(200).json({ message: `File ${fileId} deleted successfully.` });
    } catch (error) {
        console.error(`Error deleting file ${fileId}:`, error);
        res.status(500).json({ message: `Error deleting file: ${error.message}` });
    }
});

let folderId; // Global variable to store the folder ID

// Get or create the folder and store the ID at startup.
driveService.getOrCreateUploadFolder()
    .then(id => {
        folderId = id;
        console.log("Upload folder ID:", folderId);
        process.env.FOLDER_ID = folderId; // Set in environment (optional, but good practice)
    })
    .catch(err => {
        console.error("Failed to initialize folder ID:", err);
        process.exit(1); // Exit if folder initialization fails
    });


sequelize.sync({ force: false }) // Change to `true` only to reset tables
    .then(() => {
        console.log("PostgreSQL Database Connected ✅");
        app.listen(3000, () => console.log(`Server listening at http://localhost:${config.port}`));
    })
    .catch((err) => console.error("Database Connection Error ❌", err));