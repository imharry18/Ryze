"use client";

import { useAuth } from "@/hooks/useAuth";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  const { user, loading } = useAuth();

  // While checking auth, just render children (or a loader if preferred, but children prevents flicker on landing)
  if (loading) return <>{children}</>;

  // If NOT logged in, render full width (for Landing Page, Login, Register)
  if (!user) {
    return <>{children}</>;
  }

  // If LOGGED IN, render Sidebar + Content Layout
  return (
    <div className="max-w-7xl mx-auto flex gap-8 px-4 sm:px-6 py-6 min-h-[calc(100vh-80px)]">
       {/* Fixed Sidebar on Desktop */}
       <Sidebar />
       
       {/* Main Content Area */}
       <main className="flex-1 min-w-0">
         {children}
       </main>
    </div>
  );
}