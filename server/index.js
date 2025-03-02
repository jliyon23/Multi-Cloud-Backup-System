const express = require('express');
const { google } = require('googleapis');
const path = require('path');
const fs = require('node:fs/promises');
const fsSync = require('node:fs');
const app = express();
const port = 5000;
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const open = require('open');

// --- Service Account Credentials (from credentials.json) ---
const credentialsPath = path.join(__dirname, 'credentials.json'); // Service account credentials
const credentials = JSON.parse(fsSync.readFileSync(credentialsPath));

// --- Google Drive API Setup ---
const SCOPES = ['https://www.googleapis.com/auth/drive'];
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: SCOPES,
});
const driveService = google.drive({ version: 'v3', auth });

// --- Configuration ---
const UPLOAD_FOLDER_NAME = 'IMCM_Uploads'; // Name of the folder in Drive
const USER_EMAIL = 'josephliyon23@gmail.com'; // !!! Your personal Gmail address !!!

// --- Middleware ---
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());


// --- Create/Get Folder ID ---
// This function ensures the upload folder exists and returns its ID.
async function getOrCreateUploadFolder() {
    try {
        // Check if the folder already exists
        const response = await driveService.files.list({
            q: `mimeType='application/vnd.google-apps.folder' and name='${UPLOAD_FOLDER_NAME}' and trashed=false`,
            fields: 'files(id, name)',
        });

        if (response.data.files.length > 0) {
            // Folder exists, return its ID
			console.log("folder id:", response.data.files[0].id)
            return response.data.files[0].id;
        } else {
            // Folder doesn't exist, create it
            const fileMetadata = {
                name: UPLOAD_FOLDER_NAME,
                mimeType: 'application/vnd.google-apps.folder',
            };
            const createResponse = await driveService.files.create({
                requestBody: fileMetadata,
                fields: 'id',
            });
			console.log("folder id:", createResponse.data.id)
            return createResponse.data.id;
        }
    } catch (error) {
        console.error('Error getting or creating folder:', error);
        throw error; // Re-throw to be handled by the caller
    }
}

// --- Multer Configuration ---
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
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

// --- Share File Function ---
async function shareFileWithUser(fileId, userEmail) {
  try {
    const permission = {
      type: 'user',
      role: 'reader', // 'reader' (view-only) or 'writer' (edit)
      emailAddress: userEmail,
    };

    await driveService.permissions.create({
      fileId: fileId,
      requestBody: permission,
      fields: 'id', // we only care about confirmation that it worked
    });

    console.log(`File ${fileId} shared with ${userEmail}`);
  } catch (error) {
    console.error('Error sharing file:', error);
    throw error;
  }
}

// --- Google Drive Upload Function ---
async function uploadToDrive(filePath, fileName, folderId) {
  try {
    const fileMetadata = {
      name: fileName,
      parents: [folderId], // Upload to the specific folder
    };

    const media = {
      mimeType: 'application/octet-stream', // Or determine the correct MIME type
      body: fsSync.createReadStream(filePath),
    };

    const response = await driveService.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id, name, webViewLink, webContentLink', // Get webContentLink
    });

    console.log('File uploaded to Google Drive:', response.data);
    return response.data; // Return the file data

  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    throw error;
  }
}

// --- Route to handle file uploads ---
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded.' });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;
    console.log("file path", filePath);

    try {
      const folderId = await getOrCreateUploadFolder(); // Get the folder ID
        const driveResponse = await uploadToDrive(filePath, fileName, folderId);

        // Share the uploaded file with the user
        await shareFileWithUser(driveResponse.id, USER_EMAIL);

        res.status(200).json({
            message: "File uploaded successfully!",
            googleDrive: {
                id: driveResponse.id,
                name: driveResponse.name,
                webViewLink: driveResponse.webViewLink,
                webContentLink: driveResponse.webContentLink // Include download link
            }
        });

        await fs.unlink(filePath); // Delete the local temporary file

    } catch (error) {
        console.error('Error during upload process:', error);
        res.status(500).json({ message: "Error uploading file.", error: error.message });
    }
});

let folderId; // Global variable to store the folder ID
//get folder ID at the start
getOrCreateUploadFolder()
    .then((id) => {
        folderId = id;
        console.log("Upload folder ID:", folderId);
        process.env.FOLDER_ID = folderId;
    })
    .catch((err) => {
        console.error("Failed to initialize folder ID:", err);
        process.exit(1); // Exit if folder initialization fails
    });


app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});