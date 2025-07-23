export async function updateUser(uid, data, file = null) {
  try {
    const formData = new FormData();
    
    // Add User ID
    formData.append("uid", uid);
    
    // Add Profile Data
    const finalData = {
      ...data,
      updatedAt: new Date().toISOString(),
      isProfileComplete: true,
    };

    // Sanitize undefined keys
    Object.keys(finalData).forEach((key) => {
      if (finalData[key] === undefined) {
        delete finalData[key];
      }
    });

    formData.append("data", JSON.stringify(finalData));

    // Append File if exists
    if (file) {
      formData.append("file", file);
    }

    // Call local backend endpoint (e.g. /api/users/update)
    const res = await fetch("/api/users/update", {
      method: "POST",
      body: formData, // Fetch automatically sets correct boundary headers for FormData
    });

    const result = await res.json();

    if (!res.ok) {
      throw new Error(result.message || "Failed to update profile.");
    }

    return { success: true, dp: result.dpUrl || null };

  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message };
  }
}