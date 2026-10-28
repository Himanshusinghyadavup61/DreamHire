import dns from "node:dns";
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { User } from "./models/user.model.js";
import { Job } from "./models/job.model.js";
import { Company } from "./models/company.model.js";

async function setup() {
    await mongoose.connect(process.env.MONGO_URI);

    // Make sure demo2 has password '123456'
    const hashedPassword = await bcrypt.hash("123456", 10);
    await User.updateOne({ email: "demo2@gmail.com" }, { password: hashedPassword });
    await User.updateOne({ email: "recruiterboss@gmail.com" }, { password: hashedPassword });

    const recruiters = await User.find({ role: "recruiter" });
    const company = await Company.findOne({});

    console.log("Recruiters found:", recruiters.map(r => r.email));

    // Ensure mock jobs are visible to recruiters
    for (const rec of recruiters) {
        // Also associate company if needed
        await Company.updateOne({ _id: company._id }, { userId: rec._id });
        
        // Link the 3 mock jobs to the currently active recruiter
        await Job.updateMany(
            { job_id: { $in: ["JOB-201", "JOB-202", "JOB-203"] } },
            { created_by: rec._id, company: company._id }
        );
    }

    console.log("Mock data linked to active recruiter successfully!");
    process.exit(0);
}

setup();
