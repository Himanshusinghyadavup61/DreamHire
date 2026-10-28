import { User } from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import path from "path";

export const register = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, password, role } = req.body;

        if (!fullname || !email || !phoneNumber || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        const file = req.file;
        let profilePhoto = "";
        if (file) {
            try {
                const fileUri = getDataUri(file);
                if (fileUri) {
                    const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                    profilePhoto = cloudResponse.secure_url;
                }
            } catch (cloudErr) {
                console.log("Cloudinary upload failed (using empty photo):", cloudErr?.message || cloudErr);
            }
        }

        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({
                message: 'User already exist with this email.',
                success: false,
            })
        }
        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({
            fullname,
            email,
            phoneNumber,
            password: hashedPassword,
            role,
            profile: {
                profilePhoto: profilePhoto,
            }
        });

        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to register user.",
            success: false
        });
    }
}
export const login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            return res.status(400).json({
                message: "Something is missing",
                success: false
            });
        };
        let user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        }
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect email or password.",
                success: false,
            })
        };
        // check role is correct or not
        if (role !== user.role) {
            return res.status(400).json({
                message: "Account doesn't exist with current role.",
                success: false
            })
        };

        const tokenData = {
            userId: user._id,
            role: user.role
        }
        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'none', secure: true }).json({
            message: `Welcome back ${user.fullname}`,
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const logout = async (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "Logged out successfully.",
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateProfile = async (req, res) => {
    try {
        const { fullname, email, phoneNumber, bio, skills } = req.body;

        const file = req.file;
        let resumeUrl = "";
        if (file) {
            try {
                const fileUri = getDataUri(file);
                if (fileUri) {
                    const isPdf = file.mimetype === 'application/pdf' || file.originalname?.toLowerCase().endsWith('.pdf');
                    const cloudResponse = await cloudinary.uploader.upload(fileUri.content, {
                        resource_type: isPdf ? 'raw' : 'auto'
                    });
                    resumeUrl = cloudResponse.secure_url;
                }
            } catch (cloudErr) {
                console.log("Cloudinary resume upload failed:", cloudErr?.message || cloudErr);
            }

            if (!resumeUrl && file.buffer) {
                try {
                    const uploadDir = path.join(process.cwd(), "uploads");
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }
                    const safeName = Date.now() + "-" + file.originalname.replace(/\s+/g, "_");
                    fs.writeFileSync(path.join(uploadDir, safeName), file.buffer);
                    const backendUrl = process.env.BACKEND_URL || 'http://localhost:8000';
                    resumeUrl = `${backendUrl}/uploads/${safeName}`;
                    console.log("Saved resume locally to:", resumeUrl);
                } catch (fsErr) {
                    console.error("Local resume upload failed:", fsErr);
                }
            }
        }



        let skillsArray;
        if (skills) {
            skillsArray = skills.split(",");
        }
        const userId = req.id; // middleware authentication
        let user = await User.findById(userId);

        if (!user) {
            return res.status(400).json({
                message: "User not found.",
                success: false
            })
        }
        // updating data
        if (fullname) user.fullname = fullname
        if (email) user.email = email
        if (phoneNumber) user.phoneNumber = phoneNumber
        if (bio) user.profile.bio = bio
        if (skills) user.profile.skills = skillsArray

        // resume comes later here...
        if (resumeUrl) {
            user.profile.resume = resumeUrl; // save resume url (Cloudinary or local static url)
            user.profile.resumeOriginalName = file.originalname; // Save the original file name
        }


        await user.save();

        user = {
            _id: user._id,
            fullname: user.fullname,
            email: user.email,
            phoneNumber: user.phoneNumber,
            role: user.role,
            profile: user.profile
        }

        return res.status(200).json({
            message: "Profile updated successfully.",
            user,
            success: true
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Failed to update profile",
            success: false
        });
    }
}