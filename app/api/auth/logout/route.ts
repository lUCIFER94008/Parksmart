import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({
      success: true,
      message: "Signed out successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Failed to sign out." },
      { status: 500 }
    );
  }
}
