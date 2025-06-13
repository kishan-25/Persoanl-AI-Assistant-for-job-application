"use client";
import { useState } from "react";
import { parseResume } from "@/services/resumeService";

function ResumeUploadComponent({ onParseSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  // File validation constants
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'application/vnd.ms-word.document.macroEnabled.12' // .docm
  ];

  const validateFile = (selectedFile) => {
    const errors = [];

    // Check if file exists
    if (!selectedFile) {
      errors.push("No file selected");
      return errors;
    }

    // Validate file type
    const isValidType = ALLOWED_TYPES.some(type => selectedFile.type === type) ||
                       selectedFile.name.toLowerCase().endsWith('.pdf') ||
                       selectedFile.name.toLowerCase().endsWith('.doc') ||
                       selectedFile.name.toLowerCase().endsWith('.docx');

    if (!isValidType) {
      errors.push("Please upload a PDF or Word document (.pdf, .doc, .docx)");
    }

    // Validate file size
    if (selectedFile.size > MAX_FILE_SIZE) {
      const sizeMB = (selectedFile.size / (1024 * 1024)).toFixed(2);
      errors.push(`File size (${sizeMB}MB) exceeds the 5MB limit`);
    }

    // Check for empty files
    if (selectedFile.size === 0) {
      errors.push("File appears to be empty");
    }

    return errors;
  };

  const handleFileChange = (e) => {
    try {
      const selectedFile = e.target.files?.[0];
      
      if (!selectedFile) {
        setFile(null);
        setUploadError("");
        return;
      }

      const validationErrors = validateFile(selectedFile);
      
      if (validationErrors.length > 0) {
        setUploadError(validationErrors.join(". "));
        setFile(null);
        // Reset the input
        e.target.value = "";
        return;
      }

      setFile(selectedFile);
      setUploadError("");
    } catch (error) {
      console.error("Error handling file selection:", error);
      setUploadError("An error occurred while selecting the file. Please try again.");
      setFile(null);
    }
  };

  const getErrorMessage = (error) => {
    // Network errors
    if (!navigator.onLine) {
      return "No internet connection. Please check your network and try again.";
    }

    // API response errors
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      switch (status) {
        case 400:
          return message || "Invalid file format or corrupted file";
        case 413:
          return "File is too large. Please upload a smaller file.";
        case 422:
          return "Unable to process this document. Please try a different format.";
        case 429:
          return "Too many requests. Please wait a moment and try again.";
        case 500:
          return "Server error. Please try again later.";
        case 503:
          return "Service temporarily unavailable. Please try again later.";
        default:
          return message || `Server error (${status}). Please try again.`;
      }
    }

    // Network/timeout errors
    if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError') {
      return "Network error. Please check your connection and try again.";
    }

    if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
      return "Request timed out. The file might be too large or complex. Please try again.";
    }

    // File parsing errors
    if (error.message?.includes('parse') || error.message?.includes('format')) {
      return "Unable to read the document. Please ensure it's a valid PDF or Word file.";
    }

    // Generic error with specific message
    if (error.message) {
      return `Processing failed: ${error.message}`;
    }

    // Fallback error
    return "Failed to process resume. Please try again or contact support if the problem persists.";
  };

  const handleUpload = async () => {
    // Validate before upload
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }

    // Double-check file validation
    const validationErrors = validateFile(file);
    if (validationErrors.length > 0) {
      setUploadError(validationErrors.join(". "));
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadProgress(0);

    let progressInterval = null;

    try {
      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error("No internet connection");
      }

      // Start progress simulation
      progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      // Process resume using service with timeout
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Request timed out after 30 seconds')), 30000)
      );

      const parsedData = await Promise.race([
        parseResume(file),
        timeoutPromise
      ]);
      
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      setUploadProgress(100);
      
      // Validate parsed data
      if (!parsedData || typeof parsedData !== 'object') {
        throw new Error("Invalid response from resume parsing service");
      }

      // Format the parsed data with error handling for each field
      const formattedData = {
        name: (() => {
          try {
            if (parsedData.firstname && parsedData.lastname) {
              return `${parsedData.firstname} ${parsedData.lastname}`.trim();
            }
            return (parsedData.firstname || parsedData.lastname || "").trim();
          } catch (e) {
            console.warn("Error processing name:", e);
            return "";
          }
        })(),
        
        email: (() => {
          try {
            const email = parsedData.contact?.email || "";
            // Basic email validation
            if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
              console.warn("Invalid email format detected:", email);
              return "";
            }
            return email;
          } catch (e) {
            console.warn("Error processing email:", e);
            return "";
          }
        })(),
        
        skills: (() => {
          try {
            const skills = parsedData.skills;
            return Array.isArray(skills) ? skills : [];
          } catch (e) {
            console.warn("Error processing skills:", e);
            return [];
          }
        })(),
        
        experience: (() => {
          try {
            const years = parsedData.yearOfExperience;
            if (years !== null && years !== undefined) {
              const numYears = Number(years);
              return !isNaN(numYears) ? numYears.toString() : "";
            }
            return "";
          } catch (e) {
            console.warn("Error processing experience:", e);
            return "";
          }
        })(),
        
        role: parsedData.title || "Software Engineer",
        linkedin: parsedData.contact?.linkedin || "",
        github: parsedData.contact?.github || "",
        portfolio: parsedData.contact?.portfolio || ""
      };

      // Validate that we got some useful data
      const hasUsefulData = formattedData.name || 
                           formattedData.email || 
                           formattedData.skills.length > 0 || 
                           formattedData.experience;

      if (!hasUsefulData) {
        throw new Error("No readable information found in the document. Please ensure the resume contains clear text.");
      }

      // Pass the extracted data to the parent component
      if (typeof onParseSuccess === 'function') {
        onParseSuccess(formattedData);
      } else {
        console.error("onParseSuccess is not a function");
        throw new Error("Configuration error. Please refresh the page and try again.");
      }
      
    } catch (error) {
      console.error("Resume upload error:", error);
      
      // Clear progress interval on error
      if (progressInterval) {
        clearInterval(progressInterval);
        progressInterval = null;
      }
      
      setUploadProgress(0);
      setUploadError(getErrorMessage(error));
    } finally {
      setIsUploading(false);
      
      // Cleanup interval if still running
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  };

  // Cleanup on unmount
  useState(() => {
    return () => {
      // This cleanup runs on unmount, but we can't use useEffect here
      // so we'll handle cleanup in the try/catch blocks above
    };
  });

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6 border border-gray-200">
      <h2 className="text-lg font-medium mb-3">Quick Registration with Resume</h2>
      <p className="text-sm text-gray-600 mb-4">
        Upload your resume to automatically fill in your profile information
      </p>
      
      <div className="flex flex-col space-y-3">
        <div className="flex items-center">
          <input
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx"
            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0 file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100
                      disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isUploading}
            aria-describedby={uploadError ? "upload-error" : undefined}
          />
          
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`ml-2 px-4 py-2 text-sm font-medium rounded-md transition-colors
                      ${!file || isUploading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      }`}
            aria-label={isUploading ? "Processing resume" : "Parse resume"}
          >
            {isUploading ? "Processing..." : "Parse Resume"}
          </button>
        </div>
        
        {/* Progress bar */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5" role="progressbar" aria-valuenow={uploadProgress} aria-valuemin="0" aria-valuemax="100">
            <div 
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
        
        {uploadError && (
          <div 
            id="upload-error"
            className="flex items-start space-x-2 p-3 bg-red-50 border border-red-200 rounded-md"
            role="alert"
          >
            <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-red-700 text-sm">{uploadError}</p>
          </div>
        )}
        
        {file && !uploadError && (
          <div className="flex items-center space-x-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-green-700">
              Selected: {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResumeUploadComponent;