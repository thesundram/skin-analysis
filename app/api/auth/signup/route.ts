import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { getUsersCollection, ensureIndexes } from "@/lib/mongodb";
import { AUTH_COOKIE_NAME, createSessionToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { email, password, fullName } = await request.json();

    // Validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Email, password, and full name are required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedFullName = fullName.trim();

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await ensureIndexes();
    const users = await getUsersCollection();

    // Check if user already exists
    const existing = await users.findOne({ email: trimmedEmail });
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const now = new Date();
    const insertResult = await users.insertOne({
      email: trimmedEmail,
      password: hashedPassword,
      fullName: trimmedFullName,
      avatarUrl: null,
      createdAt: now,
      updatedAt: now,
    });

    const userObj = {
      id: insertResult.insertedId.toString(),
      email: trimmedEmail,
      fullName: trimmedFullName,
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
      message: "Account created successfully in MongoDB",
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Failed to create account. Please try again." },
      { status: 500 }
    );
  }
}
