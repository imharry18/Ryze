"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, MessageCircle, Edit3 } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import ProfileHeader from "@/components/profile/ProfileHeader";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function UserProfile() {
  const params = useParams(); 
  const profileUserId = params.id;

  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]); // Initialize as empty array
  
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  // 1. Fetch Profile Data
  useEffect(() => {
    if (!profileUserId) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`/api/users/${profileUserId}`);
        if (!res.ok) throw new Error("User not found");
        const data = await res.json();
        
        // Transform Prisma data for the UI
        setProfileUser({
          ...data,
          dp: data.image, // Map 'image' from DB to 'dp' for component
          followers: data._count?.followers || 0,
          following: data._count?.following || 0
        });

        // Check if I am following them
        if (currentUser && data.followers) {
           // The API returns the relation array if requested
           // We assume the API returns enough info or we strictly check the ID
           const amIFollowing = data.followers.some(f => f.followerId === currentUser.uid);
           setIsFollowing(amIFollowing);
        }

      } catch (err) {
        console.error(err);
        toast.error("Could not load profile");
      } finally {
        setLoadingProfile(false);
      }
    }

    fetchProfile();
  }, [profileUserId, currentUser]);

  // 2. Fetch User Posts (With Safety Check)
  useEffect(() => {
    if (!profileUserId) return;
    async function fetchPosts() {
      try {
        const res = await fetch(`/api/posts?userId=${profileUserId}`);
        const data = await res.json();
        
        // FIX: Ensure data is actually an array before setting state
        if (Array.isArray(data)) {
          setPosts(data);
        } else {
          console.error("Posts API returned non-array:", data);
          setPosts([]); 
        }
      } catch (error) {
        console.error("Failed to fetch posts:", error);
        setPosts([]);
      }
    }
    fetchPosts();
  }, [profileUserId]);

  const handleFollow = async () => {
    if (!currentUser) return toast.error("Login required");
    setFollowLoading(true);
    
    const action = isFollowing ? "unfollow" : "follow";

    try {
        await fetch("/api/users/follow", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ targetUserId: profileUserId, action })
        });
        setIsFollowing(!isFollowing);
        
        // Optimistically update follower count
        setProfileUser(prev => ({
            ...prev,
            followers: isFollowing ? prev.followers - 1 : prev.followers + 1
        }));
    } catch (err) {
        toast.error("Failed to update follow status");
    } finally {
        setFollowLoading(false);
    }
  };

  if (loadingProfile) return <div className="h-screen bg-black text-white flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!profileUser) return <div className="h-screen bg-black text-white flex items-center justify-center">User not found</div>;

  const isMe = currentUser?.uid === profileUserId;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-4xl mx-auto min-h-screen">
        
        {/* Profile Header */}
        <ProfileHeader profileUser={profileUser}>
            {isMe ? (
                <Link href="/settings"> 
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

        <div className="h-px bg-white/10 w-full my-4 max-w-5xl mx-auto" />

        <div className="max-w-2xl mx-auto px-4 py-6">
            <h3 className="text-lg font-bold text-white mb-6">Uploads</h3>
            
            {/* Safety check: Ensure posts is an array before mapping */}
            {Array.isArray(posts) && posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/5 border border-white/5 border-dashed">
                    <p className="text-gray-500 font-medium text-lg">No uploads</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Array.isArray(posts) && posts.map(post => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>
            )}
        </div>

      </div>
    </div>
  );
}