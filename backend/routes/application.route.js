import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isRecruiter from "../middlewares/isRecruiter.js";
import { applyRateLimiter } from "../middlewares/rateLimiter.js";
import { 
    applyJob, 
    getApplicants, 
    getAppliedJobs, 
    getApplicationById, 
    updateStatus 
} from "../controllers/application.controller.js";
 
const router = express.Router();

// Challenge 3: applyRateLimiter blocks rapid flood bots (500 req/sec) while Mongo unique index handles race conditions
router.route("/apply/:id").get(isAuthenticated, applyRateLimiter, applyJob);
router.route("/apply/:id").post(isAuthenticated, applyRateLimiter, applyJob);

// Candidate reads all their own applications
router.route("/get").get(isAuthenticated, getAppliedJobs);

// Challenge 2: Single application lookup protected against ID tampering
router.route("/get/:id").get(isAuthenticated, getApplicationById);

// Challenge 1 & 2: Recruiter-only access to view candidates and resumes
router.route("/:id/applicants").get(isAuthenticated, isRecruiter, getApplicants);

// Challenge 1: Recruiter-only access to update applicant status
router.route("/status/:id/update").post(isAuthenticated, isRecruiter, updateStatus);

export default router;
