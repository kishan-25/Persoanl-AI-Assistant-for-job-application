"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "@/redux/slices/authSlice";
import { registerUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import ResumeUploadComponent from "@/components/ResumeUploadComponent";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    skills: [],
    experience: "",
    role: "Software Engineer",
    linkedin: "",
    github: "",
    portfolio: ""
  });

  const [skillInput, setSkillInput] = useState("");
  const [errors, setErrors] = useState({});
  const [isResumeProcessing, setIsResumeProcessing] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();
  const { loading } = useSelector((state) => state.auth);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const addSkill = (e) => {
    e?.preventDefault();
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({
      ...formData,
      skills: formData.skills.filter((skill) => skill !== skillToRemove)
    });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid";
    
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    
    if (!formData.experience) newErrors.experience = "Experience is required";
    
    // Validate URLs if provided
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    
    if (formData.linkedin && !urlRegex.test(formData.linkedin)) {
      newErrors.linkedin = "Please enter a valid URL";
    }
    
    if (formData.github && !urlRegex.test(formData.github)) {
      newErrors.github = "Please enter a valid URL";
    }
    
    if (formData.portfolio && !urlRegex.test(formData.portfolio)) {
      newErrors.portfolio = "Please enter a valid URL";
    }
    
    // Show toast notifications for errors
    if (Object.keys(newErrors).length > 0) {
      toast.error("Please fix the errors in the form");
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Enhanced error handling for resume processing
  const handleResumeProcessingError = (error) => {
    console.error("Resume processing error:", error);
    
    // Check if it's a string error message
    if (typeof error === 'string') {
      if (error.includes('quota') || error.includes('429')) {
        toast.error("CV processing temporarily unavailable due to high demand. Please try again in a few minutes or fill the form manually.", {
          duration: 6000,
          style: {
            maxWidth: '400px',
          }
        });
      } else if (error.includes('network') || error.includes('fetch')) {
        toast.error("Network error while processing CV. Please check your connection and try again.");
      } else if (error.includes('file') || error.includes('format')) {
        toast.error("Invalid file format. Please upload a PDF, DOC, or DOCX file.");
      } else {
        toast.error("Failed to process CV. Please try again or fill the form manually.");
      }
      return;
    }

    // Handle structured error objects
    if (error && typeof error === 'object') {
      // Handle Gemini API specific errors
      if (error.message && error.message.includes('GoogleGenerativeAI Error')) {
        if (error.message.includes('429') || error.message.includes('quota')) {
          toast.error("CV processing service is temporarily overloaded. Please try again in a few minutes or fill the form manually.", {
            duration: 6000,
            style: {
              maxWidth: '400px',
            }
          });
        } else if (error.message.includes('401') || error.message.includes('authentication')) {
          toast.error("CV processing service is temporarily unavailable. Please fill the form manually.");
        } else if (error.message.includes('400')) {
          toast.error("Invalid file format or corrupted CV. Please try with a different file.");
        } else if (error.message.includes('413')) {
          toast.error("CV file is too large. Please use a smaller file (max 10MB).");
        } else if (error.message.includes('503') || error.message.includes('502')) {
          toast.error("CV processing service is temporarily down. Please try again later.");
        } else {
          toast.error("Failed to process CV. Please try again or fill the form manually.");
        }
        return;
      }

      // Handle HTTP response errors
      if (error.response) {
        const status = error.response.status;
        const statusText = error.response.statusText;
        
        switch (status) {
          case 400:
            toast.error("Invalid CV file format. Please upload a valid PDF, DOC, or DOCX file.");
            break;
          case 401:
            toast.error("Authentication failed. Please try again.");
            break;
          case 413:
            toast.error("CV file is too large. Please use a file smaller than 10MB.");
            break;
          case 415:
            toast.error("Unsupported file type. Please upload PDF, DOC, or DOCX files only.");
            break;
          case 429:
            toast.error("Too many requests. Please wait a moment and try again.", {
              duration: 5000
            });
            break;
          case 500:
            toast.error("Server error while processing CV. Please try again later.");
            break;
          case 502:
          case 503:
            toast.error("CV processing service is temporarily unavailable. Please try again later.");
            break;
          case 504:
            toast.error("Request timeout while processing CV. Please try with a smaller file.");
            break;
          default:
            toast.error(`Failed to process CV (Error ${status}). Please try again or fill manually.`);
        }
        return;
      }

      // Handle network errors
      if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError') {
        toast.error("Network connection error. Please check your internet and try again.");
        return;
      }

      // Handle timeout errors
      if (error.code === 'TIMEOUT' || error.name === 'TimeoutError') {
        toast.error("CV processing timed out. Please try with a smaller file or fill manually.");
        return;
      }

      // Handle file reading errors
      if (error.name === 'FileReader' || error.code === 'FILE_READ_ERROR') {
        toast.error("Could not read the CV file. Please try with a different file.");
        return;
      }

      // Generic object error with message
      if (error.message) {
        toast.error(`CV processing failed: ${error.message}`);
        return;
      }
    }

    // Fallback for unknown errors
    toast.error("An unexpected error occurred while processing your CV. Please try again or fill the form manually.");
  };

  const handleParseSuccess = (extractedData) => {
    console.log("Parsed data:", extractedData);
    
    try {
      // Validate extracted data
      if (!extractedData || typeof extractedData !== 'object') {
        toast.error("Invalid data extracted from CV. Please fill the form manually.");
        return;
      }

      // Merge existing form data with extracted data
      const updatedData = {
        ...formData,
        name: extractedData.name || formData.name,
        email: extractedData.email || formData.email,
        skills: [...new Set([...formData.skills, ...(extractedData.skills || [])])],
        experience: extractedData.experience || formData.experience,
        role: extractedData.role || formData.role,
        linkedin: extractedData.linkedin || formData.linkedin,
        github: extractedData.github || formData.github,
        portfolio: extractedData.portfolio || formData.portfolio
      };

      setFormData(updatedData);
      
      // Show success message with details
      const extractedFields = [];
      if (extractedData.name) extractedFields.push('name');
      if (extractedData.email) extractedFields.push('email');
      if (extractedData.skills && extractedData.skills.length > 0) extractedFields.push(`${extractedData.skills.length} skills`);
      if (extractedData.experience) extractedFields.push('experience');
      
      if (extractedFields.length > 0) {
        toast.success(`CV processed successfully! Extracted: ${extractedFields.join(', ')}`, {
          duration: 5000,
          style: {
            maxWidth: '400px',
          }
        });
      } else {
        toast.success("CV uploaded successfully, but no data could be extracted. Please fill the form manually.");
      }
      
    } catch (error) {
      console.error("Error processing extracted data:", error);
      toast.error("Error processing extracted CV data. Please fill the form manually.");
    }
  };

  const handleResumeUploadStart = () => {
    setIsResumeProcessing(true);
    toast.loading("Processing your CV...", {
      id: 'resume-processing',
      duration: 30000, // 30 seconds timeout
    });
  };

  const handleResumeUploadComplete = () => {
    setIsResumeProcessing(false);
    toast.dismiss('resume-processing');
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    // Prevent submission if resume is still processing
    if (isResumeProcessing) {
      toast.error("Please wait for CV processing to complete before submitting.");
      return;
    }
    
    if (!validateForm()) return;
    
    let loadingToast;
    
    try {
      // Show loading toast
      loadingToast = toast.loading("Creating your account...");
      
      const data = await registerUser(formData);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (data.success) {
        toast.success("Account created successfully! Redirecting to dashboard...", {
          duration: 3000
        });
        dispatch(loginSuccess(data));
        
        // Add a small delay to show the success message
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        toast.error(data.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      // Dismiss loading toast if it exists
      if (loadingToast) {
        toast.dismiss(loadingToast);
      }
      
      console.error("Registration error:", error);
      
      // Handle different types of registration errors
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const status = error.response.status;
        
        switch (status) {
          case 400:
            if (errorData.message && (
                errorData.message.toLowerCase().includes("already exists") ||
                errorData.message.toLowerCase().includes("already registered")
              )) {
              toast.error("This email is already registered. Please log in instead.", {
                duration: 5000
              });
            } else if (errorData.message && errorData.message.toLowerCase().includes("validation")) {
              toast.error("Please check your form data and try again.");
            } else {
              toast.error(errorData.message || "Invalid registration data. Please check your inputs.");
            }
            break;
          case 401:
            toast.error("Authentication failed. Please try again.");
            break;
          case 409:
            toast.error("An account with this email already exists. Please log in instead.");
            break;
          case 422:
            toast.error("Invalid data provided. Please check all fields and try again.");
            break;
          case 429:
            toast.error("Too many registration attempts. Please wait a moment and try again.");
            break;
          case 500:
            toast.error("Server error occurred. Please try again later.");
            break;
          case 503:
            toast.error("Registration service is temporarily unavailable. Please try again later.");
            break;
          default:
            toast.error(errorData.message || `Registration failed (Error ${status}). Please try again.`);
        }
      } else if (error.code === 'NETWORK_ERROR' || error.name === 'NetworkError') {
        toast.error("Network connection error. Please check your internet connection and try again.");
      } else if (error.code === 'TIMEOUT' || error.name === 'TimeoutError') {
        toast.error("Request timed out. Please try again.");
      } else if (error.message) {
        toast.error(`Registration failed: ${error.message}`);
      } else {
        toast.error("An unexpected error occurred during registration. Please try again.");
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg my-10 text-black">
      {/* Enhanced Toaster component with better styling */}
      <Toaster 
        position="top-right" 
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
            fontSize: '14px',
            borderRadius: '8px',
            padding: '12px 16px',
            maxWidth: '350px',
          },
          success: {
            duration: 4000,
            style: {
              background: '#10b981',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#10b981',
            },
          },
          error: {
            duration: 6000,
            style: {
              background: '#ef4444',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#ef4444',
            },
          },
          loading: {
            style: {
              background: '#3b82f6',
              color: '#fff',
            },
            iconTheme: {
              primary: '#fff',
              secondary: '#3b82f6',
            },
          },
        }} 
      />
      
      <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>
      
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Enhanced Resume Upload Component with error handling */}
        <ResumeUploadComponent 
          onParseSuccess={handleParseSuccess}
          onError={handleResumeProcessingError}
          onUploadStart={handleResumeUploadStart}
          onUploadComplete={handleResumeUploadComplete}
          disabled={isResumeProcessing}
        />
        
        {/* Show processing indicator */}
        {isResumeProcessing && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-center text-blue-800 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span>Processing your CV... Please wait.</span>
            </div>
          </div>
        )}
        
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.name ? "border-red-500" : ""
            }`}
            disabled={isResumeProcessing}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        
        {/* Email Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.email ? "border-red-500" : ""
            }`}
            disabled={isResumeProcessing}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>
        
        {/* Password Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md ${
              errors.password ? "border-red-500" : ""
            }`}
            disabled={isResumeProcessing}
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
        </div>
        
        {/* Skills Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Skills</label>
          <div className="flex mb-2">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addSkill(e);
                }
              }}
              className="flex-grow px-3 py-2 border rounded-l-md"
              placeholder="Add skill"
              disabled={isResumeProcessing}
            />
            <button
              type="button"
              onClick={addSkill}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isResumeProcessing}
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill, index) => (
              <div
                key={index}
                className="bg-gray-100 px-3 py-1 rounded-full flex items-center"
              >
                <span>{skill}</span>
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  className="ml-2 text-gray-500 hover:text-red-500 disabled:opacity-50"
                  disabled={isResumeProcessing}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
        
        {/* Experience Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Years of Experience</label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleChange}
            min="0"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.experience ? "border-red-500" : ""
            }`}
            disabled={isResumeProcessing}
          />
          {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
        </div>
        
        {/* Role Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Preferred Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-md"
            disabled={isResumeProcessing}
          >
            <option value="Software Engineer">Software Engineer</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Full Stack Developer">Full Stack Developer</option>
          </select>
        </div>
        
        {/* LinkedIn Field */}
        <div>
          <label className="block text-sm font-medium mb-1">LinkedIn</label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourprofile"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.linkedin ? "border-red-500" : ""
            }`}
            disabled={isResumeProcessing}
          />
          {errors.linkedin && <p className="text-red-500 text-sm mt-1">{errors.linkedin}</p>}
        </div>
        
        {/* GitHub Field */}
        <div>
          <label className="block text-sm font-medium mb-1">GitHub</label>
          <input
            type="url"
            name="github"
            value={formData.github}
            onChange={handleChange}
            placeholder="https://github.com/yourusername"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.github ? "border-red-500" : ""
            }`}
            disabled={isResumeProcessing}
          />
          {errors.github && <p className="text-red-500 text-sm mt-1">{errors.github}</p>}
        </div>
        
        {/* Portfolio Field */}
        <div>
          <label className="block text-sm font-medium mb-1">Portfolio</label>
          <input
            type="url"
            name="portfolio"
            value={formData.portfolio}
            onChange={handleChange}
            placeholder="https://yourportfolio.com"
            className={`w-full px-3 py-2 border rounded-md ${
              errors.portfolio ? "border-red-500" : ""
            }`}
            disabled={isResumeProcessing}
          />
          {errors.portfolio && <p className="text-red-500 text-sm mt-1">{errors.portfolio}</p>}
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors ${
            (loading || isResumeProcessing) ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={loading || isResumeProcessing}
        >
          {loading ? "Creating Account..." : 
           isResumeProcessing ? "Processing CV..." : 
           "Create Account"}
        </button>
      </form>
      
      <p className="mt-4 text-center">
        Already have an account? {" "}
        <Link href="/login" className="text-blue-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}