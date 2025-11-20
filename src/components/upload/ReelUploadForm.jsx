// src/components/upload/ReelUploadForm.jsx
"use client";
import React, { useRef, useState, useEffect } from "react";
import useUpload from "@/hooks/useUpload";
import MediaPreview from "./MediaPreview";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function ReelUploadForm({ onClose }) {
  const { user } = useAuth();
  const fileRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState("");
  const [caption, setCaption] = useState("");
  const [postType, setPostType] = useState("post");
  const [videoError, setVideoError] = useState("");

  const { upload, progress, uploading, error, successId, reset } = useUpload();

  useEffect(() => {
    if (!file) { setPreviewURL(""); return; }
    const url = URL.createObjectURL(file);
    setPreviewURL(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!f.type.startsWith("video/")) {
      alert("Please pick a video.");
      return;
    }

    const vid = document.createElement("video");
    vid.preload = "metadata";
    vid.src = URL.createObjectURL(f);
    vid.onloadedmetadata = () => {
      URL.revokeObjectURL(vid.src);
      if (vid.duration > 60) {
        setVideoError("Video longer than 60 seconds. Trim it.");
        return;
      } else {
        setVideoError("");
        setFile(f);
      }
    };
    vid.onerror = () => {
      setVideoError("Unable to read video metadata.");
    };
  };

  const startUpload = async () => {
    if (!user) return alert("Login required");
    if (!file) return alert("Select a video");
    try {
      await upload({ uid: user.uid, file, mediaType: "video", caption, postType });
      reset();
      onClose?.();
    } catch (e) { /* handled by hook */ }
  };

  return (
    <div className="flex gap-6">
      <div className="w-1/2 bg-black/60 p-4 flex items-center justify-center">
        {previewURL ? <MediaPreview previewURL={previewURL} fileType={file?.type} /> : (
          <div className="text-center text-gray-400">
            <p>Select a video (≤ 60s)</p>
            <input ref={fileRef} type="file" accept="video/*" onChange={handleFile} className="mt-3" />
          </div>
        )}
      </div>

      <div className="w-1/2 p-4 flex flex-col">
        <h3 className="text-lg font-semibold">Create Reel</h3>
        <textarea value={caption} onChange={(e)=>setCaption(e.target.value)} placeholder="Write a caption..." className="mt-3 p-2 bg-white/5 rounded h-28 resize-none" />
        <div className="mt-3">
          <label className="text-sm">Post type</label>
          <div className="flex gap-2 mt-2">
            <button className={`px-3 py-1 rounded ${postType==="post"?"bg-blue-600 text-white":""}`} onClick={()=>setPostType("post")}>Post</button>
            <button className={`px-3 py-1 rounded ${postType==="event"?"bg-blue-600 text-white":""}`} onClick={()=>setPostType("event")}>Event</button>
          </div>
        </div>

        {videoError && <p className="text-red-400 mt-2">{videoError}</p>}
        {error && <p className="text-red-400 mt-2">{error}</p>}

        <div className="mt-auto">
          {uploading && (
            <div className="mb-2">
              <div className="w-full bg-gray-800 h-2 rounded">
                <div className="h-2 bg-blue-500" style={{width: `${progress}%`}} />
              </div>
              <p className="text-xs text-gray-300 mt-1">{progress}%</p>
            </div>
          )}

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => { reset(); onClose?.(); }}>Cancel</Button>
            <Button onClick={startUpload} disabled={uploading || !!videoError}>Upload</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
