"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import Link from "next/link";
import { Loader2, MessageCircle, Edit3 } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import { followUser, unfollowUser } from "@/lib/actions/social";
import ProfileHeader from "@/components/profile/ProfileHeader";

export default function UserProfile() {
  const { id: profileUserId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Follow Logic States
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      
      if (!profileUserId) return;

      // 1. Fetch Profile Data Realtime
      const unsubUser = onSnapshot(doc(db, "users", profileUserId), (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileUser(data);
          
          // Check follow status
          if (user && data.followers?.includes(user.uid)) {
            setIsFollowing(true);
          } else {
            setIsFollowing(false);
          }
        } else {
            setProfileUser(null);
        }
      });

      // 2. Fetch User Posts (Uploads)
      const q = query(collection(db, "posts"), where("userId", "==", profileUserId));
      const unsubPosts = onSnapshot(q, (snapshot) => {
          const p = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          p.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
          setPosts(p);
          setLoading(false);
      });

      return () => {
          unsubUser();
          unsubPosts();
      };
    });
    return () => unsubAuth();
  }, [profileUserId]);

  const handleFollow = async () => {
    if (!currentUser) return alert("Login required");
    setFollowLoading(true);
    try {
        if (isFollowing) {
            await unfollowUser(currentUser.uid, profileUserId);
        } else {
            await followUser(currentUser.uid, profileUserId);
        }
    } catch (err) {
        console.error(err);
    } finally {
        setFollowLoading(false);
    }
  };

  if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!profileUser) return <div className="h-screen bg-black text-white flex items-center justify-center">User not found</div>;

  const isMe = currentUser?.uid === profileUserId;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-4xl mx-auto min-h-screen">
        
        {/* Header with Conditional Buttons */}
        <ProfileHeader profileUser={profileUser}>
            {isMe ? (
                <Link href="/profile/edit">
                    <button className="flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-sm font-bold transition text-white">
                        <Edit3 size={16} /> Edit Profile
                    </button>
                </Link>
            ) : (
                <>
                    <Link href={`/messages/${profileUserId}`}>
                        <button className="p-2.5 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white transition">
                            <MessageCircle size={20} />
                        </button>
                    </Link>

                    <button 
                        onClick={handleFollow}
                        disabled={followLoading}
                        className={`px-6 py-2.5 rounded-xl font-bold text-sm transition flex items-center gap-2 ${
                            isFollowing 
                            ? "bg-transparent border border-white/20 text-white hover:border-red-500/50 hover:text-red-400"
                            : "bg-blue-600 text-white hover:bg-blue-500 border border-transparent"
                        }`}
                    >
                        {followLoading ? <Loader2 size={16} className="animate-spin" /> : 
                         isFollowing ? "Following" : "Follow"}
                    </button>
                </>
            )}
        </ProfileHeader>

        {/* Divider */}
        <div className="h-px bg-white/10 w-full my-4 max-w-5xl mx-auto" />

        {/* Uploads Section */}
        <div className="max-w-2xl mx-auto px-4 py-6">
            <h3 className="text-lg font-bold text-white mb-6">Uploads</h3>
            
            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/5 border border-white/5 border-dashed">
                    <p className="text-gray-500 font-medium text-lg">No uploads</p>
                    <p className="text-gray-600 text-sm mt-1">Photos and reels will appear here</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map(post => (
                        <PostCard key={post.id} post={post} />
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}