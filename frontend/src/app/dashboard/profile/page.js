"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { getUserApplications } from "@/services/applicationService";
import AuthGuard from "@/utils/authGuard";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const { user } = useSelector((state) => state.auth);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    const fetchUserApplications = async () => {
      setLoading(true);
      try {
        const data = await getUserApplications();
        setApplications(data.applications || []);
        
        // Show success toast only if there are applications
        if (data.applications && data.applications.length > 0) {
          toast.success(`Loaded ${data.applications.length} application(s)`);
        }
      } catch (err) {
        console.error("Error fetching applications:", err);
        
        // Determine error message based on error type
        let errorMessage = "Failed to load your applications";
        
        if (err.response) {
          // Server responded with error status
          switch (err.response.status) {
            case 401:
              errorMessage = "You need to log in to view your applications";
              break;
            case 403:
              errorMessage = "You don't have permission to view applications";
              break;
            case 404:
              errorMessage = "Applications not found";
              break;
            case 500:
              errorMessage = "Server error. Please try again later";
              break;
            default:
              errorMessage = err.response.data?.message || "Failed to load applications";
          }
        } else if (err.request) {
          // Network error
          errorMessage = "Network error. Please check your connection";
        } else if (err.message) {
          // Other error
          errorMessage = err.message;
        }
        
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchUserApplications();
  }, []);

  const handleTabChange = (tab) => {
    try {
      setActiveTab(tab);
      toast.success(`Switched to ${tab === 'profile' ? 'Profile Details' : 'Applied Jobs'}`);
    } catch (err) {
      toast.error("Error switching tabs");
    }
  };

  const handleEditProfile = () => {
    toast.success("Redirecting to edit profile...");
  };

  const handleBrowseJobs = () => {
    toast.success("Redirecting to job listings...");
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success(`${label} copied to clipboard!`);
    } catch (err) {
      toast.error(`Failed to copy ${label.toLowerCase()}`);
    }
  };

  const openExternalLink = (url, platform) => {
    try {
      window.open(url, '_blank', 'noopener,noreferrer');
      toast.success(`Opening ${platform}...`);
    } catch (err) {
      toast.error(`Failed to open ${platform}`);
    }
  };

  return (
    <AuthGuard>
      <div className="p-6 text-black bg-white">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">User Profile</h1>
          <button
            onClick={() => copyToClipboard(user?.email || '', 'Email')}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            title="Copy email to clipboard"
          >
            📋 Copy Email
          </button>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b mb-6">
          <button 
            className={`px-4 py-2 transition-colors ${
              activeTab === 'profile' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('profile')}
          >
            Profile Details
          </button>
          <button 
            className={`px-4 py-2 transition-colors ${
              activeTab === 'applications' 
                ? 'border-b-2 border-blue-600 text-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('applications')}
          >
            Applied Jobs ({applications.length})
          </button>
        </div>
        
        {/* Profile Details Tab */}
        {activeTab === 'profile' && (
          <div className="bg-white border rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Personal Information</h2>
              <Link href="/dashboard/profile/edit">
                <button 
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  onClick={handleEditProfile}
                >
                  Edit Profile
                </button>
              </Link>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-gray-600 text-sm">Name</p>
                <p className="font-medium">{user?.name || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Email</p>
                <div className="flex items-center gap-2">
                  <p className="font-medium">{user?.email || "Not provided"}</p>
                  {user?.email && (
                    <button
                      onClick={() => copyToClipboard(user.email, 'Email')}
                      className="text-xs text-blue-600 hover:text-blue-800"
                      title="Copy email"
                    >
                      📋
                    </button>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Role</p>
                <p className="font-medium">{user?.role || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Experience</p>
                <p className="font-medium">{user?.experience || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Location</p>
                <p className="font-medium">{user?.location || "Not provided"}</p>
              </div>
              <div>
                <p className="text-gray-600 text-sm">Education</p>
                <p className="font-medium">{user?.education || "Not provided"}</p>
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-600 text-sm">About Me</p>
              <p className="font-medium">{user?.aboutMe || "Not provided"}</p>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-600 text-sm">Skills</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {user?.skills && user.skills.length > 0 ? (
                  user.skills.map((skill, index) => (
                    <span 
                      key={index} 
                      className="bg-gray-100 px-3 py-1 rounded-full text-sm hover:bg-gray-200 cursor-pointer transition-colors"
                      onClick={() => copyToClipboard(skill, 'Skill')}
                      title="Click to copy skill"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p>No skills provided</p>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <p className="text-gray-600 text-sm">Professional Links</p>
              <div className="mt-2 space-y-2">
                {user?.github && (
                  <button
                    onClick={() => openExternalLink(user.github, 'GitHub')}
                    className="text-blue-600 hover:underline block hover:text-blue-800 transition-colors"
                  >
                    GitHub
                  </button>
                )}
                {user?.linkedin && (
                  <button
                    onClick={() => openExternalLink(user.linkedin, 'LinkedIn')}
                    className="text-blue-600 hover:underline block hover:text-blue-800 transition-colors"
                  >
                    LinkedIn
                  </button>
                )}
                {user?.portfolio && (
                  <button
                    onClick={() => openExternalLink(user.portfolio, 'Portfolio')}
                    className="text-blue-600 hover:underline block hover:text-blue-800 transition-colors"
                  >
                    Portfolio
                  </button>
                )}
                {!user?.github && !user?.linkedin && !user?.portfolio && (
                  <p>No professional links provided</p>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Applied Jobs Tab */}
        {activeTab === 'applications' && (
          <div className="bg-white border rounded-xl p-6 shadow">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold">Applied Jobs</h2>
              <button
                onClick={() => {
                  if (applications.length > 0) {
                    const jobTitles = applications.map(app => app.title).join(', ');
                    copyToClipboard(jobTitles, 'Job applications');
                  } else {
                    toast.error('No applications to copy');
                  }
                }}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                disabled={applications.length === 0}
              >
                📋 Copy List
              </button>
            </div>
            
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Loading your applications...</span>
              </div>
            ) : applications.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-gray-500 mb-4">You havenot applied to any jobs yet.</p>
                <Link href="/dashboard/jobs">
                  <button 
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    onClick={handleBrowseJobs}
                  >
                    Browse Jobs
                  </button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div 
                    key={app._id} 
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      const appInfo = `${app.title} at ${app.company} - Applied on ${new Date(app.applicationDate).toLocaleDateString()}`;
                      copyToClipboard(appInfo, 'Application details');
                    }}
                    title="Click to copy application details"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-lg">{app.title}</h3>
                        <p className="text-gray-700">{app.company}</p>
                        <p className="text-gray-600 text-sm">{app.location}</p>
                        <p className="text-gray-500 text-sm mt-1">
                          Applied on: {new Date(app.applicationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                          Applied
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toast.success('Opening application details...');
                          }}
                          className="text-xs text-blue-600 hover:text-blue-800"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}