"use client";

import { useEffect, useState, useMemo } from "react";
import { auth, db } from "@/lib/firebase"; 
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, Search, MessageCircle } from "lucide-react";

// --- EXTRACTED USER ROW COMPONENT ---
const UserRow = ({ person, isInteracted, isActive }) => {
  // Check for unread messages
  const unreadCount = Number(person.unread || 0);
  const hasUnread = unreadCount > 0;

  // Format time
  const timeDisplay = person.lastMessageAt
    ? new Date(person.lastMessageAt * 1000).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  // --- DYNAMIC STYLING LOGIC ---
  let containerStyle = "flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer relative group mb-1 ";
  
  if (hasUnread) {
    // 1. RED BACKGROUND if unread (as requested)
    containerStyle += "bg-red-900/40 border border-red-500/30 hover:bg-red-900/60";
  } else if (isActive) {
    // Active State (Selected)
    containerStyle += "bg-white/10 border border-white/10";
  } else {
    // Default / Hover State
    containerStyle += "hover:bg-white/5 border border-transparent";
  }

  return (
    <Link href={`/messages/${person.uid}`} className="block">
      <div className={containerStyle}>
        
        {/* Avatar */}
        <div className={`relative h-12 w-12 shrink-0 rounded-full overflow-hidden border ${hasUnread ? "border-red-400" : "border-white/10"}`}>
          <img
            src={person.dp || "/default-dp.png"}
            className="w-full h-full object-cover bg-gray-800"
            alt={person.name}
          />
        </div>

        <div className="flex-1 min-w-0 flex flex-col justify-center">
          {/* Name Row */}
          <div className="flex justify-between items-center">
            <h3
              className={`font-bold truncate text-sm ${
                hasUnread ? "text-white" : "text-gray-300 group-hover:text-white"
              }`}
            >
              {person.name}
            </h3>
            
            {/* Time Display */}
            {isInteracted && (
              <span
                className={`text-[10px] whitespace-nowrap ml-2 ${
                  hasUnread ? "text-red-200 font-medium" : "text-gray-600 group-hover:text-gray-500"
                }`}
              >
                {timeDisplay}
              </span>
            )}
          </div>

          {/* 2. MESSAGE PREVIEW (Hidden if unread) */}
          {/* Only show the preview text if the message has been READ */}
          {!hasUnread && (
            <div className="flex justify-between items-center mt-0.5">
              <p className="text-xs truncate text-gray-500 pr-2">
                {isInteracted ? (
                  person.lastMessage || "Attachment"
                ) : (
                  <span className="text-blue-400">Start conversation</span>
                )}
              </p>
            </div>
          )}
          
          {/* If unread, you can optionally add a small label like "New Message" if you want, 
              but based on your request, we just hide the preview text. */}
        </div>
      </div>
    </Link>
  );
};

export default function MessagesLayout({ children }) {
  const [user, setUser] = useState(null);

  // Raw Data State
  const [usersMap, setUsersMap] = useState({});
  const [chatsData, setChatsData] = useState([]);
  const [loading, setLoading] = useState(true);

  const pathname = usePathname();
  const isMainPage = pathname === "/messages";

  // 1. Auth
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) return;
      setUser(currentUser);
    });
    return () => unsubAuth();
  }, []);

  // 2. Listen to ALL Users
  useEffect(() => {
    if (!user) return;
    const usersRef = collection(db, "users");
    const unsubUsers = onSnapshot(usersRef, (usersSnap) => {
      const map = {};
      usersSnap.docs.forEach((doc) => {
        if (doc.id !== user.uid) {
          map[doc.id] = { uid: doc.id, ...doc.data() };
        }
      });
      setUsersMap(map);
    });
    return () => unsubUsers();
  }, [user]);

  // 3. Listen to CHATS
  useEffect(() => {
    if (!user) return;
    
    const chatsQuery = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid)
    );

    const unsubChats = onSnapshot(chatsQuery, (chatSnapshot) => {
      const rawChats = chatSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setChatsData(rawChats);
      setLoading(false);
    });

    return () => unsubChats();
  }, [user]);

  // 4. Compute Lists
  const { interactedUsers, suggestedUsers } = useMemo(() => {
    if (!user || loading) return { interactedUsers: [], suggestedUsers: [] };

    const interactedList = [];
    const interactedIDs = new Set();

    chatsData.forEach((chat) => {
      const otherUserId = chat.participants.find((id) => id !== user.uid);

      if (otherUserId && usersMap[otherUserId]) {
        interactedIDs.add(otherUserId);

        const myUnreadCount = chat.unreadCount?.[user.uid] || 0;

        interactedList.push({
          ...usersMap[otherUserId],
          lastMessage: chat.lastMessage,
          lastMessageAt: chat.lastMessageAt?.seconds || 0,
          unread: myUnreadCount,
        });
      }
    });

    interactedList.sort((a, b) => b.lastMessageAt - a.lastMessageAt);

    const suggestionList = Object.values(usersMap)
      .filter((u) => !interactedIDs.has(u.uid))
      .sort((a, b) => a.name.localeCompare(b.name));

    return { interactedUsers: interactedList, suggestedUsers: suggestionList };
  }, [usersMap, chatsData, user, loading]);

  if (loading)
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-500" />
      </div>
    );

  return (
    <div className="flex h-[calc(100vh-80px)] bg-black text-white overflow-hidden gap-4 p-4">
      {/* SIDEBAR */}
      <aside
        className={`
        w-full md:w-[360px] lg:w-[400px] flex-shrink-0 flex flex-col bg-[#0c0c0f] 
        rounded-3xl border border-white/10 shadow-2xl overflow-hidden
        ${isMainPage ? "block" : "hidden md:flex"} 
      `}
      >
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

        <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
          {/* INTERACTED */}
          <div className="mb-2">
            {interactedUsers.map((person) => (
              <UserRow
                key={person.uid}
                person={person}
                isInteracted={true}
                isActive={pathname === `/messages/${person.uid}`}
              />
            ))}
            {interactedUsers.length === 0 && (
              <div className="text-center py-6 text-gray-600 text-xs">
                No active chats
              </div>
            )}
          </div>

          {/* DIVIDER */}
          {suggestedUsers.length > 0 && (
            <div className="flex items-center gap-3 my-4 px-2 opacity-50">
              <div className="h-px bg-white/20 flex-1" />
              <span className="text-[10px] uppercase tracking-widest text-gray-400">
                People
              </span>
              <div className="h-px bg-white/20 flex-1" />
            </div>
          )}

          {/* SUGGESTED */}
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

      {/* RIGHT CONTENT */}
      <main
        className={`
        flex-1 flex flex-col h-full relative bg-[#0c0c0f] rounded-3xl border border-white/10 overflow-hidden shadow-2xl
        ${isMainPage ? "hidden md:flex" : "flex"}
      `}
      >
        {children}
      </main>
    </div>
  );
}