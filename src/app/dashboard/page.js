"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // If logged in, redirect to their profile or the main feed
        // Most apps redirect "Dashboard" to the User's Profile
        router.push(`/profile/${user.uid}`);
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="h-screen w-full flex items-center justify-center bg-black text-white">
      <Loader2 className="animate-spin text-blue-500" size={48} />
    </div>
  );
}