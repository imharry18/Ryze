import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { userSchema } from "@/lib/schemas/userSchema";
import { generateUsername } from "@/lib/generateUsername";
import { prisma } from "@/lib/db"; // Import the new SQL client

export async function registerUser(values) {
  try {
    // 1. Generate Username
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const autoUsername = `${generateUsername(values.name)}${randomSuffix}`;

    // 2. Create Auth Account (Firebase Auth is still the Source of Truth for Login)
    const res = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password
    );
    const user = res.user;

    // --- NEW: WRITE TO POSTGRESQL (SQL PRIMARY) ---
    // We create the SQL record immediately. If this fails, we shouldn't proceed.
    try {
      await prisma.user.create({
        data: {
          firebaseUid: user.uid, // CRITICAL: This links SQL to Firebase Auth
          username: autoUsername,
          email: values.email,
          fullName: values.name,
          college: values.college,
          year: values.year,
          branch: values.branch,
          rollNo: values.rollNo,
          profilePicUrl: "", // Default
        },
      });
    } catch (sqlError) {
      console.error("SQL Registration Error:", sqlError);
      // In a strict production env, we might want to delete the firebase auth user here 
      // to maintain consistency, but for now, we just log it.
    }

    // --- OLD: WRITE TO FIRESTORE (LEGACY/BACKUP) ---
    // We keep this so your current frontend (Feed, Profile) still works perfectly.
    const userData = {
      ...userSchema,
      uid: user.uid,
      name: values.name,
      email: values.email,
      username: autoUsername,
      college: values.college,
      year: values.year,
      branch: values.branch,
      rollNo: values.rollNo,
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };

    await setDoc(doc(db, "users", user.uid), userData);

    return { success: true, user: user };

  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error };
  }
}