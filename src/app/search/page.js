"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, UserPlus, UserCheck, Loader2, MessageCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

function UserResult({ resultUser, currentUser }) {
  // Check if current user is in the result's follower list
  const isAlreadyFollowing = resultUser.followers.some(f => f.followerId === currentUser?.uid);
  const [isFollowing, setIsFollowing] = useState(isAlreadyFollowing);
  const [loading, setLoading] = useState(false);

  const handleFollow = async () => {
    if (!currentUser) return toast.error("Login to follow");
    setLoading(true);
    
    const action = isFollowing ? "unfollow" : "follow";
    
    try {
      await fetch("/api/users/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: resultUser.id, action }),
      });
      setIsFollowing(!isFollowing);
    } catch (err) {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  };

  if (currentUser && resultUser.id === currentUser.uid) return null;

  return (
    <div className="flex items-center justify-between bg-[#121212] border border-white/10 p-4 rounded-xl hover:bg-white/5 transition animate-fadeIn">
      <div className="flex items-center gap-4">
        <Link href={`/profile/${resultUser.id}`}>
          <div className="h-12 w-12 rounded-full overflow-hidden border border-white/20 relative bg-gray-800">
            <img 
              src={resultUser.image || "/default-dp.png"} 
              alt={resultUser.name} 
              className="object-cover w-full h-full"
            />
          </div>
        </Link>
        <Link href={`/profile/${resultUser.id}`}>
            <div>
                <h3 className="font-bold text-white text-lg leading-tight">{resultUser.name}</h3>
                <p className="text-gray-500 text-sm">@{resultUser.username}</p>
                {resultUser.college && <p className="text-xs text-gray-600 mt-1">{resultUser.college}</p>}
            </div>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/messages/${resultUser.id}`}>
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
          {loading ? <Loader2 size={16} className="animate-spin" /> : isFollowing ? <><UserCheck size={16} /> Following</> : <><UserPlus size={16} /> Follow</>}
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
        const res = await fetch(`/api/users/search?q=${searchTerm}`);
        const data = await res.json();
        setResults(data);
        setSearching(false);
      } else {
        setResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

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
                className="w-full bg-[#1a1a1a] border border-white/20 rounded-xl py-4 pl-12 pr-4 text-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
        </div>

        <div className="space-y-4">
            {searching ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-blue-500" size={32} /></div>
            ) : results.length > 0 ? (
                results.map((r) => <UserResult key={r.id} resultUser={r} currentUser={user} />)
            ) : searchTerm.length > 1 ? (
                <div className="text-center text-gray-500 py-10">No users found matching "{searchTerm}"</div>
            ) : (
                <div className="text-center text-gray-600 py-20">
                    <Search size={48} className="mx-auto mb-4 opacity-20" />
                    <p>Search by Name (e.g. Harry) or Username.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}