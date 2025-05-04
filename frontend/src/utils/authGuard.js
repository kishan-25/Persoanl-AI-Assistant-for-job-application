// Improved AuthGuard.js
"use client";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getUserFromLocalStorage } from "@/services/authService";
import { loginSuccess } from "@/redux/slices/authSlice";

export default function AuthGuard({ children }) {
    const { user, isAuthenticated } = useSelector((state) => state.auth);
    const router = useRouter();
    const dispatch = useDispatch();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // If user is already in Redux store, no need to check localStorage
        if (user) {
            setIsLoading(false);
            return;
        }

        // Check for user data in localStorage
        const localStorageUser = getUserFromLocalStorage();
        
        if (localStorageUser) {
            // If found in localStorage, update Redux store
            dispatch(loginSuccess(localStorageUser));
            setIsLoading(false);
        } else {
            // No user data found anywhere, redirect to login
            router.push("/");
        }
    }, [user, router, dispatch]);

    // Show nothing while checking authentication
    if (isLoading) {
        return null; // Or a loading spinner
    }

    return user ? children : null;
}