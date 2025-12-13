"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Search, MessageCircle } from "lucide-react";
import UserRow from "./UserRow"; 

export default function ChatSidebar({ user, className }) {
  const pathname = usePathname();
  const [searchTerm, setSearchTerm] = useState("");
  // Placeholder data until Messaging API is fully integrated
  const interactedUsers = []; 
  const suggestedUsers = []; 

  return (
    <aside className={`flex flex-col bg-[#050505] border-r border-white/5 h-full ${className}`}>
        {/* Header */}
        <div className="p-5 pb-2 z-10">
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-2xl font-bold text-white tracking-wide">Chats</h1>
            <div className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
              <MessageCircle size={18} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>
          
          <div className="group relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={15} className="text-gray-600 group-focus-within:text-cyan-400 transition-colors duration-300" />
            </div>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search people..." 
              className="w-full bg-[#0f0f0f] border border-white/10 text-sm text-gray-300 rounded-xl py-2.5 pl-10 pr-4 
                         focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 
                         focus:bg-[#141414] placeholder:text-gray-700 transition-all duration-300" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
          {interactedUsers.length === 0 && (
            <div className="text-center py-12 opacity-30 select-none">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">No chats found</p>
            </div>
          )}
        </div>
    </aside>
  );
}