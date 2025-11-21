"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { 
  Home, Search, PlusCircle, MessageSquare, TrendingUp, Settings, Ghost, Megaphone 
} from "lucide-react";
import UploadMenu from "@/components/layout/UploadMenu";
import UploadModal from "@/components/upload/UploadModal";

export default function Sidebar() {
  const pathname = usePathname();
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [user, setUser] = useState(null);

  const openModal = (type) => {
    setUploadType(type);
    setIsUploadMenuOpen(false);
    setIsUploadModalOpen(true);
  };

  // Global Unread Listener
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
            const q = query(collection(db, "chats"), where("participants", "array-contains", currentUser.uid));
            const unsubChats = onSnapshot(q, (snap) => {
                let count = 0;
                snap.docs.forEach(doc => {
                    const data = doc.data();
                    count += (data.unreadCount?.[currentUser.uid] || 0);
                });
                setTotalUnread(count);
            });
            return () => unsubChats();
        }
    });
    return () => unsubAuth();
  }, []);

  return (
    <>
      <aside className="hidden lg:block w-[280px] min-w-[280px] sticky top-24 h-[calc(100vh-120px)] z-50">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-xl h-full flex flex-col animate-fadeIn">
          <nav className="space-y-2 flex-1">
            
            <SidebarLink href="/" icon={<Home size={24} />} label="Home" isActive={pathname === "/"} activeColor="text-blue-400" iconColor="text-blue-500" />
            <SidebarLink href="/search" icon={<Search size={24} />} label="Search" isActive={pathname === "/search"} activeColor="text-emerald-400" iconColor="text-emerald-500" />
            <SidebarLink href="/hot-ryze" icon={<TrendingUp size={24} />} label="RyzeHot" isActive={pathname === "/hot-ryze"} activeColor="text-rose-400" iconColor="text-rose-500" />
            <SidebarLink href="/confessions" icon={<Ghost size={24} />} label="Confessions" isActive={pathname === "/confessions"} activeColor="text-pink-400" iconColor="text-pink-500" />
            <SidebarLink href="/notices" icon={<Megaphone size={24} />} label="Notices" isActive={pathname === "/notices"} activeColor="text-orange-400" iconColor="text-orange-500" />

            {/* MESSAGES WITH BADGE */}
            <Link 
              href="/messages" 
              className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group relative ${
                pathname.startsWith("/messages") 
                  ? `bg-white/10 text-purple-400 font-bold border border-white/5` 
                  : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent"
              }`}
            >
              <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 transition-transform duration-300 ${pathname.startsWith("/messages") ? "scale-110" : "group-hover:scale-110"} text-purple-500`}>
                <MessageSquare size={24} />
              </div>
              <span className="text-base font-medium tracking-wide whitespace-nowrap">Messages</span>
              
              {totalUnread > 0 && (
                  <span className="absolute right-3 bg-red-600 text-white text-[10px] font-bold h-5 min-w-[20px] px-1.5 flex items-center justify-center rounded-full border-2 border-[#121212]">
                      {totalUnread}
                  </span>
              )}
            </Link>

            {/* Upload Button */}
            <div 
              className="relative"
              onMouseEnter={() => setIsUploadMenuOpen(true)}
              onMouseLeave={() => setIsUploadMenuOpen(false)}
            >
                <button className="w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent">
                  <div className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 group-hover:scale-110 transition-transform text-cyan-500">
                    <PlusCircle size={24} />
                  </div>
                  <span className="text-base font-medium tracking-wide">Upload</span>
                </button>
                {isUploadMenuOpen && (
                    <div className="absolute left-full top-0 ml-4 z-50">
                        <UploadMenu close={() => setIsUploadMenuOpen(false)} openModal={openModal} />
                        <div className="absolute top-4 -left-1.5 w-3 h-3 bg-[#18181b] border-l border-b border-white/10 transform rotate-45" />
                    </div>
                )}
            </div>

            <SidebarLink href="/settings" icon={<Settings size={24} />} label="Settings" isActive={pathname === "/settings"} activeColor="text-white" iconColor="text-gray-400" />

          </nav>
        </div>
      </aside>

      {isUploadModalOpen && (
        <UploadModal uploadType={uploadType} isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} />
      )}
    </>
  );
}

function SidebarLink({ href, icon, label, isActive, activeColor, iconColor }) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group ${
        isActive 
          ? `bg-white/10 ${activeColor} font-bold border border-white/5` 
          : "text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent"
      }`}
    >
      <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 transition-transform duration-300 ${isActive ? "scale-110" : "group-hover:scale-110"} ${iconColor}`}>
        {icon}
      </div>
      <span className="text-base font-medium tracking-wide whitespace-nowrap">{label}</span>
    </Link>
  );
}