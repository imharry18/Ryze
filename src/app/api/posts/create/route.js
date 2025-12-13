import { NextResponse } from "next/server";
import { pg, mongo } from "@/lib/db"; // Use the Hybrid DB client
import { v2 as cloudinary } from "cloudinary";

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const formData = await req.formData();
    
    // 1. Extract Data
    const file = formData.get("file");
    const userId = formData.get("userId"); // This is the Postgres ID
    const caption = formData.get("caption");
    const location = formData.get("location");
    const postType = formData.get("postType") || "post";
    const mediaType = formData.get("mediaType") || "image";
    
    // Parse extra data (for Confessions/Notices)
    const extraDataString = formData.get("extraData");
    const extraData = extraDataString ? JSON.parse(extraDataString) : {};

    // 2. Security Check: Verify User exists in PostgreSQL
    const user = await pg.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ success: false, error: "User not found in PostgreSQL." }, { status: 404 });
    }

    let mediaUrl = null;

    // 3. Upload to Cloudinary (only if a file was provided)
    if (file && typeof file !== "string") {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            folder: "ryze_posts", 
            resource_type: "auto" // Auto-detects image vs video
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
    // We store the Postgres 'userId' as a string reference in MongoDB
    const newPost = await mongo.post.create({
      data: {
        userId: userId, 
        caption: caption,
        location: location,
        mediaUrl: mediaUrl,
        mediaType: mediaType,
        postType: postType,
        // Optional fields from extraData (Ensure your Mongo schema supports these or map them)
        category: extraData.category || null,
        isAnonymous: extraData.isAnonymous || false,
        
        likesCount: 0,
        commentsCount: 0,
      },
    });

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });

  } catch (error) {
    console.error("Upload API Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}