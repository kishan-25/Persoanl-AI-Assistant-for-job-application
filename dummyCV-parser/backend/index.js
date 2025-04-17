// backend/index.js
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const ImageKit = require('imagekit');
const cvHandler = require('./cvHandler');

const app = express();

app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Import environment variables directly
const { 
    GEMINI_API_KEY,
    IMAGEKIT_PUBLIC_KEY,
    IMAGEKIT_PRIVATE_KEY,
    IMAGEKIT_URL_ENDPOINT,
    IMAGEKIT_UPLOAD_FOLDER
} = require('./env');

// Verify that keys are loaded
console.log("ImageKit Public Key:", IMAGEKIT_PUBLIC_KEY);
console.log("ImageKit URL Endpoint:", IMAGEKIT_URL_ENDPOINT);

// Initialize ImageKit with explicit values
const imagekit = new ImageKit({
    publicKey: IMAGEKIT_PUBLIC_KEY,
    privateKey: IMAGEKIT_PRIVATE_KEY,
    urlEndpoint: IMAGEKIT_URL_ENDPOINT
});

// File upload endpoint
app.post('/upload-cv', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Upload file to ImageKit
        const uploadResult = await imagekit.upload({
            file: req.file.buffer,
            fileName: `cv_${Date.now()}`,
            folder: IMAGEKIT_UPLOAD_FOLDER
        });

        // Return the URL of the uploaded file
        res.json({ 
            success: true, 
            fileUrl: uploadResult.url 
        });
    } catch (error) {
        console.error('Error uploading file to ImageKit:', error);
        res.status(500).json({ message: 'Failed to upload file' });
    }
});

app.post('/process-cv', async(req, res) => {
    const { fileUrl } = req.body;
    
    if(!fileUrl) {
        return res.status(400).json({ message: 'fileUrl is required' });
    }
    
    try {
        const result = await cvHandler(fileUrl);
        res.json(result);
    } catch(err) {
        console.error("Error processing CV:", err);
        res.status(500).json({ message: err.message });
    }
});

app.listen(3100, () => {
    console.log(`Server is running on: http://localhost:3100`);
});