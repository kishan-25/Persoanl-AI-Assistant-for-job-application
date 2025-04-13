// src/app/login/page.js
"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure } from "@/redux/slices/authSlice";
import { loginUser } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const dispatch = useDispatch();
    const router = useRouter();
    const { loading, error } = useSelector((state) => state.auth);

    const handleLogin = async (e) => {
        e.preventDefault();
        dispatch(loginStart());
        try {
            const data = await loginUser({ email, password });
            if (data.success) {
                dispatch(loginSuccess(data));
                router.push("/dashboard");
            } else {
                dispatch(loginFailure(data.message || "Login failed"));
            }
        } catch (error) {
            dispatch(loginFailure(error.response?.data?.message || "Login failed"));
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-white text-black rounded-lg shadow-lg my-10">
            <h1 className="text-2xl font-bold mb-6 text-center">Login to Your Account</h1>
            
            {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
            
            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input 
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                    />
                </div>
                
                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition-colors"
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>
            
            <p className="mt-4 text-center">
                Donot have an account? <Link href="/register" className="text-blue-600 hover:underline">Register here</Link>
            </p>
        </div>
    );
}