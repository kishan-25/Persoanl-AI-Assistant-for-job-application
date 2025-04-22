const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    // Enhanced profile fields
    skills: { 
        type: [String], 
        default: [] 
    },
    experience: { 
        type: String, 
        default: "" 
    },
    role: {
        type: String,
        enum: [
            "Software Engineer", 
            "Frontend Developer", 
            "Backend Developer", 
            "Full Stack Developer",
            "Researcher",
            "Full Stack Developer | Researcher | Software Engineer"
        ],
        default: "Software Engineer"
    },
    education: { 
        type: String, 
        default: "" 
    },
    location: { 
        type: String, 
        default: "" 
    },
    aboutMe: { 
        type: String, 
        default: "" 
    },
    projects: { 
        type: [String], 
        default: [] 
    },
    linkedin: {
        type: String,
        default: ""
    },
    github: {
        type: String,
        default: ""
    },
    portfolio: {
        type: String,
        default: ""
    }
}, {
    timestamps: true
});

// Hash Password before saving
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();

    try {
        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare passwords
userSchema.methods.matchPassword = async function (enterPassword) {
    return await bcrypt.compare(enterPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);