"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Heart, MessageCircle, Share2, MoreHorizontal, UserPlus, Check } from "lucide-react";
import CommentSection from "@/components/ui/CommentSection";
import { useAuth } from "@/hooks/useAuth";
import { followUser, unfollowUser } from "@/lib/actions/social";

export default function PostCard({ post }) {
  const { user } = useAuth(); // Current logged-in user
  const [author, setAuthor] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);

  // Fetch Author & Check Follow Status
  useEffect(() => {
    async function fetchData() {
      if (!post.userId) return;

      // 1. Get Author Info
      const userRef = doc(db, "users", post.userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const data = snap.data();
        setAuthor(data);
        
        // 2. Check if *I* am following *Them*
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

  const timeAgo = post.createdAt?.seconds
    ? new Date(post.createdAt.seconds * 1000).toLocaleDateString(undefined, {
        month: 'short', day: 'numeric'
      })
    : "Just now";

  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden mb-6 shadow-lg animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-800 border border-white/10">
            <Image
              src={author?.dp || "/default-dp.png"}
              alt="Author"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
                <p className="text-white font-semibold text-sm">
                {author?.username || "Unknown"}
                </p>
                {/* Don't show follow button if it's my own post */}
                {user && user.uid !== post.userId && (
                    <button 
                        onClick={handleFollowToggle}
                        disabled={loadingFollow}
                        className="text-xs font-bold text-blue-400 hover:text-blue-300 transition flex items-center"
                    >
                        {loadingFollow ? "..." : isFollowing ? "Following" : "Follow"}
                    </button>
                )}
            </div>
            <p className="text-gray-500 text-xs">{author?.college || "Student"}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Media Content */}
      <div className="relative w-full bg-black min-h-[200px] flex items-center justify-center">
        {post.mediaURL && (
           post.mediaType === "video" ? (
            <video src={post.mediaURL} controls className="w-full max-h-[600px] object-contain" />
           ) : (
            <img src={post.mediaURL} alt="Post" className="w-full h-auto max-h-[600px] object-contain block" loading="lazy" />
           )
        )}
      </div>

      {/* Actions */}
      <div className="p-4">
        <div className="flex items-center gap-4 mb-3">
          <button className="text-white hover:text-red-500 transition active:scale-90">
            <Heart size={26} />
          </button>
          <button 
            className="text-white hover:text-blue-500 transition active:scale-90"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={26} />
          </button>
          <button className="text-white hover:text-green-500 transition active:scale-90 ml-auto">
            <Share2 size={24} />
          </button>
        </div>

        <div className="mb-2">
          <p className="text-sm text-white">
            <span className="font-bold mr-2">{author?.username}</span>
            {post.caption}
          </p>
        </div>
        
        <p className="text-xs text-gray-500 uppercase tracking-wide">{timeAgo}</p>

        {showComments && (
            <div className="mt-4 pt-4 border-t border-white/10">
                <CommentSection postId={post.id} />
            </div>
        )}
      </div>
    </div>
  );
}