// src/lib/comments.js

// Placeholder functions to prevent build errors
// We will replace this with a MongoDB API call later.

export async function addComment(postId, uid, text) {
  console.log("Add Comment (Mongo TODO):", postId, text);
  return { success: true };
}

export function listenComments(postId, callback) {
  console.log("Listen Comments (Mongo TODO):", postId);
  // Return dummy data for now
  callback([
    { id: "1", text: "Comments coming soon!", createdAt: new Date() }
  ]);
  // Return a dummy unsubscribe function
  return () => {};
}