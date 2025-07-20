"use client";

import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getChatId, sendMessage, clearChatHistory, blockUser, deleteMessage, markChatAsRead } from "@/lib/actions/social"; 
import { Send, ArrowLeft, MoreVertical, X, CornerDownLeft, Reply, Copy, Trash2 } from "lucide-react";
import Link from "next/link";
import ChatMenu from "@/components/chat/ChatMenu";
import MessageBubble from "@/components/chat/MessageBubble";
import { useAuth } from "@/hooks/useAuth";

export default function ChatRoom() {
  const { id: targetUserId } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const [targetUser, setTargetUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [clearedAt, setClearedAt] = useState(null); 
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [replyMessage, setReplyMessage] = useState(null);
  
  const [contextMenu, setContextMenu] = useState({ 
    visible: false, 
    x: 0, 
    y: 0, 
    msg: null 
  });

  const typingTimeoutRef = useRef(null);
  const scrollRef = useRef(null);
  const inputRef = useRef(null); 
  const isMounted = useRef(true);

  const handleContextMenu = (e, msg) => {
    e.preventDefault();
    const x = Math.min(e.clientX, window.innerWidth - 170); 
    const y = Math.min(e.clientY, window.innerHeight - 200);
    setContextMenu({ visible: true, x, y, msg });
  };

  const closeContextMenu = () => {
    if (contextMenu.visible) {
      setContextMenu({ ...contextMenu, visible: false });
    }
  };

  useEffect(() => {
    window.addEventListener("click", closeContextMenu);
    return () => window.removeEventListener("click", closeContextMenu);
  }, [contextMenu.visible]);

  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea") return;
      if (e.ctrlKey || e.altKey || e.metaKey) return;
      if (e.key.length === 1) inputRef.current?.focus();
    };
    window.addEventListener("keydown", handleGlobalKeyDown);
    return () => window.removeEventListener("keydown", handleGlobalKeyDown);
  }, []);

  useEffect(() => {
    if (replyMessage) inputRef.current?.focus();
  }, [replyMessage]);

  useLayoutEffect(() => {
    if (scrollRef.current) {
      const container = scrollRef.current;
      container.scrollTo({
        top: container.scrollHeight,
        behavior: isInitialLoad ? "auto" : "smooth"
      });
    }
  }, [messages, isInitialLoad]);

  useEffect(() => {
    isMounted.current = true;
    if (!user) return;

    const fetchChatData = async () => {
      if (!isMounted.current) return;
      try {
        const res = await fetch(`/api/chats/conversation?currentUserId=${user.uid}&targetUserId=${targetUserId}`);
        if (res.ok) {
          const data = await res.json();
          setTargetUser(data.targetUser);
          setMessages(data.messages || []);
          setPartnerTyping(data.typing || false);
          setClearedAt(data.clearedAt || null);
          setIsInitialLoad(false);

          const lastMsg = data.messages?.[data.messages.length - 1];
          if (lastMsg && lastMsg.senderId === targetUserId && !lastMsg.read) {
             await markChatAsRead(user.uid, targetUserId);
          }
        }
      } catch (err) {
        console.error("Failed to load chat data", err);
      }
    };

    fetchChatData();
    const intervalId = setInterval(fetchChatData, 3000); 
    
    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };
  }, [targetUserId, user]);

  const handleSend = async () => {
    if (!input.trim() || !user) return;
    const text = input;
    const replyContext = replyMessage ? {
        id: replyMessage.id,
        text: replyMessage.text,
        senderName: replyMessage.senderId === user.uid ? "You" : targetUser.name
    } : null;

    setInput("");
    setReplyMessage(null);
    inputRef.current?.focus(); 
    
    // Typing indicator update to local API
    await fetch('/api/chats/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid, targetUserId, typing: false })
    });

    await sendMessage(user.uid, targetUserId, text, replyContext);
  };

  const handleInputChange = async (e) => {
    setInput(e.target.value);
    if (!user) return;
    
    await fetch('/api/chats/typing', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.uid, targetUserId, typing: true })
    });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(async () => {
      await fetch('/api/chats/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.uid, targetUserId, typing: false })
      });
    }, 2000);
  };

  const handleClearChat = async () => {
    if(!confirm("Clear chat history?")) return;
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

  const handleDeleteMessage = async (msgId, forEveryone) => {
    const chatId = getChatId(user.uid, targetUserId);
    await deleteMessage(chatId, msgId, user.uid, forEveryone);
    closeContextMenu();
  };

  const handleJumpTo = (msgId) => {
    const el = document.getElementById(msgId);
    if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        el.classList.add("bg-white/5", "transition-colors", "duration-500");
        setTimeout(() => el.classList.remove("bg-white/5"), 1000);
    }
  };

  const visibleMessages = messages.filter(msg => {
      if (clearedAt && msg.createdAt && new Date(msg.createdAt) <= new Date(clearedAt)) return false;
      if (msg.deletedFor?.includes(user?.uid)) return false;
      return true;
  });

  if (!targetUser || isInitialLoad) {
    return <div className="flex flex-col h-full bg-[#0a0a0a] animate-pulse p-4">...</div>;
  }

  return (
    <div className="flex flex-col h-full bg-[#050505] relative overflow-hidden">

      <div className="flex-shrink-0 p-4 flex items-center justify-between bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 z-10">
        <div className="flex items-center gap-4">
            <Link href="/messages" className="md:hidden p-2 -ml-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white"><ArrowLeft size={22} /></Link>
            
            <Link href={`/profile/${targetUser.uid}`} className="flex items-center gap-4 hover:opacity-80 transition cursor-pointer">
                <div className="relative w-10 h-10 rounded-full p-[1.5px] bg-gradient-to-tr from-indigo-500 to-purple-500">
                    <img src={targetUser.dp || "/default-dp.png"} className="w-full h-full rounded-full object-cover bg-black" />
                </div>
                <div>
                    <h2 className="font-bold text-white text-base">{targetUser.name}</h2>
                    <p className="text-xs text-indigo-400 font-medium">@{targetUser.username}</p>
                </div>
            </Link>
        </div>
        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full text-gray-400 hover:text-white"><MoreVertical size={20} /></button>
        <ChatMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} onClearChat={handleClearChat} onBlockUser={handleBlockUser} />
      </div>

      <div className="flex-1 overflow-y-auto p-4 no-scrollbar z-0" ref={scrollRef}>
        {visibleMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-40 select-none"><p className="text-indigo-200 font-medium">No messages here yet</p></div>
        ) : (
            visibleMessages.map((msg) => (
                <MessageBubble 
                    key={msg.id} 
                    msg={msg} 
                    isMe={msg.senderId === user.uid}
                    onContextMenu={handleContextMenu} 
                    onJumpTo={handleJumpTo}
                />
            ))
        )}
        {partnerTyping && <div className="text-xs text-gray-500 pl-4">Typing...</div>}
      </div>

      <div className="p-4 z-20 relative">
        {replyMessage && (
            <div className="mx-2 mb-2 bg-[#1a1a1a] border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between animate-in slide-in-from-bottom-2">
                <div className="border-l-4 border-indigo-500 pl-3">
                    <p className="text-xs text-indigo-400 font-bold mb-0.5">Replying to {replyMessage.senderId === user.uid ? "Yourself" : targetUser.name}</p>
                    <p className="text-sm text-gray-300 line-clamp-1">{replyMessage.text}</p>
                </div>
                <button onClick={() => setReplyMessage(null)} className="p-1 hover:bg-white/10 rounded-full text-gray-400"><X size={16} /></button>
            </div>
        )}

        <div className="bg-[#0a0a0a] border border-white/10 rounded-[24px] p-1.5 flex items-end gap-2 shadow-2xl ring-1 ring-white/5 focus-within:ring-indigo-500/50 transition-all">
            <textarea 
                ref={inputRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent border-none px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none text-[15px] resize-none max-h-32 min-h-[48px] scrollbar-thin"
                style={{ height: "auto", minHeight: "44px" }}
            />
            <button onClick={handleSend} disabled={!input.trim()} className={`mb-1 p-3 rounded-full transition-all duration-300 shadow-lg flex items-center justify-center shrink-0 ${input.trim() ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-white/5 text-gray-600 cursor-not-allowed"}`}>
                {replyMessage ? <CornerDownLeft size={20} /> : <Send size={20} fill={input.trim() ? "currentColor" : "none"} className={input.trim() ? "ml-0.5" : ""} />}
            </button>
        </div>
      </div>

      {contextMenu.visible && contextMenu.msg && (
        <div 
          style={{ top: contextMenu.y, left: contextMenu.x }}
          className="fixed z-50 w-40 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-scale-in"
          onClick={(e) => e.stopPropagation()}
        >
          <button onClick={() => { setReplyMessage(contextMenu.msg); closeContextMenu(); }} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 flex items-center gap-2">
            <Reply size={14} /> Reply
          </button>
          <button onClick={() => { navigator.clipboard.writeText(contextMenu.msg.text); closeContextMenu(); }} className="w-full text-left px-4 py-2.5 text-sm text-white hover:bg-white/10 flex items-center gap-2">
            <Copy size={14} /> Copy
          </button>

          {contextMenu.msg.senderId === user.uid && !contextMenu.msg.isDeleted && (
            <>
              <div className="h-px bg-white/10 my-1" />
              <button onClick={() => handleDeleteMessage(contextMenu.msg.id, true)} className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2">
                <Trash2 size={14} /> Unsend
              </button>
            </>
          )}
          <button onClick={() => handleDeleteMessage(contextMenu.msg.id, false)} className="w-full text-left px-4 py-2.5 text-sm text-gray-400 hover:bg-white/5 flex items-center gap-2">
            <Trash2 size={14} /> Delete for me
          </button>
        </div>
      )}

    </div>
  );
}