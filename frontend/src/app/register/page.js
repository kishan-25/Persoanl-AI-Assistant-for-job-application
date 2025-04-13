// src/app/register/page.js
"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "@/redux/slices/authSlice";
import { registerUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        skills: [],
        experience: "",
        role: "Software Engineer", // Default role
        linkedin: "",
        github: "",
        portfolio: ""
    });
    
    const [skillInput, setSkillInput] = useState("");
    const [errors, setErrors] = useState({});
    
    const dispatch = useDispatch();
    const router = useRouter();
    const { loading, error } = useSelector((state) => state.auth);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const addSkill = () => {
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
            skills: formData.skills.filter(skill => skill !== skillToRemove)
        });
    };

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name) newErrors.name = "Name is required";
        if (!formData.email) newErrors.email = "Email is required";
        if (!formData.password) newErrors.password = "Password is required";        
        if (!formData.experience) newErrors.experience = "Experience is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        try {
            const data = await registerUser(formData);
            
            if(data.success) {
                dispatch(loginSuccess(data));
                router.push("/dashboard");
            } else {
                setErrors({...errors, server: data.message || "Registration failed"});
            }
        } catch (error) {
            console.error("Registration failed:", error);
            setErrors({...errors, server: "An error occurred. Please try again."});
        }
    };

    return(
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg my-10 text-black">
            <h1 className="text-2xl font-bold mb-6 text-center">Create Your Account</h1>
            
            {errors.server && <p className="text-red-500 mb-4">{errors.server}</p>}
            
            <form onSubmit={handleRegister} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Full Name</label>
                    <input 
                        type="text"
                        name="name"
                        placeholder="Enter your full name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input 
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        name="password"
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                    {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Skills</label>
                    <div className="flex mb-2">
                        <input
                            type="text"
                            placeholder="Add a skill"
                            value={skillInput}
                            onChange={(e) => setSkillInput(e.target.value)}
                            className="flex-grow px-3 py-2 border rounded-l-md"
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
                            <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
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
                
                <div>
                    <label className="block text-sm font-medium mb-1">Years of Experience</label>
                    <input
                        type="number"
                        name="experience"
                        placeholder="Years of experience"
                        value={formData.experience}
                        onChange={handleChange}
                        min="0"
                        className="w-full px-3 py-2 border rounded-md"
                    />
                    {errors.experience && <p className="text-red-500 text-sm mt-1">{errors.experience}</p>}
                </div>
                
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
                
                <div>
                    <label className="block text-sm font-medium mb-1">LinkedIn URL (optional)</label>
                    <input
                        type="url"
                        name="linkedin"
                        placeholder="Your LinkedIn profile URL"
                        value={formData.linkedin}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">GitHub URL (optional)</label>
                    <input
                        type="url"
                        name="github"
                        placeholder="Your GitHub profile URL"
                        value={formData.github}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Portfolio URL (optional)</label>
                    <input
                        type="url"
                        name="portfolio"
                        placeholder="Your portfolio website URL"
                        value={formData.portfolio}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    disabled={loading}
                >
                    {loading ? "Creating Account..." : "Create Account"}
                </button>
            </form>
            
            <p className="mt-4 text-center">
                Already have an account? <Link href="/login" className="text-blue-600 hover:underline">Log in</Link>
            </p>
        </div>
    );
}