import { userSchema } from "@/lib/schemas/userSchema";
import { generateUsername } from "@/lib/generateUsername"; 

export async function registerUser(values) {
  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const autoUsername = `${generateUsername(values.name)}${randomSuffix}`;

    const userData = {
      ...userSchema, 
      name: values.name,
      email: values.email,
      password: values.password, // IMPORTANT: Ensure you hash this before saving to DB
      username: autoUsername, 
      college: values.college,
      year: values.year,
      branch: values.branch,
      rollNo: values.rollNo,
      createdAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
    };

    // Call your local backend API here to save user to PostgreSQL/MongoDB
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to create account");
    }

    return { success: true, user: data.user };

  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error };
  }
}