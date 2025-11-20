import { db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function updateUser(uid, data, file = null) {
  try {
    let dpURL = null;

    // 1. Upload DP if provided (With Unique Filename to bust cache)
    if (file) {
      const timestamp = Date.now();
      const fileExtension = file.name.split(".").pop();
      // Path: profilePictures/uid/profile_123456789.jpg
      const fileRef = ref(storage, `profilePictures/${uid}/profile_${timestamp}.${fileExtension}`);
      
      await uploadBytes(fileRef, file);
      dpURL = await getDownloadURL(fileRef);
    }

    // 2. Prepare data for update
    const finalData = {
      ...data,
      updatedAt: new Date(),
      isProfileComplete: true,
    };

    // Add dp only if we have a new one
    if (dpURL) {
      finalData.dp = dpURL;
    }

    // 3. Sanitize: Remove undefined keys (Firestore crashes on undefined)
    Object.keys(finalData).forEach((key) => {
      if (finalData[key] === undefined) {
        delete finalData[key];
      }
    });

    // 4. Update Firestore
    await updateDoc(doc(db, "users", uid), finalData);

    return { success: true, dp: dpURL || null };

  } catch (error) {
    console.error("Error updating user:", error);
    return { success: false, error: error.message };
  }
}