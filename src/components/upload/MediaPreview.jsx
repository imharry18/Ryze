// src/components/upload/MediaPreview.jsx
"use client";
import React from "react";

export default function MediaPreview({ previewURL, fileType }) {
  if (!previewURL) return null;
  if (fileType && fileType.startsWith("image")) {
    return <img src={previewURL} alt="preview" className="max-h-[60vh] object-contain rounded" />;
  }
  // video
  return (
    <video src={previewURL} controls className="max-h-[60vh] rounded">
      Your browser does not support video.
    </video>
  );
}
