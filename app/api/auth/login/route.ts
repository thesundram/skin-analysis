import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getUsersCollection } from "@/lib/mongodb";
import { AUTH_COOKIE_NAME, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    const users = await getUsersCollection();
    const userDoc = await users.findOne({ email: trimmedEmail });

    if (!userDoc) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    // Verify password with bcrypt
    const passwordMatches = await bcrypt.compare(password, userDoc.password);
    if (!passwordMatches) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 400 }
      );
    }

    const userObj = {
      id: userDoc._id.toString(),
      email: userDoc.email,
      fullName: userDoc.fullName || "User",
    };

    // Create session token
    const sessionToken = await createSessionToken(userObj);

    const cookieStore = await cookies();
    cookieStore.set(AUTH_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      user: userObj,
      message: "Logged in successfully",
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Failed to log in. Please try again." },
      { status: 500 }
    );
  }
}
