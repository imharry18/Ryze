"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import Image from "next/image";
import Link from "next/link";
import { Loader2, MapPin, Calendar, Grid, UserPlus, Check, X } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import { Button } from "@/components/ui/Button";
import { acceptFriendRequest } from "@/lib/actions/social";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [requests, setRequests] = useState([]); // Pending friend requests
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        if (typeof window !== "undefined") window.location.href = "/login";
        return;
      }
      setUser(currentUser);

      // 1. Fetch User Profile (Realtime to catch new requests)
      const userRef = doc(db, "users", currentUser.uid);
      const unsubProfile = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);

          // Fetch details for pending requests
          if (data.pendingFriendRequests && data.pendingFriendRequests.length > 0) {
             const reqPromises = data.pendingFriendRequests.map(id => getDoc(doc(db, "users", id)));
             const reqSnaps = await Promise.all(reqPromises);
             setRequests(reqSnaps.map(s => ({ uid: s.id, ...s.data() })));
          } else {
             setRequests([]);
          }
        }
      });

      // 2. Fetch User's Posts
      const postsQuery = query(collection(db, "posts"), where("userId", "==", currentUser.uid));
      const unsubPosts = onSnapshot(postsQuery, (snapshot) => {
        const posts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        posts.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setUserPosts(posts);
        setLoading(false);
      });

      return () => {
          unsubProfile();
          unsubPosts();
      };
    });

    return () => unsubAuth();
  }, []);

  const handleAccept = async (requesterId) => {
      await acceptFriendRequest(user.uid, requesterId);
      // The realtime listener will auto-update the UI
  };

  if (loading) {
    return <div className="h-screen flex items-center justify-center bg-black text-white"><Loader2 className="animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-3xl mx-auto border-x border-white/10 min-h-screen">
        
        {/* Top Bar */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md p-3 border-b border-white/10 flex items-center gap-4">
            <h1 className="text-xl font-bold ml-2">{userData?.name}</h1>
        </div>

        {/* Banner & Profile Header (Same as before) */}
        <div className="h-48 w-full bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 relative" />
        
        <div className="px-5 pb-4 relative">
            <div className="flex justify-between items-end -mt-16 mb-4">
                <div className="relative h-32 w-32 rounded-full border-4 border-black overflow-hidden bg-black">
                <Image src={userData?.dp || "/default-dp.png"} fill alt="Profile" className="object-cover" />
                </div>
                <Button asChild variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 h-9 px-5">
                <Link href="/my-account">Edit Profile</Link>
                </Button>
            </div>
            
            <h1 className="text-2xl font-bold">{userData?.name}</h1>
            <p className="text-gray-500 mb-4">@{userData?.username}</p>
            {userData?.bio && <p className="text-white/90 mb-4">{userData?.bio}</p>}

            {/* Stats Row */}
            <div className="flex gap-5 text-[15px] mb-6">
                <div className="flex gap-1"><span className="font-bold">{userData?.following?.length || 0}</span> <span className="text-gray-500">Following</span></div>
                <div className="flex gap-1"><span className="font-bold">{userData?.followers?.length || 0}</span> <span className="text-gray-500">Followers</span></div>
                <div className="flex gap-1"><span className="font-bold">{userData?.friends?.length || 0}</span> <span className="text-gray-500">Friends</span></div>
            </div>

            {/* --- FRIEND REQUESTS SECTION --- */}
            {requests.length > 0 && (
                <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
                    <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                        <UserPlus size={16} /> Friend Requests
                    </h3>
                    <div className="space-y-3">
                        {requests.map(req => (
                            <div key={req.uid} className="flex items-center justify-between bg-black/40 p-2 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img src={req.dp || "/default-dp.png"} className="w-10 h-10 rounded-full object-cover" />
                                    <div>
                                        <p className="text-sm font-bold">{req.name}</p>
                                        <p className="text-xs text-gray-500">@{req.username}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAccept(req.uid)} className="p-2 bg-blue-600 rounded-full hover:bg-blue-500"><Check size={16} /></button>
                                    <button className="p-2 bg-white/10 rounded-full hover:bg-white/20"><X size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Tabs & Feed (Same as before) */}
        <div className="flex border-b border-white/10 mt-2">
            <button className={`flex-1 h-12 font-bold ${activeTab==="posts"?"text-white":"text-gray-500"}`} onClick={()=>setActiveTab("posts")}>Posts</button>
            <button className={`flex-1 h-12 font-bold ${activeTab==="reels"?"text-white":"text-gray-500"}`} onClick={()=>setActiveTab("reels")}>Media</button>
        </div>

        <div className="pb-20">
            {userPosts.map(post => (
                <div key={post.id} className="border-b border-white/10 hover:bg-white/[0.02]">
                     <PostCard post={post} />
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}