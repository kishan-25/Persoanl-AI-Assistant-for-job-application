"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { generateCoverLetter } from "@/services/coverLetterService";
import { fetchTelegramJobs, fetchTimesJobs } from "@/services/jobService";

// Import the getToken function
import { getToken } from "@/services/authService";

export default function ApplyPage() {
  const searchParams = useSearchParams();
  const jobId = searchParams.get("jobId");
  const source = searchParams.get("source");

  const { user } = useSelector((state) => state.auth);

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const getJobById = async () => {
      try {
        const res =
          source === "times" ? await fetchTimesJobs() : await fetchTelegramJobs();
        const foundJob = res.jobs.find((j) => j._id === jobId);
        setJob(foundJob);
      } catch (err) {
        setError("Failed to load job.");
      }
    };

    if (jobId && source) getJobById();
  }, [jobId, source]);

  const handleGenerateCoverLetter = async () => {
    if (!job) return;
    setLoading(true);
    setError("");

    // Use the token from localStorage first, fall back to user.token if available
    const token = getToken() || user?.token;
    
    if (!token) {
      setError("You must be logged in to generate a cover letter");
      setLoading(false);
      return;
    }

    const payload = {
      jobTitle: job.title,
      companyName: job.company,
      skills: user?.skills || [],
      experience: user?.experience || 1,
      userName: user?.name || "Your Name",
    };

    try {
      const letter = await generateCoverLetter(payload, token);
      setCoverLetter(letter);
    } catch (err) {
      console.error("Cover letter generation error:", err);
      setError("Error generating cover letter. Please ensure you're logged in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 text-black bg-white">
      <h1 className="text-3xl font-bold mb-4">Job Application</h1>

      {error && <p className="text-red-500">{error}</p>}

      {!job ? (
        <p>Loading job details...</p>
      ) : (
        <div className="border rounded-xl p-6 shadow space-y-3">
          <h2 className="text-2xl font-semibold">{job.title}</h2>
          <p className="text-gray-700">{job.company}</p>
          <p className="text-gray-600">{job.location}</p>
          {job.description && <p className="mt-2">{job.description}</p>}

          <button
            onClick={handleGenerateCoverLetter}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? "Generating..." : "Generate Cover Letter"}
          </button>

          {coverLetter && (
            <div className="mt-6 bg-gray-100 p-4 rounded whitespace-pre-wrap">
              <h3 className="text-lg font-semibold mb-2">Generated Cover Letter</h3>
              {coverLetter}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
