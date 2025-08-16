import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import dbConnect from "@/lib/db/mongodb";
import { prisma } from "@/lib/db/prisma"; // PostgreSQL client
import Post from "@/models/Message"; // Mongoose Model
import cloudinary from "@/lib/cloudinary";

// --- 1. GET: FETCH POSTS ---
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "global"; // 'global' or 'following'
    const targetUserId = searchParams.get("userId");   // Filter by specific user
    const postType = searchParams.get("postType");     // Filter by 'confession', 'notice', etc.
    
    await dbConnect();

    let query = {};

    // Filter A: Specific Post Type (e.g. only "confession")
    if (postType) {
      query.postType = postType;
    }

    // Filter B: Specific User Profile
    if (targetUserId) {
      query.userId = targetUserId;
    }
    // Filter C: "Following" Feed (Home Page)
    else if (type === "following") {
      const session = await getServerSession(authOptions);
      
      // If not logged in, return empty array for following feed
      if (!session) {
        return NextResponse.json([], { status: 200 });
      }

      // 1. Get list of user IDs I follow from PostgreSQL
      const following = await prisma.follows.findMany({
        where: { followerId: session.user.id },
        select: { followingId: true }
      });

      const followingIds = following.map(f => f.followingId);
      
      // 2. Always include my own posts
      followingIds.push(session.user.id);

      // 3. Update Query
      query.userId = { $in: followingIds };

      // 4. Cleanup: If we are on the home feed and didn't specify a type, 
      // usually we only want standard posts/reels, not notices/confessions mixed in.
      if (!postType) {
         query.postType = { $in: ['post', 'reel'] };
      }
    }

    // Execute Query
    const posts = await Post.find(query)
      .sort({ createdAt: -1 }) // Newest first
      .limit(50); // Limit to 50 for performance

    return NextResponse.json(posts, { status: 200 });

  } catch (error) {
    console.error("Feed Fetch Error:", error);
    return NextResponse.json({ error: "Failed to fetch feed" }, { status: 500 });
  }
}

// --- 2. POST: CREATE NEW CONTENT ---
export async function POST(req) {
  try {
    // 1. Check Session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Parse Form Data
    const formData = await req.formData();
    const caption = formData.get("caption") || "";
    const location = formData.get("location") || "";
    const postType = formData.get("postType") || "post";
    const category = formData.get("category") || ""; // For Confessions/Notices
    
    // "details" is for Notices (body text)
    const details = formData.get("details") || ""; 
    
    const isAnonymous = formData.get("isAnonymous") === "true";
    const file = formData.get("file");

    // 3. Upload Media to Cloudinary (if file exists)
    let mediaUrl = "";
    let mediaType = "text";

    if (file && typeof file !== "string") {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      
      // Determine type (video or image)
      const type = file.type.startsWith("video") ? "video" : "image";
      mediaType = type;

      // Upload Promise
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            resource_type: type,
            folder: `ryze_posts/${session.user.id}`, // Organize by user
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      mediaUrl = uploadResult.secure_url;
    }

    // 4. Save to MongoDB
    await dbConnect();

    const newPost = await Post.create({
      userId: session.user.id,
      
      // Author Snapshot (Hide if Anonymous)
      authorName: isAnonymous ? "Anonymous" : session.user.name,
      authorUsername: isAnonymous ? null : session.user.username,
      authorImage: isAnonymous ? null : session.user.image,

      caption,
      location,
      postType,
      category,
      isAnonymous,
      details, // specific for notices
      
      mediaUrl,
      mediaType,
      
      likes: [],
      commentsCount: 0,
    });

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });

  } catch (error) {
    console.error("Post Creation Error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}