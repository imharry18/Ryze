"use client";

import Link from "next/link";
import { MessageCircle } from "lucide-react";

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

  // Dynamic Styles
  let containerStyle = "flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer relative group mb-1 ";
  if (isActive) {
    containerStyle += "bg-white/10 border border-white/10";
  } else {
    containerStyle += "hover:bg-white/5 border border-transparent";
  }

  return (
    <Link href={`/messages/${person.uid}`} className="block">
      <div className={containerStyle}>
        
        {/* Avatar */}
        <div className="relative h-12 w-12 shrink-0 rounded-full overflow-hidden border border-white/10 bg-gray-800">
          <img
            src={person.dp || "/default-dp.png"}
            className="w-full h-full object-cover"
            alt={person.name}
          />
        </div>

        {/* Info Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          
          {/* Top Row: Name & Time */}
          <div className="flex justify-between items-center mb-0.5">
            <h3 className={`font-bold truncate text-sm ${hasUnread ? "text-white" : "text-gray-300 group-hover:text-white"}`}>
              {person.name}
            </h3>
            
            {isInteracted && (
              <span className={`text-[10px] whitespace-nowrap ml-2 ${hasUnread ? "text-green-400 font-bold" : "text-gray-600"}`}>
                {timeDisplay}
              </span>
            )}
          </div>

          {/* Bottom Row: Message Preview OR "New Chat" Indicator */}
          <div className="flex justify-between items-center h-5">
            
            {hasUnread ? (
              // --- UNREAD STATE: Icon + "New Chat" ---
              <div className="flex items-center gap-1.5">
                 <MessageCircle size={13} className="text-blue-400 fill-blue-400/20" />
                 <span className="text-xs font-bold text-blue-400 tracking-wide">New Chat</span>
              </div>
            ) : (
              // --- READ STATE: Actual Message Content ---
              <p className="text-xs truncate text-gray-500 pr-2 flex-1">
                {isInteracted ? (
                  person.lastMessage || "Attachment"
                ) : (
                  <span className="text-blue-400">Start conversation</span>
                )}
              </p>
            )}

            {/* --- UNREAD BADGE: Green Dot --- */}
            {hasUnread && (
              <div className="shrink-0 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse ml-2"></div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}