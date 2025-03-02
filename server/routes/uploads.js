// routes/uploads.js
const express = require('express');
const router = express.Router();
const driveService = require('../services/driveService');
const fs = require('node:fs/promises');
const config = require('../config/config');
const { upload } = require('../utils/fileUtils');

router.post('/', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    try {
        const driveResponse = await driveService.uploadFileToDrive(filePath, fileName);

        // Share file.
        await driveService.shareFile(driveResponse.id, config.google.userEmail);

        res.status(200).json({
            message: "File uploaded successfully!",
            googleDrive: {
                id: driveResponse.id,
                name: driveResponse.name,
                webViewLink: driveResponse.webViewLink,
                webContentLink: driveResponse.webContentLink
            }
        });
    } catch (error) {
        console.error('Error during upload process:', error);
        res.status(500).json({ message: "Error uploading file.", error: error.message });
    } finally {
        // Clean up local file.  Do this in a finally block to ensure it happens
        // even if there's an error.
        if (filePath) { // Check filePath exists.
            try {
                await fs.unlink(filePath);
                console.log("Local file deleted");
            } catch (unlinkError) {
                console.error("Failed to delete local file:", unlinkError);
            }
        }
    }
});



module.exports = router;