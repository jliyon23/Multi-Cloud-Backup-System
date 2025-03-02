const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config/config'); // Import config
const uploadRoutes = require('./routes/uploads');
const driveService = require('./services/driveService')
const app = express();

// --- Middleware ---
app.use(cors({
    origin: true, // Adjust in production
    credentials: true
}));
app.use(express.json());

// --- Routes ---
app.use('/upload', uploadRoutes); // Use the upload routes

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
let folderId; // Global variable to store the folder ID
//get folder ID at the start
driveService.getOrCreateUploadFolder()
    .then((id) => {
        folderId = id;
        console.log("Upload folder ID:", folderId);
        process.env.FOLDER_ID = folderId;
    })
    .catch((err) => {
        console.error("Failed to initialize folder ID:", err);
        process.exit(1); // Exit if folder initialization fails
    });

app.listen(config.port, () => {
    console.log(`Server listening at http://localhost:${config.port}`);
});