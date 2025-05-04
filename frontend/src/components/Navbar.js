"use client";

import Link from "next/link";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { getUserFromLocalStorage, removeUserFromLocalStorage } from "@/services/authService";
import { useEffect, useState } from "react";
import { Menu, X, LogOut } from "lucide-react";
import { logout } from "@/redux/slices/authSlice";

export default function Navbar() {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const router = useRouter();
  const dispatch = useDispatch();

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

  const handleLogout = () => {
    // Remove user from localStorage
    removeUserFromLocalStorage();
    // Update Redux state
    dispatch(logout());
    // Redirect to home page
    setTimeout(() => {
      router.push("/");
    }, 100);
    // Close mobile menu if open
    if (isMenuOpen) setIsMenuOpen(false);
  };

  if (!isClient) return null; // Prevent SSR mismatch

  return (
    <div className="bg-blue-600 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              TalentAlign
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/about" className="px-3 py-2 rounded hover:bg-blue-700">
              About us
            </Link>
            
            {userData || isAuthenticated ? (
              <>
                <span>Hello, {userData?.name?.split(" ")[0] || "User"}</span>
                <Link href="/dashboard" className="px-3 py-2 rounded hover:bg-blue-700">
                  Dashboard
                </Link>
                <Link href="/dashboard/profile" className="px-3 py-2 rounded hover:bg-blue-700">
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 rounded bg-red-600 hover:bg-red-700"
                >
                  <LogOut size={18} className="mr-1" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-3 py-2 rounded hover:bg-blue-700">
                  Login
                </Link>
                <Link 
                  href="/register" 
                  className="px-3 py-2 rounded bg-green-600 hover:bg-green-700"
                >
                  Sign Up
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
            <Link 
              href="/about" 
              className="block px-3 py-2 rounded hover:bg-blue-700"
              onClick={() => setIsMenuOpen(false)}
            >
              About us
            </Link>
            
            {userData || isAuthenticated ? (
              <>
                <div className="px-3 py-2 font-medium">
                  Hello, {userData?.name?.split(" ")[0] || "User"}
                </div>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 rounded w-full text-left hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/profile"
                  className="block px-3 py-2 rounded w-full text-left hover:bg-blue-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-3 py-2 rounded text-left bg-red-600 hover:bg-red-700"
                >
                  <LogOut size={18} className="mr-1" />
                  Logout
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
                  className="block px-3 py-2 rounded bg-green-600 hover:bg-green-700"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}