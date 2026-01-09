import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import { generateUsername } from "@/lib/generateUsername";

export async function POST(req) {
  try {
    const body = await req.json();
    const { name, email, password, college, year, branch, rollNo } = body;

    // 1. Validation
    if (!email || !password || !name) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
    }

    // 2. Check if Email Exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 });
    }

    // 3. Check if Username Exists (and regenerate if needed)
    let autoUsername = generateUsername(name);
    // Append 4 random digits
    autoUsername += Math.floor(1000 + Math.random() * 9000);

    // 4. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 5. Create User
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        username: autoUsername,
        college,
        year,
        branch,
        rollNo,
        image: "/default-dp.png",
      },
    });

    // Return the user without the password
    const { password: newPassword, ...userWithoutPass } = newUser;

    return NextResponse.json({ 
      success: true, 
      message: "User created successfully", 
      user: userWithoutPass 
    }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}