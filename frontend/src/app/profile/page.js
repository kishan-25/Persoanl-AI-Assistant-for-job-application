"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { loginSuccess } from "@/redux/slices/authSlice";
import AuthGuard from "@/utils/authGuard";
import axios from "axios";
import { getToken, getUserFromLocalStorage } from "@/services/authService";

// Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
  const textColor = 'text-white';

  return (
    <div className={`fixed top-4 right-4 ${bgColor} ${textColor} px-6 py-3 rounded-lg shadow-lg z-50 max-w-sm`}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 font-bold"
        >
          ×
        </button>
      </div>
    </div>
  );
};

// Toast Hook
const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info') => {
    const id = Date.now();
    const newToast = { id, message, type };
    
    setToasts(prev => [...prev, newToast]);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const ToastContainer = () => (
    <div className="fixed top-4 right-4 space-y-2 z-50">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );

  return { showToast, ToastContainer };
};

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const userData = user || getUserFromLocalStorage();
  const router = useRouter();
  const dispatch = useDispatch();
  const { showToast, ToastContainer } = useToast();

  const [formData, setFormData] = useState({
    skills: [],
    experience: "",
    role: "Software Engineer",
    education: "",
    location: "",
    aboutMe: "",
    projects: [],
    linkedin: "",
    github: "",
    portfolio: ""
  });

  const [skillInput, setSkillInput] = useState("");
  const [projectInput, setProjectInput] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userData) {
      setFormData({
        skills: userData.skills || [],
        experience: userData.experience || "",
        role: userData.role || "Software Engineer",
        education: userData.education || "",
        location: userData.location || "",
        aboutMe: userData.aboutMe || "",
        projects: userData.projects || [],
        linkedin: userData.linkedin || "",
        github: userData.github || "",
        portfolio: userData.portfolio || ""
      });
    }
  }, [userData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const addSkill = () => {
    try {
      if (!skillInput.trim()) {
        showToast("Please enter a skill name", "error");
        return;
      }

      if (formData.skills.includes(skillInput.trim())) {
        showToast("This skill is already added", "error");
        return;
      }

      if (formData.skills.length >= 20) {
        showToast("You can add maximum 20 skills", "error");
        return;
      }

      setFormData({
        ...formData,
        skills: [...formData.skills, skillInput.trim()]
      });
      setSkillInput("");
      showToast("Skill added successfully", "success");
    } catch (error) {
      showToast("Failed to add skill", "error");
    }
  };

  const removeSkill = (skillToRemove) => {
    try {
      setFormData({
        ...formData,
        skills: formData.skills.filter(skill => skill !== skillToRemove)
      });
      showToast("Skill removed", "success");
    } catch (error) {
      showToast("Failed to remove skill", "error");
    }
  };

  const addProject = () => {
    try {
      if (!projectInput.trim()) {
        showToast("Please enter a project name", "error");
        return;
      }

      if (formData.projects.includes(projectInput.trim())) {
        showToast("This project is already added", "error");
        return;
      }

      if (formData.projects.length >= 10) {
        showToast("You can add maximum 10 projects", "error");
        return;
      }

      setFormData({
        ...formData,
        projects: [...formData.projects, projectInput.trim()]
      });
      setProjectInput("");
      showToast("Project added successfully", "success");
    } catch (error) {
      showToast("Failed to add project", "error");
    }
  };

  const removeProject = (projectToRemove) => {
    try {
      setFormData({
        ...formData,
        projects: formData.projects.filter(project => project !== projectToRemove)
      });
      showToast("Project removed", "success");
    } catch (error) {
      showToast("Failed to remove project", "error");
    }
  };

  const validateForm = () => {
    const errors = [];

    // Validate experience
    if (formData.experience && (isNaN(formData.experience) || formData.experience < 0 || formData.experience > 50)) {
      errors.push("Experience must be a valid number between 0 and 50 years");
    }

    // Validate URLs
    const urlFields = [
      { field: 'linkedin', name: 'LinkedIn' },
      { field: 'github', name: 'GitHub' },
      { field: 'portfolio', name: 'Portfolio' }
    ];

    urlFields.forEach(({ field, name }) => {
      if (formData[field] && formData[field].trim()) {
        try {
          new URL(formData[field]);
        } catch {
          errors.push(`${name} URL is not valid`);
        }
      }
    });

    // Validate required fields length
    if (formData.aboutMe && formData.aboutMe.length > 1000) {
      errors.push("About Me section should not exceed 1000 characters");
    }

    if (formData.education && formData.education.length > 200) {
      errors.push("Education field should not exceed 200 characters");
    }

    if (formData.location && formData.location.length > 100) {
      errors.push("Location field should not exceed 100 characters");
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      validationErrors.forEach(error => showToast(error, "error"));
      return;
    }

    setLoading(true);

    try {
      const token = getToken();
      
      if (!token) {
        showToast("Authentication error. Please login again.", "error");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      const response = await axios.put(
        "http://localhost:5000/api/v1/auth/me",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      if (response.data.success) {
        // Update the user data in Redux and localStorage
        const updatedUser = {
          ...userData,
          ...response.data.user
        };
        
        dispatch(loginSuccess(updatedUser));
        
        try {
          localStorage.setItem("userData", JSON.stringify(updatedUser));
        } catch (storageError) {
          console.warn("Failed to update localStorage:", storageError);
          showToast("Profile updated but failed to save locally", "info");
        }
        
        showToast("Profile updated successfully!", "success");
      } else {
        showToast(response.data.message || "Failed to update profile", "error");
      }
    } catch (err) {
      console.error("Profile update error:", err);
      
      if (err.code === 'ECONNABORTED') {
        showToast("Request timed out. Please try again.", "error");
      } else if (err.response) {
        // Server responded with error status
        const status = err.response.status;
        const message = err.response.data?.message;
        
        switch (status) {
          case 400:
            showToast(message || "Invalid data provided", "error");
            break;
          case 401:
            showToast("Your session has expired. Please login again.", "error");
            setTimeout(() => {
              router.push("/login");
            }, 2000);
            break;
          case 403:
            showToast("You don't have permission to perform this action", "error");
            break;
          case 404:
            showToast("User not found", "error");
            break;
          case 422:
            showToast(message || "Validation failed. Please check your input.", "error");
            break;
          case 429:
            showToast("Too many requests. Please wait a moment and try again.", "error");
            break;
          case 500:
            showToast("Server error. Please try again later.", "error");
            break;
          default:
            showToast(message || "An unexpected error occurred", "error");
        }
      } else if (err.request) {
        // Network error
        showToast("Network error. Please check your connection and try again.", "error");
      } else {
        // Other error
        showToast("An unexpected error occurred. Please try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e, action) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      action();
    }
  };

  return (
    <AuthGuard>
      <ToastContainer />
      <div className="min-h-screen bg-gray-50 p-4 text-black">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Edit Profile</h1>
            <button
              onClick={() => router.push("/dashboard")}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded hover:bg-gray-200 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Skills Section */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Skills ({formData.skills.length}/20)
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  placeholder="Add a skill"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addSkill)}
                  className="flex-grow px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={50}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill, index) => (
                  <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-gray-500 hover:text-red-500 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Experience */}
            <div>
              <label className="block text-sm font-medium mb-1">Years of Experience</label>
              <input
                type="number"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                min="0"
                max="50"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium mb-1">Current Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="DevOps Engineer">DevOps Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Product Manager">Product Manager</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
              </select>
            </div>

            {/* Education */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Education ({formData.education.length}/200)
              </label>
              <input
                type="text"
                name="education"
                value={formData.education}
                onChange={handleChange}
                placeholder="e.g. B.Tech in Computer Science"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={200}
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Location ({formData.location.length}/100)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Delhi, India"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
            </div>

            {/* About Me */}
            <div>
              <label className="block text-sm font-medium mb-1">
                About Me ({formData.aboutMe.length}/1000)
              </label>
              <textarea
                name="aboutMe"
                value={formData.aboutMe}
                onChange={handleChange}
                rows="4"
                placeholder="Write a short bio about yourself"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={1000}
              ></textarea>
            </div>

            {/* Projects */}
            <div>
              <label className="block text-sm font-medium mb-1">
                Projects ({formData.projects.length}/10)
              </label>
              <div className="flex mb-2">
                <input
                  type="text"
                  placeholder="Add a project"
                  value={projectInput}
                  onChange={(e) => setProjectInput(e.target.value)}
                  onKeyPress={(e) => handleKeyPress(e, addProject)}
                  className="flex-grow px-3 py-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength={100}
                />
                <button
                  type="button"
                  onClick={addProject}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600 transition-colors"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {formData.projects.map((project, index) => (
                  <div key={index} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                    <span>{project}</span>
                    <button
                      type="button"
                      onClick={() => removeProject(project)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div>
              <label className="block text-sm font-medium mb-1">LinkedIn URL</label>
              <input
                type="url"
                name="linkedin"
                value={formData.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/yourusername"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">GitHub URL</label>
              <input
                type="url"
                name="github"
                value={formData.github}
                onChange={handleChange}
                placeholder="https://github.com/yourusername"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Portfolio URL</label>
              <input
                type="url"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://yourportfolio.com"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </span>
              ) : (
                "Update Profile"
              )}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
}