"use client";

import React from "react";
import { X } from "lucide-react";
import PostUploadForm from "./PostUploadForm";
import ReelUploadForm from "./ReelUploadForm";

export default function UploadModal({ isOpen, onClose, uploadType }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-[#0c0c0f] border border-white/10 rounded-2xl w-full max-w-4xl relative overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10 bg-white/5">
          <h2 className="text-lg font-semibold text-white capitalize flex items-center gap-2">
            Create {uploadType === "reel" ? "Reel" : "Post"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition bg-white/5 hover:bg-white/10 p-2 rounded-full"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-0">
          {uploadType === "reel" ? (
            <ReelUploadForm onClose={onClose} />
          ) : (
            <PostUploadForm onClose={onClose} />
          )}
        </div>

      </div>
    </div>
  );
}