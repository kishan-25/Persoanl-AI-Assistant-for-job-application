"use client"
import axios from "axios";

const API_URL = "http://localhost:5000/api/v1/auth"; // Backend URL

// Add these functions to handle token storage
export const setToken = (token) => {
  localStorage.setItem('userToken', token);
};

export const getToken = () => {
  return localStorage.getItem('userToken');
};

export const removeToken = () => {
  localStorage.removeItem('userToken');
};

export const loginUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/login`, userData);
        
        // Store the token when login is successful
        if (response.data.success && response.data.token) {
          setToken(response.data.token);
        }
        
        return response.data;
      } catch (error) {
        console.error("Login API Error:", error.response?.data || error.message);
        throw error.response?.data || error.message;
      };
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