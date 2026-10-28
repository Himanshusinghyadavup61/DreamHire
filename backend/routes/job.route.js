import express from "express";
import isAuthenticated from "../middlewares/isAuthenticated.js";
import isRecruiter from "../middlewares/isRecruiter.js";
import { deleteJob, getAdminJobs, getAllJobs, getJobById, postJob } from "../controllers/job.controller.js";

const router = express.Router();

// Candidate & General routes
router.route("/get").get(isAuthenticated, getAllJobs);
router.route("/get/:id").get(isAuthenticated, getJobById);

// Recruiter-only routes (Challenge 1: Authorization - server-side verified recruiter role)
router.route("/post").post(isAuthenticated, isRecruiter, postJob);
router.route("/getadminjobs").get(isAuthenticated, isRecruiter, getAdminJobs);
router.route("/delete/:id").delete(isAuthenticated, isRecruiter, deleteJob);

export default router;


