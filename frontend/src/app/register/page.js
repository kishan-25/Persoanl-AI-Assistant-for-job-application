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

  const handleParseSuccess = (extractedData) => {
    console.log("Parsed data:", extractedData);
    
    // Merge existing form data with extracted data
    setFormData(prev => ({
      ...prev,
      name: extractedData.name || prev.name,
      email: extractedData.email || prev.email,
      skills: [...new Set([...prev.skills, ...(extractedData.skills || [])])],
      experience: extractedData.experience || prev.experience,
      role: extractedData.role || prev.role,
      linkedin: extractedData.linkedin || prev.linkedin,
      github: extractedData.github || prev.github,
      portfolio: extractedData.portfolio || prev.portfolio
    }));
    
    toast.success("Resume data imported successfully");
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    try {
      // Show loading toast
      const loadingToast = toast.loading("Creating your account...");
      
      try {
        const data = await registerUser(formData);
        
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        if (data.success) {
          toast.success("Account created successfully!");
          dispatch(loginSuccess(data));
          router.push("/dashboard");
        } else {
          toast.error(data.message || "Registration failed");
        }
      } catch (error) {
        // Dismiss loading toast
        toast.dismiss(loadingToast);
        
        // Handle API error responses with non-200 status codes
        console.log("Handling registration error:", error);
        
        // Check if this is an axios error with a response
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          
          // Check for "User already exists" or similar messages
          if (errorData.message && (
              errorData.message.toLowerCase().includes("already exists") ||
              errorData.message.toLowerCase().includes("already registered")
            )) {
            toast.error("This email is already registered. Please log in instead.");
          } else {
            toast.error(errorData.message || "Registration failed");
          }
        } else {
          toast.error("An error occurred. Please try again.");
        }
      }
    } catch (outerError) {
      console.error("Unexpected error:", outerError);
      toast.error("An unexpected error occurred. Please try again later.");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg my-10 text-black">
      {/* Add Toaster component to render the toasts */}
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          style: {
            background: 'green',
          },
        },
        error: {
          style: {
            background: 'red',
          },
        },
      }} />
      
      <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>
      
      <form onSubmit={handleRegister} className="space-y-4">
        {/* Resume Upload Component */}
        <ResumeUploadComponent onParseSuccess={handleParseSuccess} />
        
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
            />
            <button
              type="button"
              onClick={addSkill}
              className="bg-blue-500 text-white px-4 py-2 rounded-r-md"
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
                  className="ml-2 text-gray-500 hover:text-red-500"
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
          />
          {errors.portfolio && <p className="text-red-500 text-sm mt-1">{errors.portfolio}</p>}
        </div>
        
        {/* Submit Button */}
        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Create Account"}
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