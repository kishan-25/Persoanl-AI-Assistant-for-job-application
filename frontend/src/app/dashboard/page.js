"use client";

import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { logout } from "@/redux/slices/authSlice";
import AuthGuard from "@/utils/authGuard";
import { fetchTelegramJobs, fetchTimesJobs } from "@/services/jobService";

export default function DashboardPage() {
    const [telegramJobs, setTelegramJobs] = useState([]);
    const [timesJobs, setTimesJobs] = useState([]);
    const dispatch = useDispatch();
    const router = useRouter();

    const handleLogout = () => {
        dispatch(logout());
        router.push("/login");
    };

    useEffect(() => {
        const getJobs = async () => {
            try {
                const telegramRes = await fetchTelegramJobs();
                const timesRes = await fetchTimesJobs();

                if (telegramRes.success) setTelegramJobs(telegramRes.jobs);
                if (timesRes.success) setTimesJobs(timesRes.jobs);
            } catch (error) {
                console.error("Failed to fetch jobs", error);
            }
        };

        getJobs();
    }, []);

    return (
        <AuthGuard>
            <div className="p-6 space-y-10">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">Job Dashboard</h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-500 text-white rounded-md shadow hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Times Jobs</h2>
                    <ul className="space-y-3">
                        {timesJobs.map((job, i) => (
                            <li key={i} className="p-4 border rounded-xl shadow">
                                <h3 className="font-semibold">{job.title || "No title"}</h3>
                                <p>{job.company || "Unknown company"}</p>
                                <p>{job.location || "Location not specified"}</p>
                                <button
                                        onClick={() =>
                                            router.push(
                                            `/apply?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&description=${encodeURIComponent(job.description || "")}`
                                            )
                                        }
                                        className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                        Apply
                                </button>

                            </li>
                        ))}
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-4">Telegram Jobs</h2>
                    <ul className="space-y-3">
                        {telegramJobs.map((job, i) => (
                            <li key={i} className="p-4 border rounded-xl shadow">
                                <h3 className="font-semibold">{job.title || "No title"}</h3>
                                <p>{job.company || "Unknown company"}</p>
                                <p>{job.location || "Location not specified"}</p>
                                <button
                                    onClick={() =>
                                        router.push(
                                        `/apply?title=${encodeURIComponent(job.title)}&company=${encodeURIComponent(job.company)}&description=${encodeURIComponent(job.description || "")}`
                                        )
                                    }
                                    className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                    Apply
                                </button>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
        </AuthGuard>
    );
}
