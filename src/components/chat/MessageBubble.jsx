"use client";

import React from "react";
import { Check, CheckCheck } from "lucide-react";

export default function MessageBubble({ 
  msg, 
  isMe, 
  onContextMenu, 
  onJumpTo 
}) {
  
  const time = msg.createdAt 
    ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    : "...";

  // Trigger Parent's Menu
  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onContextMenu(e, msg);
  };

  if (msg.deletedFor?.includes(isMe ? "me" : "other")) return null;

  const isDeletedMessage = msg.isDeleted;

  return (
    <div 
      id={msg.id} 
      className={`flex flex-col ${isMe ? "items-end" : "items-start"} group relative mb-1`}
    >
      {/* Reply Preview */}
      {msg.replyTo && !isDeletedMessage && (
        <div 
          onClick={() => onJumpTo(msg.replyTo.id)}
          className={`
            mb-1 px-3 py-1 rounded-lg text-xs cursor-pointer transition-all opacity-80 hover:opacity-100
            ${isMe ? "bg-indigo-900/40 text-indigo-200 border-l-2 border-indigo-400" : "bg-gray-800 text-gray-300 border-l-2 border-gray-500"}
          `}
        >
          <span className="font-bold block text-[10px] opacity-70">{msg.replyTo.senderName}</span>
          <span className="line-clamp-1 italic">{msg.replyTo.text}</span>
        </div>
      )}

      {/* Bubble Body */}
      <div 
        onContextMenu={handleRightClick}
        className={`
          relative max-w-[85%] sm:max-w-[70%] px-4 py-2 text-[15px] shadow-sm break-words rounded-2xl cursor-default select-text
          ${isDeletedMessage ? "italic text-sm border border-white/10 bg-white/5 text-gray-500" : ""}
          ${!isDeletedMessage && isMe 
            ? "bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-br-sm" 
            : !isDeletedMessage && "bg-[#1F2937] text-gray-100 rounded-bl-sm border border-gray-700/50"}
        `}
      >
        {msg.text}

        {/* Time & Read Status */}
        <div className={`flex items-center justify-end gap-1 mt-1 select-none ${isDeletedMessage ? "hidden" : ""}`}>
          <span className={`text-[10px] ${isMe ? "text-indigo-200/70" : "text-gray-500"}`}>
            {time}
          </span>
          
          {isMe && (
            <div className="ml-0.5">
              {msg.read ? (
                <CheckCheck size={14} className="text-cyan-300" /> 
              ) : (
                <Check size={14} className="text-indigo-200/70" /> 
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}