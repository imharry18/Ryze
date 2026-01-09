"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Send, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ChatRoom() {
  const params = useParams(); // Next.js 15+ way
  const chatPartnerId = params.id;
  
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [partner, setPartner] = useState(null);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // 1. Fetch Partner Details
  useEffect(() => {
    async function fetchPartner() {
      const res = await fetch(`/api/users/${chatPartnerId}`);
      if (res.ok) {
        const data = await res.json();
        setPartner(data);
      }
    }
    if (chatPartnerId) fetchPartner();
  }, [chatPartnerId]);

  // 2. Fetch Messages (Polling every 3 seconds)
  useEffect(() => {
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/messages/${chatPartnerId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000); // Poll every 3s
    return () => clearInterval(interval);
  }, [chatPartnerId]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 3. Send Message
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const tempMsg = {
        senderId: user.uid,
        text: inputText,
        createdAt: new Date().toISOString(),
        _id: "temp-" + Date.now()
    };

    // Optimistic Update
    setMessages(prev => [...prev, tempMsg]);
    setInputText("");

    try {
        await fetch("/api/messages", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ receiverId: chatPartnerId, text: tempMsg.text })
        });
        // Polling will catch the real message shortly
    } catch (error) {
        console.error("Failed to send", error);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col h-screen bg-black text-white">
        
        {/* Header */}
        <div className="flex items-center gap-4 p-4 border-b border-white/10 bg-black/80 backdrop-blur-md sticky top-0 z-10">
            <Link href="/messages" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition">
                <ArrowLeft size={20} />
            </Link>
            
            {partner && (
                <Link href={`/profile/${partner.id}`} className="flex items-center gap-3 flex-1">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-800">
                        <img src={partner.image || "/default-dp.png"} alt={partner.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm">{partner.name}</h3>
                        <p className="text-xs text-gray-500">@{partner.username}</p>
                    </div>
                </Link>
            )}
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
                <div className="text-center text-gray-600 mt-10 text-sm">
                    No messages yet. Say hi! 👋
                </div>
            )}
            
            {messages.map((msg) => {
                const isMe = msg.senderId === user?.uid;
                return (
                    <div key={msg._id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                            isMe 
                            ? "bg-blue-600 text-white rounded-br-none" 
                            : "bg-[#1f1f1f] text-gray-200 rounded-bl-none"
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                );
            })}
            <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSend} className="p-4 border-t border-white/10 bg-black">
            <div className="flex items-center gap-2 bg-[#1f1f1f] rounded-full px-4 py-2 border border-white/10 focus-within:border-blue-500/50 transition">
                <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Message..."
                    className="flex-1 bg-transparent border-none focus:outline-none text-white placeholder-gray-500 py-1"
                />
                <button 
                    type="submit" 
                    disabled={!inputText.trim()}
                    className="p-2 bg-blue-600 text-white rounded-full disabled:opacity-50 disabled:bg-transparent transition"
                >
                    <Send size={18} />
                </button>
            </div>
        </form>

    </div>
  );
}