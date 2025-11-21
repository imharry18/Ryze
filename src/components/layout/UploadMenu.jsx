"use client";

import React from "react";
import { Image as ImageIcon, Video } from "lucide-react";

export default function UploadMenu({ close, openModal, className = "" }) {
  return (
    <div
      className={`
        bg-[#18181b] text-white w-48 rounded-xl shadow-2xl border border-white/10 
        backdrop-blur-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200
        ${className}
      `}
    >
      {/* Header */}
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5 mb-1">
        Create
      </div>

      {/* Upload Post */}
      <button
        onClick={() => {
          close();
          openModal("post");
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition group"
      >
        <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition">
            <ImageIcon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">Post</span>
      </button>

      {/* Upload Reel */}
      <button
        onClick={() => {
          close();
          openModal("reel");
        }}
        className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg hover:bg-white/10 transition group"
      >
        <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition">
            <Video className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">Reel</span>
      </button>
    </div>
  );
}