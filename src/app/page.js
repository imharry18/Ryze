// src/app/page.js
'use client';

import { useAuth } from "@/hooks/useAuth";
import FeedLayout from "@/components/feed/FeedLayout";

// Landing Page Components
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, loading } = useAuth();

  // 1. Loading State
  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-black text-white">
        <Loader2 className="animate-spin w-10 h-10 text-blue-600" />
      </div>
    );
  }

  if (user) {
    return <FeedLayout />;
  }

  return (
    <div className="animate-fadeIn">
      <Hero />
      <Features />
    </div>
  );
}