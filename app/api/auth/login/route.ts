import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { setSessionCookie, SessionUser, getDefaultRouteForRole } from "@/lib/auth/session";

const LoginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          errors: parsed.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { email, password, rememberMe } = parsed.data;

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database is not configured. Please check MONGODB_URI." },
        { status: 500 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please verify your credentials." },
        { status: 401 }
      );
    }

    if (user.status === "suspended") {
      return NextResponse.json(
        {
          success: false,
          error: "Your account has been suspended. Please contact system administrator.",
        },
        { status: 403 }
      );
    }

    // Verify password with bcrypt
    const passwordValid = user.password ? await bcrypt.compare(password, user.password) : false;

    if (!passwordValid) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password. Please verify your credentials." },
        { status: 401 }
      );
    }

    const sessionUser: SessionUser = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    };

    // Establish secure HTTP-only cookie
    await setSessionCookie(sessionUser, rememberMe);

    return NextResponse.json({
      success: true,
      message: "Sign in successful.",
      user: sessionUser,
      defaultRedirect: getDefaultRouteForRole(user.role),
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "An error occurred during authentication." },
      { status: 500 }
    );
  }
}
