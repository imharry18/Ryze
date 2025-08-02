"use client";

import { useState } from "react";

export default function useUpload() {
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);
  const [url, setUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const uploadFile = async (file, path) => {
    if (!file) return null;
    
    setIsUploading(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", path); // Tells your backend where to store it (e.g., 'avatars', 'posts')

      // Simulate upload progress for the UI
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 200);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!res.ok) {
        throw new Error("File upload failed");
      }

      const data = await res.json();
      setUrl(data.url);
      setIsUploading(false);
      
      return data.url;
      
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message);
      setIsUploading(false);
      return null;
    }
  };

  return { uploadFile, progress, error, url, isUploading };
}