"use client";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "@/redux/slices/authSlice";
import { registerUser } from "@/services/authService";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const dispacth = useDispatch();
    const router = useRouter();
    const { loading, error } = useSelector((state) => state.auth);

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const data = await registerUser({ name, email, password });
            
            if(data.success) {
                dispacth(loginSuccess(data.user));
                router.push("/dashboard");
            } else {
                setError(data.message || "Registeration failed");
            }
        } catch (error) {
            console.error("registeration failed:", error);
            SERVER_PROPS_EXPORT_ERROR("An error occured, Plz try again");
        }
    };

    return(
        <div id="main">
            <h1>Register</h1>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <form onSubmit={handleRegister}>
                <input 
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <input 
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Passowrd"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit" disabled={loading}>
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>
        </div>
    )
}