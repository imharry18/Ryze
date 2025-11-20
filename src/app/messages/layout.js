"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, onSnapshot, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Loader2, MessageSquare, Search } from "lucide-react";

export default function MessagesLayout({ children }) {
  const [user, setUser] = useState(null);
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Check if we are on the main /messages page (to toggle mobile view)
  const isMainPage = pathname === "/messages";

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) return;
      setUser(currentUser);

      // Real-time listener for User's Friend List
      const userRef = doc(db, "users", currentUser.uid);
      const unsubUser = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.friends && data.friends.length > 0) {
            // Fetch friend details
            // Note: For production, consider creating a separate 'users' index or limiting this
            const promises = data.friends.map((fid) => getDoc(doc(db, "users", fid)));
            const results = await Promise.all(promises);
            setFriends(results.map((r) => ({ uid: r.id, ...r.data() })));
          }
          setLoading(false);
        }
      });

      return () => unsubUser();
    });

    return () => unsubAuth();
  }, []);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-black text-white overflow-hidden">
      
      {/* --- LEFT SIDEBAR (Chat List) --- */}
      <aside className={`
        w-full md:w-[350px] lg:w-[400px] flex-shrink-0 border-r border-white/10 flex flex-col bg-[#0c0c0f]
        ${isMainPage ? "block" : "hidden md:flex"} 
      `}>
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <h1 className="text-xl font-bold">Chats</h1>
          <MessageSquare className="text-blue-500" />
        </div>

        {/* Search (Visual only for now) */}
        <div className="p-3">
            <div className="bg-[#1a1a1a] rounded-lg flex items-center px-3 py-2">
                <Search size={18} className="text-gray-500" />
                <input placeholder="Search friends..." className="bg-transparent border-none focus:outline-none text-sm ml-2 text-white w-full" />
            </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
            {friends.length === 0 ? (
                <div className="p-6 text-center text-gray-500 mt-10">
                    <p>No friends yet.</p>
                    <Link href="/search" className="text-blue-400 text-sm hover:underline">Find people</Link>
                </div>
            ) : (
                friends.map((friend) => {
                    const isActive = pathname === `/messages/${friend.uid}`;
                    return (
                        <Link key={friend.uid} href={`/messages/${friend.uid}`}>
                            <div className={`flex items-center gap-3 p-4 hover:bg-white/5 transition cursor-pointer ${isActive ? "bg-white/10 border-l-4 border-blue-500" : ""}`}>
                                <div className="relative h-12 w-12">
                                    <img src={friend.dp || "/default-dp.png"} className="w-full h-full rounded-full object-cover" />
                                    {/* Online Dot (Mock) */}
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <h3 className="font-semibold truncate">{friend.name}</h3>
                                        <span className="text-xs text-gray-500">12:30 PM</span>
                                    </div>
                                    <p className="text-sm text-gray-400 truncate">Click to start chatting</p>
                                </div>
                            </div>
                        </Link>
                    );
                })
            )}
        </div>
      </aside>

      {/* --- RIGHT SIDE (Main Content) --- */}
      <main className={`flex-1 flex flex-col h-full ${isMainPage ? "hidden md:flex" : "flex"}`}>
        {children}
      </main>

    </div>
  );
}