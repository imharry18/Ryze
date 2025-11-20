import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from "firebase/firestore";

export async function addComment(postId, uid, text) {
  if (!text.trim()) return;

  try {
    await addDoc(collection(db, "posts", postId, "comments"), {
      uid,
      text,
      createdAt: serverTimestamp(),
    });

    return { success: true };

  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
}

export function listenComments(postId, callback) {
  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snap) => {
    const comments = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(comments);
  });
}
