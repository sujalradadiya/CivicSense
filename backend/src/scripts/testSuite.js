const http = require("http");

function request(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const headers = {
      "Content-Type": "application/json",
    };

    if (payload) {
      headers["Content-Length"] = Buffer.byteLength(payload);
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const req = http.request(
      {
        hostname: "localhost",
        port: 3000,
        path,
        method,
        headers,
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          let parsed;
          try {
            parsed = JSON.parse(data);
          } catch (e) {
            parsed = data;
          }
          resolve({ status: res.statusCode, body: parsed });
        });
      }
    );

    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log("\n========================================================");
  console.log(" CIVICSENSE RBAC TWO-ROLE (USER & ADMIN) TEST SUITE");
  console.log("========================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extra = "") {
    if (condition) {
      console.log(`[PASS] ${testName}`);
      passed++;
    } else {
      console.error(`[FAIL] ${testName} - ${extra}`);
      failed++;
    }
  }

  const timestamp = Date.now();
  const citizenEmail = `citizen_${timestamp}@test.com`;
  const citizenContact = "98" + Math.floor(10000000 + Math.random() * 90000000);
  const invitedAdminEmail = `invited_admin_${timestamp}@civicsence.com`;
  const invitedAdminContact = "99" + Math.floor(10000000 + Math.random() * 90000000);

  let citizenToken = "";
  let adminToken = "";
  let invitedAdminToken = "";
  let adminInviteToken = "";
  let testIssueId = "";
  let citizenUserId = "";

  try {
    // 1. Citizen Signup with attempt to supply ADMIN role
    console.log("--- 1. CITIZEN SIGNUP & PRIVILEGE ESCALATION PREVENTION ---");
    const signupWithAdminRes = await request("POST", "/api/auth/signup", {
      name: "Rahul Citizen",
      email: citizenEmail,
      password: "password123",
      contact: citizenContact,
      city: "Ahmedabad",
      role: "ADMIN", // Sneaky attempt to self-promote to ADMIN
    });

    assert(
      signupWithAdminRes.status === 201 && signupWithAdminRes.body.user.role === "USER",
      "1. Public signup enforces role 'USER' and ignores 'ADMIN' in request body",
      JSON.stringify(signupWithAdminRes.body)
    );
    citizenToken = signupWithAdminRes.body.token;
    citizenUserId = signupWithAdminRes.body.user.id;

    // 2. Citizen Signup with attempt to supply MANAGER role
    const citizenEmail2 = `citizen2_${timestamp}@test.com`;
    const signupWithManagerRes = await request("POST", "/api/auth/signup", {
      name: "Sneaky User",
      email: citizenEmail2,
      password: "password123",
      role: "MANAGER", // Sneaky attempt to supply MANAGER
    });
    assert(
      signupWithManagerRes.status === 201 && signupWithManagerRes.body.user.role === "USER",
      "2. Attempt to register with MANAGER role is ignored and account becomes 'USER'",
      JSON.stringify(signupWithManagerRes.body)
    );

    // 3. Citizen Login
    console.log("\n--- 2. COMMON LOGIN API & PROFILE ---");
    const citizenLoginRes = await request("POST", "/api/auth/login", {
      email: citizenEmail,
      password: "password123",
    });
    assert(
      citizenLoginRes.status === 200 &&
        citizenLoginRes.body.user.role === "USER" &&
        Boolean(citizenLoginRes.body.token),
      "3. Citizen login returns valid JWT and role is strictly 'USER'",
      JSON.stringify(citizenLoginRes.body)
    );

    // 4. Invalid Password returns 401
    const badLoginRes = await request("POST", "/api/auth/login", {
      email: citizenEmail,
      password: "wrong_password",
    });
    assert(
      badLoginRes.status === 401,
      "4. Invalid login credentials returns 401 Unauthorized"
    );

    // 5. Citizen Profile
    const profileRes = await request("GET", "/api/auth/profile", null, citizenToken);
    assert(
      profileRes.status === 200 &&
        profileRes.body.user.email === citizenEmail &&
        profileRes.body.user.role === "USER",
      "5. GET /api/auth/profile returns authenticated citizen profile with actual role",
      JSON.stringify(profileRes.body)
    );

    // 6. Citizen Attempt to Modify Role via Profile Update
    const updateRoleRes = await request(
      "PUT",
      "/api/auth/profile",
      { role: "ADMIN" },
      citizenToken
    );
    assert(
      updateRoleRes.status === 400,
      "6. Attempt to modify role via profile update is strictly blocked with 400",
      JSON.stringify(updateRoleRes.body)
    );

    // 7. Initial Admin Login
    console.log("\n--- 3. ADMINISTRATOR LOGIN & RBAC ACCESS ---");
    const adminLoginRes = await request("POST", "/api/auth/login", {
      email: "admin@civicsence.com",
      password: "Admin@Civic2026",
    });
    assert(
      adminLoginRes.status === 200 &&
        adminLoginRes.body.user.role === "ADMIN",
      "7. Admin logs in with common login API and role is strictly 'ADMIN'",
      JSON.stringify(adminLoginRes.body)
    );
    adminToken = adminLoginRes.body.token;

    // 8. Admin Accessing Dashboard Stats
    const statsRes = await request("GET", "/api/admin/stats", null, adminToken);
    assert(
      statsRes.status === 200 &&
        statsRes.body.success === true &&
        typeof statsRes.body.data.totalUsers === "number",
      "8. Admin accesses /api/admin/stats and receives real-time aggregation metrics",
      JSON.stringify(statsRes.body)
    );

    // 9. Citizen Attempting to Access Admin Stats (Forbidden)
    const citizenStatsRes = await request("GET", "/api/admin/stats", null, citizenToken);
    assert(
      citizenStatsRes.status === 403,
      "9. Citizen accessing /api/admin/stats is blocked with 403 Forbidden",
      JSON.stringify(citizenStatsRes.body)
    );

    // 10. Attempt to Create Invitation with MANAGER role (Rejected)
    console.log("\n--- 4. INVITATION-BASED ADMINISTRATOR REGISTRATION ---");
    const managerInviteRes = await request(
      "POST",
      "/api/admin/invitations",
      { email: `nomgr_${timestamp}@test.com`, role: "MANAGER" },
      adminToken
    );
    assert(
      managerInviteRes.status === 400,
      "10. Attempt to create invitation with role 'MANAGER' is rejected with 400",
      JSON.stringify(managerInviteRes.body)
    );

    // 11. Admin Creating ADMIN Invitation
    const adminInviteRes = await request(
      "POST",
      "/api/admin/invitations",
      { email: invitedAdminEmail, role: "ADMIN" },
      adminToken
    );
    assert(
      adminInviteRes.status === 201 && Boolean(adminInviteRes.body.data.invitationToken),
      "11. Admin successfully creates single-use ADMIN invitation token",
      JSON.stringify(adminInviteRes.body)
    );
    adminInviteToken = adminInviteRes.body.data.invitationToken;

    // 12. Registering new Admin via Invitation Token
    const adminRegRes = await request("POST", "/api/auth/admin-signup", {
      name: "Second City Admin",
      email: invitedAdminEmail,
      password: "AdminPassword@2026",
      contact: invitedAdminContact,
      city: "Ahmedabad",
      invitationToken: adminInviteToken,
    });
    assert(
      adminRegRes.status === 201 && adminRegRes.body.user.role === "ADMIN",
      "12. Invited user registers successfully with invitation token and role is 'ADMIN'",
      JSON.stringify(adminRegRes.body)
    );
    invitedAdminToken = adminRegRes.body.token;

    // 13. Attempt to Reuse the Invitation Token
    const reuseInviteRes = await request("POST", "/api/auth/admin-signup", {
      name: "Attacker",
      email: `attacker_${timestamp}@civicsence.com`,
      password: "password123",
      invitationToken: adminInviteToken,
    });
    assert(
      reuseInviteRes.status === 400,
      "13. Reusing single-use invitation token is blocked with 400 Bad Request",
      JSON.stringify(reuseInviteRes.body)
    );

    // 14. Second Admin Login
    const secondAdminLogin = await request("POST", "/api/auth/login", {
      email: invitedAdminEmail,
      password: "AdminPassword@2026",
    });
    assert(
      secondAdminLogin.status === 200 && secondAdminLogin.body.user.role === "ADMIN",
      "14. Newly registered Administrator logs in successfully with role 'ADMIN'",
      JSON.stringify(secondAdminLogin.body)
    );

    // 15. Invalid JWT Token Verification
    console.log("\n--- 5. JWT VALIDATION & COMPLAINT WORKFLOW ---");
    const badTokenRes = await request("GET", "/api/admin/complaints", null, "invalid.jwt.token");
    assert(
      badTokenRes.status === 401,
      "15. Invalid JWT returns 401 Unauthorized",
      JSON.stringify(badTokenRes.body)
    );

    // 16. Citizen Submits Complaint
    const issueRes = await request(
      "POST",
      "/issues",
      {
        issueTitle: "Broken Water Pipe",
        issueDetails: "Water leaking near civic center road corner.",
        city: "Ahmedabad",
        urgency: "High",
        issueTypeId: "68b2a1c4e5f6789012345679",
        stateId: "68b2a1c4e5f6789012345680",
      },
      citizenToken
    );
    assert(
      issueRes.status === 201 && issueRes.body.data.uid === citizenUserId,
      "16. Complaint registered and automatically associated with citizen's user ID",
      JSON.stringify(issueRes.body)
    );
    testIssueId = issueRes.body.data._id;

    // 17. Citizen views their complaints (only personal)
    const citizenIssuesRes = await request("GET", "/issues", null, citizenToken);
    assert(
      citizenIssuesRes.status === 200 &&
        citizenIssuesRes.body.data.every((i) => i.uid && i.uid._id === citizenUserId),
      "17. Citizen GET /issues returns ONLY their personal complaints"
    );

    // 18. Admin views all complaints
    const adminComplaintsRes = await request(
      "GET",
      "/api/admin/complaints",
      null,
      adminToken
    );
    assert(
      adminComplaintsRes.status === 200 && adminComplaintsRes.body.data.length > 0,
      "18. Admin GET /api/admin/complaints views complaints from ALL citizens"
    );

    // 19. Admin updates complaint priority
    const priorityUpdateRes = await request(
      "PATCH",
      `/api/admin/complaints/${testIssueId}/priority`,
      { priority: "CRITICAL", reason: "Major drinking water waste hazard" },
      adminToken
    );
    assert(
      priorityUpdateRes.status === 200 &&
        priorityUpdateRes.body.data.priority === "CRITICAL",
      "19. Admin updates complaint priority to CRITICAL with reason",
      JSON.stringify(priorityUpdateRes.body)
    );

    // 20. Admin updates status to RESOLVED
    const statusUpdateRes = await request(
      "PATCH",
      `/api/admin/complaints/${testIssueId}/status`,
      { status: "RESOLVED", remarks: "Repaired by municipal water department team." },
      adminToken
    );
    assert(
      statusUpdateRes.status === 200 &&
        statusUpdateRes.body.data.status === "RESOLVED",
      "20. Admin updates complaint status to RESOLVED with remarks",
      JSON.stringify(statusUpdateRes.body)
    );

    // 21. Citizen sees updated status on their complaint list
    const citizenCheckRes = await request("GET", "/issues", null, citizenToken);
    const updatedForCitizen = citizenCheckRes.body.data.find(
      (i) => i._id === testIssueId
    );
    assert(
      updatedForCitizen && updatedForCitizen.status === "RESOLVED",
      "21. Citizen sees updated RESOLVED status on personal complaints dashboard"
    );

    // 22. Admin retrieves complaint history timeline
    const historyRes = await request(
      "GET",
      `/api/admin/complaints/${testIssueId}/history`,
      null,
      adminToken
    );
    assert(
      historyRes.status === 200 &&
        Array.isArray(historyRes.body.data) &&
        historyRes.body.data.length >= 2,
      "22. Admin retrieves actual history timeline from /api/admin/complaints/:id/history",
      JSON.stringify(historyRes.body)
    );

    // 23. AI Analysis endpoint responds with proper structure
    console.log("\n--- 6. AI AGENT ARCHITECTURE & USER MANAGEMENT ---");
    const aiRes = await request(
      "GET",
      `/api/admin/complaints/${testIssueId}/ai-analysis`,
      null,
      adminToken
    );
    assert(
      aiRes.status === 200 &&
        aiRes.body.available === false &&
        aiRes.body.message === "AI analysis not available yet",
      "23. AI analysis endpoint responds with 'AI analysis not available yet' (No fake data)",
      JSON.stringify(aiRes.body)
    );

    // 24. Admin Citizen Management (Passwords never exposed)
    const allCitizensRes = await request("GET", "/api/admin/users", null, adminToken);
    assert(
      allCitizensRes.status === 200 &&
        allCitizensRes.body.data.length > 0 &&
        !allCitizensRes.body.data[0].password,
      "24. Admin views all citizens with passwords hidden and excluded",
      JSON.stringify(allCitizensRes.body)
    );

    // 25. View Staff lists only ADMINs (No Managers)
    const staffRes = await request("GET", "/api/admin/staff", null, adminToken);
    assert(
      staffRes.status === 200 &&
        staffRes.body.data.every((s) => s.role === "ADMIN"),
      "25. Admin /api/admin/staff returns ONLY accounts with role 'ADMIN'",
      JSON.stringify(staffRes.body)
    );

    // 26. Account Deactivation & Blocked Login
    const deactRes = await request(
      "PATCH",
      `/api/admin/users/${citizenUserId}/status`,
      { isActive: false, remarks: "Testing suspension" },
      adminToken
    );
    assert(
      deactRes.status === 200 && deactRes.body.data.isActive === false,
      "26. Admin deactivates citizen account successfully"
    );

    const deactLoginRes = await request("POST", "/api/auth/login", {
      email: citizenEmail,
      password: "password123",
    });
    assert(
      deactLoginRes.status === 403,
      "27. Deactivated account is blocked from login with 403 Forbidden"
    );

    // Reactivate account
    await request(
      "PATCH",
      `/api/admin/users/${citizenUserId}/status`,
      { isActive: true, remarks: "Reactivated" },
      adminToken
    );

    console.log("\n========================================================");
    console.log(` RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log("========================================================\n");

    if (failed === 0) {
      console.log("ALL TESTS PASSED WITH 100% SUCCESS!");
      process.exit(0);
    } else {
      console.error("SOME TESTS FAILED.");
      process.exit(1);
    }
  } catch (err) {
    console.error("Test execution encountered an error:", err);
    process.exit(1);
  }
}

// Execute test suite
runTests();
