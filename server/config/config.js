// config/config.js
require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    google: {
        credentialsPath: 'credentials.json', // Relative to project root
        scopes: ['https://www.googleapis.com/auth/drive'],
        uploadFolderName: 'IMCM_Uploads',
        userEmail: process.env.USER_EMAIL, // Get from .env
    },
    uploadDir: 'uploads', // Relative to server.js
    sessionSecret: process.env.SESSION_SECRET || 'jliyon23', // Use .env!
};