import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(req, { params }) {
  try {
    // Await params before accessing properties
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        college: true,
        branch: true,
        year: true,
        followers: true, // We will count these in the frontend or use _count here
        following: true,
        _count: {
          select: { followers: true, following: true }
        }
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}