// backend/controllers/applicationController.js
const Application = require("../models/Application");

// Track a job application
exports.trackJobApplication = async (req, res) => {
  try {
    const { jobId, title, company, location, applied, source, applicationDate } = req.body;
    const userId = req.user._id;

    // Check if application already exists
    let application = await Application.findOne({ user: userId, jobId });

    if (application) {
      // Update existing application
      application.applied = applied;
      application.applicationDate = applicationDate || application.applicationDate;
      await application.save();
    } else {
      // Create new application
      application = new Application({
        user: userId,
        jobId,
        title,
        company,
        location,
        applied,
        source,
        applicationDate: applicationDate || Date.now()
      });
      await application.save();
    }

    res.status(200).json({
      success: true,
      application
    });
  } catch (error) {
    console.error("Application tracking error:", error);
    res.status(500).json({
      success: false,
      message: "Error tracking job application",
      error: error.message
    });
  }
};

// Get user's applications
exports.getUserApplications = async (req, res) => {
  try {
    const userId = req.user._id;
    const applications = await Application.find({ 
      user: userId,
      applied: true // Only return jobs where the user actually applied
    }).sort({ applicationDate: -1 }); // Sort by application date (newest first)

    res.status(200).json({
      success: true,
      applications
    });
  } catch (error) {
    console.error("Get applications error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving applications",
      error: error.message
    });
  }
};