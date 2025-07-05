"use server";

import { pg } from "@/lib/db";
import { hash } from "bcryptjs";
import { generateUsername } from "@/lib/generateUsername";

export async function registerUser(values) {
  try {
    const { name, email, password, college, year, branch, rollNo } = values;

    // 1. Check if user already exists in Postgres
    const existingUser = await pg.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Email already in use." };
    }

    // 2. Hash Password
    const hashedPassword = await hash(password, 12);

    // 3. Generate Username (client-side helper or inline logic)
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    // Simple username generation if helper is missing:
    const baseName = name.replace(/\s+/g, "").toLowerCase();
    const username = `${baseName}${randomSuffix}`;

    // 4. Create User in PostgreSQL
    const newUser = await pg.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        college,
        year,
        branch,
        rollNo,
        image: "", // Default empty profile pic
      },
    });

    return { success: true, user: newUser };

  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error: error.message };
  }
}