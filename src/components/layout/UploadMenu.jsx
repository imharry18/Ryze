"use client";

import React from "react";
import { Image as ImageIcon, Video } from "lucide-react";

export default function UploadMenu({ close, openModal }) {
  return (
    <div
      className="absolute right-0 mt-3 bg-black/90 text-white w-44 rounded-xl shadow-lg
                 border border-white/10 backdrop-blur-xl p-2 z-50 animate-fadeIn"
    >
      {/* Upload Post */}
      <button
        onClick={() => {
          close();
          openModal("post");
        }}
        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition"
      >
        <ImageIcon className="h-5 w-5" />
        <span>Upload Post</span>
      </button>

      {/* Upload Reel */}
      <button
        onClick={() => {
          close();
          openModal("reel");
        }}
        className="w-full flex items-center gap-3 px-3 py-2 mt-1 rounded-lg hover:bg-white/10 transition"
      >
        <Video className="h-5 w-5" />
        <span>Upload Reel</span>
      </button>
    </div>
  );
}
