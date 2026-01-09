"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  const loading = status === "loading";
  
  // Transform NextAuth session to match your old Firebase user object structure
  // This minimizes changes needed in other components
  const user = session?.user ? {
    uid: session.user.id, // Map 'id' to 'uid' for compatibility
    ...session.user
  } : null;

  return { user, loading };
}