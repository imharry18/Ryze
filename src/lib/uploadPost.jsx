// src/lib/uploadPost.jsx
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
  location = "", // New Parameter
  postType = "post",
  onProgress = () => {},
}) {
  console.log("Step 1: Starting Post Creation...");
  
  const postsCol = collection(db, "posts");
  
  let newPostRef;
  try {
    newPostRef = await addDoc(postsCol, {
      userId: uid,
      caption,
      location, // Save Location
      postType,
      mediaType,
      createdAt: serverTimestamp(),
      likesCount: 0,
      commentsCount: 0,
      mediaURL: null, 
      processing: true 
    });
  } catch (dbError) {
    console.error("Firestore Create Error:", dbError);
    throw new Error("Failed to create post record. Check internet or permissions.");
  }

  const postId = newPostRef.id;
  console.log("Step 2: Post Record Created with ID:", postId);

  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}.${ext}`;
  const stPath = `posts/${uid}/${postId}/${filename}`;
  
  console.log("Step 3: Starting File Upload to:", stPath);
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
          console.log("Step 4: File Upload Complete. Getting URL...");
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          
          console.log("Step 5: Updating Post with URL...");
          await updateDoc(
            doc(db, "posts", postId),
            {
              mediaURL: url,
              mediaStoragePath: stPath,
              updatedAt: serverTimestamp(),
              processing: false 
            }
          );

          try {
              await setDoc(doc(db, "userPosts", uid, "posts", postId), {
                createdAt: serverTimestamp(),
              });
          } catch (linkError) {
              console.warn("Failed to link post to user profile (non-fatal):", linkError);
          }

          resolve({ postId, downloadURL: url });
        } catch (e) {
          console.error("Final Update Error:", e);
          reject(e);
        }
      }
    );
  });
}