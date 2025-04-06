const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/authMiddleware");
const { generateCoverLetter } = require("../controllers/coverLetterController");

router.post("/", protect, generateCoverLetter);

module.exports = router;
