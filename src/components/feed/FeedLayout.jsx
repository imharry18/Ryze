// src/components/feed/FeedLayout.jsx
"use client";

import React, { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import PostCard from "./PostCard";
import { Loader2, UserPlus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function FeedLayout({ contentType = "global" }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState([]);

  // 1. Fetch "Following" list if we are in "following" mode
  useEffect(() => {
    if (contentType === "following" && user) {
      async function fetchFollowing() {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setFollowing(snap.data().following || []);
        }
      }
      fetchFollowing();
    }
  }, [user, contentType]);

  // 2. Fetch Posts Realtime
  useEffect(() => {
    const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
    
    const unsub = onSnapshot(q, (snap) => {
      const allPosts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      
      if (contentType === "following") {
        // FILTER: Only show posts from people I follow OR my own posts
        if (user) {
           const filtered = allPosts.filter(post => 
              following.includes(post.userId) || post.userId === user.uid
           );
           setPosts(filtered);
        } else {
           setPosts([]);
        }
      } else {
        // GLOBAL: Show everything
        setPosts(allPosts);
      }
      
      setLoading(false);
    });

    return () => unsub();
  }, [contentType, following, user]);

  return (
    <div className="flex justify-center xl:justify-between gap-6 w-full">
      
      {/* --- CENTER FEED --- */}
      <main className="w-full max-w-[600px] mx-auto xl:mx-0">
        
        {/* Posts Stream */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : (
          <div className="space-y-4">
            {posts.length === 0 ? (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                    {contentType === "following" ? (
                      <>
                        <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
                          <UserPlus size={32} />
                        </div>
                        <p className="text-lg font-medium text-white mb-2">Your feed is empty</p>
                        <p className="text-sm text-gray-400 max-w-xs mx-auto mb-6">
                          Follow people to see their photos and videos here.
                        </p>
                        <Link href="/search">
                          <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold transition">
                            Find People
                          </button>
                        </Link>
                      </>
                    ) : (
                      <p>No posts yet. Be the first to Ryze!</p>
                    )}
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
            {/* You can implement a real suggestion algorithm here later */}
            <div className="space-y-4">
                {[1,2,3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gray-800" />
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-white">College_Student_{i}</span>
                                <span className="text-xs text-gray-500">New to Ryze</span>
                            </div>
                        </div>
                        <Link href="/search" className="text-xs text-blue-400 hover:text-white font-medium">
                          View
                        </Link>
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