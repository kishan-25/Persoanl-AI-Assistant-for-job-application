// src/components/Navbar.js
"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getUserFromLocalStorage } from "@/services/authService";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const userData = user || getUserFromLocalStorage();
  const router = useRouter();

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              JobHunter
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {userData ? (
              <>
                <span>Hello, {userData.name?.split(' ')[0] || 'User'}</span>
                <button 
                  onClick={() => router.push("/dashboard")}
                  className="px-3 py-2 rounded hover:bg-blue-700"
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => router.push("/dashboard/profile")}
                  className="px-3 py-2 rounded hover:bg-blue-700"
                >
                  Profile
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 rounded hover:bg-blue-700">
                  Login
                </Link>
                <Link href="/register" className="px-3 py-2 rounded hover:bg-blue-700">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}