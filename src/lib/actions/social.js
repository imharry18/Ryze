export function getChatId(uid1, uid2) {
  return uid1 < uid2 ? `${uid1}_${uid2}` : `${uid2}_${uid1}`;
}

export async function sendMessage(senderId, receiverId, text, replyTo = null) {
  if (!text.trim()) return;
  try {
    const res = await fetch('/api/chats/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ senderId, receiverId, text, replyTo })
    });
    return await res.json();
  } catch (error) {
    console.error("Error sending message:", error);
    return { success: false, error };
  }
}

export async function deleteMessage(chatId, messageId, userId, deleteForEveryone = false) {
  try {
    const res = await fetch('/api/chats/message/delete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, messageId, userId, deleteForEveryone })
    });
    return await res.json();
  } catch (error) {
    console.error("Delete error:", error);
    return { success: false, error };
  }
}

export async function markChatAsRead(currentUserId, targetUserId) {
  try {
    const res = await fetch('/api/chats/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId, targetUserId })
    });
    return await res.json();
  } catch (error) {
    console.error("Error marking chat as read:", error);
  }
}

export async function clearChatHistory(chatId, userId) {
  try {
    const res = await fetch('/api/chats/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId, userId })
    });
    return await res.json();
  } catch (error) {
    console.error("Error clearing chat:", error);
    return { success: false, error };
  }
}

export async function blockUser(currentUserId, targetUserId) {
  try {
    const res = await fetch('/api/users/block', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId, targetUserId })
    });
    return await res.json();
  } catch (error) {
    console.error("Error blocking user:", error);
    return { success: false, error };
  }
}

export async function sendFriendRequest(currentUserId, targetUserId) {
  if (!currentUserId || !targetUserId) return;
  try {
    const res = await fetch('/api/users/friend-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId, targetUserId })
    });
    return await res.json();
  } catch (error) { 
    return { success: false, error }; 
  }
}

export async function acceptFriendRequest(currentUserId, requesterId) {
  try {
    const res = await fetch('/api/users/friend-request/accept', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId, requesterId })
    });
    return await res.json();
  } catch (error) { 
    return { success: false, error }; 
  }
}

export async function followUser(currentUserId, targetUserId) {
  try {
    const res = await fetch('/api/users/follow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId, targetUserId })
    });
    return await res.json();
  } catch (error) { 
    return { success: false, error }; 
  }
}

export async function unfollowUser(currentUserId, targetUserId) {
  try {
    const res = await fetch('/api/users/unfollow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentUserId, targetUserId })
    });
    return await res.json();
  } catch (error) { 
    return { success: false, error }; 
  }
}