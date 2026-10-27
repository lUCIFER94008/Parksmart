import crypto from "crypto";
import { cookies } from "next/headers";

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "operator" | "admin";
  phone?: string;
  avatar?: string;
}

const SESSION_COOKIE_NAME = "parksmart_session";
const SECRET_KEY =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "development-secret-must-be-at-least-32-characters-long";

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Creates a signed JWT-style token for the session.
 */
export function signSessionToken(user: SessionUser, expiresInDays: number = 7): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const exp = now + expiresInDays * 24 * 60 * 60;

  const payload = {
    sub: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar,
    iat: now,
    exp,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const data = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(data)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${data}.${signature}`;
}

/**
 * Verifies and decodes a signed session token.
 */
export function verifySessionToken(token: string): SessionUser | null {
  try {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const data = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(data)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSignature) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return null; // Expired
    }

    return {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role || "user",
      phone: payload.phone,
      avatar: payload.avatar,
    };
  } catch (err) {
    return null;
  }
}

/**
 * Retrieves the current session user from server cookies.
 */
export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch (err) {
    return null;
  }
}

/**
 * Sets the HTTP-only session cookie.
 */
export async function setSessionCookie(user: SessionUser, rememberMe: boolean = false): Promise<string> {
  const days = rememberMe ? 30 : 7;
  const token = signSessionToken(user, days);
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: days * 24 * 60 * 60,
  });

  return token;
}

/**
 * Clears the session cookie on sign out.
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/**
 * Sanitizes and validates a callback URL to prevent open redirect vulnerabilities.
 */
export function getSafeCallbackUrl(rawUrl?: string | null, fallbackRole: string = "user"): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return getDefaultRouteForRole(fallbackRole);
  }

  const trimmed = rawUrl.trim();

  // Must start with a single slash, not //, not /\, and cannot contain scheme (e.g. http://)
  if (
    trimmed.startsWith("/") &&
    !trimmed.startsWith("//") &&
    !trimmed.startsWith("/\\") &&
    !trimmed.includes("://")
  ) {
    return trimmed;
  }

  return getDefaultRouteForRole(fallbackRole);
}

/**
 * Determines the authorized destination route based on the verified role.
 */
export function getDefaultRouteForRole(role?: string): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "operator":
      return "/operator";
    default:
      return "/dashboard";
  }
}
