"use client";

import { useEffect, useState, useRef } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc } from "firebase/firestore"; 
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import { getChatId, markChatAsRead, sendMessage } from "@/lib/actions/social"; 
import { Loader2, Send, ArrowLeft, MoreVertical, Check, CheckCheck } from "lucide-react";
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

      // 1. Mark as Read
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
    <div className="flex flex-col h-full bg-[#0a0a0a]">
      
      {/* Header */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#0c0c0f] shadow-sm z-10">
        <div className="flex items-center gap-4">
            <Link href="/messages" className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition">
                <ArrowLeft size={20} />
            </Link>
            <div className="relative">
                <img src={targetUser.dp || "/default-dp.png"} className="w-10 h-10 rounded-full object-cover bg-gray-800" />
            </div>
            <div>
                <h2 className="font-bold text-white text-base leading-tight">{targetUser.name}</h2>
                <p className="text-xs text-gray-500">@{targetUser.username}</p>
            </div>
        </div>
        <button className="p-2 rounded-full hover:bg-white/5 text-gray-400 transition"><MoreVertical size={20} /></button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1 bg-black/50 min-h-0 scroll-smooth">
        {messages.map((msg) => {
            const isMe = msg.senderId === user.uid;
            return (
                <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"} animate-fadeIn mb-1`}>
                    <div 
                        className={`relative max-w-[75%] px-3 py-1.5 text-sm shadow-sm break-words
                        ${isMe ? "bg-blue-600 text-white rounded-lg rounded-tr-none" : "bg-[#1e1e1e] text-gray-200 rounded-lg rounded-tl-none"}`}
                    >
                        <div className="flex flex-col gap-0.5">
                            <span className="pr-14 pb-1">{msg.text}</span>
                            <div className="flex items-center gap-1 self-end absolute bottom-1 right-2">
                                <span className={`text-[10px] ${isMe ? "text-blue-100" : "text-gray-500"}`}>
                                    {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                                </span>
                                {isMe && (
                                    msg.read 
                                    ? <CheckCheck size={14} className="text-blue-200" strokeWidth={2.5} /> 
                                    : <CheckCheck size={14} className="text-blue-300/70" />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            );
        })}
        {partnerTyping && (
           <div className="flex justify-start animate-fadeIn">
              <div className="bg-[#1e1e1e] px-4 py-3 rounded-xl rounded-tl-none flex items-center gap-1 shadow-sm">
                 <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
              </div>
           </div>
        )}
        <div ref={scrollRef} className="h-1" />
      </div>

      {/* Input */}
      <div className="p-4 bg-[#0c0c0f] border-t border-white/5 flex items-center gap-3">
        <div className="flex-1 bg-[#1a1a1a] rounded-full flex items-center px-2 border border-transparent focus-within:border-blue-500/30 transition-colors">
            <input 
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type a message..."
                className="flex-1 bg-transparent border-none px-4 py-3.5 text-white text-sm focus:outline-none placeholder:text-gray-500"
            />
        </div>
        <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className={`p-3.5 rounded-full transition shadow-lg ${input.trim() ? "bg-blue-600 text-white hover:bg-blue-500 hover:scale-105" : "bg-[#1a1a1a] text-gray-600"}`}
        >
            <Send size={20} fill={input.trim() ? "currentColor" : "none"} />
        </button>
      </div>

    </div>
  );
}