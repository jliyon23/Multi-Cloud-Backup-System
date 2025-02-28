// --- main.js (Main Process) ---

const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs/promises');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const chokidar = require('chokidar');
const os = require('node:os');
const pdf = require('pdf-parse');
const mammoth = require("mammoth");
require('dotenv').config();

// --- Configuration ---
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY; // !!! REPLACE !!!

// --- Gemini AI Setup ---
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);

// --- Function to list available models (keep this) ---
async function listAvailableModels() {
    try {
        for await (const m of genAI.listModels()) {
            console.log(m);  // Log to the main process console
            // Send to renderer process (if window is available)
            if (mainWindow) {
                mainWindow.webContents.send('model-list', m);
            }
        }
    } catch (error) {
        console.error("Error listing models:", error);
    }
}

let textModel;
let visionModel;

// --- Monitored Directories (Start with user's Downloads) ---
let MONITORED_DIRECTORIES = [`${os.homedir()}/Downloads`];

// --- Supported File Types and Prompts ---
const FILE_PROMPTS = {
    ".txt": "Summarize this text document and assign an importance score (1-10).",
    ".pdf": "Analyze this PDF document and provide a summary with importance (1-10).",
    ".docx": "Evaluate this Word document, highlight key themes, and score its importance (1-10).",
    ".jpg": "Describe this image, assess its relevance, and provide an importance score (1-10).",
    ".jpeg": "Describe this image, assess its relevance, and provide an importance score (1-10).",
    ".png": "Describe this image, assess its relevance, and provide an importance score (1-10).",
};

// --- File Analysis Function ---
async function analyzeFileContent(filePath) {
    try {
        const fileExtension = path.extname(filePath).toLowerCase();
        if (!FILE_PROMPTS[fileExtension]) return "Unsupported file type.";

        if ([".txt", ".pdf", ".docx"].includes(fileExtension)) {
            // Text file handling
            try {
                let fileContent = "";
                if (fileExtension === ".txt") {
                    fileContent = await fs.readFile(filePath, "utf-8");
                } else if (fileExtension === ".pdf") {
                    const dataBuffer = await fs.readFile(filePath);
                    const pdfData = await pdf(dataBuffer);
                    fileContent = pdfData.text;
                } else if (fileExtension === ".docx") {
                    const result = await mammoth.extractRawText({ path: filePath });
                    fileContent = result.value;
                }

                if (fileContent.length > 25000) {
                    fileContent = fileContent.substring(0, 25000) + "\n... (truncated)";
                }

                const result = await textModel.generateContent(`${FILE_PROMPTS[fileExtension]}\n\n${fileContent}`);
                return (await result.response).text();
            } catch (error) {
                console.error(`Error reading file ${filePath}:`, error);
                return `Error reading file: ${error.message}`;
            }
        } else if ([".jpg", ".jpeg", ".png"].includes(fileExtension)) {
            // Image processing
            try {
                const { default: imageType } = await import('image-type'); // Dynamic import
                const imageData = await fs.readFile(filePath);
                const imgType = await imageType(imageData);
                if (!imgType) return "Unsupported image format.";

                const result = await visionModel.generateContent([
                    FILE_PROMPTS[fileExtension],
                    { inlineData: { data: imageData.toString("base64"), mimeType: imgType.mime } },
                ]);
                return (await result.response).text();
            } catch (error) {
                console.error(`Error processing image ${filePath}:`, error);
                return `Error processing image: ${error.message}`;
            }
        }
    } catch (error) {
        console.error("Error analyzing file:", error);
        return `Error: ${error.message}`;
    }
}

// --- File Monitoring ---
let watcher;
function startMonitoring() {
  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "YOUR_GEMINI_API_KEY") {
    console.error("Error: Please set your GOOGLE_API_KEY.");
    if (mainWindow) {
        mainWindow.webContents.send('log-message', "Error: Please set your GOOGLE_API_KEY in main.js", true);
    }
    return;
  }
    if (watcher) {
        watcher.close(); // Stop previous watcher
    }

    watcher = chokidar.watch(MONITORED_DIRECTORIES, {
        ignored: /(^|[\/\\])\../,
        persistent: true,
        ignoreInitial: true,
        usePolling: true, // Consider removing if permissions are not an issue
        interval: 1000,
    });

     watcher.on('add', async (filePath) => await handleFileEvent(filePath, 'added'));
     watcher.on('change', async (filePath) => await handleFileEvent(filePath, 'modified'));
     watcher.on('unlink', (filePath) => {
        if (mainWindow) {
            mainWindow.webContents.send('log-message', `File deleted: ${filePath}`);
        }
    });

    watcher.on('error', error => {
        console.error('Watcher error:', error);
         if (mainWindow) {
             mainWindow.webContents.send('log-message', `Watcher error: ${error}`, true);
         }

    });

    if (mainWindow) {
        mainWindow.webContents.send('log-message', 'Monitoring started...');
    }

}

// --- File Event Handler (with Debouncing) ---
let analysisTimeout = null;
const DEBOUNCE_DELAY = 2000; // 2 seconds
async function handleFileEvent(filePath, eventType) {
    const fileExtension = path.extname(filePath).toLowerCase();
    if (!FILE_PROMPTS[fileExtension]) return;

    if (mainWindow) {
        mainWindow.webContents.send('log-message', `File ${eventType}: ${filePath}`);
    }

    clearTimeout(analysisTimeout);
    analysisTimeout = setTimeout(async () => {
        const analysisResult = await analyzeFileContent(filePath);
        if (mainWindow) {
          mainWindow.webContents.send('analysis-result', { filePath, result: analysisResult });
        }
    }, DEBOUNCE_DELAY);
}

// --- Electron App Setup ---

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 800,
        icon: path.join(__dirname, 'assets/icon.png'), 
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, // VERY IMPORTANT for security
            contextIsolation: true,  // VERY IMPORTANT for security
        }
    });
    mainWindow.loadFile('index.html');
    // mainWindow.webContents.openDevTools(); // Open DevTools (optional)
}

app.whenReady().then(() => {
    createWindow();
    // List models and initialize on app start
    listAvailableModels().then(() => {
      textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Replace with actual
      visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });  // Replace with actual
      startMonitoring();
    });


    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
    if (watcher) {
        watcher.close();  // Important to stop the watcher when closing
    }
});

// --- IPC Event Handlers ---

ipcMain.handle('get-monitored-directories', async () => {
    return MONITORED_DIRECTORIES;
});

// Add directory to monitored directories
ipcMain.handle('add-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory']
    });

    if (!result.canceled && result.filePaths.length > 0) {
      const newDir = result.filePaths[0];
      if (!MONITORED_DIRECTORIES.includes(newDir)) {
        MONITORED_DIRECTORIES.push(newDir);
        startMonitoring(); // Restart monitoring with the new directory
        return newDir; // Return the newly added directory
      }
      return null; // Directory already being monitored or selection was canceled
    }
    return null;  // No directory selected
  });

  //Remove directories
  ipcMain.handle('remove-directory', async (event, dirToRemove) => {
    MONITORED_DIRECTORIES = MONITORED_DIRECTORIES.filter(dir => dir !== dirToRemove);
    startMonitoring();
    return MONITORED_DIRECTORIES;
});