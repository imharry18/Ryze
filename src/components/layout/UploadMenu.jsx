"use client";

import React from "react";
import { Image as ImageIcon, Video, Ghost, Megaphone } from "lucide-react";

export default function UploadMenu({ close, openModal, className = "" }) {
  return (
    <div
      className={`
        bg-[#18181b] text-white w-52 rounded-xl shadow-2xl border border-white/10 
        backdrop-blur-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-200
        ${className}
      `}
    >
      {/* Header */}
      <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-white/5 mb-1">
        Create New
      </div>

      {/* Post */}
      <button
        onClick={() => { close(); openModal("post"); }}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/10 transition group"
      >
        <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition">
            <ImageIcon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">Post</span>
      </button>

      {/* Reel */}
      <button
        onClick={() => { close(); openModal("reel"); }}
        className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg hover:bg-white/10 transition group"
      >
        <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition">
            <Video className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">Reel</span>
      </button>

      {/* Confession */}
      <button
        onClick={() => { close(); openModal("confession"); }}
        className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg hover:bg-white/10 transition group"
      >
        <div className="p-1.5 rounded-md bg-pink-500/10 text-pink-400 group-hover:bg-pink-500 group-hover:text-white transition">
            <Ghost className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">Confession</span>
      </button>

      {/* Notice */}
      <button
        onClick={() => { close(); openModal("notice"); }}
        className="w-full flex items-center gap-3 px-3 py-2.5 mt-1 rounded-lg hover:bg-white/10 transition group"
      >
        <div className="p-1.5 rounded-md bg-orange-500/10 text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition">
            <Megaphone className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium">Notice</span>
      </button>
    </div>
  );
}