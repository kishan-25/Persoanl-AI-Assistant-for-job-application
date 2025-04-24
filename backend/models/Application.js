// backend/models/Application.js
const mongoose = require("mongoose");

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  jobId: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  company: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    default: "",
  },
  applied: {
    type: Boolean,
    default: true,
  },
  source: {
    type: String,
    required: true,
  },
  applicationDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true
});

// Create a compound unique index on user and jobId
// This prevents duplicate applications for the same job by the same user
applicationSchema.index({ user: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model("Application", applicationSchema);