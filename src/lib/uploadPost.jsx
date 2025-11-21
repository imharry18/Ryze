import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

export async function uploadPostAndMedia({
  storage,
  db,
  uid,
  file,
  mediaType,
  caption = "",
  location = "",
  postType = "post",
  extraData = {}, // New Parameter
  onProgress = () => {},
}) {
  console.log("Step 1: Starting Post Creation...");
  
  const postsCol = collection(db, "posts");
  
  let newPostRef;
  try {
    // Base post object
    const postPayload = {
      userId: uid,
      caption,
      location,
      postType,
      mediaType,
      createdAt: serverTimestamp(),
      likesCount: 0,
      commentsCount: 0,
      mediaURL: null,
      processing: true,
      ...extraData // Spread extra fields (category, isAnonymous, etc.)
    };

    newPostRef = await addDoc(postsCol, postPayload);
  } catch (dbError) {
    console.error("Firestore Create Error:", dbError);
    throw new Error("Failed to create post record.");
  }

  const postId = newPostRef.id;
  
  // If there is NO file (like for text-only confessions), we just finish here
  if (!file) {
     await updateDoc(doc(db, "posts", postId), { processing: false });
     return { postId, downloadURL: null };
  }

  // If there IS a file, proceed with upload
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}.${ext}`;
  const stPath = `posts/${uid}/${postId}/${filename}`;
  
  const sRef = storageRef(storage, stPath);
  const uploadTask = uploadBytesResumable(sRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress(prog);
      },
      (err) => {
        console.error("Storage Upload Error:", err);
        reject(new Error("File upload failed."));
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          
          await updateDoc(
            doc(db, "posts", postId),
            {
              mediaURL: url,
              mediaStoragePath: stPath,
              updatedAt: serverTimestamp(),
              processing: false 
            }
          );

          resolve({ postId, downloadURL: url });
        } catch (e) {
          console.error("Final Update Error:", e);
          reject(e);
        }
      }
    );
  });
}