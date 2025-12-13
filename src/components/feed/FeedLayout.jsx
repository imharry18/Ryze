// Ryze/src/components/feed/FeedLayout.jsx
"use client";

import React, { useState, useEffect } from "react";
import PostCard from "./PostCard";
import { Loader2, UserPlus, RefreshCw } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";

export default function FeedLayout({ contentType = "global" }) {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Fetch from our new MongoDB API
      const res = await fetch("/api/posts");
      if (!res.ok) throw new Error("Failed to load feed");
      
      const data = await res.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
      setError("Could not load feed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="flex justify-center xl:justify-between gap-6 w-full">
      <main className="w-full max-w-[600px] mx-auto xl:mx-0">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={40} />
          </div>
        ) : error ? (
           <div className="text-center py-10 text-red-400">
             <p>{error}</p>
             <button onClick={fetchPosts} className="mt-2 text-sm underline hover:text-white">Try Again</button>
           </div>
        ) : (
          <div className="space-y-4">
            {posts.length === 0 ? (
                <div className="text-center py-20 text-gray-500 flex flex-col items-center">
                    <p className="text-lg font-medium text-white mb-2">Feed is empty</p>
                    <p className="text-sm text-gray-400">Be the first to upload!</p>
                </div>
            ) : (
                posts.map((post) => <PostCard key={post.id} post={post} />)
            )}
          </div>
        )}
      </main>
    </div>
  );
}