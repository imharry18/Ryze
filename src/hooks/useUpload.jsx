"use client";

import { useState } from "react";

export default function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  const upload = async ({ uid, file, mediaType, caption, location, postType, extraData }) => {
    setUploading(true);
    setError(null);
    setProgress(10); // Start visual progress

    try {
      const formData = new FormData();
      formData.append("userId", uid); // Sending Postgres ID
      
      if (file) {
        formData.append("file", file);
      }
      
      formData.append("caption", caption || "");
      formData.append("location", location || "");
      formData.append("mediaType", mediaType || "image");
      formData.append("postType", postType || "post");

      if (extraData) {
        formData.append("extraData", JSON.stringify(extraData));
      }

      // Simulate Progress (Native fetch doesn't support upload progress easily)
      const interval = setInterval(() => {
        setProgress((prev) => (prev >= 90 ? 90 : prev + 10));
      }, 500);

      const response = await fetch("/api/posts/create", {
        method: "POST",
        body: formData,
      });

      clearInterval(interval);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Upload failed");
      }

      setProgress(100);
      setUploading(false);
      return data.post;

    } catch (err) {
      console.error("Upload Hook Error:", err);
      setError(err.message);
      setUploading(false);
      setProgress(0);
      throw err;
    }
  };

  const reset = () => {
    setUploading(false);
    setProgress(0);
    setError(null);
  };

  return { upload, uploading, progress, error, reset };
}