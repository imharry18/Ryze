"use server";

import { pg } from "@/lib/db";
import { hash } from "bcryptjs";

export async function updateSettings(userId, data) {
  try {
    // 1. Handle General Settings (Toggles, etc.)
    // Note: Ensure your Prisma schema has these fields or store them in a JSON field if you want to persist them.
    if (data.type === "general") {
      // Example: Updating a 'bio' or 'privacy' field if it exists in your schema
      // await pg.user.update({ where: { id: userId }, data: { ... } });
      return { success: true };
    }

    // 2. Handle Password Update
    if (data.type === "password") {
      if (!data.newPassword || data.newPassword.length < 6) {
        return { success: false, error: "Password must be at least 6 characters" };
      }

      const hashedPassword = await hash(data.newPassword, 12);
      
      await pg.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
      });
      
      return { success: true };
    }

    return { success: false, error: "Invalid update type" };

  } catch (error) {
    console.error("Settings Update Error:", error);
    return { success: false, error: error.message };
  }
}