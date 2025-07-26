"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Share2 } from "lucide-react";

export default function PostCard({ post }) {
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);

  const handleLike = async () => {
    // Optimistic Update to prevent UI lag/bugs
    setLiked(!liked);
    setLikesCount((prev) => (liked ? prev - 1 : prev + 1));
    
    try {
      const res = await fetch(`/api/posts/${post.id}/like`, { method: "POST" });
      if (!res.ok) throw new Error("Like failed");
    } catch (err) {
      console.error("Failed to toggle like", err);
      // Revert if API fails
      setLiked(!liked);
      setLikesCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  return (
    <div className="bg-[#121212] border border-white/10 rounded-2xl p-4 sm:p-5 shadow-lg animate-fadeIn">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link href={`/profile/${post.authorId}`}>
          <div className="relative h-10 w-10 rounded-full overflow-hidden border border-white/20 bg-gray-800 transition hover:opacity-80">
            <Image 
              src={post.authorDp || "/default-dp.png"} 
              alt="Author DP" 
              fill 
              className="object-cover" 
            />
          </div>
        </Link>
        <div>
          <Link href={`/profile/${post.authorId}`} className="font-bold text-white hover:text-blue-400 transition">
            {post.authorName || "Unknown User"}
          </Link>
          <p className="text-xs text-gray-500">
            {post.createdAt ? new Date(post.createdAt).toLocaleDateString() : "Just now"}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4">
        <p className="text-gray-200 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {/* Media Attachment */}
      {post.mediaUrl && (
        <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden mb-4 border border-white/10 bg-black/50">
          <Image 
            src={post.mediaUrl} 
            alt="Post Media" 
            fill 
            className="object-contain" 
          />
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-3 border-t border-white/10">
        <button 
          onClick={handleLike} 
          className={`flex items-center gap-2 text-sm transition-colors ${
            liked ? "text-red-500" : "text-gray-400 hover:text-red-400"
          }`}
        >
          <Heart size={20} className={`transition-transform ${liked ? "fill-current scale-110" : "scale-100"}`} />
          <span className="font-medium">{likesCount}</span>
        </button>
        
        <Link href={`/post/${post.id}`} className="flex items-center gap-2 text-sm text-gray-400 hover:text-blue-400 transition">
          <MessageCircle size={20} />
          <span className="font-medium">{post.commentsCount || 0}</span>
        </Link>
        
        <button className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition ml-auto">
          <Share2 size={20} />
        </button>
      </div>
    </div>
  );
}