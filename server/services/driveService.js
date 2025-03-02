// services/driveService.js
const { google } = require('googleapis');
const fs = require('node:fs'); // Use the synchronous version for createReadStream
const path = require('path');
const config = require('../config/config');


const credentials = config.google.credentials; // Use fs (sync)
const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: config.google.scopes,
});
const driveService = google.drive({ version: 'v3', auth });

let folderIdPromise = null;

async function getOrCreateUploadFolder() {
    // Only run the folder creation/check once, and reuse result
    if (!folderIdPromise) {
      folderIdPromise = driveService.files.list({
        q: `mimeType='application/vnd.google-apps.folder' and name='${config.google.uploadFolderName}' and trashed=false`,
        fields: 'files(id, name)',
      }).then(response => {
        if (response.data.files.length > 0) {
          return response.data.files[0].id;
        } else {
          const fileMetadata = {
            name: config.google.uploadFolderName,
            mimeType: 'application/vnd.google-apps.folder',
          };
          return driveService.files.create({
            requestBody: fileMetadata,
            fields: 'id',
          }).then(createResponse => createResponse.data.id);
        }
      }).catch(error => {
        console.error('Error getting or creating folder:', error);
        throw error;
      });
    }

    return folderIdPromise;
}
async function uploadFileToDrive(filePath, fileName) {
    const folderId = await getOrCreateUploadFolder();
    const fileMetadata = {
        name: fileName,
        parents: [folderId],
    };

    const media = {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(filePath),  // Use the synchronous fs
    };

    try {
        const response = await driveService.files.create({
            requestBody: fileMetadata,
            media: media,
            fields: 'id, name, webViewLink, webContentLink',
        });
        console.log('File uploaded to Google Drive:', response.data);
		return response.data;

    } catch (error) {
        console.error('Error uploading to Google Drive:', error);
        throw error; // Re-throw to be handled by the caller
    }
}

async function shareFile(fileId, userEmail) {
    try {
      const permission = {
        type: 'user',
        role: 'reader',
        emailAddress: userEmail,
      };
      await driveService.permissions.create({
        fileId: fileId,
        requestBody: permission,
        fields: 'id',
      });
      console.log(`File ${fileId} shared with ${userEmail}`);
    } catch (error) {
      console.error('Error sharing file:', error);
      throw error; // Important to re-throw so caller knows it failed
    }
}

async function listFiles() {
    try {
      const response = await driveService.files.list({
        pageSize: 10, // Or however many you want to list
        fields: 'nextPageToken, files(id, name, webViewLink, webContentLink)', // Include webContentLink
      });
      return response.data.files;
    } catch (error) {
      console.error('Error listing files:', error);
      throw error;
    }
  }

module.exports = {
    uploadFileToDrive,
    shareFile,
	listFiles,
    getOrCreateUploadFolder
};