"use client"
import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/auth"; // Backend URL

export const loginUser = async (userData) => {
    const response = await axios.post(`${API_URL}/login`, userData);
    return response.data;
};

export const registerUser = async(userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        console.error("Register API Error:", error.response?.data || error.message);
        throw error.response?.data || error.message;
    }
};