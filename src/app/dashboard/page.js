"use client";

import React, { useEffect, useState } from "react";
import FeedLayout from "@/components/feed/FeedLayout";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    const fetchPosts = async () => {
      try {
        const res = await fetch("/api/feed");
        if (res.ok) {
          const data = await res.json();
          setPosts(data.posts || []);
        }
      } catch (err) {
        console.error("Error fetching feed:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [user]);

  if (authLoading || isLoading) {
    return (
      <div className="min-h-[calc(100vh-80px)] flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white animate-fadeIn">
      <FeedLayout posts={posts} />
    </div>
  );
}