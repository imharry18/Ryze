"use client";

import { useEffect, useState, useMemo } from "react";
import { db } from "@/lib/firebase"; 
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { usePathname } from "next/navigation";
import { Search, MessageCircle } from "lucide-react";
import UserRow from "./UserRow"; 

export default function ChatSidebar({ user, className }) {
  const pathname = usePathname();
  const [usersMap, setUsersMap] = useState({});
  const [chatsData, setChatsData] = useState([]);

  // 1. Fetch All Users
  useEffect(() => {
    if (!user) return;
    const unsub = onSnapshot(collection(db, "users"), (snap) => {
      const map = {};
      snap.docs.forEach((doc) => {
        if (doc.id !== user.uid) map[doc.id] = { uid: doc.id, ...doc.data() };
      });
      setUsersMap(map);
    });
    return () => unsub();
  }, [user]);

  // 2. Fetch My Chats
  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "chats"), where("participants", "array-contains", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setChatsData(snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  // 3. Process Lists
  const { interactedUsers, suggestedUsers } = useMemo(() => {
    if (!user) return { interactedUsers: [], suggestedUsers: [] };

    const interactedList = [];
    const interactedIDs = new Set();

    chatsData.forEach((chat) => {
      const otherUserId = chat.participants.find((id) => id !== user.uid);
      if (otherUserId && usersMap[otherUserId]) {
        interactedIDs.add(otherUserId);
        
        // --- CORE LOGIC FIX ---
        // 1. Get count from DB
        let dbCount = chat.unreadCount?.[user.uid] || 0;
        
        // 2. Check if this chat is currently open
        const isChatOpen = pathname === `/messages/${otherUserId}`;
        
        // 3. If open, force count to 0 (Visually hide badge instantly)
        const finalCount = isChatOpen ? 0 : dbCount;

        interactedList.push({
          ...usersMap[otherUserId],
          lastMessage: chat.lastMessage,
          lastMessageAt: chat.lastMessageAt?.seconds || 0,
          unread: finalCount, // Pass the processed count
        });
      }
    });

    interactedList.sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    const suggestionList = Object.values(usersMap)
      .filter((u) => !interactedIDs.has(u.uid))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { interactedUsers: interactedList, suggestedUsers: suggestionList };
  }, [usersMap, chatsData, user, pathname]); // Added pathname dependency

  return (
    <aside className={`flex flex-col bg-[#0c0c0f] h-full ${className}`}>
        {/* Header */}
        <div className="p-5 pb-3 bg-[#0c0c0f] z-10">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold text-white">Chats</h1>
            <div className="bg-white/5 border border-white/10 p-2 rounded-full">
              <MessageCircle size={18} className="text-gray-400" />
            </div>
          </div>
          <div className="bg-[#1a1a1a] rounded-xl flex items-center px-4 py-3 border border-white/5 focus-within:border-blue-500/50 transition-colors">
            <Search size={18} className="text-gray-500" />
            <input placeholder="Search people..." className="bg-transparent border-none focus:outline-none text-sm ml-3 text-white w-full placeholder:text-gray-600" />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
          <div className="mb-2">
            {interactedUsers.map((person) => (
              <UserRow 
                key={person.uid} 
                person={person} 
                isInteracted={true} 
                isActive={pathname === `/messages/${person.uid}`} 
              />
            ))}
            {interactedUsers.length === 0 && <div className="text-center py-6 text-gray-600 text-xs">No active chats</div>}
          </div>

          {suggestedUsers.length > 0 && (
            <div className="flex items-center gap-3 my-4 px-2 opacity-50">
              <div className="h-px bg-white/20 flex-1" />
              <span className="text-[10px] uppercase tracking-widest text-gray-400">People</span>
              <div className="h-px bg-white/20 flex-1" />
            </div>
          )}

          <div className="mb-2 opacity-80">
            {suggestedUsers.map((person) => (
              <UserRow 
                key={person.uid} 
                person={person} 
                isInteracted={false} 
                isActive={pathname === `/messages/${person.uid}`} 
              />
            ))}
          </div>
        </div>
    </aside>
  );
}