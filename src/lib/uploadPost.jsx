// src/lib/uploadPost.js
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

/**
 * Upload file to storage and create post doc in Firestore.
 */
export async function uploadPostAndMedia({
  storage,
  db,
  uid,
  file,
  mediaType,
  caption = "",
  postType = "post",
  onProgress = () => {},
}) {
  console.log("Step 1: Starting Post Creation...");
  
  // 1. Create post doc (so we have an id)
  // We initialize mediaURL as null first.
  const postsCol = collection(db, "posts");
  
  let newPostRef;
  try {
    newPostRef = await addDoc(postsCol, {
      userId: uid,
      caption,
      postType,
      mediaType,
      createdAt: serverTimestamp(),
      likesCount: 0,
      commentsCount: 0,
      mediaURL: null, // Placeholder
      processing: true // Flag to hide it until upload finishes
    });
  } catch (dbError) {
    console.error("Firestore Create Error:", dbError);
    throw new Error("Failed to create post record. Check internet or permissions.");
  }

  const postId = newPostRef.id;
  console.log("Step 2: Post Record Created with ID:", postId);

  // 2. Upload file to storage at posts/{uid}/{postId}/{filename}
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
        console.log(`Upload Progress: ${prog}%`);
        onProgress(prog);
      },
      (err) => {
        console.error("Storage Upload Error:", err);
        // Try to clean up the empty doc if upload fails
        // deleteDoc(newPostRef).catch(() => {}); 
        reject(new Error("File upload failed."));
      },
      async () => {
        try {
          console.log("Step 4: File Upload Complete. Getting URL...");
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          
          console.log("Step 5: Updating Post with URL...");
          // 3. Update post doc with media URL + storage path
          await updateDoc(
            doc(db, "posts", postId),
            {
              mediaURL: url,
              mediaStoragePath: stPath,
              updatedAt: serverTimestamp(),
              processing: false // Show post now
            }
          );

          console.log("Step 6: Linking to User Profile...");
          // 4. Create userPosts quick index
          // Note: Ensure you have permission to write to this collection
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