const mongoose = require("mongoose");

const getTelegramJobs = async (req, res) => {
    try {
        const jobs = await mongoose.connection.db.collection("telegram").find({}).toArray();
        res.status(200).json({
            success: true, jobs
        })
    } catch (err) {
        res.status(500).json({
            success:false,
            message: "Error fetching telegram jobs",
            error: err.message
        })
    }
};

const getTimesJobs = async (req, res) => {
    try {
        const jobs = await mongoose.connection.db.collection("timesjob").find({}).toArray();
        res.status(200).json({
            success: true, jobs
        })
    } catch(err) {
        res.status(500).json({
            success: false, 
            message: "Error fetching times jobs",
            error: err.message
        })
    }
};

module.exports = { getTelegramJobs, getTimesJobs }