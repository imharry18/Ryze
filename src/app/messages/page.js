"use client";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center p-6 bg-black/95">
      <div className="w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center mb-6 animate-pulse">
        <MessageSquare size={40} className="text-blue-500" />
      </div>
      <h2 className="text-2xl font-bold text-white mb-2">Your Messages</h2>
      <p className="text-gray-400 max-w-xs">
        Send private photos and messages to a friend or group.
      </p>
    </div>
  );
}