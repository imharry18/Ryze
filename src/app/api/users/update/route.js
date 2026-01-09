import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/db/prisma";
import cloudinary from "@/lib/cloudinary";

export async function PUT(req) {
  try {
    // 1. Check Session
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const formData = await req.formData();

    // 2. Extract Data
    const name = formData.get("name");
    const bio = formData.get("bio");
    const college = formData.get("college");
    const year = formData.get("year");
    const branch = formData.get("branch");
    const file = formData.get("file"); // Profile Picture

    let imageUrl = null;

    // 3. Handle Image Upload (if a new file is provided)
    if (file && typeof file !== "string") {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            resource_type: "image",
            folder: "ryze_avatars", // Specific folder for DPs
            public_id: `avatar_${userId}`, // Overwrite old avatar
            overwrite: true 
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });

      imageUrl = uploadResult.secure_url;
    }

    // 4. Prepare Update Object
    const updateData = {};
    if (name) updateData.name = name;
    if (bio) updateData.bio = bio;
    if (college) updateData.college = college;
    if (year) updateData.year = year;
    if (branch) updateData.branch = branch;
    if (imageUrl) updateData.image = imageUrl;

    // 5. Update PostgreSQL
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    return NextResponse.json({ success: true, user: updatedUser });

  } catch (error) {
    console.error("Update Profile Error:", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}