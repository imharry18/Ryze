import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function isUsernameUnique(username) {
  const q = query(
    collection(db, "users"),
    where("username", "==", username)
  );

  const snap = await getDocs(q);
  return snap.empty; // true → unique
}
