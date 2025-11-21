"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, Search } from "lucide-react";

export default function MessagesLayout({ children }) {
  const [user, setUser] = useState(null);
  const [chatList, setChatList] = useState([]); 
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const isMainPage = pathname === "/messages";

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) return;
      setUser(currentUser);

      // 1. FETCH ALL USERS
      const usersRef = collection(db, "users");
      const unsubUsers = onSnapshot(usersRef, async (usersSnap) => {
        
        const allUsers = usersSnap.docs
            .map(d => ({ uid: d.id, ...d.data() }))
            .filter(u => u.uid !== currentUser.uid);

        // 2. FETCH ACTIVE CHATS (For Sorting & Badges)
        const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", currentUser.uid));
        
        const unsubChats = onSnapshot(chatsQuery, (chatSnapshot) => {
            const activeChatsMap = {};
            
            chatSnapshot.docs.forEach(doc => {
                const data = doc.data();
                const otherUserId = data.participants.find(id => id !== currentUser.uid);
                if(otherUserId) {
                    activeChatsMap[otherUserId] = {
                        lastMessage: data.lastMessage,
                        lastMessageAt: data.lastMessageAt?.seconds || 0,
                        unread: data.unreadCount?.[currentUser.uid] || 0
                    };
                }
            });

            // 3. MERGE & SORT
            const finalSortedList = allUsers.map(user => ({
                ...user,
                ...activeChatsMap[user.uid]
            })).sort((a, b) => {
                // Active chats first (by time), then alphabetical
                const timeA = a.lastMessageAt || 0;
                const timeB = b.lastMessageAt || 0;
                return timeB - timeA; 
            });

            setChatList(finalSortedList);
            setLoading(false);
        });
      });

      return () => unsubUsers();
    });

    return () => unsubAuth();
  }, []);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-black text-white overflow-hidden gap-4 p-4">
      
      {/* --- LEFT SIDEBAR --- */}
      <aside className={`
        w-full md:w-[360px] lg:w-[400px] flex-shrink-0 flex flex-col bg-[#0c0c0f] 
        rounded-3xl border border-white/10 shadow-2xl overflow-hidden
        ${isMainPage ? "block" : "hidden md:flex"} 
      `}>
        
        {/* Header */}
        <div className="p-5 pb-3 bg-[#0c0c0f] z-10">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Chats</h1>
            <div className="bg-blue-500/10 p-2 rounded-full">
                <span className="text-blue-400 text-xs font-bold px-1">
                    {chatList.reduce((acc, curr) => acc + (curr.unread || 0), 0)} New
                </span>
            </div>
          </div>
          
          {/* Search */}
          <div className="bg-[#1a1a1a] rounded-xl flex items-center px-4 py-3 border border-white/5 focus-within:border-blue-500/50 transition-colors">
              <Search size={18} className="text-gray-500" />
              <input 
                placeholder="Search people..." 
                className="bg-transparent border-none focus:outline-none text-sm ml-3 text-white w-full placeholder:text-gray-600" 
              />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-1 custom-scrollbar">
            {chatList.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No users found.</div>
            ) : (
                chatList.map((person) => {
                    const isActive = pathname === `/messages/${person.uid}`;
                    const hasUnread = person.unread > 0;

                    return (
                        <Link key={person.uid} href={`/messages/${person.uid}`}>
                            <div className={`
                                flex items-center gap-4 p-3 rounded-2xl transition-all cursor-pointer relative
                                ${isActive ? "bg-blue-600/10 border border-blue-600/30" : "hover:bg-white/5 border border-transparent"}
                            `}>
                                <div className="relative h-12 w-12 shrink-0">
                                    <img src={person.dp || "/default-dp.png"} className="w-full h-full rounded-full object-cover bg-gray-800 border border-white/10" />
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center">
                                        <h3 className={`font-bold truncate text-sm ${hasUnread ? "text-white" : "text-gray-300"}`}>
                                            {person.name}
                                        </h3>
                                        {hasUnread ? (
                                            <span className="bg-blue-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full">
                                                {person.unread}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-gray-600">
                                                {person.lastMessageAt ? new Date(person.lastMessageAt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <p className={`text-xs truncate mt-0.5 ${hasUnread ? "text-white font-medium" : "text-gray-500"}`}>
                                        {person.lastMessage || "Say Hello 👋"}
                                    </p>
                                </div>
                            </div>
                        </Link>
                    );
                })
            )}
        </div>
      </aside>

      {/* --- RIGHT SIDE --- */}
      <main className={`
        flex-1 flex flex-col h-full relative bg-[#0c0c0f] rounded-3xl border border-white/10 overflow-hidden shadow-2xl
        ${isMainPage ? "hidden md:flex" : "flex"}
      `}>
        {children}
      </main>

    </div>
  );
}