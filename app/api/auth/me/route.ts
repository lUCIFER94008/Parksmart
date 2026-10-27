import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({
        success: false,
        authenticated: false,
        user: null,
      });
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      authenticated: false,
      user: null,
    });
  }
}
