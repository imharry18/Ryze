"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // This gets the [id] from the URL
import { doc, getDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import { Loader2, MapPin, Calendar, UserPlus, UserCheck, MessageCircle } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import { followUser, unfollowUser } from "@/lib/actions/social";
import Link from "next/link";

export default function UserProfile() {
  const { id: profileUserId } = useParams(); // Get ID from URL
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (profileUserId) {
        // 1. Fetch Profile User Data
        const userRef = doc(db, "users", profileUserId);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const data = userSnap.data();
          setProfileUser(data);
          
          // Check if I follow them
          if (user && data.followers && data.followers.includes(user.uid)) {
            setIsFollowing(true);
          }
        } else {
            setProfileUser(null); // User not found
        }

        // 2. Fetch User's Posts
        const q = query(
            collection(db, "posts"), 
            where("userId", "==", profileUserId)
        );
        
        const unsubPosts = onSnapshot(q, (snapshot) => {
            const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            p.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
            setPosts(p);
            setLoading(false);
        });

        return () => unsubPosts();
      }
    });

    return () => unsubAuth();
  }, [profileUserId]);

  const handleFollow = async () => {
    if (!currentUser) return alert("Login to follow");
    setFollowLoading(true);

    if (isFollowing) {
        await unfollowUser(currentUser.uid, profileUserId);
        setIsFollowing(false);
        // Update local state for immediate UI feedback
        setProfileUser(prev => ({
            ...prev,
            followers: prev.followers.filter(id => id !== currentUser.uid)
        }));
    } else {
        await followUser(currentUser.uid, profileUserId);
        setIsFollowing(true);
        // Update local state
        setProfileUser(prev => ({
            ...prev,
            followers: [...(prev.followers || []), currentUser.uid]
        }));
    }
    setFollowLoading(false);
  };

  if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  if (!profileUser) return <div className="h-screen bg-black text-white flex items-center justify-center">User not found</div>;

  const isMe = currentUser?.uid === profileUserId;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-3xl mx-auto border-x border-white/10 min-h-screen">
        
        {/* Header */}
        <div className="sticky top-0 z-40 bg-black/80 backdrop-blur-md p-3 border-b border-white/10 flex items-center gap-4">
            <h1 className="text-xl font-bold ml-2">{profileUser.name}</h1>
            <p className="text-xs text-gray-500 mt-1">{posts.length} posts</p>
        </div>

        {/* Banner */}
        <div className="h-48 w-full bg-gradient-to-r from-gray-800 via-gray-900 to-black relative" />

        {/* Profile Info */}
        <div className="px-5 pb-4 relative">
            <div className="flex justify-between items-end -mt-16 mb-4">
                <div className="relative h-32 w-32 rounded-full border-4 border-black overflow-hidden bg-black">
                    <img src={profileUser.dp || "/default-dp.png"} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex gap-3">
                    {/* Message Button */}
                    {!isMe && (
                        <Link href={`/messages/${profileUserId}`}>
                            <button className="p-2 rounded-full border border-white/20 hover:bg-white/10 transition">
                                <MessageCircle size={20} />
                            </button>
                        </Link>
                    )}

                    {/* Follow/Edit Button */}
                    {isMe ? (
                        <Link href="/my-account">
                            <button className="px-4 py-2 rounded-full border border-white/20 font-bold text-sm hover:bg-white/10">
                                Edit Profile
                            </button>
                        </Link>
                    ) : (
                        <button 
                            onClick={handleFollow}
                            disabled={followLoading}
                            className={`px-6 py-2 rounded-full font-bold text-sm transition flex items-center gap-2 ${
                                isFollowing 
                                ? "border border-white/20 text-white hover:border-red-500/50 hover:text-red-400"
                                : "bg-white text-black hover:bg-gray-200"
                            }`}
                        >
                            {followLoading ? <Loader2 size={16} className="animate-spin" /> : 
                             isFollowing ? "Following" : "Follow"}
                        </button>
                    )}
                </div>
            </div>

            <h1 className="text-2xl font-bold leading-tight">{profileUser.name}</h1>
            <p className="text-gray-500 text-sm mb-4">@{profileUser.username}</p>
            
            {profileUser.bio && <p className="text-white/90 mb-4 whitespace-pre-wrap text-[15px]">{profileUser.bio}</p>}

            <div className="flex flex-wrap gap-y-2 gap-x-4 text-sm text-gray-500 mb-4">
                {profileUser.college && <div className="flex items-center gap-1"><MapPin size={16} /><span>{profileUser.college}</span></div>}
                {profileUser.createdAt && <div className="flex items-center gap-1"><Calendar size={16} /><span>Joined {new Date(profileUser.createdAt.seconds * 1000).toLocaleDateString()}</span></div>}
            </div>

            <div className="flex gap-5 text-[15px]">
                <div className="flex gap-1"><span className="font-bold text-white">{profileUser.following?.length || 0}</span> <span className="text-gray-500">Following</span></div>
                <div className="flex gap-1"><span className="font-bold text-white">{profileUser.followers?.length || 0}</span> <span className="text-gray-500">Followers</span></div>
            </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 mt-2">
            <div className="flex-1 h-12 flex items-center justify-center font-bold text-white relative hover:bg-white/5 cursor-pointer">
                Posts
                <div className="absolute bottom-0 h-1 w-14 bg-blue-500 rounded-full" />
            </div>
            <div className="flex-1 h-12 flex items-center justify-center font-bold text-gray-500 hover:bg-white/5 cursor-pointer">
                Media
            </div>
        </div>

        {/* Posts Feed */}
        <div className="pb-20">
            {posts.length === 0 ? (
                <div className="text-center py-10 text-gray-500">No posts yet</div>
            ) : (
                posts.map(post => (
                    <div key={post.id} className="border-b border-white/10 hover:bg-white/[0.02]">
                        <PostCard post={post} />
                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
}