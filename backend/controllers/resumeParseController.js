// backend/controllers/resumeParseController.js
const ImageKit = require('imagekit');
const cvHandler = require('../cvHandler');

// Make sure environment variables are accessible
// Debug logs to check environment variables are loaded
console.log("ImageKit Config Check:");
console.log("- PUBLIC_KEY:", process.env.IMAGEKIT_PUBLIC_KEY ? "Loaded" : "Missing");
console.log("- PRIVATE_KEY:", process.env.IMAGEKIT_PRIVATE_KEY ? "Loaded" : "Missing");
console.log("- URL_ENDPOINT:", process.env.IMAGEKIT_URL_ENDPOINT ? "Loaded" : "Missing");

// Use string literals to ensure keys are properly defined
const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "public_wBuKV8oOQOOZu3tuua14Y85MUiM=",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "private_5VmVpl+MyYTlAzDwPTy9P5AJRi4=", 
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/ocxypkiqc"
});

const parseResume = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                message: 'No resume file uploaded' 
            });
        }

        // Upload the file to ImageKit
        const uploadResult = await imagekit.upload({
            file: req.file.buffer,
            fileName: `resume_${Date.now()}`,
            folder: process.env.IMAGEKIT_UPLOAD_FOLDER || "cv-parser"
        });

        // Process the CV using the cvHandler
        const fileUrl = uploadResult.url;
        const extractedData = await cvHandler(fileUrl);

        // Transform data to match your user model structure
        const transformedData = {
            name: extractedData.firstname && extractedData.lastname 
                ? `${extractedData.firstname} ${extractedData.lastname}` 
                : extractedData.firstname || extractedData.lastname || "",
            email: extractedData.contact?.email || "",
            skills: extractedData.skills || [],
            experience: extractedData.yearOfExperience?.toString() || "",
            role: extractedData.title || "Software Engineer",
            education: extractedData.education?.length 
                ? extractedData.education.map(edu => edu.institution).join(", ") 
                : "",
            linkedin: extractedData.contact?.linkedin || "",
            github: extractedData.contact?.github || "",
            portfolio: extractedData.contact?.portfolio || "",
            aboutMe: extractedData.about || ""
        };

        return res.status(200).json({
            success: true,
            data: transformedData,
            rawData: extractedData // Include raw data for debugging
        });

    } catch (error) {
        console.error("Resume parsing error:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to parse resume",
            error: error.message
        });
    }
};

module.exports = { parseResume };