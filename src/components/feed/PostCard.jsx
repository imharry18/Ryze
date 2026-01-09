"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
// import CommentSection from "@/components/ui/CommentSection"; // We will fix this later
import { useAuth } from "@/hooks/useAuth";

export default function PostCard({ post }) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  
  // NOTE: Interaction logic (Like/Follow) will be added in the next step.
  // For now, these are visual-only.

  // Parse Date
  const dateObj = new Date(post.createdAt);
  const dateStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const locationText = post.location || "";
  const headerMeta = locationText ? `${locationText}  •  ${dateStr}` : `${dateStr}  •  ${timeStr}`;

  return (
    <div className="bg-[#121212] border border-white/10 rounded-xl overflow-hidden mb-6 shadow-lg animate-fadeIn">
      
      {/* --- Header --- */}
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          
          {/* Avatar */}
          <Link href={`/profile/${post.userId}`}>
            <div className="h-10 w-10 relative rounded-full overflow-hidden bg-gray-800 border border-white/10 cursor-pointer hover:opacity-80 transition">
                <Image
                  src={post.authorImage || "/default-dp.png"}
                  alt="Author"
                  fill
                  className="object-cover"
                />
            </div>
          </Link>

          <div>
            <div className="flex items-center gap-2">
                <Link href={`/profile/${post.userId}`}>
                    <p className="text-white font-semibold text-sm hover:underline cursor-pointer">
                        {post.authorName || "User"}
                    </p>
                </Link>
                {/* Optional: Anonymous Badge */}
                {post.isAnonymous && <span className="text-[10px] bg-white/10 px-1.5 rounded text-gray-400">Anon</span>}
            </div>
            <p className="text-gray-500 text-[11px] mt-0.5">{headerMeta}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* --- Media Content --- */}
      {post.mediaUrl && (
        <div className="relative w-full bg-black min-h-[200px] flex items-center justify-center">
           {post.mediaType === "video" ? (
            <video src={post.mediaUrl} controls className="w-full max-h-[600px] object-contain" />
           ) : (
            <img src={post.mediaUrl} alt="Post" className="w-full h-auto max-h-[600px] object-contain block" loading="lazy" />
           )}
        </div>
      )}

      {/* --- Footer --- */}
      <div className="p-4">
        
        {/* Caption */}
        {post.caption && (
          <div className="mb-4">
            <p className="text-sm text-white leading-relaxed">
              <span className="font-bold mr-2">{post.authorUsername}</span>
              {post.caption}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-5 border-t border-white/10 pt-3">
          <button className="text-white hover:text-red-500 transition active:scale-90 flex items-center gap-1">
            <Heart size={24} />
            {post.likes && post.likes.length > 0 && <span className="text-sm">{post.likes.length}</span>}
          </button>
          
          <button 
            className="text-white hover:text-blue-500 transition active:scale-90 flex items-center gap-1"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle size={24} />
            {post.commentsCount > 0 && <span className="text-sm">{post.commentsCount}</span>}
          </button>
          
          <button className="text-white hover:text-green-500 transition active:scale-90 ml-auto">
            <Share2 size={22} />
          </button>
        </div>

        {/* Comments Drawer (Placeholder until we migrate comments) */}
        {showComments && (
            <div className="mt-4 pt-4 border-t border-white/10 text-center text-gray-500 text-sm">
                Comments system upgrading...
            </div>
        )}
      </div>
    </div>
  );
}