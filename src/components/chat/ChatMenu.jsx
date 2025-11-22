"use client";

import React, { useEffect, useRef } from "react";
import { Trash2, Ban, Flag, X } from "lucide-react";

export default function ChatMenu({ isOpen, onClose, onClearChat, onBlockUser }) {
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute top-16 right-4 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden"
    >
      <div className="flex flex-col py-1">
        
        <button 
          onClick={onClearChat}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors"
        >
          <Trash2 size={16} /> Clear Chat
        </button>

        <button className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white flex items-center gap-2 transition-colors">
          <Flag size={16} /> Report
        </button>

        <div className="h-px bg-white/10 my-1" />

        <button 
          onClick={onBlockUser}
          className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
        >
          <Ban size={16} /> Block User
        </button>

      </div>
    </div>
  );
}