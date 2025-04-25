"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/redux/slices/authSlice";
import AuthGuard from "@/utils/authGuard";
import { fetchTelegramJobs, fetchTimesJobs } from "@/services/jobService";
import { calculateJobSkillMatch, getMatchColor, getMatchStrength } from "@/utils/jobMatching";
import { getUserFromLocalStorage } from "@/services/authService";
import Navbar from "@/components/Navbar";

export default function DashboardPage() {
    const [telegramJobs, setTelegramJobs] = useState([]);
    const [timesJobs, setTimesJobs] = useState([]);
    const [activeTab, setActiveTab] = useState("times");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);
    
    // Get user data from local storage if not in redux state
    const userData = user || getUserFromLocalStorage();

    const handleLogout = () => {
        dispatch(logout());
        router.push("/login");
    };

    // Using correct job skill matching logic
    useEffect(() => {
        const getJobs = async () => {
            setLoading(true);
            try {
                const telegramRes = await fetchTelegramJobs();
                const timesRes = await fetchTimesJobs();

                if (telegramRes.success) {
                    // Calculate skill match for telegram jobs
                    const jobsWithMatch = telegramRes.jobs.map(job => {
                        // Get key skills from job text if possible
                        const jobSkills = job.keySkills || '';
                        
                        const matchResult = calculateJobSkillMatch(
                            userData?.skills || [], 
                            job.text || "",
                            job.title || "",
                            jobSkills
                        );
                        
                        return {
                            ...job,
                            matchPercentage: matchResult.matchPercentage,
                            matchStrength: getMatchStrength(matchResult.matchPercentage),
                            skillsNotMatched: matchResult.skillsNotMatched
                        };
                    });
                    
                    // Filter out jobs with 0% match and sort remaining by match percentage
                    const filteredJobs = jobsWithMatch.filter(job => job.matchPercentage > 0);
                    setTelegramJobs(filteredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage));
                }
                
                if (timesRes.success) {
                    // Calculate skill match for times jobs
                    const jobsWithMatch = timesRes.jobs.map(job => {
                        const matchResult = calculateJobSkillMatch(
                            userData?.skills || [], 
                            job.description || "",
                            job.title || "",
                            job.keySkills || ""
                        );
                        
                        return {
                            ...job,
                            matchPercentage: matchResult.matchPercentage,
                            matchStrength: getMatchStrength(matchResult.matchPercentage),
                            skillsNotMatched: matchResult.skillsNotMatched
                        };
                    });
                    
                    // Filter out jobs with 0% match and sort remaining by match percentage
                    const filteredJobs = jobsWithMatch.filter(job => job.matchPercentage > 0);
                    setTimesJobs(filteredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage));
                }
                
                setLoading(false);
            } catch (error) {
                console.error("Failed to fetch jobs", error);
                setError("Failed to load jobs. Please try again later.");
                setLoading(false);
            }
        };

        if (userData) {
            getJobs();
        }
    }, [userData]);

    const renderJobCard = (job, source) => {
        return (
            <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between">
                    <h3 className="font-semibold text-lg">{job.title || "No title"}</h3>
                    <div className="flex flex-col items-end">
                        <div className={`${getMatchColor(job.matchPercentage)} font-bold text-lg`}>
                            {job.matchPercentage}% Match
                        </div>
                        <div className="text-sm text-gray-500">
                            {job.matchStrength} match
                        </div>
                    </div>
                </div>
                
                <p className="text-gray-700 mt-2">{job.company || "Unknown company"}</p>
                
                {job.location && <p className="text-gray-600 mt-1"> {job.location}</p>}
                
                {/* Display skills not matched - skills in job description but not in user skills */}
                {job.skillsNotMatched && job.skillsNotMatched.length > 0 && (
                    <div className="mt-2">
                        <p className="text-sm font-medium text-orange-600">Skills not matched:</p>
                        <p className="text-sm text-gray-600">{job.skillsNotMatched.join(", ")}</p>
                    </div>
                )}
                
                {source === "times" && job.keySkills && (
                    <div className="mt-2">
                        <p className="text-sm font-medium">Key Skills:</p>
                        <p className="text-sm text-gray-600">{job.keySkills}</p>
                    </div>
                )}
                
                {source === "telegram" && job.role && (
                    <div className="mt-2">
                        <p className="text-sm font-medium">Role:</p>
                        <p className="text-sm text-gray-600">{job.role}</p>
                    </div>
                )}
                
                <div className="mt-4 flex justify-end">
                    <button 
                        onClick={() => router.push(`/dashboard/apply?jobId=${job._id}&source=${source}`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                    >
                        Apply Now
                    </button>
                </div>
            </div>
        );
    };

    return (
        <AuthGuard>
            <Navbar/>
            <div className="min-h-screen bg-gray-50 text-black">
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Job Dashboard</h1>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome section with user info */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                        <h2 className="text-xl font-semibold">Welcome, {userData?.name || "User"}!</h2>
                        <p className="mt-2 text-gray-600">
                            We have found jobs matching your skills: {userData?.skills?.join(", ") || "No skills added yet"}
                        </p>
                        {(!userData?.skills || userData.skills.length === 0) && (
                            <div className="mt-4 p-4 bg-yellow-50 text-yellow-700 rounded-md">
                                <p>Add skills to your profile to get better job matches!</p>
                                <button 
                                    onClick={() => router.push("/dashboard/profile")}
                                    className="mt-2 text-blue-600 hover:underline"
                                >
                                    Update Profile
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {/* Job tabs */}
                    <div className="mb-6">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex" aria-label="Tabs">
                                <button
                                    onClick={() => setActiveTab("telegram")}
                                    className={`${
                                        activeTab === "telegram"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base`}
                                >
                                    Telegram Jobs
                                </button>
                                <button
                                    onClick={() => setActiveTab("times")}
                                    className={`${
                                        activeTab === "times"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base`}
                                >
                                    Web Portals
                                </button>
                            </nav>
                        </div>
                    </div>
                    
                    {/* Job listings */}
                    {loading ? (
                        <div className="text-center py-10">Loading jobs...</div>
                    ) : error ? (
                        <div className="text-center py-10 text-red-600">{error}</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeTab === "telegram" && telegramJobs.length > 0 ? (
                               telegramJobs.map((job) => (
                                <div key={job._id || job.id}>
                                  {renderJobCard(job, "telegram")}
                                </div>
                              ))
                            ) : activeTab === "times" && timesJobs.length > 0 ? (
                                timesJobs.map((job) => (
                                    <div key={job._id || job.id}>
                                      {renderJobCard(job, "times")}
                                    </div>
                                  ))
                            ) : (
                                <div className="col-span-full text-center py-10">
                                    No matching jobs found
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </AuthGuard>
    );
}