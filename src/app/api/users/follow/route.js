import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/db/prisma";

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { targetUserId, action } = await req.json(); // action = "follow" or "unfollow"

  if (targetUserId === session.user.id) {
    return NextResponse.json({ error: "Cannot follow yourself" }, { status: 400 });
  }

  try {
    if (action === "follow") {
      await prisma.follows.create({
        data: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      });
    } else {
      await prisma.follows.deleteMany({
        where: {
          followerId: session.user.id,
          followingId: targetUserId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    // Ignore duplicate follow errors
    return NextResponse.json({ success: true }); 
  }
}