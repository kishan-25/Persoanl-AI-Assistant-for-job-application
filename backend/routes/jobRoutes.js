const express = require("express");
const { getTelegramJobs, getTimesJobs} = require("../controllers/jobController");

const router = express.Router();

router.get("/telegram", getTelegramJobs);
router.get("/times", getTimesJobs);

module.exports = router;