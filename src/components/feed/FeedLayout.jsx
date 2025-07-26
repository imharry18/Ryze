"use client";

import React from "react";
import PostCard from "./PostCard";

export default function FeedLayout({ posts = [] }) {
  if (posts.length === 0) {
    return (
      <div className="w-full flex flex-col items-center justify-center py-20">
        <p className="text-gray-400 text-lg">No posts to show right now.</p>
        <p className="text-gray-600 text-sm mt-2">Follow some people to see their updates here!</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6 p-4">
      {posts.map((post) => (
        <PostCard key={post.id || post._id} post={post} />
      ))}
    </div>
  );
}