const express = require("express");
const router = express.Router();
const upload = require("../middlewares/uploadMiddleware");
const { parseResume } = require("../controllers/resumeParseController");

// Route for resume parsing
router.post("/parse", upload.single("resume"), parseResume);

module.exports = router;