import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { userSchema } from "@/lib/schemas/userSchema";
import { generateUsername } from "@/lib/generateUsername"; // Using your existing helper

export async function registerUser(values) {
  try {
    // 1. Generate Random Username
    // We add a random number to ensure it is unique
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const autoUsername = `${generateUsername(values.name)}${randomSuffix}`;

    // 2. Create Auth Account
    const res = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password
    );

    const User = res.user;

    // 3. Prepare Firestore Data
    const userData = {
      ...userSchema, // Load default structure
      
      // Override with actual data
      uid: User.uid,
      name: values.name,
      email: values.email,
      username: autoUsername, // Saved here!
      college: values.college,
      year: values.year,
      branch: values.branch,
      rollNo: values.rollNo,
      
      createdAt: new Date(),
      lastActiveAt: new Date(),
    };

    // 4. Save to Database
    await setDoc(doc(db, "users", User.uid), userData);

    return { success: true, user: User };

  } catch (error) {
    console.error("Registration Error:", error);
    return { success: false, error };
  }
}