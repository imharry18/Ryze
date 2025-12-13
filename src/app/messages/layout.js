"use client";

import { useAuth } from "@/hooks/useAuth"; // Uses NextAuth
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import ChatSidebar from "@/components/chat/ChatSidebar"; 
import { useEffect } from "react";

export default function MessagesLayout({ children }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const isMainPage = pathname === "/messages";

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <div className="h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;
  
  // Protect route
  if (!user) return null; 

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