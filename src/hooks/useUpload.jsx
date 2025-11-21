import { useState, useCallback } from "react";
import { uploadPostAndMedia } from "@/lib/uploadPost";
import { storage, db } from "@/lib/firebase";

export default function useUpload() {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successId, setSuccessId] = useState(null);

  // Updated signature to accept extraData
  const upload = useCallback(async ({ uid, file, mediaType, caption, location, postType, extraData = {} }) => {
    setError("");
    setSuccessId(null);
    setUploading(true);
    setProgress(0);

    try {
      const r = await uploadPostAndMedia({
        storage,
        db,
        uid,
        file,
        mediaType,
        caption,
        location, 
        postType,
        extraData, // Pass it down
        onProgress: (p) => setProgress(p),
      });
      setSuccessId(r.postId);
      setUploading(false);
      return r;
    } catch (e) {
      console.error("upload failed", e);
      setError(e.message || "Upload failed");
      setUploading(false);
      throw e;
    }
  }, []);

  return { upload, progress, uploading, error, successId, reset: () => { setProgress(0); setUploading(false); setError(""); setSuccessId(null); } };
}