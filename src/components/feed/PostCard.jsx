// Ryze/src/components/feed/PostCard.jsx
"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link"; 
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import CommentSection from "@/components/ui/CommentSection";

export default function PostCard({ post }) {
  const [showComments, setShowComments] = useState(false);

  // 1. Author Data is now nested from the API include
  const author = post.user || {}; 
  const mediaLink = post.mediaUrl;
  
  // Use Firebase UID for links if available (for profile navigation)
  const profileLink = author.firebaseUid ? `/profile/${author.firebaseUid}` : "#";

  // Format Date
  const dateObj = new Date(post.createdAt);
  const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden mb-6 shadow-lg animate-fadeIn">
      
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Link href={profileLink}>
            <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-800 border border-white/10 cursor-pointer hover:opacity-80 transition">
                <Image 
                  src={author.profilePicUrl || "/default-dp.png"} 
                  alt="Author" 
                  fill 
                  className="object-cover" 
                />
            </div>
          </Link>

          <div>
            <Link href={profileLink}>
                <p className="text-white font-semibold text-sm hover:underline cursor-pointer">
                    {author.fullName || author.username || "Anonymous"}
                </p>
            </Link>
            <p className="text-gray-500 text-[11px] mt-0.5">{post.location || "Earth"} • {dateStr}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Media */}
      <div className={`relative w-full bg-black flex items-center justify-center ${mediaLink ? 'min-h-[300px]' : ''}`}>
        {mediaLink && (
           post.mediaType === "video" ? (
            <video src={mediaLink} controls className="w-full max-h-[600px] object-contain" />
           ) : (
            <img src={mediaLink} alt="Post" className="w-full h-auto max-h-[600px] object-contain block" loading="lazy" />
           )
        )}
      </div>

      {/* Footer */}
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-white leading-relaxed">
            <span className="font-bold mr-2 text-white">{author.username}</span>
            <span className="text-gray-200">{post.caption}</span>
          </p>
        </div>

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

        {showComments && (
            <div className="mt-4 pt-4 border-t border-white/10">
                <CommentSection postId={post.id} />
            </div>
        )}
      </div>
    </div>
  );
}