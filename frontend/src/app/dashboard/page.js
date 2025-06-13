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

// Toast Component
const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);

        return () => clearTimeout(timer);
    }, [onClose]);

    const getToastStyles = () => {
        switch (type) {
            case 'error':
                return 'bg-red-500 text-white';
            case 'success':
                return 'bg-green-500 text-white';
            case 'warning':
                return 'bg-yellow-500 text-white';
            case 'info':
                return 'bg-blue-500 text-white';
            default:
                return 'bg-gray-500 text-white';
        }
    };

    const getIcon = () => {
        switch (type) {
            case 'error':
                return '❌';
            case 'success':
                return '✅';
            case 'warning':
                return '⚠️';
            case 'info':
                return 'ℹ️';
            default:
                return '📋';
        }
    };

    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${getToastStyles()} transform transition-all duration-300 ease-in-out`}>
            <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2">
                    <span className="text-lg">{getIcon()}</span>
                    <p className="text-sm font-medium">{message}</p>
                </div>
                <button
                    onClick={onClose}
                    className="ml-3 text-white hover:text-gray-200 focus:outline-none"
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
        <div className="fixed top-0 right-0 z-50 p-4 space-y-2">
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

export default function DashboardPage() {
    const [telegramJobs, setTelegramJobs] = useState([]);
    const [timesJobs, setTimesJobs] = useState([]);
    const [activeTab, setActiveTab] = useState("times");
    const [loading, setLoading] = useState(true);
    const [jobsLoading, setJobsLoading] = useState({ telegram: false, times: false });
    const [retryCount, setRetryCount] = useState(0);
    
    const dispatch = useDispatch();
    const router = useRouter();
    const { user } = useSelector((state) => state.auth);
    const { showToast, ToastContainer } = useToast();
    
    // Get user data from local storage if not in redux state
    const userData = user || getUserFromLocalStorage();

    const handleLogout = () => {
        try {
            dispatch(logout());
            showToast("Successfully logged out", "success");
            router.push("/");
        } catch (error) {
            showToast("Error during logout. Please try again.", "error");
        }
    };

    const handleNavigation = (path) => {
        try {
            router.push(path);
        } catch (error) {
            showToast("Navigation error. Please try again.", "error");
        }
    };

    const handleJobApplication = (jobId, source) => {
        try {
            if (!jobId || !source) {
                showToast("Invalid job information. Please try again.", "error");
                return;
            }
            router.push(`/dashboard/apply?jobId=${jobId}&source=${source}`);
        } catch (error) {
            showToast("Error navigating to application page.", "error");
        }
    };

    const processJobs = (jobs, jobType) => {
        try {
            if (!Array.isArray(jobs)) {
                throw new Error(`Invalid ${jobType} jobs data format`);
            }

            const jobsWithMatch = jobs.map(job => {
                try {
                    const jobSkills = job.keySkills || '';
                    const description = jobType === 'telegram' ? job.text : job.description;
                    
                    const matchResult = calculateJobSkillMatch(
                        userData?.skills || [], 
                        description || "",
                        job.title || "",
                        jobSkills
                    );
                    
                    return {
                        ...job,
                        matchPercentage: matchResult.matchPercentage || 0,
                        matchStrength: getMatchStrength(matchResult.matchPercentage || 0),
                        skillsNotMatched: matchResult.skillsNotMatched || []
                    };
                } catch (jobError) {
                    console.error(`Error processing individual ${jobType} job:`, jobError);
                    // Return job with default values if processing fails
                    return {
                        ...job,
                        matchPercentage: 0,
                        matchStrength: "No match",
                        skillsNotMatched: []
                    };
                }
            });
            
            // Filter out jobs with 0% match and sort remaining by match percentage
            const filteredJobs = jobsWithMatch.filter(job => job.matchPercentage > 0);
            return filteredJobs.sort((a, b) => b.matchPercentage - a.matchPercentage);
        } catch (error) {
            console.error(`Error processing ${jobType} jobs:`, error);
            showToast(`Error processing ${jobType} jobs. Some jobs may not display correctly.`, "warning");
            return [];
        }
    };

    const fetchJobsWithRetry = async (retryAttempt = 0) => {
        const maxRetries = 3;
        const retryDelay = 1000 * Math.pow(2, retryAttempt); // Exponential backoff

        setLoading(true);
        setJobsLoading({ telegram: true, times: true });

        try {
            // Fetch both job sources concurrently
            const [telegramRes, timesRes] = await Promise.allSettled([
                fetchTelegramJobs(),
                fetchTimesJobs()
            ]);

            // Handle Telegram jobs
            if (telegramRes.status === 'fulfilled' && telegramRes.value?.success) {
                const processedTelegramJobs = processJobs(telegramRes.value.jobs, 'telegram');
                setTelegramJobs(processedTelegramJobs);
                setJobsLoading(prev => ({ ...prev, telegram: false }));
                
                if (processedTelegramJobs.length > 0) {
                    showToast(`Found ${processedTelegramJobs.length} matching Telegram jobs`, "success");
                }
            } else {
                console.error("Telegram jobs fetch failed:", telegramRes.reason || telegramRes.value);
                setJobsLoading(prev => ({ ...prev, telegram: false }));
                
                if (retryAttempt < maxRetries) {
                    showToast(`Retrying Telegram jobs... (Attempt ${retryAttempt + 1}/${maxRetries})`, "warning");
                } else {
                    showToast("Failed to load Telegram jobs after multiple attempts", "error");
                }
            }

            // Handle Times jobs
            if (timesRes.status === 'fulfilled' && timesRes.value?.success) {
                const processedTimesJobs = processJobs(timesRes.value.jobs, 'times');
                setTimesJobs(processedTimesJobs);
                setJobsLoading(prev => ({ ...prev, times: false }));
                
                if (processedTimesJobs.length > 0) {
                    showToast(`Found ${processedTimesJobs.length} matching web portal jobs`, "success");
                }
            } else {
                console.error("Times jobs fetch failed:", timesRes.reason || timesRes.value);
                setJobsLoading(prev => ({ ...prev, times: false }));
                
                if (retryAttempt < maxRetries) {
                    showToast(`Retrying web portal jobs... (Attempt ${retryAttempt + 1}/${maxRetries})`, "warning");
                } else {
                    showToast("Failed to load web portal jobs after multiple attempts", "error");
                }
            }

            // Check if both failed and we should retry
            const bothFailed = (telegramRes.status === 'rejected' || !telegramRes.value?.success) &&
                             (timesRes.status === 'rejected' || !timesRes.value?.success);

            if (bothFailed && retryAttempt < maxRetries) {
                setTimeout(() => {
                    setRetryCount(retryAttempt + 1);
                    fetchJobsWithRetry(retryAttempt + 1);
                }, retryDelay);
                return;
            }

            setLoading(false);

        } catch (error) {
            console.error("Unexpected error fetching jobs:", error);
            setLoading(false);
            setJobsLoading({ telegram: false, times: false });
            
            if (retryAttempt < maxRetries) {
                showToast(`Network error. Retrying... (Attempt ${retryAttempt + 1}/${maxRetries})`, "warning");
                setTimeout(() => {
                    setRetryCount(retryAttempt + 1);
                    fetchJobsWithRetry(retryAttempt + 1);
                }, retryDelay);
            } else {
                showToast("Failed to load jobs. Please check your connection and try again.", "error");
            }
        }
    };

    useEffect(() => {
        if (!userData) {
            showToast("User data not found. Please log in again.", "error");
            return;
        }

        if (!userData.skills || userData.skills.length === 0) {
            showToast("Add skills to your profile for better job matching!", "info");
        }

        fetchJobsWithRetry();
    }, [userData]);

    const handleRefresh = () => {
        setRetryCount(0);
        setTelegramJobs([]);
        setTimesJobs([]);
        fetchJobsWithRetry();
        showToast("Refreshing job listings...", "info");
    };

    const renderJobCard = (job, source) => {
        if (!job) {
            return null;
        }

        return (
            <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                <div className="flex justify-between">
                    <h3 className="font-semibold text-lg">{job.title || "No title"}</h3>
                    <div className="flex flex-col items-end">
                        <div className={`${getMatchColor(job.matchPercentage || 0)} font-bold text-lg`}>
                            {job.matchPercentage || 0}% Match
                        </div>
                        <div className="text-sm text-gray-500">
                            {job.matchStrength || "No match"}
                        </div>
                    </div>
                </div>
                
                <p className="text-gray-700 mt-2">{job.company || "Unknown company"}</p>
                
                {job.location && <p className="text-gray-600 mt-1">{job.location}</p>}
                
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
                        onClick={() => handleJobApplication(job._id || job.id, source)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!job._id && !job.id}
                    >
                        Apply Now
                    </button>
                </div>
            </div>
        );
    };

    return (
        <AuthGuard>
            <ToastContainer />
            <Navbar/>
            <div className="min-h-screen bg-gray-50 text-black">
                <header className="bg-white shadow-sm">
                    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Job Dashboard</h1>
                            <button
                                onClick={handleRefresh}
                                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? "Loading..." : "Refresh Jobs"}
                            </button>
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
                                    onClick={() => handleNavigation("/dashboard/profile")}
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
                                    } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base relative`}
                                >
                                    Telegram Jobs
                                    {jobsLoading.telegram && (
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                        </div>
                                    )}
                                </button>
                                <button
                                    onClick={() => setActiveTab("times")}
                                    className={`${
                                        activeTab === "times"
                                            ? "border-blue-500 text-blue-600"
                                            : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                    } w-1/2 py-4 px-1 text-center border-b-2 font-medium text-sm sm:text-base relative`}
                                >
                                    Web Portals
                                    {jobsLoading.times && (
                                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                                            <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
                                        </div>
                                    )}
                                </button>
                            </nav>
                        </div>
                    </div>
                    
                    {/* Job listings */}
                    {loading ? (
                        <div className="text-center py-10">
                            <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                            <p>Loading jobs...</p>
                            {retryCount > 0 && (
                                <p className="text-sm text-gray-500 mt-2">Retry attempt: {retryCount}/3</p>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {activeTab === "telegram" && telegramJobs.length > 0 ? (
                               telegramJobs.map((job) => (
                                <div key={job._id || job.id || Math.random()}>
                                  {renderJobCard(job, "telegram")}
                                </div>
                              ))
                            ) : activeTab === "times" && timesJobs.length > 0 ? (
                                timesJobs.map((job) => (
                                    <div key={job._id || job.id || Math.random()}>
                                      {renderJobCard(job, "times")}
                                    </div>
                                  ))
                            ) : (
                                <div className="col-span-full text-center py-10">
                                    <p className="text-gray-600">No matching jobs found</p>
                                    {activeTab === "telegram" && jobsLoading.telegram && (
                                        <p className="text-sm text-gray-500 mt-2">Still loading Telegram jobs...</p>
                                    )}
                                    {activeTab === "times" && jobsLoading.times && (
                                        <p className="text-sm text-gray-500 mt-2">Still loading web portal jobs...</p>
                                    )}
                                    <button
                                        onClick={handleRefresh}
                                        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>
        </AuthGuard>
    );
}