"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { Search, UserPlus, UserCheck, Loader2, MessageCircle } from "lucide-react";
import { followUser, unfollowUser } from "@/lib/actions/social";

function UserResult({ resultUser, currentUser }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (resultUser.followers && currentUser && resultUser.followers.includes(currentUser.uid)) {
      setIsFollowing(true);
    }
  }, [resultUser, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      if (isFollowing) {
        await unfollowUser(currentUser.uid, resultUser.uid);
        setIsFollowing(false);
      } else {
        await followUser(currentUser.uid, resultUser.uid);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Error toggling follow:", err);
    } finally {
      setLoading(false);
    }
  };

  if (currentUser && resultUser.uid === currentUser.uid) return null;

  return (
    <div className="flex items-center justify-between bg-[#121212] border border-white/10 p-4 rounded-xl hover:bg-white/5 transition animate-fadeIn">
      <div className="flex items-center gap-4">
        <Link href={`/profile/${resultUser.uid}`}>
          <div className="h-12 w-12 rounded-full overflow-hidden border border-white/20 relative bg-gray-800">
            <img 
              src={resultUser.dp || "/default-dp.png"} 
              alt={resultUser.name} 
              className="object-cover w-full h-full"
            />
          </div>
        </Link>
        
        <Link href={`/profile/${resultUser.uid}`}>
            <div>
                <h3 className="font-bold text-white text-lg leading-tight">{resultUser.name}</h3>
                <p className="text-gray-500 text-sm">@{resultUser.username}</p>
                {resultUser.college && (
                    <p className="text-xs text-gray-600 mt-1">{resultUser.college}</p>
                )}
            </div>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/messages/${resultUser.uid}`}>
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
                <MessageCircle size={20} />
            </button>
        </Link>

        <button
          onClick={handleFollow}
          disabled={loading}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition min-w-[100px] justify-center ${
            isFollowing
              ? "bg-transparent border border-white/20 text-white hover:border-red-500/50 hover:text-red-400"
              : "bg-blue-600 text-white hover:bg-blue-500"
          }`}
        >
          {loading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isFollowing ? (
            <>
              <UserCheck size={16} /> Following
            </>
          ) : (
            <>
              <UserPlus size={16} /> Follow
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setSearching(true);
        await performSearch(searchTerm);
        setSearching(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = async (text) => {
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(text)}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.users || []);
      }
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Search className="text-blue-500" /> Find People
        </h1>

        <div className="relative mb-8">
            <input
                type="text"
                placeholder="Search by name or username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl py-4 pl-12 pr-4 text-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        </div>

        <div className="space-y-4">
            {searching ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            ) : results.length > 0 ? (
                results.map((resultUser) => (
                    <UserResult key={resultUser.uid || resultUser._id} resultUser={resultUser} currentUser={user} />
                ))
            ) : searchTerm.length > 1 ? (
                <div className="text-center text-gray-500 py-10">
                    <p>No users found matching "{searchTerm}"</p>
                </div>
            ) : (
                <div className="text-center text-gray-600 py-20">
                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Search by Name (e.g. Harish) or Username.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}