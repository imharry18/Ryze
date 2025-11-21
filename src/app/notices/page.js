"use client";

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/hooks/useAuth";
import { Loader2, Megaphone, Heart, MessageCircle, Share2 } from "lucide-react";
import Link from "next/link";

// Notice Colors Configuration
const NOTICE_THEMES = {
  "Query": "bg-gradient-to-br from-blue-900/80 to-cyan-950 border-blue-500/50 text-blue-200",
  "Update": "bg-gradient-to-br from-orange-900/80 to-yellow-950 border-orange-500/50 text-orange-200",
  "Event": "bg-gradient-to-br from-purple-900/80 to-pink-950 border-purple-500/50 text-purple-200",
  "Lost & Found": "bg-gradient-to-br from-red-900/80 to-rose-950 border-red-500/50 text-red-200",
  "Academic": "bg-gradient-to-br from-green-900/80 to-emerald-950 border-green-500/50 text-green-200"
};

const NOTICE_BADGES = {
  "Query": "bg-blue-600 text-white",
  "Update": "bg-orange-600 text-white",
  "Event": "bg-purple-600 text-white",
  "Lost & Found": "bg-red-600 text-white",
  "Academic": "bg-green-600 text-white"
};

const NoticeCard = ({ post }) => {
  const themeClass = NOTICE_THEMES[post.category] || NOTICE_THEMES["Update"];
  const badgeClass = NOTICE_BADGES[post.category] || NOTICE_BADGES["Update"];
  
  const date = post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000) : new Date();
  const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="relative w-full mb-6 break-inside-avoid animate-fadeIn">
      <div className={`rounded-2xl border shadow-lg overflow-hidden relative ${themeClass}`}>
          
          {/* Top Badge */}
          <div className={`absolute top-0 right-0 px-4 py-1 rounded-bl-2xl text-xs font-bold uppercase tracking-wider ${badgeClass}`}>
            {post.category || "Notice"}
          </div>

          <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-full flex items-center justify-center font-bold shadow-inner bg-white/10 text-white">
                    {post.authorName?.[0]?.toUpperCase() || "U"}
                </div>
                
                <div>
                    <Link href={`/profile/${post.userId}`} className="text-white font-bold text-sm hover:underline">
                        {post.authorName || "Unknown User"}
                    </Link>
                    <p className="text-white/40 text-[10px] mt-0.5 font-medium uppercase tracking-wide">
                        {post.category} • {dateStr} • {timeStr}
                    </p>
                </div>
            </div>

            {/* Title */}
            <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                {post.caption}
            </h3>

            {/* Details Text */}
            <div className="mb-6">
                <p className="text-base text-white/90 leading-relaxed whitespace-pre-wrap">
                {post.details}
                </p>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <div className="flex gap-4">
                <button className="text-white/60 hover:text-white transition flex items-center gap-1.5 text-xs font-medium">
                    <Heart size={18} /> <span>Like</span>
                </button>
                <button className="text-white/60 hover:text-white transition flex items-center gap-1.5 text-xs font-medium">
                    <MessageCircle size={18} /> <span>Comment</span>
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

export default function NoticesPage() {
  const { user } = useAuth();
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");

  useEffect(() => {
    // Query posts where postType is 'notice'
    // Note: You might need to create an index for this query too!
    // postType Ascending, createdAt Descending
    let q = query(
        collection(db, "posts"), 
        where("postType", "==", "notice"),
        orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setNotices(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const filteredNotices = filter === "All" 
    ? notices 
    : notices.filter(c => c.category === filter);

  return (
    <div className="min-h-screen bg-black text-white pb-20">
        {/* Header */}
        <div className="sticky top-20 z-30 bg-black/80 backdrop-blur-md p-4 border-b border-white/10">
            <div className="max-w-2xl mx-auto flex items-center justify-between">
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <Megaphone className="text-orange-500" /> Notices
                </h1>
                
                {/* Filter Dropdown */}
                <div className="flex gap-2 overflow-x-auto no-scrollbar">
                    {["All", ...Object.keys(NOTICE_THEMES)].map(cat => (
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

        {/* Content Feed */}
        <div className="max-w-2xl mx-auto p-4">
            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-orange-500" size={40} />
                </div>
            ) : filteredNotices.length === 0 ? (
                <div className="text-center py-20 text-gray-500">
                    <p>No notices yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredNotices.map(post => (
                        <NoticeCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>
    </div>
  );
}