import { db } from "../firebase"; // Relative path fix
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
  getDocs,
  getDoc,
  deleteDoc
} from "firebase/firestore";

// --- UTILS ---

export function getChatId(uid1, uid2) {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

// --- CHAT SYSTEM ---

export async function sendMessage(senderId, receiverId, text, replyTo = null) {
  if (!text.trim()) return;
  
  const chatId = getChatId(senderId, receiverId);
  const chatDocRef = doc(db, "chats", chatId);
  const messagesColRef = collection(db, "chats", chatId, "messages");

  try {
    // 1. Add Message
    await addDoc(messagesColRef, {
      senderId,
      text,
      replyTo, 
      createdAt: serverTimestamp(),
      read: false,
      deletedFor: [] 
    });
    
    // 2. Update Metadata
    try {
      await updateDoc(chatDocRef, {
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        [`unreadCount.${receiverId}`]: increment(1), 
        [`typing.${senderId}`]: false
      });
    } catch (err) {
      await setDoc(chatDocRef, {
        participants: [senderId, receiverId],
        lastMessage: text,
        lastMessageAt: serverTimestamp(),
        unreadCount: { [receiverId]: 1 },
        typing: { [senderId]: false }
      }, { merge: true });
    }

    return { success: true };
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error };
  }
}

export async function deleteMessage(chatId, messageId, userId, deleteForEveryone = false) {
  try {
    const msgRef = doc(db, "chats", chatId, "messages", messageId);

    if (deleteForEveryone) {
      await updateDoc(msgRef, {
        text: "🚫 This message was deleted",
        isDeleted: true,
        replyTo: null 
      });
    } else {
      await updateDoc(msgRef, {
        deletedFor: arrayUnion(userId)
      });
    }
    return { success: true };
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error };
  }
}

export async function markChatAsRead(currentUserId, targetUserId) {
  const chatId = getChatId(currentUserId, targetUserId);
  const chatDocRef = doc(db, "chats", chatId);
  const messagesColRef = collection(db, "chats", chatId, "messages");

  try {
    await updateDoc(chatDocRef, {
      [`unreadCount.${currentUserId}`]: 0
    }).catch(async () => {
       await setDoc(chatDocRef, { unreadCount: { [currentUserId]: 0 } }, { merge: true });
    });

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

export async function clearChatHistory(chatId, userId) {
  try {
    const chatRef = doc(db, "chats", chatId);
    await setDoc(chatRef, {
        clearedAt: {
            [userId]: serverTimestamp()
        }
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Error clearing chat:", error);
    return { success: false, error };
  }
}

export async function blockUser(currentUserId, targetUserId) {
  try {
    const currentUserRef = doc(db, "users", currentUserId);
    await updateDoc(currentUserRef, {
        blockedUsers: arrayUnion(targetUserId)
    });
    return { success: true };
  } catch (error) {
    console.error("Error blocking user:", error);
    return { success: false, error };
  }
}

// --- OTHER SOCIAL ACTIONS ---
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