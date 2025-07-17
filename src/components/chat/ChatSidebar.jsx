"use client";

import { useEffect, useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Search, MessageCircle } from "lucide-react";
import UserRow from "./UserRow"; 

export default function ChatSidebar({ user, className }) {
  const pathname = usePathname();
  const [usersMap, setUsersMap] = useState({});
  const [chatsData, setChatsData] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchSidebarData = async () => {
      try {
        const res = await fetch(`/api/chats/sidebar?userId=${user.uid}`);
        if (res.ok) {
          const data = await res.json();
          setUsersMap(data.usersMap || {});
          setChatsData(data.chats || []);
        }
      } catch (err) {
        console.error("Failed to load sidebar data", err);
      }
    };

    fetchSidebarData();
    // Poll every 5 seconds to simulate real-time updates
    const intervalId = setInterval(fetchSidebarData, 5000);
    return () => clearInterval(intervalId);
  }, [user]);

  const { interactedUsers, suggestedUsers } = useMemo(() => {
    if (!user) return { interactedUsers: [], suggestedUsers: [] };

    const lowerTerm = searchTerm.toLowerCase(); 
    const myProfile = usersMap[user.uid];
    const myFollowingList = myProfile?.following || []; 

    const interactedList = [];
    const interactedIDs = new Set();

    chatsData.forEach((chat) => {
      const otherUserId = chat.participants.find((id) => id !== user.uid);
      if (otherUserId && usersMap[otherUserId]) {
        const partner = usersMap[otherUserId];
        
        if (!partner.name.toLowerCase().includes(lowerTerm)) return;

        interactedIDs.add(otherUserId);
        
        let dbCount = chat.unreadCount?.[user.uid] || 0;
        const isChatOpen = pathname === `/messages/${otherUserId}`;
        const finalCount = isChatOpen ? 0 : dbCount;

        interactedList.push({
          ...partner,
          lastMessage: chat.lastMessage,
          lastMessageAt: chat.lastMessageAt || 0,
          unread: finalCount,
        });
      }
    });

    interactedList.sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    const suggestionList = Object.values(usersMap)
      .filter((u) => {
        if (u.uid === user.uid) return false; 
        if (interactedIDs.has(u.uid)) return false; 
        if (!myFollowingList.includes(u.uid)) return false;
        
        return u.name.toLowerCase().includes(lowerTerm);
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return { interactedUsers: interactedList, suggestedUsers: suggestionList };
  }, [usersMap, chatsData, user, pathname, searchTerm]); 

  return (
    <aside className={`flex flex-col bg-[#050505] border-r border-white/5 h-full ${className}`}>
        <div className="p-5 pb-2 z-10">
          <div className="flex justify-between items-center mb-5">
            <h1 className="text-2xl font-bold text-white tracking-wide">Chats</h1>
            <div className="p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 transition-colors cursor-pointer group">
              <MessageCircle size={18} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
            </div>
          </div>
          
          <div className="group relative mb-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={15} className="text-gray-600 group-focus-within:text-cyan-400 transition-colors duration-300" />
            </div>
            <input 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search people..." 
              className="w-full bg-[#0f0f0f] border border-white/10 text-sm text-gray-300 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 focus:bg-[#141414] placeholder:text-gray-700 transition-all duration-300" 
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
          
          {interactedUsers.map((person) => (
            <UserRow 
              key={person.uid} 
              person={person} 
              isInteracted={true} 
              isActive={pathname === `/messages/${person.uid}`} 
            />
          ))}
          
          {interactedUsers.length === 0 && (
            <div className="text-center py-12 opacity-30 select-none">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500">No chats found</p>
            </div>
          )}

          {suggestedUsers.length > 0 && (
            <div className="pt-6 pb-3 px-2">
              <div className="flex items-center gap-3 opacity-40">
                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-cyan-300/70">People</span>
                <div className="h-px bg-gradient-to-r from-cyan-500/30 to-transparent flex-1" />
              </div>
            </div>
          )}

          <div className="space-y-1">
            {suggestedUsers.map((person) => (
              <UserRow 
                key={person.uid} 
                person={person} 
                isInteracted={false} 
                isActive={pathname === `/messages/${person.uid}`} 
              />
            ))}
            
            {suggestedUsers.length === 0 && interactedUsers.length > 0 && searchTerm && (
               <div className="text-center py-8 px-6">
                  <p className="text-xs text-gray-700">No matches found.</p>
               </div>
            )}
          </div>
        </div>
    </aside>
  );
}