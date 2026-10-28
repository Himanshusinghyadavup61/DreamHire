import dns from "node:dns";
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch {}
import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import { Job } from "./models/job.model.js";

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    const users = await User.find({}).lean();
    console.log("=== USERS ===");
    users.forEach(u => console.log(`${u._id} | ${u.fullname} | ${u.email} | ${u.role}`));
    const jobs = await Job.find({}).lean();
    console.log("\n=== JOBS ===");
    jobs.forEach(j => console.log(`${j._id} | ${j.job_id} | ${j.title} | ${j.status} | created_by: ${j.created_by}`));
    process.exit(0);
}
run();
