"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { toast } from "react-hot-toast";
import { generateCoverLetter } from "@/services/coverLetterService";
import { fetchTelegramJobs, fetchTimesJobs } from "@/services/jobService";
import { trackJobApplication } from "@/services/applicationService";

// Import the getToken function
import { getToken } from "@/services/authService";

// Loading component for Suspense fallback
function LoadingState() {
  return <div className="p-6">Loading job details...</div>;
}

// Main component wrapped in Suspense
function ApplyPageContent() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const source = searchParams.get("source");

  const { user } = useSelector((state) => state.auth);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationTracking, setApplicationTracking] = useState(false);
  const [jobLoading, setJobLoading] = useState(true);

  useEffect(() => {
    const getJobById = async () => {
      // Validate required parameters
      if (!jobId || !source) {
        toast.error("Missing job ID or source parameter");
        setJobLoading(false);
        return;
      }

      try {
        setJobLoading(true);
        const res = source === "times" 
          ? await fetchTimesJobs() 
          : await fetchTelegramJobs();
        
        if (!res || !res.jobs) {
          throw new Error("Invalid response from job service");
        }

        const foundJob = res.jobs.find((j) => j._id === jobId);
        
        if (!foundJob) {
          toast.error("Job not found");
          setJob(null);
        } else {
          setJob(foundJob);
          toast.success("Job details loaded successfully");
        }
      } catch (err) {
        console.error("Error fetching job:", err);
        const errorMessage = err.response?.data?.message || 
                           err.message || 
                           "Failed to load job details";
        toast.error(errorMessage);
        setJob(null);
      } finally {
        setJobLoading(false);
      }
    };

    getJobById();
  }, [jobId, source]);

  const handleGenerateCoverLetter = async () => {
    if (!job) {
      toast.error("No job selected");
      return;
    }

    setLoading(true);
    
    try {
      // Use the token from localStorage first, fall back to user.token if available
      const token = getToken() || user?.token;
      
      if (!token) {
        toast.error("You must be logged in to generate a cover letter");
        return;
      }

      // Validate user data
      if (!user?.name) {
        toast.error("Please complete your profile to generate a cover letter");
        return;
      }

      const payload = {
        jobTitle: job.title,
        companyName: job.company,
        skills: user?.skills || [],
        experience: user?.experience || 1,
        userName: user?.name,
      };

      // Show loading toast
      const loadingToast = toast.loading("Generating cover letter...");

      const letter = await generateCoverLetter(payload, token);
      
      if (!letter) {
        throw new Error("Empty cover letter received");
      }

      setCoverLetter(letter);
      toast.dismiss(loadingToast);
      toast.success("Cover letter generated successfully!");
      
    } catch (err) {
      console.error("Cover letter generation error:", err);
      
      let errorMessage = "Failed to generate cover letter";
      
      if (err.response?.status === 401) {
        errorMessage = "Authentication expired. Please log in again";
      } else if (err.response?.status === 403) {
        errorMessage = "You don't have permission to generate cover letters";
      } else if (err.response?.status === 429) {
        errorMessage = "Too many requests. Please try again later";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleApplicationTracking = async (applied) => {
    if (!job) {
      toast.error("No job selected for tracking");
      return;
    }

    setApplicationTracking(true);
    
    try {
      const token = getToken();
      if (!token) {
        toast.error("You must be logged in to track your application");
        return;
      }

      const trackingData = {
        jobId: job._id,
        title: job.title,
        company: job.company,
        location: job.location,
        applied: applied,
        source: source,
        applicationDate: new Date().toISOString()
      };

      await trackJobApplication(trackingData);

      setHasApplied(applied);
      toast.success(applied ? "Application tracked successfully!" : "Application status updated");
      
    } catch (err) {
      console.error("Application tracking error:", err);
      
      let errorMessage = "Failed to track your application";
      
      if (err.response?.status === 401) {
        errorMessage = "Authentication expired. Please log in again";
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setApplicationTracking(false);
    }
  };

  const handleApplyNow = () => {
    if (!job?.apply_link) {
      toast.error("No application link available for this job");
      return;
    }

    try {
      // Open the job application link in a new tab
      window.open(job.apply_link, '_blank');
      toast.success("Application page opened in new tab");
      
      // Show application tracking options after opening the link
      setTimeout(() => {
        handleApplicationTracking(true);
      }, 1000);
      
    } catch (err) {
      console.error("Error opening application link:", err);
      toast.error("Failed to open application link");
    }
  };

  const handleCopyToClipboard = async () => {
    if (!coverLetter) {
      toast.error("No cover letter to copy");
      return;
    }

    try {
      await navigator.clipboard.writeText(coverLetter);
      toast.success("Cover letter copied to clipboard!");
    } catch (err) {
      console.error("Failed to copy to clipboard:", err);
      toast.error("Failed to copy to clipboard");
    }
  };

  // Show loading state
  if (jobLoading) {
    return (
      <div className="p-6 text-black bg-white">
        <div className="flex items-center justify-center min-h-[200px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p>Loading job details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 text-black bg-white">
      <h1 className="text-3xl font-bold mb-4">Job Application</h1>

      {!job ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Job not found or failed to load</p>
          <button 
            onClick={() => window.history.back()}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      ) : (
        <div className="border rounded-xl p-6 shadow space-y-3">
          <h2 className="text-2xl font-semibold">{job.title}</h2>
          <p className="text-gray-700">{job.company}</p>
          <p className="text-gray-600">{job.location}</p>
          
          {job.apply_link && !hasApplied ? (
            <button 
              onClick={handleApplyNow}
              className="mt-4 bg-blue-600 m-4 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={applicationTracking}
            >
              {applicationTracking ? "Tracking..." : "Apply Now"}
            </button>
          ) : hasApplied ? (
            <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg border border-green-200">
              ✅ You have applied to this job
            </div>
          ) : job.apply_link ? null : (
            <div className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-lg border border-yellow-200">
              ⚠️ No application link available for this job
            </div>
          )}
                  
          {job.description && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Job Description:</h3>
              <p className="text-gray-700 leading-relaxed">{job.description}</p>
            </div>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleGenerateCoverLetter}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating...
                </span>
              ) : (
                "Generate Cover Letter"
              )}
            </button>
          </div>

          {coverLetter && (
            <div className="mt-6 bg-gray-50 border rounded-lg overflow-hidden">
              <div className="bg-gray-100 px-4 py-3 border-b flex justify-between items-center">
                <h3 className="text-lg font-semibold">Generated Cover Letter</h3>
                <button
                  onClick={handleCopyToClipboard}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
                >
                  Copy to Clipboard
                </button>
              </div>
              <div className="p-4 whitespace-pre-wrap text-gray-800 leading-relaxed">
                {coverLetter}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Main component export
export default function ApplyPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ApplyPageContent />
    </Suspense>
  );    
}