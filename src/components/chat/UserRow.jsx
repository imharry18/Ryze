"use client";

import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function UserRow({ person, isInteracted, isActive }) {
  const unreadCount = Number(person.unread || 0);
  const hasUnread = unreadCount > 0;

  // Format Time
  const timeDisplay = person.lastMessageAt
    ? new Date(person.lastMessageAt * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // --- STYLING ---
  // Active: Subtle Glass Background (No Border)
  // Inactive: Hover effect
  let containerClass = "relative flex items-center gap-3.5 p-3 rounded-lg transition-all duration-200 group cursor-pointer ";
  
  if (isActive) {
    containerClass += "bg-white/[0.08]"; // Just background, no border
  } else {
    containerClass += "hover:bg-white/[0.03]";
  }

  return (
    <Link href={`/messages/${person.uid}`} className="block outline-none">
      <div className={containerClass}>
        
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="relative h-11 w-11 rounded-full overflow-hidden bg-gray-800 border border-white/10 shadow-sm">
            <img
              src={person.dp || "/default-dp.png"}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              alt={person.name}
            />
          </div>
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-[2px]">
          
          {/* Name & Time Row */}
          <div className="flex justify-between items-center">
            <h3 className={`text-[14px] font-semibold truncate transition-colors ${
                hasUnread ? "text-white" : "text-gray-300 group-hover:text-white"
            }`}>
              {person.name}
            </h3>
            
            {isInteracted && (
              <span className={`text-[10px] whitespace-nowrap font-medium ${
                  hasUnread ? "text-cyan-400" : "text-gray-600 group-hover:text-gray-500"
              }`}>
                {timeDisplay}
              </span>
            )}
          </div>

          {/* Message / Status Row */}
          <div className="flex justify-between items-center h-4">
            
            {hasUnread ? (
              // --- UNREAD: Blue/Cyan Techy Style ---
              <div className="flex items-center gap-1.5">
                 <span className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 tracking-wide animate-pulse">
                    New Chat
                 </span>
              </div>
            ) : (
              // --- READ: Standard Gray ---
              <p className={`text-[11px] truncate pr-2 flex-1 ${isActive ? "text-gray-400" : "text-gray-500 group-hover:text-gray-400"}`}>
                {isInteracted ? (
                  person.lastMessage || <span className="italic opacity-50">Attachment</span>
                ) : (
                  <span className="flex items-center gap-1 text-cyan-500/60 group-hover:text-cyan-400 transition-colors">
                    <MessageSquare size={10} /> Say Hi
                  </span>
                )}
              </p>
            )}

            {/* --- TECHY DOT --- */}
            {hasUnread && (
              <div className="shrink-0 w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.9)] animate-pulse"></div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}