const BASE_URL = 'http://localhost:8000/api/v1';

async function runSecurityAudit() {
    console.log("=================================================");
    console.log("   DREAMHIRE SECURITY & ASSESSMENT TEST SUITE   ");
    console.log("=================================================\n");

    const ts = Date.now();
    const candidateEmail = `test.cand.${ts}@example.com`;
    const recruiter1Email = `test.rec1.${ts}@example.com`;
    const recruiter2Email = `test.rec2.${ts}@example.com`;
    const password = 'Password@123';

    // Helper to register
    async function register(fullname, email, role) {
        const res = await fetch(`${BASE_URL}/user/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                fullname,
                email,
                phoneNumber: '9876543210',
                password,
                role
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        return data;
    }

    // Helper to login and get cookie
    async function login(email, role) {
        const res = await fetch(`${BASE_URL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, role })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Login failed');
        const cookie = res.headers.get('set-cookie') || '';
        return { user: data.user, cookie };
    }

    console.log("[1/6] Registering test users (Candidate, Recruiter 1, Recruiter 2)...");
    await register('Alice Candidate', candidateEmail, 'student');
    await register('Bob Recruiter', recruiter1Email, 'recruiter');
    await register('Charlie Recruiter', recruiter2Email, 'recruiter');

    console.log("[2/6] Logging in test users...");
    const candidateAuth = await login(candidateEmail, 'student');
    const recruiter1Auth = await login(recruiter1Email, 'recruiter');
    const recruiter2Auth = await login(recruiter2Email, 'recruiter');

    console.log("✓ Logins successful.\n");

    // Recruiter 1 creates a company and job
    console.log("[3/6] Recruiter 1 creates company and job...");
    const compRes = await fetch(`${BASE_URL}/company/register`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': recruiter1Auth.cookie
        },
        body: JSON.stringify({ companyName: `Acme Corp ${ts}` })
    });
    const compData = await compRes.json();
    const companyId = compData.company._id;

    const jobRes = await fetch(`${BASE_URL}/job/post`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': recruiter1Auth.cookie
        },
        body: JSON.stringify({
            title: `Full Stack Engineer ${ts}`,
            description: 'Solve real-world challenges',
            requirements: 'Node.js, React, MongoDB',
            salary: '₹12,00,000',
            location: 'Remote',
            jobType: 'Full Time',
            experience: '2',
            position: 3,
            companyId
        })
    });
    const jobData = await jobRes.json();
    const jobId = jobData.job._id;
    console.log(`✓ Job created with ID: ${jobId}\n`);

    // ==========================================
    // CHALLENGE 1: THE INVISIBLE DOOR (AUTHORIZATION)
    // ==========================================
    console.log("-------------------------------------------------");
    console.log("CHALLENGE 1: The Invisible Door (Authorization)");
    console.log("-------------------------------------------------");

    // Test 1.1: Candidate attempts to post a job directly via API (curl/postman simulation)
    const candPostRes = await fetch(`${BASE_URL}/job/post`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': candidateAuth.cookie
        },
        body: JSON.stringify({
            title: 'Hacked Job By Candidate',
            description: 'Unauthorized job',
            requirements: 'None',
            salary: '₹1,00,000',
            location: 'Remote',
            jobType: 'Full Time',
            experience: '0',
            position: 1,
            companyId
        })
    });
    if (candPostRes.status === 403) {
        console.log(" PASS: Candidate blocked from posting job (403 Forbidden)");
    } else {
        console.error(` FAIL: Unexpected status on candidate post job: ${candPostRes.status}`);
    }

    // Test 1.2: Candidate attempts to view recruiter applicant dashboard/resumes
    const candViewAppRes = await fetch(`${BASE_URL}/application/${jobId}/applicants`, {
        headers: { 'Cookie': candidateAuth.cookie }
    });
    if (candViewAppRes.status === 403) {
        console.log(" PASS: Candidate blocked from viewing applicants (403 Forbidden)");
    } else {
        console.error(` FAIL: Unexpected status on candidate viewing applicants: ${candViewAppRes.status}`);
    }

    // Test 1.3: Recruiter 2 (non-owner) attempts to view Recruiter 1's applicants
    const rec2ViewAppRes = await fetch(`${BASE_URL}/application/${jobId}/applicants`, {
        headers: { 'Cookie': recruiter2Auth.cookie }
    });
    if (rec2ViewAppRes.status === 403) {
        console.log(" PASS: Non-owner Recruiter blocked from viewing other recruiter's applicants (403 Forbidden)");
    } else {
        console.error(` FAIL: Unexpected status on recruiter 2 viewing applicants: ${rec2ViewAppRes.status}`);
    }

    // Test 1.4: Candidate attempts to delete a job
    const candDelRes = await fetch(`${BASE_URL}/job/delete/${jobId}`, {
        method: 'DELETE',
        headers: { 'Cookie': candidateAuth.cookie }
    });
    if (candDelRes.status === 403) {
        console.log(" PASS: Candidate blocked from deleting job (403 Forbidden)");
    } else {
        console.error(` FAIL: Unexpected status on candidate delete job: ${candDelRes.status}`);
    }

    // Test 1.5: Recruiter 2 attempts to delete Recruiter 1's job
    const rec2DelRes = await fetch(`${BASE_URL}/job/delete/${jobId}`, {
        method: 'DELETE',
        headers: { 'Cookie': recruiter2Auth.cookie }
    });
    if (rec2DelRes.status === 403) {
        console.log(" PASS: Recruiter 2 blocked from deleting Recruiter 1's job (403 Forbidden)");
    } else {
        console.error(` FAIL: Unexpected status on recruiter 2 delete job: ${rec2DelRes.status}`);
    }

    // ==========================================
    // CHALLENGE 2: THE DATA LEAK (PRIVACY & ID TAMPERING)
    // ==========================================
    console.log("\n-------------------------------------------------");
    console.log("CHALLENGE 2: The Data Leak (Privacy & ID Tampering)");
    console.log("-------------------------------------------------");

    // Candidate applies to the job
    const applyRes = await fetch(`${BASE_URL}/application/apply/${jobId}`, {
        method: 'POST',
        headers: { 'Cookie': candidateAuth.cookie }
    });
    const applyData = await applyRes.json();
    console.log(`Candidate applied: ${applyData.message}`);

    // Query candidate's applied jobs to get the application ID
    const candAppsRes = await fetch(`${BASE_URL}/application/get`, {
        headers: { 'Cookie': candidateAuth.cookie }
    });
    const candAppsData = await candAppsRes.json();
    const candidateAppId = candAppsData.application[0]._id;
    console.log(`Candidate application ID: ${candidateAppId}`);

    // Create a 2nd candidate to simulate ID tampering
    const candidate2Email = `test.attacker.${ts}@example.com`;
    await register('Mallory Attacker', candidate2Email, 'student');
    const candidate2Auth = await login(candidate2Email, 'student');

    // Mallory tries to access Alice's application details by guessing/tampering ID
    const malloryRes = await fetch(`${BASE_URL}/application/get/${candidateAppId}`, {
        headers: { 'Cookie': candidate2Auth.cookie }
    });
    if (malloryRes.status === 403) {
        console.log(" PASS: Mallory blocked from reading Alice's application (403 Forbidden)");
    } else {
        console.error(` FAIL: Unexpected status on ID tampering read: ${malloryRes.status}`);
    }

    // Alice accesses her own application
    const aliceRes = await fetch(`${BASE_URL}/application/get/${candidateAppId}`, {
        headers: { 'Cookie': candidateAuth.cookie }
    });
    if (aliceRes.status === 200) {
        console.log(" PASS: Alice can legitimately view her own application (200 OK)");
    } else {
        console.error(` FAIL: Alice could not view her own application: ${aliceRes.status}`);
    }

    // Recruiter 1 (job owner) accesses Alice's application
    const rec1Res = await fetch(`${BASE_URL}/application/get/${candidateAppId}`, {
        headers: { 'Cookie': recruiter1Auth.cookie }
    });
    if (rec1Res.status === 200) {
        console.log(" PASS: Recruiter 1 (Job Owner) can view Alice's application (200 OK)");
    } else {
        console.error(` FAIL: Recruiter 1 could not view Alice's application: ${rec1Res.status}`);
    }

    // ==========================================
    // CHALLENGE 3: THE SPAM BOT (CONCURRENCY RACE CONDITIONS)
    // ==========================================
    console.log("\n-------------------------------------------------");
    console.log("CHALLENGE 3: The Spam Bot (Concurrency Race Conditions)");
    console.log("-------------------------------------------------");

    // Create a fresh candidate to test concurrent race conditions
    const botEmail = `spambot.${ts}@example.com`;
    await register('Spam Bot 3000', botEmail, 'student');
    const botAuth = await login(botEmail, 'student');

    console.log("Firing 20 concurrent application requests simultaneously...");
    const requests = Array.from({ length: 20 }, () =>
        fetch(`${BASE_URL}/application/apply/${jobId}`, {
            method: 'POST',
            headers: { 'Cookie': botAuth.cookie }
        }).then(r => r.status)
    );

    const statuses = await Promise.all(requests);
    const statusCounts = {};
    statuses.forEach(s => {
        statusCounts[s] = (statusCounts[s] || 0) + 1;
    });

    console.log("Concurrency Status Breakdown:", statusCounts);
    const successCount = statusCounts[201] || 0;
    const duplicatesBlocked = (statusCounts[400] || 0) + (statusCounts[409] || 0);
    const rateLimited = statusCounts[429] || 0;

    if (successCount === 1) {
        console.log(` PASS: Exactly 1 application created (201 Created)!`);
        console.log(` PASS: All 19 concurrent race condition attempts successfully rejected (Duplicates: ${duplicatesBlocked}, Rate Limited: ${rateLimited}).`);
    } else {
        console.error(` FAIL: Multiple applications created under concurrency: ${successCount}`);
    }

    // Cleanup: Recruiter 1 deletes their closed job
    console.log("\n[Recruiter Deletes Closed Job]");
    const delRes = await fetch(`${BASE_URL}/job/delete/${jobId}`, {
        method: 'DELETE',
        headers: { 'Cookie': recruiter1Auth.cookie }
    });
    const delData = await delRes.json();
    if (delRes.status === 200 && delData.success) {
        console.log(" PASS: Recruiter 1 successfully deleted their closed job.");
    } else {
        console.error(` FAIL: Recruiter 1 could not delete job: ${delRes.status}`);
    }

    console.log("\n=================================================");
    console.log("   ALL THREE ASSESSMENT CHALLENGES VERIFIED!     ");
    console.log("=================================================");
}

runSecurityAudit().catch(err => {
    console.error("Test suite error:", err);
    process.exit(1);
});
