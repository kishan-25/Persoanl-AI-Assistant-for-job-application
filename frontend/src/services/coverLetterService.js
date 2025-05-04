import axios from "axios";

// const API_URL = "http://localhost:5000/api/v1/cover-letter";
const API_URL = "https://talentalign-backend.onrender.com/api/v1/cover-Letter";

export const generateCoverLetter = async (payload, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await axios.post(API_URL, payload, config);
    return response.data.coverLetter;
  } catch (error) {
    console.error("Cover letter generation error:", error.response?.data || error.message);
    throw new Error("Failed to generate cover letter");
  }
};