import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/db/mongodb";
import Message from "@/models/Message";
import { prisma } from "@/lib/db/prisma";

// 1. GET: Fetch "Recent Chats" (Inbox)
export async function GET(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json([], { status: 401 });

    await dbConnect();
    const myId = session.user.id;

    // Aggregation: Find unique users I have chatted with
    // This is complex in Mongo, so for MVP we fetch recent messages involving me
    const recentMessages = await Message.find({
      $or: [{ senderId: myId }, { receiverId: myId }]
    })
    .sort({ createdAt: -1 })
    .limit(50); // Fetch last 50 messages to calculate recent contacts

    // Extract unique user IDs from these messages
    const contactIds = new Set();
    recentMessages.forEach(msg => {
      const otherId = msg.senderId === myId ? msg.receiverId : msg.senderId;
      contactIds.add(otherId);
    });

    // Fetch User Details from PostgreSQL for these IDs
    const contacts = await prisma.user.findMany({
      where: { id: { in: Array.from(contactIds) } },
      select: { id: true, name: true, username: true, image: true }
    });

    // Map last message to each contact
    const inbox = contacts.map(contact => {
      const lastMsg = recentMessages.find(m => 
        (m.senderId === contact.id && m.receiverId === myId) || 
        (m.receiverId === contact.id && m.senderId === myId)
      );
      
      return {
        ...contact,
        lastMessage: lastMsg?.text || "Media",
        lastMessageTime: lastMsg?.createdAt,
        isRead: lastMsg?.senderId === myId ? true : lastMsg?.isRead // Logic for unread badge
      };
    }).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));

    return NextResponse.json(inbox);

  } catch (error) {
    console.error("Inbox Error:", error);
    return NextResponse.json({ error: "Failed to fetch inbox" }, { status: 500 });
  }
}

// 2. POST: Send a Message
export async function POST(req) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { receiverId, text } = await req.json();

    if (!receiverId || !text) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    await dbConnect();

    const newMessage = await Message.create({
      senderId: session.user.id,
      receiverId,
      text,
      isRead: false
    });

    return NextResponse.json(newMessage, { status: 201 });

  } catch (error) {
    console.error("Send Message Error:", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}