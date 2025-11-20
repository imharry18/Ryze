import { db } from "@/lib/firebase";
import { 
  doc, 
  updateDoc, 
  arrayUnion, 
  arrayRemove, 
  collection, 
  addDoc, 
  serverTimestamp, 
  getDoc 
} from "firebase/firestore";

// --- FRIEND REQUEST SYSTEM ---

export async function sendFriendRequest(currentUserId, targetUserId) {
  if (!currentUserId || !targetUserId) return;
  
  try {
    // Add to target user's "pending requests"
    const targetRef = doc(db, "users", targetUserId);
    await updateDoc(targetRef, {
      pendingFriendRequests: arrayUnion(currentUserId)
    });

    // Add to current user's "sent requests" (optional, for UI updates)
    const currentRef = doc(db, "users", currentUserId);
    await updateDoc(currentRef, {
      sentFriendRequests: arrayUnion(targetUserId)
    });
    
    return { success: true };
  } catch (error) {
    console.error("Error sending friend request:", error);
    return { success: false, error };
  }
}

export async function acceptFriendRequest(currentUserId, requesterId) {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    const requesterRef = doc(db, "users", requesterId);

    // 1. Add to both users' friends list
    await updateDoc(currentUserRef, {
      friends: arrayUnion(requesterId),
      pendingFriendRequests: arrayRemove(requesterId)
    });

    await updateDoc(requesterRef, {
      friends: arrayUnion(currentUserId),
      sentFriendRequests: arrayRemove(currentUserId)
    });

    return { success: true };
  } catch (error) {
    console.error("Error accepting friend request:", error);
    return { success: false, error };
  }
}

// --- FOLLOWING SYSTEM (Twitter Style) ---

export async function followUser(currentUserId, targetUserId) {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);

    // Add to my "following"
    await updateDoc(currentUserRef, {
      following: arrayUnion(targetUserId)
    });

    // Add to their "followers"
    await updateDoc(targetUserRef, {
      followers: arrayUnion(currentUserId)
    });

    return { success: true };
  } catch (error) {
    console.error("Error following user:", error);
    return { success: false, error };
  }
}

export async function unfollowUser(currentUserId, targetUserId) {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    const targetUserRef = doc(db, "users", targetUserId);

    await updateDoc(currentUserRef, {
      following: arrayRemove(targetUserId)
    });

    await updateDoc(targetUserRef, {
      followers: arrayRemove(currentUserId)
    });

    return { success: true };
  } catch (error) {
    console.error("Error unfollowing user:", error);
    return { success: false, error };
  }
}

// --- CHAT SYSTEM ---

// Generate a unique chat ID for two users (order-independent)
export function getChatId(uid1, uid2) {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

export async function sendMessage(senderId, receiverId, text) {
  if (!text.trim()) return;
  
  const chatId = getChatId(senderId, receiverId);
  const chatRef = collection(db, "chats", chatId, "messages");

  try {
    await addDoc(chatRef, {
      senderId,
      text,
      createdAt: serverTimestamp(),
      read: false
    });
    
    // Update last message metadata for chat list (optional)
    // await setDoc(doc(db, "chats", chatId), { ... }, { merge: true });

    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error };
  }
}