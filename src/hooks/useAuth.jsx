"use client";

import { useEffect, useState } from "react";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Placeholder for your local auth check (e.g., checking a cookie or calling an API)
        // const res = await fetch('/api/auth/me');
        // if (res.ok) {
        //   const data = await res.json();
        //   setUser(data.user);
        // } else {
        //   setUser(null);
        // }
        
        setUser(null); 
      } catch (error) {
        console.error("Auth check failed:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading };
}