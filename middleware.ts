import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SECRET_KEY =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "development-secret-must-be-at-least-32-characters-long";

/**
 * Universal Web Crypto HMAC verifier compatible with Next.js Edge Middleware
 */
async function verifySessionTokenEdge(token: string, secret: string) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const data = `${header}.${payload}`;

    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );

    let sigBase64 = signature.replace(/-/g, "+").replace(/_/g, "/");
    while (sigBase64.length % 4) sigBase64 += "=";
    const sigBytes = Uint8Array.from(atob(sigBase64), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, enc.encode(data));
    if (!isValid) return null;

    let payloadBase64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    while (payloadBase64.length % 4) payloadBase64 += "=";
    const decoded = JSON.parse(atob(payloadBase64));

    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < now) return null;

    return decoded;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protected route prefixes
  const isDashboard = pathname.startsWith("/dashboard");
  const isOperator = pathname.startsWith("/operator");
  const isAdmin = pathname.startsWith("/admin");

  if (!isDashboard && !isOperator && !isAdmin) {
    return NextResponse.next();
  }

  // Check session cookie
  const sessionCookie = request.cookies.get("parksmart_session")?.value;

  if (!sessionCookie) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("authRequired", "true");
    return NextResponse.redirect(loginUrl);
  }

  const session = await verifySessionTokenEdge(sessionCookie, SECRET_KEY);

  if (!session) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    loginUrl.searchParams.set("authRequired", "true");
    const response = NextResponse.redirect(loginUrl);
    // Clear invalid cookie
    response.cookies.delete("parksmart_session");
    return response;
  }

  const role = session.role || "user";

  // Role-Based Access Control
  if (isAdmin) {
    if (role !== "admin") {
      const redirectUrl = new URL(role === "operator" ? "/operator" : "/dashboard", request.url);
      redirectUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(redirectUrl);
    }
  }

  if (isOperator) {
    if (role !== "operator" && role !== "admin") {
      const redirectUrl = new URL("/dashboard", request.url);
      redirectUrl.searchParams.set("error", "unauthorized");
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Attach session user info to request headers for downstream server components
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", session.sub || "");
  requestHeaders.set("x-user-role", role);
  requestHeaders.set("x-user-email", session.email || "");

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/dashboard/:path*", "/operator/:path*", "/admin/:path*"],
};
