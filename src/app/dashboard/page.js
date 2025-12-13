"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, UserPlus, Check, X } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth();
  
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      try {
        const res = await fetch("/api/posts");
        const allPosts = await res.json();
        
        // Filter for "My Posts" (Client side filter for now)
        const myPosts = allPosts.filter(p => p.userId === user.id);
        setUserPosts(myPosts);

      } catch (error) {
        console.error("Dashboard Fetch Error", error);
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  if (authLoading || loading) {
    return <div className="h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>;
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-3xl mx-auto border-x border-white/10 min-h-screen">
        
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md p-3 border-b border-white/10 flex items-center gap-4">
            <h1 className="text-xl font-bold ml-2">{user.name}</h1>
        </div>

        {/* Banner */}
        <div className="h-48 w-full bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 relative" />
        
        <div className="px-5 pb-4 relative">
            <div className="flex justify-between items-end -mt-16 mb-4">
                <div className="relative h-32 w-32 rounded-full border-4 border-black overflow-hidden bg-black">
                  <Image src={user.image || "/default-dp.png"} fill alt="Profile" className="object-cover" />
                </div>
                <Button asChild variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 h-9 px-5">
                  <Link href="/profile/edit">Edit Profile</Link>
                </Button>
            </div>
            
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500 mb-4">@{user.username}</p>
            
            {/* Stats Row */}
            <div className="flex gap-5 text-[15px] mb-6">
                <div className="flex gap-1"><span className="font-bold">0</span> <span className="text-gray-500">Following</span></div>
                <div className="flex gap-1"><span className="font-bold">0</span> <span className="text-gray-500">Followers</span></div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mt-2">
            <button className={`flex-1 h-12 font-bold ${activeTab==="posts"?"text-white":"text-gray-500"}`} onClick={()=>setActiveTab("posts")}>Posts</button>
            <button className={`flex-1 h-12 font-bold ${activeTab==="reels"?"text-white":"text-gray-500"}`} onClick={()=>setActiveTab("reels")}>Media</button>
        </div>

        <div className="pb-20">
            {userPosts.length > 0 ? (
               userPosts.map(post => (
                <div key={post.id} className="border-b border-white/10 hover:bg-white/[0.02]">
                     <PostCard post={post} />
                </div>
               ))
            ) : (
              <div className="text-center py-10 text-gray-500">No posts yet.</div>
            )}
        </div>

      </div>
    </div>
  );
}