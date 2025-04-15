import { useState } from "react";

export default function ResumeUploadComponent({ onParseSuccess }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseSuccess, setParseSuccess] = useState(false);
  const [parseError, setParseError] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    
    // Reset states
    setParseSuccess(false);
    setParseError("");
    
    // Validate file type
    if (file && file.type !== "application/pdf") {
      setParseError("Only PDF files are allowed");
      setResumeFile(null);
      e.target.value = null; // Reset file input
      return;
    }
    
    setResumeFile(file);
  };

  const handleParseResume = async () => {
    if (!resumeFile) {
      setParseError("Please select a resume file first");
      return;
    }
    
    setIsParsing(true);
    setParseError("");
    
    const fd = new FormData();
    fd.append("resume", resumeFile);
    
    try {
      const res = await fetch("http://localhost:5000/api/v1/resume/parse", {
        method: "POST",
        body: fd
      });
      
      const data = await res.json();
      
      if (data.success && data.extracted) {
        setParseSuccess(true);
        // Send the extracted data to parent component
        onParseSuccess(data.extracted);
      } else {
        setParseError(data.message || "Resume parsing failed");
      }
    } catch (err) {
      console.error("Resume parse error:", err);
      setParseError("Error connecting to server");
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-1">Upload Resume (PDF)</label>
      <div className="flex items-center">
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          className="w-full px-3 py-2 border rounded-l-md"
        />
        <button
          type="button"
          onClick={handleParseResume}
          disabled={!resumeFile || isParsing}
          className={`bg-green-600 text-white px-4 py-2 rounded-r-md hover:bg-green-700 ${
            !resumeFile || isParsing ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {isParsing ? "Parsing..." : "Parse Resume"}
        </button>
      </div>
      
      {parseError && (
        <div className="mt-2 text-red-500 text-sm">
          {parseError}
        </div>
      )}
      
      {parseSuccess && (
        <div className="mt-2 text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
          <span>Resume parsed successfully!</span>
        </div>
      )}
    </div>
  );
}