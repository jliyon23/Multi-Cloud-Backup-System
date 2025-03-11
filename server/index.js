const express = require('express');
const path = require('path'); // Not actually used in this code, consider removing
const fs = require('node:fs/promises'); // Not actually used in this code, consider removing
const fsSync = require('node:fs'); // Not actually used in this code, consider removing
const app = express();
 // Use process.env.PORT for deployment
const cors = require('cors');
const multer = require('multer'); // Not used in this snippet, consider removing if not needed elsewhere
require('dotenv').config();
const config = require('./config/config'); // Import config (check if still needed)
const uploadRoutes = require('./routes/uploads');
const driveService = require('./services/driveService');
const sequelize = require("./config/database_pg");
const User = require("./models/User");
const authRoutes = require('./routes/authRoutes');

const port = process.env.PORT || 5000;

// --- Middleware ---
//  Restrictive CORS Configuration (replace with your actual domain(s) in production)
const allowedOrigins = ['http://localhost:5173', 'https://your-production-domain.com'];  //example
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) { // Allow requests with no origin (like mobile apps)
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true  // Only if you are using cookies
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
        res.status(500).json({ message: 'Error listing files', error: 'Failed to list files' }); // Generic error
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
        res.status(200).json({ message: `File ${fileId} deleted successfully.` });  // Template literals need backticks
    } catch (error) {
        console.error(`Error deleting file ${fileId}:`, error);
        res.status(500).json({ message: 'Error deleting file' }); // Generic error
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


sequelize.sync({ force: false }) // Change to true only to reset tables
    .then(() => {
        console.log("PostgreSQL Database Connected ✅");
        app.listen(port, () => console.log(`Server listening at http://localhost:${port}`)); // Use dynamic port
    })
    .catch((err) => console.error("Database Connection Error ❌", err));