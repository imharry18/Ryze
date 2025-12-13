"use server";

import { prisma } from "@/lib/db";

export async function createPostInDB(firebaseUid, postData) {
  try {
    // 1. Find the SQL User ID using the Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid },
    });

    if (!user) {
      throw new Error("User not found in database. Please re-login or register again.");
    }

    // 2. Create the Post
    const newPost = await prisma.post.create({
      data: {
        userId: user.id,
        caption: postData.caption,
        mediaUrl: postData.mediaURL || null,
        mediaType: postData.mediaType,
        location: postData.location,
        postType: postData.postType,
        category: postData.category,
        isAnonymous: postData.isAnonymous,
      },
    });

    console.log("✅ Post created in SQL:", newPost.id);
    return { success: true, postId: newPost.id };

  } catch (error) {
    console.error("❌ Create Post Error:", error);
    return { success: false, error: error.message };
  }
}