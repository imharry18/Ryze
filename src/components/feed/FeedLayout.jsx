"use client";

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PostCard from "./PostCard";
import { Loader2 } from "lucide-react";
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
    // Use 'justify-between' to push the main feed and right sidebar apart
    <div className="flex justify-center xl:justify-between gap-6 w-full">
      
      {/* --- CENTER FEED --- */}
      <main className="w-full max-w-[600px] mx-auto xl:mx-0">
        
        {/* Stories Section has been removed for Ryze */}
        
        {/* Posts Stream */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <div className="space-y-4">
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

      {/* --- RIGHT SIDEBAR (Suggested People) --- */}
      <aside className="hidden xl:block w-[350px] shrink-0 sticky top-24 h-fit">
        <div className="bg-[#121212] border border-white/10 rounded-xl p-6">
            <h3 className="text-gray-400 font-semibold mb-4 text-sm uppercase tracking-wider">Suggested for you</h3>
            <div className="space-y-4">
                {[1,2,3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">College_Admin_{i}</span>
                                <span className="text-xs text-gray-500">New to Ryze</span>
                            </div>
                        </div>
                        <button className="text-xs text-blue-400 hover:text-white font-medium">Follow</button>
                    </div>
                ))}
            </div>
        </div>
        
        <div className="mt-6 text-xs text-gray-600 px-2 text-center">
            <p>© 2025 RYZE Inc.</p>
        </div>
      </aside>

    </div>
  );
}