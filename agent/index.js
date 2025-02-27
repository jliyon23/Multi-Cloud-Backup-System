import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import { GoogleGenerativeAI } from "@google/generative-ai";
import chokidar from 'chokidar';
import pdf from 'pdf-parse';
import mammoth from "mammoth";
// No top-level import for imageType

// --- Configuration ---
const GOOGLE_API_KEY = "AIzaSyD1452xjuZaVWmkBnW8ac3eGy4pzSHfE_s"; // !!! REPLACE !!!

// --- Gemini AI Setup ---
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const textModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or your text model
const visionModel = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Or your vision model - VERIFY!

// --- Monitored Directories ---
const MONITORED_DIRECTORIES = ["C:/Users/josep/Downloads"];

// --- Supported File Types and Prompts ---
const FILE_PROMPTS = {
  ".txt":  "Summarize this text document and assign an importance score (1-10).",
  ".pdf":  "Analyze this PDF document and provide a summary with importance (1-10).",
  ".docx": "Evaluate this Word document, highlight key themes, and score its importance (1-10).",
  ".jpg":  "Describe this image, assess its relevance, and provide an importance score (1-10).",
  ".jpeg": "Describe this image, assess its relevance, and provide an importance score (1-10).",
  ".png":  "Describe this image, assess its relevance, and provide an importance score (1-10).",
};

// --- File Analysis Function ---
async function analyzeFileContent(filePath) {
  try {
    const fileExtension = path.extname(filePath).toLowerCase();
    if (!FILE_PROMPTS[fileExtension]) return "Unsupported file type.";

    if ([".txt", ".pdf", ".docx"].includes(fileExtension)) {
      // Text file handling (same as before, but moved inside the if)
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

        // Truncate long files
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
      // Image processing (with dynamic import)
      try {
        const { default: imageType } = await import('image-type'); // Dynamic import
        const imageData = await fs.readFile(filePath);
        const imgType = await imageType(imageData); // Await the result here
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

// --- File Monitoring Setup ---
function startMonitoring() {
  if (!GOOGLE_API_KEY || GOOGLE_API_KEY === "YOUR_GEMINI_API_KEY") {
    console.error("Error: Please set your GOOGLE_API_KEY.");
    return;
  }

  const watcher = chokidar.watch(MONITORED_DIRECTORIES, {
    ignored: /(^|[\/\\])\../, // Ignore hidden files
    persistent: true,
    ignoreInitial: true,
    usePolling: true,
    interval: 1000,
  });

  watcher.on("add", async (filePath) => await handleFileEvent(filePath, "added"));
  watcher.on("change", async (filePath) => await handleFileEvent(filePath, "modified"));
  watcher.on("unlink", (filePath) => console.log(`File deleted: ${filePath}`));
  watcher.on("error", (error) => console.error("Watcher error:", error));

  console.log("Monitoring started...");
}

// --- File Event Handler (with Debouncing) ---
let analysisTimeout = null;
const DEBOUNCE_DELAY = 2000; // 2 seconds

async function handleFileEvent(filePath, eventType) {
  if (!FILE_PROMPTS[path.extname(filePath).toLowerCase()]) return;

  console.log(`File ${eventType}: ${filePath}`);

  clearTimeout(analysisTimeout);
  analysisTimeout = setTimeout(async () => {
    const analysisResult = await analyzeFileContent(filePath);
    console.log(`Analysis Result:\n${analysisResult}`);
  }, DEBOUNCE_DELAY);
}

// --- Start Monitoring ---
startMonitoring();
