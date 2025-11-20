import { db, storage } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function updateUser(uid, data, file = null) {
  try {

    // Upload DP if provided
    let dpURL = null;

    if (file) {
      const fileRef = ref(storage, `profilePictures/${uid}`);
      await uploadBytes(fileRef, file);
      dpURL = await getDownloadURL(fileRef);
    }

    const finalData = {
      ...data,
      ...(dpURL && { dp: dpURL }),
      updatedAt: new Date(),
      isProfileComplete: true,
    };

    await updateDoc(doc(db, "users", uid), finalData);

    return { success: true, dp: dpURL || null };

  } catch (error) {
    return { success: false, error };
  }
}
