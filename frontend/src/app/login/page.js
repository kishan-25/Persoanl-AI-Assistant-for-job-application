"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginStart, loginSuccess, loginFailure} from "@/redux/slices/authSlice";
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
            dispatch(loginSuccess(data));
            router.push("/dashboard");
        } catch (error) {
            dispatch(loginFailure(error.response?.data?.message));
        }
    };

    return (
        <div id="main">
            <h1>Login</h1>
            {error && <p style={{ color: "red"}}>{error}</p>}
            <form onSubmit={handleLogin}>
                <input 
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button 
                    type="submit"
                    disabled={loading}>
                        {loading ? "Logging in ..." : "Login"}
                    </button>
            </form>
            <p>
                Donot have an account? <Link href="/register">Register here</Link> 
            </p>
        </div>
    );
}