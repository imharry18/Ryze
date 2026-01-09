import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import dbConnect from "@/lib/db/mongodb";
import Message from "@/models/Message";

export async function GET(req, { params }) {
  try {
    // Await params correctly for Next.js 15+
    const resolvedParams = await params;
    const otherUserId = resolvedParams.id;

    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json([], { status: 401 });

    const myId = session.user.id;
    await dbConnect();

    // Fetch messages between Me and OtherUser
    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId }
      ]
    }).sort({ createdAt: 1 }); // Oldest first (for chat UI)

    return NextResponse.json(messages);

  } catch (error) {
    console.error("Chat Error:", error);
    return NextResponse.json({ error: "Failed to fetch chat" }, { status: 500 });
  }
}