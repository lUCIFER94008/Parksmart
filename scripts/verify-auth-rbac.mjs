// Automated verification script for ParkSmart Authentication & RBAC
const BASE_URL = "http://localhost:3000";

async function runTests() {
  console.log("=== STARTING PARKSMART AUTH & RBAC VERIFICATION ===");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passed++;
    } else {
      console.error(`[FAIL] ${message}`);
      failed++;
    }
  }

  try {
    // 1. Public Pages Access (Unauthenticated)
    console.log("\n--- 1. Testing Public Pages (Unauthenticated) ---");
    const homeRes = await fetch(`${BASE_URL}/`, { redirect: "manual" });
    assert(homeRes.status === 200, "GET / returns 200 OK without authentication");

    const parkingRes = await fetch(`${BASE_URL}/parking`, { redirect: "manual" });
    assert(parkingRes.status === 200, "GET /parking returns 200 OK without authentication");

    // 2. Protected Routes (Unauthenticated Redirect)
    console.log("\n--- 2. Testing Protected Routes (Unauthenticated) ---");
    const dashRes = await fetch(`${BASE_URL}/dashboard`, { redirect: "manual" });
    assert(
      dashRes.status === 307 || dashRes.status === 302,
      `GET /dashboard redirects unauthenticated user (status: ${dashRes.status})`
    );
    const dashLocation = dashRes.headers.get("location") || "";
    assert(
      dashLocation.includes("/auth/login") && dashLocation.includes("callbackUrl=%2Fdashboard"),
      `GET /dashboard redirects to login with callbackUrl (location: ${dashLocation})`
    );

    const opRes = await fetch(`${BASE_URL}/operator`, { redirect: "manual" });
    assert(
      opRes.status === 307 || opRes.status === 302,
      `GET /operator redirects unauthenticated user (status: ${opRes.status})`
    );

    const adminRes = await fetch(`${BASE_URL}/admin`, { redirect: "manual" });
    assert(
      adminRes.status === 307 || adminRes.status === 302,
      `GET /admin redirects unauthenticated user (status: ${adminRes.status})`
    );

    // 3. API Bookings Protection (Unauthenticated)
    console.log("\n--- 3. Testing Booking API Protection (Unauthenticated) ---");
    const unauthBookingRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        locationId: "loc-downtown-metro",
        slotNumber: "A-01",
        vehiclePlate: "TEST-99",
        vehicleType: "car",
        startTime: new Date(Date.now() + 3600000).toISOString(),
        endTime: new Date(Date.now() + 7200000).toISOString(),
      }),
    });
    assert(
      unauthBookingRes.status === 401,
      `POST /api/bookings returns 401 Unauthorized for unauthenticated request (status: ${unauthBookingRes.status})`
    );

    // 4. Authenticate as Driver (Regular User)
    console.log("\n--- 4. Testing Driver Authentication & RBAC ---");
    const driverLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "driver@parksmart.io",
        password: "Password123!",
        rememberMe: true,
      }),
    });
    assert(driverLoginRes.status === 200, "POST /api/auth/login succeeds for driver@parksmart.io");
    const driverCookie = driverLoginRes.headers.get("set-cookie");
    assert(driverCookie && driverCookie.includes("parksmart_session"), "Login sets parksmart_session cookie");

    // Extract cookie value
    const sessionCookieHeader = driverCookie ? driverCookie.split(";")[0] : "";

    // Test /api/auth/me with session
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: sessionCookieHeader },
    });
    const meData = await meRes.json();
    assert(meData.authenticated === true && meData.user.role === "user", "Driver session verified with role 'user'");

    // Driver accessing /dashboard -> allowed
    const driverDashRes = await fetch(`${BASE_URL}/dashboard`, {
      headers: { Cookie: sessionCookieHeader },
      redirect: "manual",
    });
    assert(driverDashRes.status === 200, "Driver can access /dashboard (status: 200)");

    // Driver attempting to access /admin -> redirected to /dashboard?error=unauthorized
    const driverAdminRes = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: sessionCookieHeader },
      redirect: "manual",
    });
    assert(
      driverAdminRes.status === 307 || driverAdminRes.status === 302,
      `Driver attempting /admin is redirected (status: ${driverAdminRes.status})`
    );
    const driverAdminLoc = driverAdminRes.headers.get("location") || "";
    assert(
      driverAdminLoc.includes("/dashboard") && driverAdminLoc.includes("error=unauthorized"),
      `Driver is redirected to /dashboard with error=unauthorized (location: ${driverAdminLoc})`
    );

    // Driver attempting to access /operator -> redirected to /dashboard?error=unauthorized
    const driverOpRes = await fetch(`${BASE_URL}/operator`, {
      headers: { Cookie: sessionCookieHeader },
      redirect: "manual",
    });
    assert(
      driverOpRes.status === 307 || driverOpRes.status === 302,
      `Driver attempting /operator is redirected (status: ${driverOpRes.status})`
    );
    const driverOpLoc = driverOpRes.headers.get("location") || "";
    assert(
      driverOpLoc.includes("/dashboard") && driverOpLoc.includes("error=unauthorized"),
      `Driver is redirected to /dashboard with error=unauthorized (location: ${driverOpLoc})`
    );

    // 5. Authenticate as Operator
    console.log("\n--- 5. Testing Operator Authentication & RBAC ---");
    const opLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "operator@parksmart.io",
        password: "Password123!",
      }),
    });
    assert(opLoginRes.status === 200, "POST /api/auth/login succeeds for operator@parksmart.io");
    const opCookieHeader = opLoginRes.headers.get("set-cookie")?.split(";")[0] || "";

    // Operator accessing /operator -> allowed
    const opPageRes = await fetch(`${BASE_URL}/operator`, {
      headers: { Cookie: opCookieHeader },
      redirect: "manual",
    });
    assert(opPageRes.status === 200, "Operator can access /operator (status: 200)");

    // Operator attempting /admin -> redirected
    const opAdminRes = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: opCookieHeader },
      redirect: "manual",
    });
    assert(
      opAdminRes.status === 307 || opAdminRes.status === 302,
      `Operator attempting /admin is redirected (status: ${opAdminRes.status})`
    );

    // 6. Authenticate as Admin
    console.log("\n--- 6. Testing Admin Authentication & RBAC ---");
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@parksmart.io",
        password: "Password123!",
      }),
    });
    assert(adminLoginRes.status === 200, "POST /api/auth/login succeeds for admin@parksmart.io");
    const adminCookieHeader = adminLoginRes.headers.get("set-cookie")?.split(";")[0] || "";

    // Admin accessing /admin -> allowed
    const adminPageRes = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: adminCookieHeader },
      redirect: "manual",
    });
    assert(adminPageRes.status === 200, "Admin can access /admin (status: 200)");

    // 7. Authenticated Booking Creation with Driver
    console.log("\n--- 7. Testing Authenticated Booking Creation ---");
    const startTimeStr = new Date(Date.now() + 2 * 3600000).toISOString();
    const endTimeStr = new Date(Date.now() + 5 * 3600000).toISOString();
    const authBookingRes = await fetch(`${BASE_URL}/api/bookings`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: sessionCookieHeader,
      },
      body: JSON.stringify({
        locationId: "loc-downtown-metro",
        slotNumber: "A-09",
        vehiclePlate: "VERIFY-88",
        vehicleType: "car",
        startTime: startTimeStr,
        endTime: endTimeStr,
      }),
    });
    const bookingResult = await authBookingRes.json();
    assert(authBookingRes.status === 200, `Authenticated booking succeeds (status: ${authBookingRes.status})`);
    assert(bookingResult.data?.bookingReference?.startsWith("PK-"), "Booking reference generated in PK-YYYYMMDD-XXXX format");
    assert(bookingResult.data?.qrCodeDataUrl?.startsWith("data:image/png;base64,"), "QR Pass generated after persistence");

    // 8. Sign Out
    console.log("\n--- 8. Testing Logout ---");
    const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: "POST",
      headers: { Cookie: sessionCookieHeader },
    });
    assert(logoutRes.status === 200, "POST /api/auth/logout succeeds");
    const clearedCookie = logoutRes.headers.get("set-cookie") || "";
    assert(
      clearedCookie.includes("parksmart_session=") && (clearedCookie.includes("Max-Age=0") || clearedCookie.includes("expires=")),
      "Logout clears parksmart_session cookie"
    );

    console.log(`\n=== RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  } catch (error) {
    console.error("Test execution failed with exception:", error);
  }
}

runTests();
