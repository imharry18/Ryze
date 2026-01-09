"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function useUpload() {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0); // Fake progress for UX
  const router = useRouter();

  const upload = async ({ 
    file, 
    caption, 
    location, 
    postType, 
    extraData = {} // category, isAnonymous, etc.
  }) => {
    setUploading(true);
    setProgress(10); // Start

    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      formData.append("caption", caption || "");
      formData.append("location", location || "");
      formData.append("postType", postType || "post");
      
      // Append extra data (category, isAnonymous, details)
      Object.keys(extraData).forEach(key => {
        formData.append(key, extraData[key]);
      });

      // Simulate Progress (Fetch doesn't support progress events natively easily)
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 500);

      const res = await fetch("/api/posts", {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      setProgress(100);
      toast.success("Posted successfully!");
      router.refresh(); // Refresh feed
      
      return { success: true };

    } catch (error) {
      console.error(error);
      toast.error(error.message);
      throw error;
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 1000); // Reset after delay
    }
  };

  return { 
    upload, 
    uploading, 
    progress, 
    reset: () => { setProgress(0); setUploading(false); } 
  };
}