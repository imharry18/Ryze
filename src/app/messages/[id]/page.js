"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, getDoc, setDoc, updateDoc, writeBatch, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useParams, useRouter } from "next/navigation";
import { getChatId, sendMessage, clearChatHistory, blockUser, deleteMessage } from "@/lib/actions/social"; 
import { Loader2, Send, ArrowLeft, MoreVertical, X, CornerDownLeft } from "lucide-react";
import Link from "next/link";
import ChatMenu from "@/components/chat/ChatMenu";
import MessageBubble from "@/components/chat/MessageBubble";

export default function ChatRoom() {
  const { id: targetUserId } = useParams();
  const router = useRouter();
  
  // State
  const [user, setUser] = useState(null);
  const [targetUser, setTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [clearedAt, setClearedAt] = useState(null); 
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  // Reply State
  const [replyMessage, setReplyMessage] = useState(null);

  // Refs
  const typingTimeoutRef = useRef(null);
  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null); // To scroll to bottom
  const isMounted = useRef(true);

  // --- SCROLL LOGIC ---
  // useLayoutEffect ensures scroll happens BEFORE paint (instant feel)
  useLayoutEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: isInitialLoad ? "auto" : "smooth" });
    }
  }, [messages, isInitialLoad]);

  // Mark Read Helper
  const markRead = async (currentUserId, targetId, chatId) => {
    if (!currentUserId || !targetId) return;
    // Optimization: Only write if necessary (handled by backend usually, but good to be safe)
    await updateDoc(doc(db, "chats", chatId), { [`unreadCount.${currentUserId}`]: 0 }).catch(() => {});
    
    const q = query(collection(db, "chats", chatId, "messages"), where("senderId", "==", targetId), where("read", "==", false));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const batch = writeBatch(db);
      snapshot.docs.forEach((doc) => batch.update(doc.ref, { read: true }));
      await batch.commit();
    }
  };

  // --- INITIALIZATION ---
  useEffect(() => {
    isMounted.current = true;
    
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return router.push("/login");
      setUser(currentUser);

      const targetSnap = await getDoc(doc(db, "users", targetUserId));
      if (targetSnap.exists()) setTargetUser(targetSnap.data());

      const chatId = getChatId(currentUser.uid, targetUserId);
      markRead(currentUser.uid, targetUserId, chatId);

      // Metadata Listener
      const unsubMeta = onSnapshot(doc(db, "chats", chatId), (docSnap) => {
        if (!isMounted.current) return;
        if (docSnap.exists()) {
          const data = docSnap.data();
          setPartnerTyping(data.typing && data.typing[targetUserId]);
          if (data.clearedAt && data.clearedAt[currentUser.uid]) {
              setClearedAt(data.clearedAt[currentUser.uid]);
          }
          // Real-time badge clear
          if (data.unreadCount && data.unreadCount[currentUser.uid] > 0) {
             updateDoc(doc(db, "chats", chatId), { [`unreadCount.${currentUser.uid}`]: 0 }).catch(()=>{});
          }
        }
      });

      // Messages Listener
      const q = query(collection(db, "chats", chatId, "messages"), orderBy("createdAt", "asc"));
      const unsubMsg = onSnapshot(q, (snap) => {
        if (!isMounted.current) return;
        
        const msgs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setMessages(msgs);
        setIsInitialLoad(false); // Data loaded

        // Mark read if new message arrives while open
        const lastMsg = msgs[msgs.length - 1];
        if (lastMsg && lastMsg.senderId === targetUserId && !lastMsg.read) {
           markRead(currentUser.uid, targetUserId, chatId);
        }
      });

      return () => { unsubMsg(); unsubMeta(); };
    });

    return () => { isMounted.current = false; return unsubAuth(); };
  }, [targetUserId, router]);

  // --- HANDLERS ---

  const handleInputChange = async (e) => {
    setInput(e.target.value);
    if (!user) return;
    const chatId = getChatId(user.uid, targetUserId);
    updateDoc(doc(db, "chats", chatId), { [`typing.${user.uid}`]: true }).catch(()=>{});

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      updateDoc(doc(db, "chats", chatId), { [`typing.${user.uid}`]: false }).catch(()=>{});
    }, 2000);
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const text = input;
    const replyContext = replyMessage ? {
        id: replyMessage.id,
        text: replyMessage.text,
        senderName: replyMessage.senderId === user.uid ? "You" : targetUser.name
    } : null;

    setInput("");
    setReplyMessage(null); // Clear reply
    
    const chatId = getChatId(user.uid, targetUserId);
    updateDoc(doc(db, "chats", chatId), { [`typing.${user.uid}`]: false }).catch(()=>{});
    await sendMessage(user.uid, targetUserId, text, replyContext);
  };

  const handleClearChat = async () => {
    if(!confirm("Clear chat history for you? This cannot be undone.")) return;
    const chatId = getChatId(user.uid, targetUserId);
    await clearChatHistory(chatId, user.uid);
    setIsMenuOpen(false);
  };

  const handleBlockUser = async () => {
    if(!confirm(`Block ${targetUser.name}?`)) return;
    await blockUser(user.uid, targetUserId);
    setIsMenuOpen(false);
    router.push("/messages");
  };

  // Pass this to MessageBubble
  const handleDeleteMessage = async (msgId, forEveryone) => {
    if (!confirm(forEveryone ? "Delete for everyone?" : "Delete for me?")) return;
    const chatId = getChatId(user.uid, targetUserId);
    await deleteMessage(chatId, msgId, user.uid, forEveryone);
  };

  const handleJumpTo = (msgId) => {
    const el = document.getElementById(msgId);
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        // Highlight effect
        el.classList.add("bg-white/5", "transition-colors", "duration-500");
        setTimeout(() => el.classList.remove("bg-white/5"), 1000);
    }
  };

  // Filter messages
  const visibleMessages = messages.filter(msg => {
      // 1. Cleared History check
      if (clearedAt && msg.createdAt && msg.createdAt.seconds <= clearedAt.seconds) return false;
      // 2. Deleted for me check
      if (msg.deletedFor?.includes(user?.uid)) return false;
      return true;
  });

  if (!targetUser || isInitialLoad) {
    // --- SKELETON LOADER ---
    return (
      <div className="flex flex-col h-full bg-[#0a0a0a] animate-pulse p-4">
         <div className="flex items-center justify-between mb-8 p-2">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-full" />
                <div className="space-y-2">
                    <div className="w-32 h-4 bg-gray-800 rounded" />
                    <div className="w-20 h-3 bg-gray-900 rounded" />
                </div>
            </div>
         </div>
         <div className="flex-1 space-y-6">
            {[1,2,3,4].map(i => (
                <div key={i} className={`flex ${i%2===0?"justify-end":"justify-start"}`}>
                    <div className={`w-48 h-12 rounded-2xl ${i%2===0?"bg-indigo-900/20":"bg-gray-800/50"}`} />
                </div>
            ))}
         </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden">

      {/* Header */}
      <div className="flex-shrink-0 p-4 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 z-10">
        <div className="flex items-center gap-4">
            <Link href="/messages" className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-full transition text-gray-400 hover:text-white">
                <ArrowLeft size={22} />
            </Link>
            
            <div className="relative">
                <div className="w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-indigo-500 to-purple-500">
                    <img src={targetUser.dp || "/default-dp.png"} className="w-full h-full rounded-full object-cover bg-black" />
                </div>
            </div>

            <div>
                <h2 className="font-bold text-white text-base leading-tight tracking-wide">{targetUser.name}</h2>
                <p className="text-xs text-indigo-400 font-medium">@{targetUser.username}</p>
            </div>
        </div>

        <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-2 rounded-full transition ${isMenuOpen ? "bg-white/10 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white"}`}
        >
            <MoreVertical size={20} />
        </button>

        <ChatMenu 
            isOpen={isMenuOpen} 
            onClose={() => setIsMenuOpen(false)} 
            onClearChat={handleClearChat}
            onBlockUser={handleBlockUser}
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 no-scrollbar z-0" ref={scrollRef}>
        
        {visibleMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 select-none">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4 blur-sm animate-pulse">
                    <div className="w-16 h-16 bg-indigo-500/40 rounded-full" />
                </div>
                <p className="text-indigo-200 font-medium">No messages here yet</p>
            </div>
        ) : (
            visibleMessages.map((msg) => (
                <MessageBubble 
                    key={msg.id} 
                    msg={msg} 
                    isMe={msg.senderId === user.uid}
                    onReply={setReplyMessage}
                    onDelete={handleDeleteMessage}
                    onJumpTo={handleJumpTo}
                />
            ))
        )}

        {partnerTyping && (
           <div className="flex justify-start animate-in slide-in-from-left-2 fade-in duration-300 pl-2">
              <div className="bg-[#1F2937] border border-gray-700/50 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1 shadow-lg">
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 z-20">
        
        {/* Reply Preview */}
        {replyMessage && (
            <div className="mx-2 mb-2 bg-[#1a1a1a] border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="border-l-4 border-indigo-500 pl-3">
                    <p className="text-xs text-indigo-400 font-bold mb-0.5">
                        Replying to {replyMessage.senderId === user.uid ? "Yourself" : targetUser.name}
                    </p>
                    <p className="text-sm text-gray-300 line-clamp-1">{replyMessage.text}</p>
                </div>
                <button onClick={() => setReplyMessage(null)} className="p-1 hover:bg-white/10 rounded-full text-gray-400">
                    <X size={16} />
                </button>
            </div>
        )}

        <div className="bg-[#0a0a0a] border border-white/10 rounded-[24px] p-1.5 flex items-end gap-2 shadow-2xl ring-1 ring-white/5 focus-within:ring-indigo-500/50 transition-all">
            <textarea 
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                    }
                }}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent border-none px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none text-[15px] resize-none max-h-32 min-h-[48px] scrollbar-thin"
                style={{ height: "auto", minHeight: "44px" }} // Auto-grow logic can be improved with a library but this is simple
            />
            
            <button 
                onClick={handleSend}
                disabled={!input.trim()}
                className={`mb-1 p-3 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center shrink-0
                    ${input.trim() 
                        ? "bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 hover:shadow-indigo-500/30" 
                        : "bg-white/5 text-gray-600 cursor-not-allowed"
                    }`}
            >
                {replyMessage ? <CornerDownLeft size={20} /> : <Send size={20} fill={input.trim() ? "currentColor" : "none"} className={input.trim() ? "ml-0.5" : ""} />}
            </button>
        </div>
      </div>

    </div>
  );
}