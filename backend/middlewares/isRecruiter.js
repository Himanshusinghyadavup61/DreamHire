import { User } from "../models/user.model.js";

const isRecruiter = async (req, res, next) => {
    try {
        if (!req.id) {
            return res.status(401).json({
                message: "User not authenticated.",
                success: false
            });
        }

        let role = req.role;
        if (!role) {
            const user = await User.findById(req.id).select("role");
            if (!user) {
                return res.status(401).json({
                    message: "User not found.",
                    success: false
                });
            }
            role = user.role;
            req.role = role;
        }

        if (role !== "recruiter") {
            return res.status(403).json({
                message: "Forbidden: Only verified recruiters can perform this action.",
                success: false
            });
        }

        next();
    } catch (error) {
        console.error("Authorization error:", error);
        return res.status(500).json({
            message: "Internal server error during authorization.",
            success: false
        });
    }
};

export default isRecruiter;
