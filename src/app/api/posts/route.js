import { NextResponse } from "next/server";
import { pg, mongo } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    // 1. Get Posts from Mongo
    const posts = await mongo.post.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // 2. Extract all User IDs from these posts
    const userIds = [...new Set(posts.map(p => p.userId))];

    // 3. Fetch User Details from Postgres
    const users = await pg.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, username: true, image: true }
    });

    // 4. Create a Map for fast lookup
    const userMap = {};
    users.forEach(u => { userMap[u.id] = u; });

    // 5. Merge Data
    const enrichedPosts = posts.map(post => ({
      ...post,
      user: userMap[post.userId] || { name: "Unknown", username: "unknown", image: "/default-dp.png" }
    }));

    return NextResponse.json(enrichedPosts);

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}