const logElement = document.getElementById('log');
const analysisResultsElement = document.getElementById('analysisResults');
const directoriesListElement = document.getElementById('directoriesList');
const addDirectoryButton = document.getElementById('addDirectory');
const modelListElement = document.getElementById('modelList');

// --- Log Handling ---
function logMessage(message, isError = false) {
    const div = document.createElement('div');
    div.textContent = message;
    if (isError) {
        div.classList.add('error');
    }
    logElement.appendChild(div);
    logElement.scrollTop = logElement.scrollHeight; // Auto-scroll
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
    directoriesListElement.innerHTML = ''; // Clear existing list
    directories.forEach(dir => {
      const listItem = document.createElement('li');
      listItem.textContent = dir;
      const removeButton = document.createElement('span');
      removeButton.textContent = ' [X]';
      removeButton.className = 'remove-button';
      removeButton.onclick = async () => {
        await window.electronAPI.removeDirectory(dir);
        updateDirectoriesList(); // Refresh the list after removal
      };
      listItem.appendChild(removeButton);

      directoriesListElement.appendChild(listItem);
    });
  }


// --- Event Listeners ---

// Log messages
window.electronAPI.onLogMessage(logMessage);

// Analysis results
window.electronAPI.onAnalysisResult(displayAnalysisResult);

// Add directory button
addDirectoryButton.addEventListener('click', async () => {
    const newDir = await window.electronAPI.addDirectory();
    if(newDir) {
      updateDirectoriesList();
    }
});

// Model List
window.electronAPI.onModelList((model) => {
    const listItem = document.createElement('li');
    listItem.textContent = `${model.displayName} (${model.name})`;
    modelListElement.appendChild(listItem);
});

// Initial directory list update
updateDirectoriesList();