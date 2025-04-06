const User = require("../models/User");
const jwt = require("jsonwebtoken");

//Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};

//Register User
const registerUser = async (req, res) => {
    const { name, email, password } = req.body;

    if( !name || !email || !password) {
        return res.status(400).json({
            success:false,
            message: "Please provide all fields"
        })
    }

    const userExists = await User.findOne({ email });
    if(userExists) {
        return res.status(400).json({
            status: false,
            message: "User already exists"
        })
    }

    const user = await User.create({ name, email, password });

    if(user) {
        res.status(201).json({
            success: true,
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),
        });
    } else {
        res.status(400).json({
            success: false,
            message: "Invalid user data"
        });
    }
};

// Login User
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if(user && (await user.matchPassword(password))) {
        res.json({
            success: true,
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),
        });
    } else {
        res.status(401).json({
            success: false,
            message: "Invalid credentials",
        })
    }
};

// Get User Profile
const getUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    if(user) {
        res.json({
            success: true, user
        });
    } else {
        res.status(404).json({ 
            success: false,
            message: "User not found"
        })
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    const user = await User.findById(req.user.id);

    if (user) {
        user.skills = req.body.skills || user.skills;
        user.experience = req.body.experience || user.experience;
        user.education = req.body.education || user.education;
        user.location = req.body.location || user.location;
        user.aboutMe = req.body.aboutMe || user.aboutMe;
        user.projects = req.body.projects || user.projects;

        const updatedUser = await user.save();

        res.json({
            success: true,
            message: "Profile updated successfully",
            user: {
                name: updatedUser.name,
                email: updatedUser.email,
                skills: updatedUser.skills,
                experience: updatedUser.experience,
                education: updatedUser.education,
                location: updatedUser.location,
                aboutMe: updatedUser.aboutMe,
                projects: updatedUser.projects,
            },
        });
    } else {
        res.status(404).json({ success: false, message: "User not found" });
    }
};


module.exports = { registerUser, loginUser, getUserProfile, updateUserProfile };