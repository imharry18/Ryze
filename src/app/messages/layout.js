"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar"; 

export default function MessagesLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const isMainPage = pathname === "/messages";

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) setUser(currentUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="flex h-[calc(100vh-80px)] bg-black text-white overflow-hidden gap-4 p-4">
      <div className={`
        w-full md:w-[360px] lg:w-[400px] flex-shrink-0 rounded-3xl border border-white/10 shadow-2xl overflow-hidden
        ${isMainPage ? "block" : "hidden md:block"} 
      `}>
         <ChatSidebar user={user} className="h-full" />
      </div>

      <main className={`
        flex-1 flex flex-col h-full relative bg-[#0c0c0f] rounded-3xl border border-white/10 overflow-hidden shadow-2xl
        ${isMainPage ? "hidden md:flex" : "flex"}
      `}>
        {children}
      </main>
    </div>
  );
}