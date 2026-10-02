import { cookies } from "next/headers";
import { ObjectId } from "mongodb";
import { getUsersCollection } from "./mongodb";
import { AUTH_COOKIE_NAME, verifySessionToken } from "./token";

export * from "./token";

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
}

/**
 * Server-side helper to get authenticated user from cookies and MongoDB Atlas
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
    const payload = await verifySessionToken(token);
    if (!payload?.userId) return null;

    const users = await getUsersCollection();
    let query: any = { email: payload.email };
    try {
      query = { _id: new ObjectId(payload.userId) };
    } catch {
      // Fallback query by email if not an ObjectId
    }

    const doc = await users.findOne(query);
    if (!doc) return null;

    return {
      id: doc._id.toString(),
      email: doc.email,
      fullName: doc.fullName || payload.fullName,
    };
  } catch (err) {
    console.error("getCurrentUser error:", err);
    return null;
  }
}
