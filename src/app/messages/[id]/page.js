"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc, addDoc, serverTimestamp } from "firebase/firestore"; // Added missing imports
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import { getChatId } from "@/lib/actions/social"; // Removed sendMessage import to define locally if needed or import
import { Loader2, Send, ArrowLeft, MoreVertical, Phone, Video } from "lucide-react";
import Link from "next/link";

export default function ChatRoom() {
  const { id: targetUserId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return router.push("/login");
      setUser(currentUser);

      // 1. Get Target User Info
      const targetRef = doc(db, "users", targetUserId);
      const targetSnap = await getDoc(targetRef);
      if (targetSnap.exists()) setTargetUser(targetSnap.data());

      // 2. Listen to Messages
      const chatId = getChatId(currentUser.uid, targetUserId);
      const q = query(
        collection(db, "chats", chatId, "messages"),
        orderBy("createdAt", "asc")
      );

      const unsubMsg = onSnapshot(q, (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "auto" }), 100);
      });

      return () => unsubMsg();
    });
    return () => unsubAuth();
  }, [targetUserId, router]);

  // Re-implementing sendMessage locally to ensure imports work
  const sendMessage = async (senderId, receiverId, text) => {
    if (!text.trim()) return;
    const chatId = getChatId(senderId, receiverId);
    const chatRef = collection(db, "chats", chatId, "messages");
    await addDoc(chatRef, {
      senderId,
      text,
      createdAt: serverTimestamp(),
      read: false
    });
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput(""); // clear immediately for UX
    await sendMessage(user.uid, targetUserId, text);
  };

  if (!targetUser) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col h-full bg-black/95">
      
      {/* Chat Header */}
      <div className="p-3 border-b border-white/10 flex items-center justify-between bg-[#0c0c0f]">
        <div className="flex items-center gap-3">
            {/* Mobile Back Button */}
            <Link href="/messages" className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-full">
                <ArrowLeft size={20} />
            </Link>
            
            <div className="relative">
                <img src={targetUser.dp || "/default-dp.png"} className="w-10 h-10 rounded-full object-cover" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0c0c0f]"></div>
            </div>
            
            <div>
                <h2 className="font-bold text-sm leading-tight">{targetUser.name}</h2>
                <p className="text-xs text-green-500">Online</p>
            </div>
        </div>

        <div className="flex items-center gap-4 text-gray-400">
            <Phone size={20} className="cursor-pointer hover:text-white" />
            <Video size={20} className="cursor-pointer hover:text-white" />
            <MoreVertical size={20} className="cursor-pointer hover:text-white" />
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-black/50">
        {messages.map((msg) => {
            const isMe = msg.senderId === user.uid;
            return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm relative ${
                        isMe 
                        ? "bg-blue-600 text-white rounded-br-sm" 
                        : "bg-[#1e1e1e] text-gray-200 rounded-bl-sm"
                    }`}>
                        {msg.text}
                        <span className="text-[10px] opacity-50 block text-right mt-1">
                            {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "..."}
                        </span>
                    </div>
                </div>
            );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#0c0c0f] border-t border-white/10 flex items-center gap-2">
        <input 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Message..."
            className="flex-1 bg-[#1a1a1a] border-none rounded-full px-4 py-3 text-white text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-3 rounded-full transition ${input.trim() ? "bg-blue-600 text-white hover:bg-blue-500" : "bg-[#1a1a1a] text-gray-500"}`}
        >
            <Send size={18} />
        </button>
      </div>

    </div>
  );
}