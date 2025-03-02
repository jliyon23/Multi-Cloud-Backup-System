// config/config.js
require('dotenv').config();

module.exports = {
    port: process.env.PORT || 5000,
    google: {
        credentials: {
            type: "service_account",
            project_id: process.env.GOOGLE_PROJECT_ID,
            private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
            private_key: process.env.GOOGLE_PRIVATE_KEY,
            client_email: process.env.GOOGLE_CLIENT_EMAIL,
            client_id: process.env.GOOGLE_CLIENT_ID,
            auth_uri: process.env.GOOGLE_AUTH_URI,
            token_uri: process.env.GOOGLE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_CERT_URL,
            client_x509_cert_url: process.env.GOOGLE_CLIENT_CERT_URL,
        }, // Relative to project root
        scopes: ['https://www.googleapis.com/auth/drive'],
        uploadFolderName: 'IMCM_Uploads',
        userEmail: process.env.USER_EMAIL, // Get from .env
    },
    uploadDir: 'uploads', // Relative to server.js
    sessionSecret: process.env.SESSION_SECRET || 'jliyon23', // Use .env!
};