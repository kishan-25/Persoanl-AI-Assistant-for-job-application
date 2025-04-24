// frontend/src/services/applicationService.js
"use client";

import axios from "axios";
import { getToken } from "./authService";

const API_URL = "http://localhost:5000/api/v1/applications";

export const trackJobApplication = async (jobData) => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(API_URL, jobData, config);
    return response.data;
  } catch (error) {
    console.error("Application tracking error:", error.response?.data || error.message);
    throw error;
  }
};

export const getUserApplications = async () => {
  try {
    const token = getToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    console.error("Get applications error:", error.response?.data || error.message);
    throw error;
  }
};