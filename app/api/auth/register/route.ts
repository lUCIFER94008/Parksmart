import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { connectToDatabase, isDatabaseConfigured } from "@/lib/db/mongodb";
import { User } from "@/models/User";
import { setSessionCookie, SessionUser } from "@/lib/auth/session";

const RegisterSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(7, "Please enter a valid phone number").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirm password must be at least 6 characters"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = RegisterSchema.safeParse(body);

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

    const { name, email, phone, password, confirmPassword } = parsed.data;

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, error: "Passwords do not match." },
        { status: 400 }
      );
    }

    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { success: false, error: "Database is not configured. Please check MONGODB_URI." },
        { status: 500 }
      );
    }

    await connectToDatabase();

    const normalizedEmail = email.toLowerCase().trim();

    // Check for existing user
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "An account with this email address already exists. Please sign in instead.",
        },
        { status: 409 }
      );
    }

    // Hash password securely with bcryptjs
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in MongoDB with role "user"
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone?.trim() || undefined,
      password: hashedPassword,
      role: "user", // Strict: users registering cannot grant themselves operator/admin roles
      status: "active",
    });

    const sessionUser: SessionUser = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
    };

    // Automatically establish session
    await setSessionCookie(sessionUser, false);

    return NextResponse.json({
      success: true,
      message: "Account created successfully.",
      user: sessionUser,
      defaultRedirect: "/dashboard",
    });
  } catch (error: any) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register account." },
      { status: 500 }
    );
  }
}
