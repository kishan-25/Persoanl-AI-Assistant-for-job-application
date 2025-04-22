"use client";
import { useState } from "react";
import { parseResume } from "@/services/resumeService";

function ResumeUploadComponent({ onParseSuccess }) {
  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      if (!selectedFile.type.includes("pdf") && 
          !selectedFile.type.includes("docx") && 
          !selectedFile.type.includes("doc")) {
        setUploadError("Please upload a PDF or Word document");
        setFile(null);
        return;
      }
      
      // Validate file size (max 5MB)
      if (selectedFile.size > 5 * 1024 * 1024) {
        setUploadError("File size must be less than 5MB");
        setFile(null);
        return;
      }

      setFile(selectedFile);
      setUploadError("");
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file first");
      return;
    }

    setIsUploading(true);
    setUploadError("");
    setUploadProgress(0);

    try {
      // Use a simulated progress interval since we can't get real progress from the service function
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 300);
      
      // Process resume using our service
      const parsedData = await parseResume(file);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      // Format the parsed data to match your form structure
      const formattedData = {
        name: parsedData.firstname && parsedData.lastname ? 
              `${parsedData.firstname} ${parsedData.lastname}` : 
              parsedData.firstname || parsedData.lastname || "",
        email: parsedData.contact?.email || "",
        skills: parsedData.skills || [],
        experience: parsedData.yearOfExperience?.toString() || "",
        role: parsedData.title || "Software Engineer",
        linkedin: parsedData.contact?.linkedin || "",
        github: parsedData.contact?.github || "",
        portfolio: parsedData.contact?.portfolio || ""
      };

      // Pass the extracted data to the parent component
      onParseSuccess(formattedData);
      
    } catch (error) {
      console.error("Resume upload error:", error);
      setUploadError(error.response?.data?.message || error.message || "Failed to process resume");
    } finally {
      setIsUploading(false);
    }
  };

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
                      file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            disabled={isUploading}
          />
          
          <button
            onClick={handleUpload}
            disabled={!file || isUploading}
            className={`ml-2 px-4 py-2 text-sm font-medium rounded-md 
                      ${!file || isUploading
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                      }`}
          >
            {isUploading ? "Processing..." : "Parse Resume"}
          </button>
        </div>
        
        {/* Progress bar */}
        {isUploading && (
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        )}
        
        {uploadError && (
          <p className="text-red-500 text-sm">{uploadError}</p>
        )}
        
        {file && (
          <p className="text-sm text-gray-600">
            Selected file: {file.name}
          </p>
        )}
      </div>
    </div>
  );
}

export default ResumeUploadComponent;