"use client"
import axios from "axios";

const API_URL = "http://localhost:5000/api/v1"; // Backend URL

export const generateCoverLetter = async (payload, token) => {
  try {
    const res = await axios.post(
      `${API_URL}/cover-letter`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return res.data.coverLetter;
  } catch (error) {
    console.error("Cover letter API error:", error.response?.data || error.message);
    throw error.response?.data || { message: "Failed to generate cover letter" };
  }
};
