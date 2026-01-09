"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Ghost, Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";

// Category Colors (Same as before)
const CATEGORY_THEMES = {
  "Love": "bg-gradient-to-br from-pink-900/80 to-rose-950 border-pink-500/50 text-pink-200",
  "Dare": "bg-gradient-to-br from-orange-900/80 to-red-950 border-orange-500/50 text-orange-200",
  "Challenge": "bg-gradient-to-br from-blue-900/80 to-cyan-950 border-blue-500/50 text-blue-200",
  "Secret": "bg-gradient-to-br from-purple-900/80 to-indigo-950 border-purple-500/50 text-purple-200",
  "Other": "bg-gradient-to-br from-gray-800 to-slate-900 border-gray-500/50 text-gray-300"
};

const CATEGORY_BADGES = {
  "Love": "bg-pink-600 text-white",
  "Dare": "bg-orange-600 text-white",
  "Challenge": "bg-blue-600 text-white",
  "Secret": "bg-purple-600 text-white",
  "Other": "bg-gray-600 text-white"
};

const ConfessionCard = ({ post }) => {
  const isAnonymous = post.isAnonymous;
  const themeClass = CATEGORY_THEMES[post.category] || CATEGORY_THEMES["Other"];
  const badgeClass = CATEGORY_BADGES[post.category] || CATEGORY_BADGES["Other"];
  
  const date = new Date(post.createdAt);
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative w-full mb-6 break-inside-avoid animate-fadeIn">
      <div className={`rounded-2xl border shadow-lg overflow-hidden relative ${themeClass}`}>
          
          <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-xs font-bold uppercase tracking-wider ${badgeClass}`}>
            {post.category || "Confession"}
          </div>

          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold shadow-inner 
                    ${isAnonymous ? "bg-black/40 text-gray-400" : "bg-white/10 text-white"}`}>
                {isAnonymous ? <Ghost size={20} /> : (post.authorName?.[0]?.toUpperCase() || "U")}
                </div>
                
                <div>
                {isAnonymous ? (
                    <p className="text-white/70 font-bold text-sm italic tracking-wide">Anonymous</p>
                ) : (
                    <Link href={`/profile/${post.userId}`} className="text-white font-bold text-sm hover:underline">
                        {post.authorName || "Unknown User"}
                    </Link>
                )}
                <p className="text-white/40 text-[10px] mt-0.5 font-medium uppercase tracking-wide">
                    {post.category} • {dateStr} • {timeStr}
                </p>
                </div>
            </div>

            <div className="mb-6">
                <p className="text-xl text-white font-serif font-medium leading-relaxed whitespace-pre-wrap drop-shadow-sm">
                "{post.caption}"
                </p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex gap-4">
                <button className="text-white/60 hover:text-white transition flex items-center gap-1.5 text-xs font-medium">
                    <Heart size={18} /> <span>{post.likes?.length || 0}</span>
                </button>
                <button className="text-white/60 hover:text-white transition flex items-center gap-1.5 text-xs font-medium">
                    <MessageCircle size={18} /> <span>{post.commentsCount || 0}</span>
                </button>
                </div>
                <button className="text-white/60 hover:text-white transition">
                <Share2 size={18} />
                </button>
            </div>
          </div>
      </div>
    </div>
  );
};

export default function ConfessionsPage() {
  const [confessions, setConfessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    async function fetchConfessions() {
        try {
            // New API Call
            const res = await fetch("/api/posts?postType=confession");
            const data = await res.json();
            if (Array.isArray(data)) {
                setConfessions(data);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    }
    fetchConfessions();
  }, []);

  const filteredConfessions = filter === "All" 
    ? confessions 
    : confessions.filter(c => c.category === filter);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
        <div className="sticky top-20 z-30 bg-black/80 backdrop-blur-md p-4 border-b border-white/10">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Ghost className="text-pink-500" /> Confessions
                </h1>
                
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {["All", ...Object.keys(CATEGORY_THEMES)].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilter(cat)}
                            className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap border 
                                ${filter === cat 
                                    ? "bg-white text-black border-white" 
                                    : "bg-transparent text-gray-400 border-white/10 hover:border-white/30"}`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        <div className="max-w-2xl mx-auto p-4">
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-pink-500" size={40} />
                </div>
            ) : filteredConfessions.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p>No confessions found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredConfessions.map(post => (
                        <ConfessionCard key={post._id} post={post} />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}