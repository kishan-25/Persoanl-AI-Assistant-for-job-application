"use client";

import Link from "next/link";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { getUserFromLocalStorage } from "@/services/authService";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const { user } = useSelector((state) => state.auth);
  const router = useRouter();

  const [userData, setUserData] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    if (!user) {
      const localUser = getUserFromLocalStorage();
      setUserData(localUser);
    } else {
      setUserData(user);
    }
  }, [user]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (!isClient) return null; // Prevent SSR mismatch

  return (
    <div className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              JobHunter
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {userData ? (
              <>
                <span>Hello, {userData.name?.split(" ")[0] || "User"}</span>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="px-3 py-2 rounded hover:bg-blue-700"
                >
                  Dashboard
                </button>

                <button
                  onClick={() => router.push("/about")}
                  className="px-3 py-2 rounded hover:bg-blue-700"
                >
                  About us
                </button>
                
                <button
                  onClick={() => router.push("/profile")}
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

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMenu} 
              className="p-2 rounded-md hover:bg-blue-700 focus:outline-none"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-blue-700">
            {userData ? (
              <>
                <div className="px-3 py-2 font-medium">
                  Hello, {userData.name?.split(" ")[0] || "User"}
                </div>
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    setIsMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded w-full text-left hover:bg-blue-700"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    router.push("/about");
                    setIsMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded w-full text-left hover:bg-blue-700"
                >
                  About us
                </button>
                <button
                  onClick={() => {
                    router.push("/profile");
                    setIsMenuOpen(false);
                  }}
                  className="block px-3 py-2 rounded w-full text-left hover:bg-blue-700"
                >
                  Profile
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  className="block px-3 py-2 rounded hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="block px-3 py-2 rounded hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}