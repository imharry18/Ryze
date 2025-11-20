// src/components/feed/PostCard.jsx
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Heart, MessageCircle, Share2, MoreHorizontal } from "lucide-react";
import CommentSection from "@/components/ui/CommentSection";

export default function PostCard({ post }) {
  const [author, setAuthor] = useState(null);
  const [showComments, setShowComments] = useState(false);

  // Fetch Author Details
  useEffect(() => {
    async function fetchAuthor() {
      if (!post.userId) return;
      const userRef = doc(db, "users", post.userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) setAuthor(snap.data());
    }
    fetchAuthor();
  }, [post.userId]);

  // Format Date
  const timeAgo = post.createdAt?.seconds
    ? newjhDate(post.createdAt.seconds * 1000).toLocaleDateString()
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
            <p className="text-white font-semibold text-sm">
              {author?.username || "Unknown"}
            </p>
            <p className="text-gray-500 text-xs">{author?.college || "Student"}</p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-white">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Media */}
      <div className="relative w-full bg-black flex items-center justify-center bg-gradient-to-b from-black/0 to-black/20">
        {post.mediaType === "video" ? (
          <video
            src={post.mediaURL}
            controls
            className="w-full max-h-[600px] object-contain"
          />
        ) : (
          <div className="relative w-full h-auto min-h-[300px]">
             <img 
               src={post.mediaURL} 
               alt="Post Media" 
               className="w-full h-auto max-h-[600px] object-contain" 
               loading="lazy"
             />
          </div>
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

        {/* Caption */}
        <div className="mb-2">
          <p className="text-sm text-white">
            <span className="font-bold mr-2">{author?.username}</span>
            {post.caption}
          </p>
        </div>
        
        <p className="text-xs text-gray-500 uppercase tracking-wide">{timeAgo}</p>

        {/* Comments Integration */}
        {showComments && (
            <div className="mt-4 pt-4 border-t border-white/10">
                <CommentSection postId={post.id} />
            </div>
        )}
      </div>
    </div>
  );
}