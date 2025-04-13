"use client";

import Navbar from "@/components/Navbar";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 text-black">
        <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Find Your Dream Tech Job
            </h1>
            <p className="mt-6 text-xl text-gray-500 max-w-2xl mx-auto">
              JobHunter helps you discover software engineering opportunities 
              that match your skills, experience, and career goals.
            </p>
            <div className="mt-10 flex justify-center space-x-6">
              <button
                onClick={() => router.push("/register")}
                className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Sign Up Now
              </button>
              <button
                onClick={() => router.push("/login")}
                className="px-8 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Log In
              </button>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-2xl font-bold text-center mb-8">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">1. Create Your Profile</h3>
                <p>Add your skills, experience, and preferences so we can find the right jobs for you.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">2. Browse Matched Jobs</h3>
                <p>We will show you positions that align with your profile and career aspirations.</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">3. Apply With Ease</h3>
                <p>Submit applications directly through our platform and track your progress.</p>
              </div>
            </div>
          </div>

          <div className="mt-20">
            <h2 className="text-2xl font-bold text-center mb-8">Why Choose JobHunter</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow flex">
                <div className="mr-4 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Smart Matching Algorithm</h3>
                  <p>Our AI-powered system connects you with jobs that truly match your skills and career goals.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow flex">
                <div className="mr-4 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Faster Application Process</h3>
                  <p>Apply to multiple positions with just Link few clicks using your saved information.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow flex">
                <div className="mr-4 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Real-Time Updates</h3>
                  <p>Get notified instantly when new opportunities match your profile or when employers respond.</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow flex">
                <div className="mr-4 text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Personalized Dashboard</h3>
                  <p>Track your applications, interviews, and offers all in one centralized location.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-20 bg-white rounded-lg shadow p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Featured Companies</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {/* Company logos would go here */}
              <div className="h-16 bg-gray-100 rounded flex items-center justify-center">Logo 1</div>
              <div className="h-16 bg-gray-100 rounded flex items-center justify-center">Logo 2</div>
              <div className="h-16 bg-gray-100 rounded flex items-center justify-center">Logo 3</div>
              <div className="h-16 bg-gray-100 rounded flex items-center justify-center">Logo 4</div>
            </div>
          </div>

          <div className="mt-20 text-center">
            <h2 className="text-2xl font-bold mb-4">Ready to Find Your Next Opportunity?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of software engineers who have found their dream jobs through JobHunter.
            </p>
            <button
              onClick={() => router.push("/register")}
              className="px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Get Started Today
            </button>
          </div>
        </main>

        <footer className="bg-gray-800 text-white mt-20">
          <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div>
                <h3 className="text-lg font-semibold mb-4">JobHunter</h3>
                <p className="text-gray-300">
                  Connecting talented developers with great companies since 2023.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white">About Us</Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white">For Employers</Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white">Blog</Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white">FAQ</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <ul className="space-y-2">
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white">Salary Guide</Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white">Interview Tips</Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white">Remote Work</Link>
                  </li>
                  <li>
                    <Link href="#" className="text-gray-300 hover:text-white">Career Growth</Link>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
                <p className="text-gray-300 mb-2">
                  Have questions? Reach out to our support team.
                </p>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
                  Contact Support
                </button>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-300">
              <p>&copy; {new Date().getFullYear()} JobHunter. All rights reserved.</p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}