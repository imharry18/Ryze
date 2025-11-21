"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Define routes that unauthenticated users are allowed to visit
const PUBLIC_ROUTES = ["/", "/login", "/register"];

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // We use a local check state to prevent "flashing" of protected content
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Only run check when auth loading is done
    if (!loading) {
      // Logic: If NOT logged in AND accessing a NON-public route
      if (!user && !PUBLIC_ROUTES.includes(pathname)) {
        router.push("/"); // Redirect to Landing/Login Showcase
      }
      // Logic: If LOGGED IN and on Login/Register page (Optional UX improvement, usually desired)
      // if (user && (pathname === "/login" || pathname === "/register")) {
      //   router.push("/dashboard"); 
      // }
      
      setIsChecking(false);
    }
  }, [user, loading, pathname, router]);

  // Show loader while checking auth state or redirecting
  if (loading || isChecking) {
    return (
      <div className="h-[calc(100vh-80px)] w-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10" />
      </div>
    );
  }

  // If not logged in and trying to view protected route, return null (while redirect happens)
  if (!user && !PUBLIC_ROUTES.includes(pathname)) {
      return null;
  }

  return <>{children}</>;
}