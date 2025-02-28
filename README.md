Intelligent Multi-Cloud Backup System
This project is an AI-powered file backup system that monitors file changes in selected directories, analyzes file importance using Google Gemini AI, and automatically backs up important files to Google Drive.

Features
🖥️ Real-time File Monitoring – Watches directories for new or modified files.
🤖 AI-Powered Analysis – Uses Google Gemini API to determine file importance.
☁️ Automatic Cloud Backup – Uploads important files to Google Drive.
🖼️ Supports Text & Images – Analyzes both text documents and images.
🔍 Customizable Analysis – Security check, code quality review, or content summary.
🛠️ Electron.js UI – Displays real-time logs in a user-friendly interface.
Installation
1️⃣ Clone the Repository
bash
Copy
Edit
git clone https://github.com/yourusername/ai-cloud-backup.git
cd ai-cloud-backup
2️⃣ Install Dependencies
bash
Copy
Edit
npm install
3️⃣ Configure Environment Variables
Create a .env file in the project root and add your Google Gemini API key:

ini
Copy
Edit
GEMINI_API_KEY=your_gemini_api_key
4️⃣ Run the Application
bash
Copy
Edit
npm start
Usage
The app monitors the Downloads directory (configurable).
When a file is added or modified, it is analyzed using AI.
If the file is important, it is automatically uploaded to Google Drive.
Logs are displayed in the Electron UI.
Project Structure
bash
Copy
Edit
📂 ai-cloud-backup
├── 📁 src
│   ├── fileMonitor.js   # Watches file changes
│   ├── analyzeFile.js   # AI-based file importance analysis
│   ├── googleDrive.js   # Handles Google Drive uploads
│   ├── main.js          # ElectronJS main process
│   ├── renderer.js      # Frontend logic for logs
│   ├── index.html       # UI for real-time logs
├── .env                 # API key configuration
├── package.json         # Project dependencies
├── README.md            # Project documentation
Technologies Used
Electron.js – Desktop app with UI logs
Node.js – Backend for file monitoring
Chokidar – File system watcher
Google Gemini API – AI-based file analysis
Google Drive API – Cloud storage integration
Contributing
Feel free to open issues or submit PRs to improve this project! 🚀

License
This project is licensed under the MIT License.

Author
👤 Joseph Liyon
📧 Contact: [your.email@example.com]
🔗 GitHub: [github.com/yourusername]