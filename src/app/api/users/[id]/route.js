import { NextResponse } from "next/server";
import { pg, mongo } from "@/lib/db";

export async function GET(request, { params }) {
  const { id } = params;

  try {
    // 1. Fetch User details from PostgreSQL (or using Firebase UID stored in Postgres)
    let user = await pg.user.findUnique({
      where: { id: id }, // Try ID first
    });

    if (!user) {
      // Fallback: Try finding by firebaseUid (if using legacy links) or username
      user = await pg.user.findFirst({
        where: {
            OR: [
                { username: id }
            ]
        }
      });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Fetch Posts from MongoDB
    // Note: In Mongo schema, userId is a String reference to the Postgres ID
    const posts = await mongo.post.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Return Combined Data
    return NextResponse.json({
      user,
      posts
    });

  } catch (error) {
    console.error("Profile Fetch Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}