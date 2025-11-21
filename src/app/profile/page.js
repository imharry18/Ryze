"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

export default function ProfileRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Automatically redirect to the dynamic route: /profile/{uid}
        router.replace(`/profile/${user.uid}`);
      } else {
        // If not logged in, send to login
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  // Show a spinner while the redirect happens
  return (
    <div className="h-[calc(100vh-80px)] flex items-center justify-center bg-black text-white">
      <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
    </div>
  );
}