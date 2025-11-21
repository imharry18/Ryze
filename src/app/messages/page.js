"use client";
import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-[#0a0a0a]">
      <div className="w-24 h-24 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-900/20 animate-pulse">
        <MessageCircle size={48} className="text-white" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-3">Your Messages</h2>
      <p className="text-gray-400 max-w-sm leading-relaxed">
        Pick a friend from the left to start a conversation. Share photos, swap stories, and just hang out.
      </p>
    </div>
  );
}