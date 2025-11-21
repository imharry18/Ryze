"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link"; // Import Link
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import CommentSection from "@/components/ui/CommentSection";
import { useAuth } from "@/hooks/useAuth";
import { followUser, unfollowUser } from "@/lib/actions/social";

export default function PostCard({ post }) {
  const { user } = useAuth();
  const [author, setAuthor] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // Fetch Author & Check Follow Status
  useEffect(() => {
    async function fetchData() {
      if (!post.userId) return;

      const userRef = doc(db, "users", post.userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setAuthor(data);
        
        if (data.followers && user) {
            setIsFollowing(data.followers.includes(user.uid));
        }
      }
    }
    fetchData();
  }, [post.userId, user]);

  const handleFollowToggle = async () => {
    if (!user) return alert("Login to follow!");
    setLoadingFollow(true);

    if (isFollowing) {
        await unfollowUser(user.uid, post.userId);
        setIsFollowing(false);
    } else {
        await followUser(user.uid, post.userId);
        setIsFollowing(true);
    }
    setLoadingFollow(false);
  };

  // Format Date and Time
  const createdAtDate = post.createdAt?.seconds ? new Date(post.createdAt.seconds * 1000) : new Date();
  const dateStr = createdAtDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = createdAtDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const locationText = post.location || "Unknown Location";
  const headerMeta = `${locationText}  •  ${dateStr}  •  ${timeStr}`;

  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden mb-6 shadow-lg animate-fadeIn">
      
      {/* --- Header --- */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          
          {/* Redirect to Profile on Image Click */}
          <Link href={`/profile/${post.userId}`}>
            <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-800 border border-white/10 cursor-pointer hover:opacity-80 transition">
                <Image
                src={author?.dp || "/default-dp.png"}
                alt="Author"
                fill
                className="object-cover"
                />
            </div>
          </Link>

          <div>
            <div className="flex items-center gap-2">
                {/* Redirect to Profile on Name Click */}
                <Link href={`/profile/${post.userId}`}>
                    <p className="text-white font-semibold text-sm hover:underline cursor-pointer">
                        {author?.username || "Unknown"}
                    </p>
                </Link>

                {/* Follow Button Logic */}
                {user && user.uid !== post.userId && (
                    <button 
                        onClick={handleFollowToggle}
                        disabled={loadingFollow}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 transition flex items-center"
                    >
                        • {loadingFollow ? "..." : isFollowing ? "Following" : "Follow"}
                    </button>
                )}
            </div>
            {/* Subtext: Location | Date | Time */}
            <p className="text-gray-500 text-[11px] mt-0.5">{headerMeta}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* --- Media Content --- */}
      <div className="relative w-full bg-black min-h-[200px] flex items-center justify-center">
        {post.mediaURL && (
           post.mediaType === "video" ? (
            <video src={post.mediaURL} controls className="w-full max-h-[600px] object-contain" />
           ) : (
            <img src={post.mediaURL} alt="Post" className="w-full h-auto max-h-[600px] object-contain block" loading="lazy" />
           )
        )}
      </div>

      {/* --- Footer --- */}
      <div className="p-4">
        
        {/* 1. Caption Row */}
        <div className="mb-4">
          <p className="text-sm text-white leading-relaxed">
            <Link href={`/profile/${post.userId}`}>
                <span className="font-bold mr-2 cursor-pointer hover:underline">{author?.username}</span>
            </Link>
            {post.caption}
          </p>
        </div>

        {/* 2. Action Buttons Row */}
        <div className="flex items-center gap-5 border-t border-white/10 pt-3">
          <button className="text-white hover:text-red-500 transition active:scale-90 flex items-center gap-1">
            <Heart size={24} />
          </button>
          
          <button 
            className="text-white hover:text-blue-500 transition active:scale-90 flex items-center gap-1"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={24} />
          </button>
          
          <button className="text-white hover:text-green-500 transition active:scale-90 ml-auto">
            <Share2 size={22} />
          </button>
        </div>

        {/* Comments Drawer */}
        {showComments && (
            <div className="mt-4 pt-4 border-t border-white/10">
                <CommentSection postId={post.id} />
            </div>
        )}
      </div>
    </div>
  );
}