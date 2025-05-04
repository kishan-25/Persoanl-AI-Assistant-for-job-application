"use client"
import axios from "axios";

// const API_URL = "http://localhost:5000/api/v1/jobs"; // Backend URL
const API_URL = "https://talentalign-backend.onrender.com/api/v1/jobs";

export const fetchTelegramJobs = async () => {
    const response = await axios.get(`${API_URL}/telegram`);
    return response.data;
}

export const fetchTimesJobs = async () => {
    const response = await axios.get(`${API_URL}/times`);
    return response.data;
}