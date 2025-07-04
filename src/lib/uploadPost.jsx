export async function uploadPost(postData) {
  try {
    // Add local timestamp before sending to ensure consistency
    const payload = {
      ...postData,
      createdAt: new Date().toISOString(),
    };

    const res = await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || "Failed to create post");
    }

    const data = await res.json();
    return { success: true, post: data.post };

  } catch (error) {
    console.error("Error uploading post:", error);
    return { success: false, error: error.message };
  }
}