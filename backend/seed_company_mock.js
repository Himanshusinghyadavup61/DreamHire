import dns from "node:dns";
try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch {}

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import { User } from "./models/user.model.js";
import { Company } from "./models/company.model.js";
import { Job } from "./models/job.model.js";

const mockJobs = [
  {
    job_id: "JOB-201",
    title: "Frontend React Developer",
    department: "Engineering",
    location: "Remote - India",
    experience_required: "0-1 Years",
    status: "Open",
    salary: "₹6,00,000 - ₹9,00,000",
    description: "Build beautiful and high-performance user interfaces using React, Redux, and modern styling libraries. Collaborate with backend engineers to integrate APIs.",
    requirements: ["React", "JavaScript", "Redux", "Tailwind CSS", "HTML5/CSS3"],
    jobType: "Full Time",
    position: 2
  },
  {
    job_id: "JOB-202",
    title: "Backend Node.js Engineer",
    department: "Engineering",
    location: "Bengaluru",
    experience_required: "1-3 Years",
    status: "Open",
    salary: "₹10,00,000 - ₹15,00,000",
    description: "Architect scalable microservices and APIs using Node.js, Express, and MongoDB. Implement robust authentication, rate limiting, and database optimization.",
    requirements: ["Node.js", "Express.js", "MongoDB", "REST APIs", "JWT Authentication"],
    jobType: "Full Time",
    position: 3
  },
  {
    job_id: "JOB-203",
    title: "HR Associate",
    department: "Human Resources",
    location: "Mumbai",
    experience_required: "Fresher",
    status: "Closed",
    salary: "₹4,50,000 - ₹6,00,000",
    description: "Support full-cycle recruiting, candidate onboarding, employee engagement, and corporate compliance operations. Coordinate interviews and manage ATS records.",
    requirements: ["HR Management", "Communication", "Talent Acquisition", "Employee Onboarding"],
    jobType: "Full Time",
    position: 1
  }
];

async function seed() {
    try {
        console.log("Connecting to MongoDB Atlas...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB.");

        // Find or create recruiter
        let recruiter = await User.findOne({ role: "recruiter" });
        if (!recruiter) {
            console.log("No recruiter found. Please ensure a recruiter exists.");
            process.exit(1);
        }
        console.log(`Assigning jobs to recruiter: ${recruiter.fullname} (${recruiter.email})`);

        // Find or create company
        let company = await Company.findOne({ userId: recruiter._id });
        if (!company) {
            company = await Company.findOne({});
        }
        if (!company) {
            company = await Company.create({
                name: "DreamPlay Tech",
                description: "Innovating modern work and tech products.",
                location: "Bengaluru, India",
                userId: recruiter._id
            });
            console.log(`Created company: ${company.name}`);
        } else {
            console.log(`Using company: ${company.name}`);
        }

        for (const item of mockJobs) {
            const existing = await Job.findOne({ job_id: item.job_id });
            if (existing) {
                existing.title = item.title;
                existing.department = item.department;
                existing.location = item.location;
                existing.experienceLevel = item.experience_required;
                existing.status = item.status;
                existing.salary = item.salary;
                existing.description = item.description;
                existing.requirements = item.requirements;
                existing.jobType = item.jobType;
                existing.position = item.position;
                existing.company = company._id;
                existing.created_by = recruiter._id;
                await existing.save();
                console.log(`Updated job: [${item.job_id}] ${item.title} (${item.status})`);
            } else {
                const newJob = await Job.create({
                    job_id: item.job_id,
                    title: item.title,
                    department: item.department,
                    location: item.location,
                    experienceLevel: item.experience_required,
                    status: item.status,
                    salary: item.salary,
                    description: item.description,
                    requirements: item.requirements,
                    jobType: item.jobType,
                    position: item.position,
                    company: company._id,
                    created_by: recruiter._id
                });
                console.log(`Created job: [${item.job_id}] ${item.title} (${item.status}) with ID: ${newJob._id}`);
            }
        }

        console.log("\nAll company mock jobs seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Seeding error:", err);
        process.exit(1);
    }
}

seed();
