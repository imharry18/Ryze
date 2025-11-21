// src/app/messages/layout.js
"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, onSnapshot, query, where, doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, Search, MessageCircle } from "lucide-react";

export default function MessagesLayout({ children }) {
  const [user, setUser] = useState(null);
  const [chatList, setChatList] = useState([]); 
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const isMainPage = pathname === "/messages";

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) return;
      setUser(currentUser);

      // --- 1. FETCH CURRENT USER PROFILE (To get followers/following) ---
      // We need this to filter who shows up in the list
      let userProfile = {};
      try {
        const userSnap = await getDoc(doc(db, "users", currentUser.uid));
        if (userSnap.exists()) userProfile = userSnap.data();
      } catch (e) { console.error(e); }

      const following = userProfile.following || [];
      const followers = userProfile.followers || [];
      const friends = userProfile.friends || [];
      
      // Set of all UIDs relevant to the user
      const relevantUIDs = new Set([...following, ...followers, ...friends]);

      // --- 2. LISTENER FOR ALL USERS ---
      const usersRef = collection(db, "users");
      const unsubUsers = onSnapshot(usersRef, (usersSnap) => {
        const allUsersMap = {};
        usersSnap.docs.forEach(doc => {
          if (doc.id !== currentUser.uid) {
            allUsersMap[doc.id] = { uid: doc.id, ...doc.data() };
          }
        });

        // --- 3. LISTENER FOR CHATS (Realtime Badges) ---
        const chatsQuery = query(collection(db, "chats"), where("participants", "array-contains", currentUser.uid));
        
        const unsubChats = onSnapshot(chatsQuery, (chatSnapshot) => {
            const interactedUsers = [];
            const interactedUIDs = new Set();

            // Process Active Chats
            chatSnapshot.docs.forEach(chatDoc => {
                const data = chatDoc.data();
                // Find the "other" person in the chat
                const otherUserId = data.participants.find(id => id !== currentUser.uid);
                
                if(otherUserId && allUsersMap[otherUserId]) {
                    interactedUIDs.add(otherUserId);
                    interactedUsers.push({
                        ...allUsersMap[otherUserId], // User Data
                        lastMessage: data.lastMessage,
                        lastMessageAt: data.lastMessageAt?.seconds || 0,
                        unread: data.unreadCount?.[currentUser.uid] || 0, // BADGE NUMBER
                    });
                }
            });

            // Sort Interacted by Time (Newest first)
            interactedUsers.sort((a, b) => b.lastMessageAt - a.lastMessageAt);
            setChatList(interactedUsers);

            // Process Suggestions (Connected users but NO chat history)
            const suggestedUsers = [];
            relevantUIDs.forEach(uid => {
                if (!interactedUIDs.has(uid) && allUsersMap[uid]) {
                    suggestedUsers.push(allUsersMap[uid]);
                }
            });
            setSuggestions(suggestedUsers);
            
            setLoading(false);
        });

        // Cleanup inner listener when outer re-runs (rare)
        return () => unsubChats();
      });

      return () => unsubUsers();
    });

    return () => unsubAuth();
  }, []);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  // Component to render a single user item
  const UserItem = ({ person, isInteracted }) => {
    const isActive = pathname === `/messages/${person.uid}`;
    const hasUnread = person.unread > 0;

    return (
        <Link href={`/messages/${person.uid}`}>
            <div className={`
                flex items-center gap-4 p-3 rounded-2xl transition-all cursor-pointer relative mb-1
                ${isActive ? "bg-white/10 border border-white/10" : "hover:bg-white/5 border border-transparent"}
            `}>
                <div className="relative h-12 w-12 shrink-0">
                    <img src={person.dp || "/default-dp.png"} className="w-full h-full rounded-full object-cover bg-gray-800 border border-white/10" />
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                        <h3 className={`font-bold truncate text-sm ${hasUnread ? "text-white" : "text-gray-300"}`}>
                            {person.name}
                        </h3>
                        {/* TIME or UNREAD BADGE */}
                        {hasUnread ? (
                            <span className="bg-blue-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full shadow-lg shadow-blue-900/50">
                                {person.unread}
                            </span>
                        ) : (
                            isInteracted && (
                                <span className="text-[10px] text-gray-600">
                                    {person.lastMessageAt ? new Date(person.lastMessageAt * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ""}
                                </span>
                            )
                        )}
                    </div>
                    
                    {isInteracted ? (
                        <p className={`text-xs truncate mt-0.5 ${hasUnread ? "text-white font-medium" : "text-gray-500"}`}>
                            {person.lastMessage || "Sent an attachment"}
                        </p>
                    ) : (
                        <p className="text-[11px] text-blue-400 mt-0.5 flex items-center gap-1">
                           Start conversation
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
  };

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
            <div className="bg-white/5 border border-white/10 p-2 rounded-full">
                <MessageCircle size={18} className="text-gray-400" />
            </div>
          </div>
          
          <div className="bg-[#1a1a1a] rounded-xl flex items-center px-4 py-3 border border-white/5 focus-within:border-blue-500/50 transition-colors">
              <Search size={18} className="text-gray-500" />
              <input 
                placeholder="Search people..." 
                className="bg-transparent border-none focus:outline-none text-sm ml-3 text-white w-full placeholder:text-gray-600" 
              />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
            
            {/* 1. INTERACTED USERS (Above Line) */}
            <div className="mb-2">
                {chatList.length > 0 ? (
                    chatList.map((person) => <UserItem key={person.uid} person={person} isInteracted={true} />)
                ) : (
                    <div className="p-4 text-center text-gray-500 text-sm">No recent chats</div>
                )}
            </div>

            {/* DIVIDER */}
            {suggestions.length > 0 && (
                <>
                    <div className="flex items-center gap-2 my-4 px-2">
                        <div className="h-px bg-white/10 flex-1" />
                        <span className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">People you know</span>
                        <div className="h-px bg-white/10 flex-1" />
                    </div>

                    {/* 2. SUGGESTIONS (Below Line) */}
                    <div className="mb-2">
                        {suggestions.map((person) => <UserItem key={person.uid} person={person} isInteracted={false} />)}
                    </div>
                </>
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