"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

import {
  Menu,
  X,
  PlusCircle,
  MessageSquare,
  User,
  Settings,
  LogOut,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";

import UploadMenu from "@/components/layout/UploadMenu";
import UploadModal from "@/components/upload/UploadModal";

import { Button } from "./ui/Button";

export default function Navbar() {

  const { user, loading } = useAuth(); // NOW PROPER LOADING SUPPORT

  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isAccountMenu, setIsAccountMenu] = useState(false);
  const [isUploadMenu, setIsUploadMenu] = useState(false);
  const [uploadType, setUploadType] = useState(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleLogout = async () => {
    await signOut(auth);
    window.location.href = "/login";
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/hot-ryze", label: "HotRyze" },
    { href: "/search", label: "Search" },
    { href: "/events", label: "Events" },
  ];

  // ------------------------------------
  // 🔥 FIX: do NOT render anything until auth loads
  // ------------------------------------
  if (loading) {
    return (
      <nav className="w-full fixed top-0 left-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 py-3">
          <div className="text-white/60">Loading...</div>
        </div>
      </nav>
    );
  }

  return (
    <>
      <nav className="w-full fixed top-0 left-0 z-50 bg-black/60 backdrop-blur-xl border-b border-white/10 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3">

          {/* LOGO */}
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="RYZE Logo"
              width={40}
              height={40}
              className="h-8 w-auto brightness-110"
            />
            <span className="text-2xl font-bold text-white tracking-wide">
              RYZE
            </span>
          </Link>

          {/* CENTER LINKS */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-white/70 hover:text-white text-sm font-medium transition-all hover:scale-110"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* RIGHT SIDE */}
          <div className="hidden md:flex items-center gap-6">

            {/* UPLOAD */}
            {user && (
              <div className="relative">
                <PlusCircle
                  className="h-7 w-7 text-white hover:text-blue-400 cursor-pointer transition active:scale-90"
                  onClick={() => {
                    setIsUploadMenu(!isUploadMenu);
                    setIsAccountMenu(false);
                  }}
                />

                {isUploadMenu && (
                  <UploadMenu
                    close={() => setIsUploadMenu(false)}
                    openModal={(type) => {
                      setUploadType(type);
                      setIsUploadMenu(false);
                      setIsUploadModalOpen(true);
                    }}
                  />
                )}
              </div>
            )}

            {/* MESSAGES */}
            {user && (
              <Link href="/messages">
                <MessageSquare className="h-7 w-7 text-white hover:text-purple-400 cursor-pointer transition active:scale-90" />
              </Link>
            )}

            {/* ACCOUNT */}
            {user && (
              <div className="relative">
                <User
                  className="h-7 w-7 text-white hover:text-green-400 cursor-pointer transition active:scale-90"
                  onClick={() => {
                    setIsAccountMenu(!isAccountMenu);
                    setIsUploadMenu(false);
                  }}
                />

                {isAccountMenu && (
                  <div className="absolute right-0 mt-3 bg-black/90 text-white w-44 rounded-xl shadow-lg border border-white/10 backdrop-blur-xl p-2 z-50">
                    <Link
                      href="/my-account"
                      className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg"
                      onClick={() => setIsAccountMenu(false)}
                    >
                      <User className="h-4 w-4" /> My Account
                    </Link>

                    <Link
                      href="/settings"
                      className="flex items-center gap-3 px-3 py-2 hover:bg-white/10 rounded-lg"
                      onClick={() => setIsAccountMenu(false)}
                    >
                      <Settings className="h-4 w-4" /> Settings
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-3 py-2 w-full text-left hover:bg-red-800/20 text-red-400 rounded-lg"
                    >
                      <LogOut className="h-4 w-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* NOT LOGGED IN */}
            {!user && (
              <>
                <Button asChild variant="outline" className="text-white">
                  <Link href="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Register</Link>
                </Button>
              </>
            )}
          </div>

          {/* MOBILE MENU */}
          <button
            className="md:hidden text-white"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

        </div>
      </nav>

      {/* UPLOAD MODAL */}
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
