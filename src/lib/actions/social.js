import { db } from "@/lib/firebase";
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  collection, 
  addDoc, 
  serverTimestamp, 
  setDoc,
  increment, 
  writeBatch,
  query,
  where,
  getDocs
} from "firebase/firestore";

// --- UTILS ---
export function getChatId(uid1, uid2) {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

// --- FRIEND REQUESTS & FOLLOWING ---
export async function sendFriendRequest(currentUserId, targetUserId) {
  if (!currentUserId || !targetUserId) return;
  try {
    const targetRef = doc(db, "users", targetUserId);
    await updateDoc(targetRef, { pendingFriendRequests: arrayUnion(currentUserId) });
    const currentRef = doc(db, "users", currentUserId);
    await updateDoc(currentRef, { sentFriendRequests: arrayUnion(targetUserId) });
    return { success: true };
  } catch (error) { return { success: false, error }; }
}

export async function acceptFriendRequest(currentUserId, requesterId) {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    const requesterRef = doc(db, "users", requesterId);
    await updateDoc(currentUserRef, { friends: arrayUnion(requesterId), pendingFriendRequests: arrayRemove(requesterId) });
    await updateDoc(requesterRef, { friends: arrayUnion(currentUserId), sentFriendRequests: arrayRemove(currentUserId) });
    return { success: true };
  } catch (error) { return { success: false, error }; }
}

export async function followUser(currentUserId, targetUserId) {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);
    await updateDoc(currentUserRef, { following: arrayUnion(targetUserId) });
    await updateDoc(targetUserRef, { followers: arrayUnion(currentUserId) });
    return { success: true };
  } catch (error) { return { success: false, error }; }
}

export async function unfollowUser(currentUserId, targetUserId) {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);
    await updateDoc(currentUserRef, { following: arrayRemove(targetUserId) });
    await updateDoc(targetUserRef, { followers: arrayRemove(currentUserId) });
    return { success: true };
  } catch (error) { return { success: false, error }; }
}

// --- CHAT SYSTEM ---

export async function sendMessage(senderId, receiverId, text) {
  if (!text.trim()) return;
  
  const chatId = getChatId(senderId, receiverId);
  const chatDocRef = doc(db, "chats", chatId);
  const messagesColRef = collection(db, "chats", chatId, "messages");

  try {
    // 1. Add the actual message to the subcollection
    await addDoc(messagesColRef, {
      senderId,
      text,
      createdAt: serverTimestamp(),
      read: false
    });
    
    // 2. Update Chat Metadata & INCREMENT COUNTER
    // using setDoc with merge: true handles both creating new chats AND updating existing ones
    await setDoc(chatDocRef, {
      participants: [senderId, receiverId],
      lastMessage: text,
      lastMessageAt: serverTimestamp(),
      // This specific field update increments the counter for the RECEIVER
      [`unreadCount.${receiverId}`]: increment(1), 
      // Reset typing status for sender
      typing: { [senderId]: false }
    }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error };
  }
}

export async function markChatAsRead(currentUserId, targetUserId) {
  const chatId = getChatId(currentUserId, targetUserId);
  const chatDocRef = doc(db, "chats", chatId);
  const messagesColRef = collection(db, "chats", chatId, "messages");

  try {
    // 1. Reset Badge to 0 for the current user
    // We use setDoc with merge here too, just in case the doc is missing (rare but safe)
    await setDoc(chatDocRef, {
      [`unreadCount.${currentUserId}`]: 0
    }, { merge: true });

    // 2. Mark incoming messages as read (Blue Ticks logic)
    const q = query(
      messagesColRef, 
      where("senderId", "==", targetUserId),
      where("read", "==", false)
    );
    
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => {
        batch.update(doc.ref, { read: true });
      });
      await batch.commit();
    }
  } catch (error) {
    console.error("Error marking chat as read:", error);
  }
}