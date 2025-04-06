const { GoogleGenerativeAI } = require("@google/generative-ai");

const generateCoverLetter = async (req, res) => {
   // Verify user is authenticated (middleware should have added req.user)
   if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  const { jobTitle, companyName, skills, experience, userName } = req.body;
  
  // Validate required fields
  if (!jobTitle || !companyName) {
    return res.status(400).json({
      success: false,
      message: "Job title and company name are required"
    });
  }

  try {
    // Initialize the API client
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
     
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("API key for Gemini is not configured");
    }

    // Get the model - use simple model name without any prefix
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Create a prompt
    const prompt = `Write a professional cover letter for ${userName} applying for a ${jobTitle} position at ${companyName}. 
    The applicant has ${Array.isArray(skills) ? skills.join(", ") : skills} skills
    and ${experience} years of experience.`;

    // Generate content with a simpler structure
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    res.status(200).json({ success: true, coverLetter: text });
  } catch (error) {
    console.error("Gemini cover letter generation error:", error);
    
    // More specific error messages based on error type
    if (error.message.includes("API key")) {
      return res.status(500).json({ 
        success: false, 
        message: "Server configuration error" 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate cover letter", 
      error: error.message 
    });
  }
};

module.exports = { generateCoverLetter };