"use client";
import Link from "next/link";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "@/redux/slices/authSlice";
import { useRouter } from "next/navigation";

export default function Navbar() {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleLogout = () => {
        dispatch(logout());
        router.push("/login");
    };
    return (
        <div id="main">
            <nav className="bg-gray-800 text-white p-4 flex justify-between">
                <Link href="/" className="text-lg font-bold">MyApp</Link>
                <div>
                    {isAuthenticated ? (
                        <>
                            <Link href="/dashboard" className="mr-4">dashboard</Link>
                            <button onClick={handleLogout} className="bg-red-500 px-3 py-1 rounded">Logout</button>
                        </>
                    ) : (
                        <Link href="/login" className="bg-blue-500 px-3 py-1 rounded">Login</Link>
                    )}
                </div>
            </nav>
        </div>
    )
}