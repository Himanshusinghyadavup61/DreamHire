# DreamHire - Modern Job Portal & Applicant Tracking System

**DreamHire** is a full-stack, enterprise-ready Job Portal and Applicant Tracking System (ATS). It connects job seekers with hiring companies, providing candidate workflows, recruiter administration tools, and real-time application management.

---

## Key Features

### For Candidates
* **Explore Open Roles:** Browse, filter, and search open jobs by keyword, role, location, department, and company.
* **Streamlined Applications:** Apply to open jobs with one click, submit resumes, and track application status (`Pending`, `Accepted`, `Rejected`) in real time.
* **Profile Management:** Maintain professional profile details, contact information, uploaded resumes, and applied job histories.

### For Recruiters & Employers
* **Company Registration:** Set up and manage company profiles with logos, website URLs, and company descriptions.
* **Job Posting & Customization:** Create and publish job openings with custom Job IDs, departments, experience levels, salary ranges, and recruitment status (`Open` or `Closed`).
* **Applicant Tracking Dashboard:** Review applicants, inspect resumes, and manage hiring decisions with status updates.
* **Job Lifecycle Management:** Manage job statuses and safely delete closed or completed job listings.

---

## Security & Architecture Highlights

* **Role-Based Access Control (RBAC):** Privileged recruiter routes and administrative capabilities are enforced on the server using cryptographically signed JWT tokens and role verification.
* **Data Privacy & Ownership:** Resource ownership validation ensures candidates can only access their personal application records, while recruiters only access candidates for their own posted roles.
* **High-Concurrency Protection:** Backed by database compound unique indexes to guarantee duplicate application submissions are rejected even under concurrent high-traffic bursts.
* **Rate Limiting & Abuse Prevention:** Layered rate limiting defends API endpoints against rapid-fire bot requests and denial-of-service attempts.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React, Redux Toolkit, React Router DOM, Tailwind CSS, Lucide React, Radix UI / Shadcn UI, Sonner |
| **Backend** | Node.js, Express.js, MongoDB Atlas (Mongoose), JWT, Cookie-Parser, Multer, DataURI, Cloudinary |
| **Security** | Express-Rate-Limit, BCryptJS, Strict RBAC Middleware, Compound Indexes |

---

## Getting Started

### Prerequisites
* **Node.js** (v18 or higher)
* **npm** or **yarn**
* **MongoDB Atlas** database or local MongoDB instance

---

### Installation & Local Setup

#### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=8000
   MONGO_URI=your_mongodb_connection_string
   SECRET_KEY=your_jwt_secret_key
   CLOUD_NAME=your_cloudinary_cloud_name
   API_KEY=your_cloudinary_api_key
   API_SECRET=your_cloudinary_api_secret
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```
   *The backend runs at `http://localhost:8000`.*

---

#### 2. Frontend Setup
1. In a separate terminal, navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend runs at `http://localhost:5173`.*

---

## API Reference

### Authentication (`/api/v1/user`)
* `POST /register`: Create a new candidate or recruiter account with optional avatar/resume.
* `POST /login`: Authenticate user and issue secure HTTP-only session cookie.
* `GET /logout`: Invalidate session and clear authentication cookie.
* `POST /profile/update`: Update user details, bio, skills, and resume.

### Jobs (`/api/v1/job`)
* `GET /get`: Retrieve all active jobs (supports filtering by title, department, and keyword).
* `GET /get/:id`: Retrieve full job details and requirements.
* `POST /post`: Post a new job *(Recruiter only)*.
* `GET /getadminjobs`: Get all jobs posted by the authenticated recruiter *(Recruiter only)*.
* `DELETE /delete/:id`: Delete a job and associated applications *(Recruiter & Owner only)*.

### Applications (`/api/v1/application`)
* `POST /apply/:id`: Submit an application for an open job *(Candidate only)*.
* `GET /get`: Retrieve all applications submitted by the logged-in candidate.
* `GET /get/:id`: View a specific application *(Applicant or Job Owner only)*.
* `GET /:id/applicants`: View all candidates who applied for a job *(Job Owner only)*.
* `POST /status/:id/update`: Update application status to `accepted` or `rejected` *(Job Owner only)*.

### Companies (`/api/v1/company`)
* `POST /register`: Register a new company profile *(Recruiter only)*.
* `GET /get`: List all companies owned by the recruiter.
* `GET /get/:id`: Fetch specific company details.
* `PUT /update/:id`: Update company details and logo *(Company Owner only)*.

---

## Deployment Guide

### Backend (Render / Railway)
1. Push your repository to GitHub.
2. Create a new Web Service and link the repository.
3. Configure:
   * **Root Directory:** `backend`
   * **Build Command:** `npm install`
   * **Start Command:** `node index.js`
4. Add the environment variables configured in `backend/.env`.

### Frontend (Vercel / Netlify)
1. Create a new project on Vercel and import your repository.
2. Configure:
   * **Root Directory:** `frontend`
   * **Framework Preset:** `Vite`
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
3. In `frontend/src/utils/constant.js`, ensure the endpoints point to your deployed backend URL.

---

## License

This project is licensed under the [MIT License](LICENSE).
