// --- preload.js (Preload Script) ---

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    addDirectory: () => ipcRenderer.invoke('add-directory'),
    getMonitoredDirectories: () => ipcRenderer.invoke('get-monitored-directories'),
    removeDirectory: (dir) => ipcRenderer.invoke('remove-directory', dir),
    onLogMessage: (callback) => ipcRenderer.on('log-message', (_event, message, isError) => callback(message, isError)),
    onAnalysisResult: (callback) => ipcRenderer.on('analysis-result', (_event, data) => callback(data)),
    onFileUploaded: (callback) => ipcRenderer.on('file-uploaded', (_event, data) => callback(data)), // Add this
});