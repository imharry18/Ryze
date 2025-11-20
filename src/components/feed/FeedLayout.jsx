// src/components/feed/FeedLayout.jsx
"use client";

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Link from "next/link";
import Image from "next/image";
import PostCard from "./PostCard";
import { Loader2, TrendingUp, Calendar, Users } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function FeedLayout() {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch Posts Realtime
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setPosts(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex justify-center">
      
      {/* --- LEFT SIDEBAR (Desktop Only) --- */}
      {/* This acts as your "Quick Nav" similar to Instagram's side rail */}
      <aside className="hidden lg:block w-[300px] sticky top-20 h-[calc(100vh-80px)] p-4 overflow-y-auto">
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6 space-y-6">
            <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 relative rounded-full overflow-hidden border-2 border-blue-500">
                    <Image src={user?.photoURL || "/default-dp.png"} fill alt="You" className="object-cover" />
                </div>
                <div>
                    <p className="font-bold text-lg">{user?.displayName || "Student"}</p>
                    <Link href="/my-account" className="text-xs text-blue-400 hover:underline">Edit Profile</Link>
                </div>
            </div>

            <nav className="space-y-2">
                <Link href="/dashboard" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition">
                    <Users size={20} className="text-purple-400"/> <span>My Profile</span>
                </Link>
                <Link href="/events" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition">
                    <Calendar size={20} className="text-green-400"/> <span>College Events</span>
                </Link>
                 <Link href="/hot-ryze" className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 transition">
                    <TrendingUp size={20} className="text-red-400"/> <span>Trending</span>
                </Link>
            </nav>
        </div>
      </aside>

      {/* --- CENTER FEED --- */}
      <main className="w-full max-w-[600px] px-4 py-6 min-h-screen">
        {/* Stories / Status Bar (Placeholder for innovation) */}
        <div className="flex gap-4 overflow-x-auto pb-6 mb-2 scrollbar-hide">
             {/* You can map stories here later */}
             <div className="flex-shrink-0 w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center border-2 border-black">
                    <span className="text-xs font-bold">+</span>
                </div>
             </div>
             {[1,2,3,4].map(i => (
                 <div key={i} className="flex-shrink-0 w-16 h-16 rounded-full bg-gray-800 border border-white/10 animate-pulse" />
             ))}
        </div>

        {/* Posts Stream */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <div className="space-y-2">
            {posts.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p>No posts yet. Be the first to Ryze!</p>
                </div>
            ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}
      </main>

      {/* --- RIGHT SIDEBAR (Desktop Only) --- */}
      <aside className="hidden xl:block w-[350px] sticky top-20 h-[calc(100vh-80px)] p-4">
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
            <h3 className="text-gray-400 font-semibold mb-4 text-sm uppercase tracking-wider">Suggested for you</h3>
            {/* Placeholder Suggestions */}
            <div className="space-y-4">
                {[1,2,3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">College_Admin_{i}</span>
                                <span className="text-xs text-gray-500">New to Ryze</span>
                            </div>
                        </div>
                        <button className="text-xs text-blue-400 hover:text-white">Follow</button>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="mt-6 text-xs text-gray-600 px-2">
            <p>© 2025 RYZE FROM HARRY</p>
        </div>
      </aside>

    </div>
  );
}