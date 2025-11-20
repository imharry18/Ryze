import { auth, db } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { userSchema } from "@/lib/schemas/userSchema";

// This function handles full user creation
export async function registerUser(values) {
  try {
    // Create auth account
    const res = await createUserWithEmailAndPassword(
      auth,
      values.email,
      values.password
    );

    const User = res.user;

    // Create Firestore document
    await setDoc(doc(db, "users", User.uid), {
      ...userSchema,

      // override defaults with actual values
      uid: User.uid,
      name: values.name,
      email: values.email,
      college: values.college,
      year: values.year,
      branch: values.branch,
      rollNo: values.rollNo,

      createdAt: new Date(),
    });

    return { success: true, user: User };

  } catch (error) {
    return { success: false, error };
  }
}
