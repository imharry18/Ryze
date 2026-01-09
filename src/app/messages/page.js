"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function MessagesPage() {
  const { user } = useAuth();
  const [inbox, setInbox] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchInbox() {
      try {
        const res = await fetch("/api/messages");
        if (res.ok) {
          const data = await res.json();
          setInbox(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchInbox();
  }, [user]);

  if (loading) return <div className="flex justify-center pt-20 text-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="h-full bg-black text-white p-4">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <MessageCircle className="text-blue-500" /> Messages
      </h1>

      <div className="flex flex-col gap-2">
        {inbox.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No messages yet.</p>
            <Link href="/search" className="text-blue-400 text-sm hover:underline mt-2 block">
              Start a new chat
            </Link>
          </div>
        ) : (
          inbox.map((chat) => (
            <Link key={chat.id} href={`/messages/${chat.id}`}>
              <div className="flex items-center gap-4 p-4 rounded-xl hover:bg-white/5 transition border border-transparent hover:border-white/10 cursor-pointer">
                
                {/* Avatar */}
                <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-800 relative shrink-0">
                   <img src={chat.image || "/default-dp.png"} alt={chat.name} className="object-cover w-full h-full" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-semibold text-white truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500">
                      {new Date(chat.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${chat.isRead ? 'text-gray-500' : 'text-white font-bold'}`}>
                    {chat.lastMessage}
                  </p>
                </div>

              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}