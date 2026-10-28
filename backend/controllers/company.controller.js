import { Company } from "../models/company.model.js";
import getDataUri from "../utils/datauri.js";
import cloudinary from "../utils/cloudinary.js";

export const registerCompany = async (req, res) => {
    try {
        const { companyName } = req.body;
        if (!companyName) {
            return res.status(400).json({
                message: "Company name is required.",
                success: false
            });
        }
        let company = await Company.findOne({ name: companyName });
        if (company) {
            return res.status(400).json({
                message: "You can't register same company.",
                success: false
            })
        };
        company = await Company.create({
            name: companyName,
            userId: req.id
        });

        return res.status(201).json({
            message: "Company registered successfully.",
            company,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const getCompany = async (req, res) => {
    try {
        const userId = req.id; // logged in user id
        const companies = await Company.find({ userId });
        if (!companies) {
            return res.status(404).json({
                message: "Companies not found.",
                success: false
            })
        }
        return res.status(200).json({
            companies,
            success:true
        })
    } catch (error) {
        console.log(error);
    }
}
// get company by id
export const getCompanyById = async (req, res) => {
    try {
        const companyId = req.params.id;
        const company = await Company.findById(companyId);
        if (!company) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            })
        }
        return res.status(200).json({
            company,
            success: true
        })
    } catch (error) {
        console.log(error);
    }
}
export const updateCompany = async (req, res) => {
    try {
        const { name, description, website, location } = req.body;
        const companyId = req.params.id;

        const existingCompany = await Company.findById(companyId);
        if (!existingCompany) {
            return res.status(404).json({
                message: "Company not found.",
                success: false
            });
        }

        // Ownership verification: Only the recruiter who registered the company can edit it
        if (existingCompany.userId.toString() !== req.id.toString()) {
            return res.status(403).json({
                message: "Forbidden: You are not authorized to update this company.",
                success: false
            });
        }
 
        const file = req.file;
        let logo;
        if (file) {
            const fileUri = getDataUri(file);
            if (fileUri) {
                const cloudResponse = await cloudinary.uploader.upload(fileUri.content);
                logo = cloudResponse.secure_url;
            }
        }
    
        const updateData = { name, description, website, location };
        if (logo) {
            updateData.logo = logo;
        }

        const company = await Company.findByIdAndUpdate(companyId, updateData, { new: true });

        return res.status(200).json({
            message: "Company information updated.",
            company,
            success: true
        });

    } catch (error) {
        console.error("Update company error:", error);
        return res.status(500).json({
            message: "Failed to update company.",
            success: false
        });
    }
}