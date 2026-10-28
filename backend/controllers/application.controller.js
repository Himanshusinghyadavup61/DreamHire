import { Application } from "../models/application.model.js";
import { Job } from "../models/job.model.js";

// Challenge 3: Intelligently handles application submission, blocking duplicates even under concurrent floods
export const applyJob = async (req, res) => {
    try {
        const userId = req.id;
        const jobId = req.params.id;
        if (!jobId) {
            return res.status(400).json({
                message: "Job id is required.",
                success: false
            });
        }

        // 1. In-memory / DB pre-check
        const existingApplication = await Application.findOne({ job: jobId, applicant: userId });
        if (existingApplication) {
            return res.status(400).json({
                message: "You have already applied for this job.",
                success: false
            });
        }

        // 2. Check if the job exists and is open
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false
            });
        }

        // Business Requirement: Candidates can only apply to Open roles
        if (job.status === "Closed") {
            return res.status(400).json({
                message: "This job posting is closed and no longer accepting applications.",
                success: false
            });
        }

        // 3. Create application (protected by MongoDB compound unique index { job: 1, applicant: 1 })
        const newApplication = await Application.create({
            job: jobId,
            applicant: userId,
        });

        // Safely add application reference to job
        if (!job.applications.includes(newApplication._id)) {
            job.applications.push(newApplication._id);
            await job.save();
        }

        return res.status(201).json({
            message: "Job applied successfully.",
            success: true
        });
    } catch (error) {
        console.error("Apply job error:", error);
        // Challenge 3: MongoDB duplicate key error code 11000 caught when concurrent requests slip through
        if (error.code === 11000) {
            return res.status(409).json({
                message: "You have already applied for this job.",
                success: false
            });
        }
        return res.status(500).json({
            message: "Failed to apply for job.",
            success: false
        });
    }
};

// Candidate views all their own applied jobs (Challenge 2: Candidates only see their own applications)
export const getAppliedJobs = async (req, res) => {
    try {
        const userId = req.id;
        const application = await Application.find({ applicant: userId })
            .sort({ createdAt: -1 })
            .populate({
                path: 'job',
                options: { sort: { createdAt: -1 } },
                populate: {
                    path: 'company',
                    options: { sort: { createdAt: -1 } },
                }
            });

        if (!application || application.length === 0) {
            return res.status(200).json({
                application: [],
                message: "No Applications found.",
                success: true
            });
        }

        return res.status(200).json({
            application,
            success: true
        });
    } catch (error) {
        console.error("Get applied jobs error:", error);
        return res.status(500).json({
            message: "Failed to fetch applied jobs.",
            success: false
        });
    }
};

// Challenge 1 & 2: Recruiter views applicants for their own job only!
export const getApplicants = async (req, res) => {
    try {
        const jobId = req.params.id;
        const job = await Job.findById(jobId).populate({
            path: 'applications',
            options: { sort: { createdAt: -1 } },
            populate: {
                path: 'applicant',
                select: '-password' // Never leak passwords
            }
        });

        if (!job) {
            return res.status(404).json({
                message: 'Job not found.',
                success: false
            });
        }

        // Strict Ownership Check: Only the recruiter who created this job can view its applicants
        if (job.created_by.toString() !== req.id.toString()) {
            return res.status(403).json({
                message: "Forbidden: You are not authorized to view applicants for this job.",
                success: false
            });
        }

        return res.status(200).json({
            job,
            success: true
        });
    } catch (error) {
        console.error("Get applicants error:", error);
        return res.status(500).json({
            message: "Failed to fetch applicants.",
            success: false
        });
    }
};

// Challenge 1 & 2: Recruiter updates application status only for their own job
export const updateStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const applicationId = req.params.id;
        if (!status) {
            return res.status(400).json({
                message: 'status is required',
                success: false
            });
        }

        // Find the application and populate job to verify recruiter ownership
        const application = await Application.findById(applicationId).populate('job');
        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        }

        // Strict Ownership Check: Only the job poster can update candidate status
        if (application.job.created_by.toString() !== req.id.toString()) {
            return res.status(403).json({
                message: "Forbidden: You are not authorized to update status for this application.",
                success: false
            });
        }

        // Update the status
        application.status = status.toLowerCase();
        await application.save();

        return res.status(200).json({
            message: "Status updated successfully.",
            success: true
        });
    } catch (error) {
        console.error("Update status error:", error);
        return res.status(500).json({
            message: "Failed to update application status.",
            success: false
        });
    }
};

// Challenge 2: Prevent ID tampering - candidate can only view their own application, recruiter can view application for their job
export const getApplicationById = async (req, res) => {
    try {
        const applicationId = req.params.id;
        const application = await Application.findById(applicationId)
            .populate({
                path: 'job',
                populate: { path: 'company' }
            })
            .populate({
                path: 'applicant',
                select: '-password'
            });

        if (!application) {
            return res.status(404).json({
                message: "Application not found.",
                success: false
            });
        }

        // Privacy check: Only the applicant who submitted it OR the recruiter who posted the job can view it
        const isApplicant = application.applicant?._id?.toString() === req.id.toString();
        const isJobOwner = application.job?.created_by?.toString() === req.id.toString();

        if (!isApplicant && !isJobOwner) {
            return res.status(403).json({
                message: "Forbidden: You do not have permission to view this application.",
                success: false
            });
        }

        return res.status(200).json({
            application,
            success: true
        });
    } catch (error) {
        console.error("Get application by id error:", error);
        return res.status(500).json({
            message: "Failed to retrieve application.",
            success: false
        });
    }
};