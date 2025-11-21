// src/app/messages/[id]/page.js
"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc } from "firebase/firestore"; 
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import { getChatId, markChatAsRead, sendMessage } from "@/lib/actions/social"; 
import { Loader2, Send, ArrowLeft, MoreVertical, CheckCheck } from "lucide-react";
import Link from "next/link";

export default function ChatRoom() {
  const { id: targetUserId } = useParams();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  
  const [isTyping, setIsTyping] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const scrollRef = useRef();

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return router.push("/login");
      setUser(currentUser);

      const targetRef = doc(db, "users", targetUserId);
      const targetSnap = await getDoc(targetRef);
      if (targetSnap.exists()) setTargetUser(targetSnap.data());

      const chatId = getChatId(currentUser.uid, targetUserId);

      // 1. Mark as Read immediately
      await markChatAsRead(currentUser.uid, targetUserId);

      // 2. Messages Listener
      const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
      const unsubMsg = onSnapshot(q, (snap) => {
        setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "auto", block: "end" }), 100);
      });

      // 3. Typing Listener
      const unsubTyping = onSnapshot(doc(db, "chats", chatId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPartnerTyping(data.typing && data.typing[targetUserId]);
          if (data.typing && data.typing[targetUserId]) {
             setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: "smooth", block: "end" }), 100);
          }
        }
      });

      return () => { unsubMsg(); unsubTyping(); };
    });
    return () => unsubAuth();
  }, [targetUserId, router]);

  const handleInputChange = async (e) => {
    setInput(e.target.value);
    if (!user) return;
    const chatId = getChatId(user.uid, targetUserId);

    if (!isTyping) {
      setIsTyping(true);
      setDoc(doc(db, "chats", chatId), { typing: { [user.uid]: true } }, { merge: true });
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      setDoc(doc(db, "chats", chatId), { typing: { [user.uid]: false } }, { merge: true });
    }, 2000);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    setInput("");
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
    await sendMessage(user.uid, targetUserId, text);
  };

  if (!targetUser) return <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="flex flex-col h-full bg-[#0b141a]"> 
      {/* Dark background like WhatsApp Web Dark */}
      
      {/* Header */}
      <div className="p-3 px-4 border-b border-white/5 flex items-center justify-between bg-[#202c33] shadow-sm z-10">
        <div className="flex items-center gap-3">
            <Link href="/messages" className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition">
                <ArrowLeft size={20} className="text-gray-300" />
            </Link>
            <div className="relative">
                <img src={targetUser.dp || "/default-dp.png"} className="w-10 h-10 rounded-full object-cover bg-gray-800" />
            </div>
            <div>
                <h2 className="font-bold text-white text-sm leading-tight">{targetUser.name}</h2>
                <p className="text-xs text-gray-400">@{targetUser.username}</p>
            </div>
        </div>
        <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 transition"><MoreVertical size={20} /></button>
      </div>

      {/* Messages Area */}
      {/* Added implicit pattern background effect via color */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1.5 min-h-0 scroll-smooth custom-scrollbar">
        {messages.map((msg) => {
            const isMe = msg.senderId === user.uid;
            return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn`}>
                    <div 
                        className={`relative min-w-[100px] max-w-[75%] px-3 pt-2 pb-5 text-sm shadow-md break-words rounded-lg
                        ${isMe 
                            ? "bg-[#005c4b] text-white rounded-tr-none" // Sent: Green
                            : "bg-[#202c33] text-white rounded-tl-none" // Received: Dark Gray
                        }`}
                    >
                        <span className="block leading-snug text-[14.2px]">{msg.text}</span>
                        
                        {/* Timestamp & Tick - Positioned Absolute Bottom Right */}
                        <div className="absolute bottom-1 right-2 flex items-center gap-1">
                            <span className="text-[10px] text-white/60 font-medium">
                                {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                            </span>
                            {isMe && (
                                msg.read 
                                ? <CheckCheck size={15} className="text-cyan-400" /> // Blue Tick
                                : <CheckCheck size={15} className="text-gray-400" /> // Gray Tick
                            )}
                        </div>
                    </div>
                </div>
            );
        })}
        
        {partnerTyping && (
           <div className="flex justify-start animate-fadeIn">
              <div className="bg-[#202c33] px-4 py-3 rounded-xl rounded-tl-none flex items-center gap-1 shadow-sm">
                 <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
              </div>
           </div>
        )}
        <div ref={scrollRef} className="h-1" />
      </div>

      {/* Input Area */}
      <div className="p-3 bg-[#202c33] flex items-center gap-3">
        <div className="flex-1 bg-[#2a3942] rounded-lg flex items-center px-4 py-1 border border-transparent focus-within:border-white/10 transition-colors">
            <input 
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message"
                className="flex-1 bg-transparent border-none py-2.5 text-white text-sm focus:outline-none placeholder:text-gray-400"
            />
        </div>
        <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-3 rounded-full transition shadow-lg flex items-center justify-center ${input.trim() ? "bg-[#00a884] text-white hover:bg-[#008f72]" : "bg-[#2a3942] text-gray-500"}`}
        >
            <Send size={20} fill={input.trim() ? "currentColor" : "none"} className={input.trim() ? "ml-0.5" : ""} />
        </button>
      </div>

    </div>
  );
}