// src/app/hot-ryze/page.js
"use client";

import FeedLayout from "@/components/feed/FeedLayout";
import { Flame } from "lucide-react";

export default function RyzeHotPage() {
  return (
    <div className="min-h-screen bg-black text-white pb-20">
      {/* Header for RyzeHot */}
      <div className="sticky top-20 z-30 bg-black/80 backdrop-blur-md p-4 border-b border-white/10 mb-4">
          <div className="max-w-2xl mx-auto flex items-center gap-2">
              <Flame className="text-rose-500 fill-rose-500" /> 
              <h1 className="text-2xl font-bold">RyzeHot <span className="text-sm font-normal text-gray-500 ml-2">(Global Feed)</span></h1>
          </div>
      </div>

      {/* Global Feed */}
      <FeedLayout contentType="global" />
    </div>
  );
}