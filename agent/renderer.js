// --- renderer.js (Renderer Process) ---

const logElement = document.getElementById('log');
const analysisResultsElement = document.getElementById('analysisResults');
const directoriesListElement = document.getElementById('directoriesList');
const addDirectoryButton = document.getElementById('addDirectory');
const uploadedFilesList = document.getElementById('uploaded-files'); // Get the uploaded files list


// --- Log Handling ---
function logMessage(message, isError = false) {
    const div = document.createElement('div');
    div.textContent = message;
    if (isError) {
        div.classList.add('error');
    }
    logElement.appendChild(div);
    logElement.scrollTop = logElement.scrollHeight;
}

// --- Analysis Results ---
function displayAnalysisResult(data) {
    const div = document.createElement('div');
    div.innerHTML = `<strong>${data.filePath}</strong>:<br>${data.result}`;
    analysisResultsElement.appendChild(div);
    analysisResultsElement.scrollTop = analysisResultsElement.scrollHeight;
}

// --- Directory Management ---
async function updateDirectoriesList() {
    const directories = await window.electronAPI.getMonitoredDirectories();
    directoriesListElement.innerHTML = '';
    directories.forEach(dir => {
        const listItem = document.createElement('li');
        listItem.textContent = dir;
        const removeButton = document.createElement('span');
        removeButton.textContent = ' [X]';
        removeButton.className = 'remove-button';
        removeButton.onclick = async () => {
            await window.electronAPI.removeDirectory(dir);
            updateDirectoriesList();
        };
        listItem.appendChild(removeButton);
        directoriesListElement.appendChild(listItem);
    });
}

// --- Display Uploaded Files with Links ---
function displayUploadedFile(fileInfo) {
  const listItem = document.createElement('li');
  // Use webContentLink for direct downloads
  listItem.innerHTML = `<a href="${fileInfo.webContentLink}" target="_blank" rel="noopener noreferrer">${fileInfo.name}</a>`;
  uploadedFilesList.appendChild(listItem);
}


// --- Event Listeners ---

window.electronAPI.onLogMessage(logMessage);
window.electronAPI.onAnalysisResult(displayAnalysisResult);

// Listen for file-uploaded events from the main process
window.electronAPI.onFileUploaded(displayUploadedFile); // Add this line


addDirectoryButton.addEventListener('click', async () => {
    const newDir = await window.electronAPI.addDirectory();
    if (newDir) {
        updateDirectoriesList();
    }
});



// --- Initial Setup ---
updateDirectoriesList();