"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Home, 
  Search, 
  PlusCircle, 
  MessageSquare, 
  TrendingUp, 
  Settings,
  Ghost,       // Icon for Confessions
  Megaphone    // Icon for Notices
} from "lucide-react";
import UploadMenu from "@/components/layout/UploadMenu";
import UploadModal from "@/components/upload/UploadModal";

export default function Sidebar() {
  const pathname = usePathname();
  const [isUploadMenuOpen, setIsUploadMenuOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadType, setUploadType] = useState(null);

  const openModal = (type) => {
    setUploadType(type);
    setIsUploadMenuOpen(false);
    setIsUploadModalOpen(true);
  };

  return (
    <>
      <aside className="hidden lg:block w-[280px] min-w-[280px] sticky top-24 h-[calc(100vh-120px)] z-50">
        <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 shadow-xl h-full flex flex-col animate-fadeIn">
          
          <nav className="space-y-2 flex-1">
            
            {/* 1. Home */}
            <SidebarLink 
              href="/" 
              icon={<Home size={24} />} 
              label="Home" 
              isActive={pathname === "/"} 
              activeColor="text-blue-400"
              iconColor="text-blue-500"
            />

            {/* 2. Search */}
            <SidebarLink 
              href="/search" 
              icon={<Search size={24} />} 
              label="Search" 
              isActive={pathname === "/search"} 
              activeColor="text-emerald-400"
              iconColor="text-emerald-500"
            />

            {/* 3. RyzeHot */}
            <SidebarLink 
              href="/hot-ryze" 
              icon={<TrendingUp size={24} />} 
              label="RyzeHot" 
              isActive={pathname === "/hot-ryze"} 
              activeColor="text-rose-400"
              iconColor="text-rose-500"
            />

            {/* 4. Confessions (New) */}
            <SidebarLink 
              href="/confessions" 
              icon={<Ghost size={24} />} 
              label="Confessions" 
              isActive={pathname === "/confessions"} 
              activeColor="text-pink-400"
              iconColor="text-pink-500"
            />

            {/* 5. Notices (New) */}
            <SidebarLink 
              href="/notices" 
              icon={<Megaphone size={24} />} 
              label="Notices" 
              isActive={pathname === "/notices"} 
              activeColor="text-orange-400"
              iconColor="text-orange-500"
            />

            {/* 6. Messages */}
            <SidebarLink 
              href="/messages" 
              icon={<MessageSquare size={24} />} 
              label="Messages" 
              isActive={pathname.startsWith("/messages")} 
              activeColor="text-purple-400"
              iconColor="text-purple-500"
            />

            {/* 7. Upload */}
            <div 
              className="relative"
              onMouseEnter={() => setIsUploadMenuOpen(true)}
              onMouseLeave={() => setIsUploadMenuOpen(false)}
            >
                <button
                  className={`
                    w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 group 
                    text-gray-400 hover:bg-white/5 hover:text-gray-200 border border-transparent
                    ${isUploadMenuOpen ? "bg-white/5 text-white" : ""}
                  `}
                >
                  <div className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 group-hover:scale-110 transition-transform text-cyan-500`}>
                    <PlusCircle size={24} />
                  </div>
                  <span className="text-base font-medium tracking-wide">Upload</span>
                </button>
                
                {/* Dropdown Menu */}
                {isUploadMenuOpen && (
                    <div className="absolute left-full top-0 ml-4 z-50">
                        <UploadMenu close={() => setIsUploadMenuOpen(false)} openModal={openModal} />
                        {/* Decorative Arrow */}
                        <div className="absolute top-4 -left-1.5 w-3 h-3 bg-[#18181b] border-l border-b border-white/10 transform rotate-45" />
                    </div>
                )}
            </div>

            {/* 8. Settings */}
            <SidebarLink 
              href="/settings" 
              icon={<Settings size={24} />} 
              label="Settings" 
              isActive={pathname === "/settings"} 
              activeColor="text-white"
              iconColor="text-gray-400"
            />

          </nav>
        </div>
      </aside>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <UploadModal
          uploadType={uploadType}
          isOpen={isUploadModalOpen}
          onClose={() => setIsUploadModalOpen(false)}
        />
      )}
    </>
  );
}

// Helper Component
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