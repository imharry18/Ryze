export async function addComment(postId, userId, text, userName, userDp) {
  if (!text || !text.trim()) {
    return { success: false, error: "Comment cannot be empty" };
  }
  
  try {
    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId,
        userId,
        text: text.trim(),
        userName,
        userDp,
        createdAt: new Date().toISOString()
      })
    });
    
    if (!res.ok) throw new Error("Failed to add comment");
    
    return await res.json();
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, error: error.message };
  }
}

export async function getComments(postId) {
  if (!postId) return [];
  
  try {
    const res = await fetch(`/api/comments?postId=${postId}`);
    if (!res.ok) throw new Error("Failed to fetch comments");
    
    const data = await res.json();
    return data.comments || [];
  } catch (error) {
    console.error("Error getting comments:", error);
    return [];
  }
}

export async function deleteComment(commentId, postId) {
  if (!commentId || !postId) return { success: false, error: "Missing parameters" };

  try {
    const res = await fetch(`/api/comments`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ commentId, postId })
    });
    
    if (!res.ok) throw new Error("Failed to delete comment");
    
    return await res.json();
  } catch (error) {
    console.error("Error deleting comment:", error);
    return { success: false, error: error.message };
  }
}