"use server";

import { pg } from "@/lib/db";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function updateUser(userId, formData) {
  try {
    const name = formData.get("name");
    const username = formData.get("username");
    const bio = formData.get("bio");
    const branch = formData.get("branch");
    const file = formData.get("file"); // Profile Pic

    let imageUrl = undefined;

    if (file && typeof file !== "string") {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const uploadResult = await new Promise((resolve, reject) => {
            cloudinary.uploader.upload_stream({ folder: "ryze_profiles" }, (err, res) => {
                if (err) reject(err); else resolve(res);
            }).end(buffer);
        });
        imageUrl = uploadResult.secure_url;
    }

    await pg.user.update({
        where: { id: userId },
        data: {
            name,
            username,
            bio,
            branch,
            ...(imageUrl && { image: imageUrl }) // Only update if new image
        }
    });

    return { success: true };

  } catch (error) {
    console.error("Update User Error:", error);
    return { success: false, error: error.message };
  }
}