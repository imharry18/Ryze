import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q");

  if (!query || query.length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  try {
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { username: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        username: true,
        image: true,
        college: true,
        followers: { select: { followerId: true } } // return who follows them to check "isFollowing"
      },
      take: 20,
    });

    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}