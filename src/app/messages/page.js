"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import Image from "next/image";
import { Loader2, MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const { user, loading: authLoading } = useAuth();
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchChats = async () => {
      try {
        const res = await fetch(`/api/chats?userId=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setChats(data.chats || []);
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChats();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        <Loader2 className="animate-spin w-8 h-8 text-purple-500" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 pt-24 animate-fadeIn text-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
          <MessageSquare size={24} />
        </div>
        Your Messages
      </h1>

      {chats.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <MessageSquare size={48} className="mb-4 opacity-20" />
          <p className="text-lg">No active conversations yet.</p>
          <p className="text-sm mt-2 opacity-60">Start chatting from a user's profile!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {chats.map((chat) => (
            <Link key={chat.id} href={`/messages/${chat.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition border border-white/5 hover:border-white/20 cursor-pointer bg-[#121212]">
                <div className="relative h-14 w-14 rounded-full overflow-hidden bg-gray-800 border border-white/10">
                  <Image 
                    src={chat.participantDp || "/default-dp.png"} 
                    alt="DP" 
                    fill 
                    className="object-cover" 
                  />
                </div>
                
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-bold text-gray-200 truncate">{chat.participantName || "Unknown User"}</h3>
                    <span className="text-xs text-gray-500 shrink-0">
                      {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleDateString() : ""}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 truncate w-[90%]">
                    {chat.lastMessage || "Start a conversation..."}
                  </p>
                </div>

                {chat.unreadCount > 0 && (
                  <div className="bg-purple-600 text-white text-xs font-bold h-6 min-w-[24px] px-2 flex items-center justify-center rounded-full shrink-0 shadow-lg">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}