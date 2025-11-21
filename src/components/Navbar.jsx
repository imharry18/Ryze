"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { doc, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";

import {
  Menu,
  X,
  User,
  Settings,
  LogOut,
  Bell
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useNotifications } from "@/hooks/useNotifications";
import { auth, db } from "@/lib/firebase";

import { Button } from "./ui/Button";

export default function Navbar() {

  const { user, loading } = useAuth();
  // Fetch notification count
  const { requestCount } = useNotifications(user?.uid); 

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAccountMenu, setIsAccountMenu] = useState(false);
  
  // State for Firestore Profile Data
  const [profile, setProfile] = useState(null);

  // Fetch Firestore Profile (Username & DP) Realtime
  useEffect(() => {
    if (!user?.uid) return;

    const unsub = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data());
      }
    });

    return () => unsub();
  }, [user]);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  if (loading) {
    return (
      <nav className="w-full fixed top-0 left-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          {/* Minimal Loading State */}
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full fixed top-0 left-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">

        {/* LEFT: LOGO */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="RYZE Logo"
            width={32}
            height={32}
            className="h-8 w-auto brightness-110"
          />
          <span className="text-xl font-bold text-white tracking-wider">
            RYZE
          </span>
        </Link>

        {/* RIGHT: ACTIONS */}
        <div className="flex items-center gap-4">

          {user ? (
            <>
              {/* 1. Notifications */}
              <Link href="/dashboard" className="relative group">
                  <div className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-full transition">
                      <Bell size={22} />
                  </div>
                  {requestCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-600 text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border-2 border-black">
                          {requestCount}
                      </span>
                  )}
              </Link>

              {/* 2. Profile & Username */}
              <div className="relative">
                <div 
                  className="flex items-center gap-3 cursor-pointer p-1 pr-4 rounded-full hover:bg-white/10 transition border border-transparent hover:border-white/10"
                  onClick={() => setIsAccountMenu(!isAccountMenu)}
                >
                  <div className="relative h-8 w-8 rounded-full overflow-hidden border border-white/20 bg-gray-800">
                      <Image 
                          // Priority: Firestore DP -> Auth Photo -> Default
                          src={profile?.dp || user.photoURL || "/default-dp.png"} 
                          alt="Profile" 
                          fill 
                          className="object-cover"
                      />
                  </div>
                  <span className="hidden md:block text-sm font-bold text-white max-w-[150px] truncate">
                      {/* Priority: Firestore Username -> Auth DisplayName -> Fallback */}
                      {profile?.username || user.displayName || "User"}
                  </span>
                </div>

                {/* Account Dropdown */}
                {isAccountMenu && (
                  <div className="absolute right-0 mt-2 bg-[#121212] text-white w-56 rounded-xl shadow-2xl border border-white/10 backdrop-blur-xl py-2 z-50 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-white/10 mb-2">
                      <p className="text-sm font-bold text-white">
                        @{profile?.username || "username"}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>

                    <Link
                      href="/profile"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-gray-300 hover:text-white transition"
                      onClick={() => setIsAccountMenu(false)}
                    >
                      <User size={16} /> My Profile
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 text-sm text-gray-300 hover:text-white transition"
                      onClick={() => setIsAccountMenu(false)}
                    >
                      <Settings size={16} /> Settings
                    </Link>

                    <div className="h-px bg-white/10 my-2" />

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 w-full text-left hover:bg-red-500/10 text-red-400 transition text-sm"
                    >
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* LOGGED OUT STATE */
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-gray-300 hover:text-white transition px-2">
                Log In
              </Link>
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-6">
                <Link href="/register">Sign Up</Link>
              </Button>
            </div>
          )}

          {/* MOBILE MENU TOGGLE */}
          <button
            className="md:hidden text-white ml-2"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

        </div>
      </div>
    </nav>
  );
}