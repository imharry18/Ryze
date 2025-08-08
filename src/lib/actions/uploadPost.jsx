import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { createPostInDB } from "@/lib/actions/createPost"; // <--- Ensure this import exists

export async function uploadPostAndMedia({
  storage,
  uid,
  file,
  mediaType,
  caption = "",
  location = "",
  postType = "post",
  extraData = {},
  onProgress = () => {},
}) {
  console.log("Step 1: Uploading to Firebase Storage...");
  let downloadURL = null;

  if (file) {
    const ext = file.name.split(".").pop();
    const filename = `${Date.now()}.${ext}`;
    const stPath = `posts/${uid}/${filename}`;
    const sRef = storageRef(storage, stPath);
    
    downloadURL = await new Promise((resolve, reject) => {
      const uploadTask = uploadBytesResumable(sRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(prog);
        },
        (error) => reject(error),
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        }
      );
    });
  }

  console.log("Step 2: Saving to SQL Database...");
  
  const postData = {
    caption,
    location,
    postType,
    mediaType: file ? mediaType : "text",
    mediaURL: downloadURL,
    category: extraData.category || null,
    isAnonymous: extraData.isAnonymous || false,
  };

  const result = await createPostInDB(uid, postData);

  if (!result.success) {
    throw new Error(result.error);
  }

  return { postId: result.postId, downloadURL };
}