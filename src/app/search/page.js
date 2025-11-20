"use client";

import { useState, useEffect } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { Search, UserPlus, UserCheck, Loader2, MessageCircle } from "lucide-react";
import { followUser, unfollowUser } from "@/lib/actions/social";

// A sub-component for each user result to manage its own 'Follow' state
function UserResult({ resultUser, currentUser }) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Check if I am already following this person
  useEffect(() => {
    if (resultUser.followers && currentUser && resultUser.followers.includes(currentUser.uid)) {
      setIsFollowing(true);
    }
  }, [resultUser, currentUser]);

  const handleFollow = async () => {
    if (!currentUser) return;
    setLoading(true);
    if (isFollowing) {
      await unfollowUser(currentUser.uid, resultUser.uid);
      setIsFollowing(false);
    } else {
      await followUser(currentUser.uid, resultUser.uid);
      setIsFollowing(true);
    }
    setLoading(false);
  };

  // Don't show myself in search results
  if (currentUser && resultUser.uid === currentUser.uid) return null;

  return (
    <div className="flex items-center justify-between bg-[#121212] border border-white/10 p-4 rounded-xl hover:bg-white/5 transition animate-fadeIn">
      
      <div className="flex items-center gap-4">
        {/* Profile Pic */}
        <Link href={`/profile/${resultUser.uid}`}>
          <div className="h-12 w-12 rounded-full overflow-hidden border border-white/20 relative bg-gray-800">
            <img 
              src={resultUser.dp || "/default-dp.png"} 
              alt={resultUser.name} 
              className="object-cover w-full h-full"
            />
          </div>
        </Link>
        
        {/* Name & Username */}
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

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Message Button */}
        <Link href={`/messages/${resultUser.uid}`}>
            <button className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition">
                <MessageCircle size={20} />
            </button>
        </Link>

        {/* Follow Button */}
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
  const [user, setUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
         if (typeof window !== "undefined") window.location.href = "/login";
         return;
      }
      setUser(currentUser);
    });
    return () => unsub();
  }, []);

  // Debounce Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim().length > 1) {
        setSearching(true);
        await performSearch(searchTerm);
        setSearching(false);
      } else {
        setResults([]);
      }
    }, 500); // Wait 500ms after typing stops

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const performSearch = async (text) => {
    try {
      const usersRef = collection(db, "users");
      const endText = text + '\uf8ff';
      
      // 1. Query by Name
      const qName = query(
        usersRef,
        where("name", ">=", text),
        where("name", "<=", endText)
      );

      // 2. Query by Username (This fixes your issue!)
      const qUsername = query(
        usersRef,
        where("username", ">=", text),
        where("username", "<=", endText)
      );

      // Run both queries in parallel
      const [snapName, snapUsername] = await Promise.all([
        getDocs(qName),
        getDocs(qUsername)
      ]);

      // Merge results using a Map to remove duplicates (in case name and username are similar)
      const resultsMap = new Map();

      snapName.forEach(doc => {
        resultsMap.set(doc.id, { uid: doc.id, ...doc.data() });
      });

      snapUsername.forEach(doc => {
        resultsMap.set(doc.id, { uid: doc.id, ...doc.data() });
      });

      // Convert Map back to Array
      setResults(Array.from(resultsMap.values()));
      
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

        {/* Search Bar */}
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

        {/* Results Area */}
        <div className="space-y-4">
            {searching ? (
                <div className="flex justify-center py-10">
                    <Loader2 className="animate-spin text-blue-500" size={32} />
                </div>
            ) : results.length > 0 ? (
                results.map((resultUser) => (
                    <UserResult key={resultUser.uid} resultUser={resultUser} currentUser={user} />
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