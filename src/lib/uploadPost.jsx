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
} from "firebase/firestore";

/**
 * Upload file to storage and create post doc in Firestore.
 * @param {Object} params
 * @param {import("firebase/storage").Storage} params.storage
 * @param {import("firebase/firestore").Firestore} params.db
 * @param {string} params.uid - current user id
 * @param {File} params.file - file to upload
 * @param {"image"|"video"} params.mediaType
 * @param {string} params.caption
 * @param {"post"|"event"} params.postType
 * @param {(progressNumber)=>void} params.onProgress
 * @returns {Promise<{postId:string, downloadURL:string}>}
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
  // 1. Create post doc (so we have an id)
  const postsCol = collection(db, "posts");
  const newPostRef = await addDoc(postsCol, {
    userId: uid,
    caption,
    postType,
    mediaType,
    createdAt: serverTimestamp(),
    likesCount: 0,
    commentsCount: 0,
    // We'll add mediaURL later
  });
  const postId = newPostRef.id;

  // 2. Upload file to storage at posts/{uid}/{postId}/{filename}
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}.${ext}`;
  const stPath = `posts/${uid}/${postId}/${filename}`;
  const sRef = storageRef(storage, stPath);
  const uploadTask = uploadBytesResumable(sRef, file);

  // wrap upload in promise
  const downloadURL = await new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        onProgress(prog);
      },
      (err) => {
        reject(err);
      },
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          // 3. Update post doc with media URL + storage path
          await setDoc(
            doc(db, "posts", postId),
            {
              mediaURL: url,
              mediaStoragePath: stPath,
              updatedAt: serverTimestamp(),
            },
            { merge: true }
          );

          // 4. Create userPosts quick index: userPosts/{uid}/posts/{postId}
          await setDoc(doc(db, "userPosts", uid, "posts", postId), {
            createdAt: serverTimestamp(),
          });

          resolve(url);
        } catch (e) {
          reject(e);
        }
      }
    );
  });

  return { postId, downloadURL: downloadURL };
}
