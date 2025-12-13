"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth"; // New hook
import Link from "next/link";
import { Loader2, MessageCircle, Edit3 } from "lucide-react";
import PostCard from "@/components/feed/PostCard";
import ProfileHeader from "@/components/profile/ProfileHeader";

export default function UserProfile() {
  const { id: profileId } = useParams();
  const { user: currentUser } = useAuth();
  
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`/api/users/${profileId}`);
        if (!res.ok) throw new Error("User not found");
        
        const data = await res.json();
        setProfileUser(data.user);
        
        // Enrich posts with user data for the card
        const enrichedPosts = data.posts.map(p => ({
            ...p,
            user: {
                username: data.user.username,
                image: data.user.image,
                id: data.user.id
            }
        }));
        setPosts(enrichedPosts);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (profileId) fetchData();
  }, [profileId]);

  if (loading) return <div className="h-screen bg-black text-white flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!profileUser) return <div className="h-screen bg-black text-white flex items-center justify-center">User not found</div>;

  const isMe = currentUser?.id === profileUser.id;

  return (
    <div className="min-h-screen bg-black text-white pb-20">
      <div className="max-w-4xl mx-auto min-h-screen">
        
        <ProfileHeader profileUser={profileUser}>
            {isMe ? (
                <Link href="/profile/edit">
                    <button className="flex items-center gap-2 px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-xl text-sm font-bold transition text-white">
                        <Edit3 size={16} /> Edit Profile
                    </button>
                </Link>
            ) : (
                <Link href={`/messages/${profileUser.id}`}>
                    <button className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition flex items-center gap-2">
                        <MessageCircle size={18} /> Message
                    </button>
                </Link>
            )}
        </ProfileHeader>

        <div className="h-px bg-white/10 w-full my-4 max-w-5xl mx-auto" />

        <div className="max-w-2xl mx-auto px-4 py-6">
            <h3 className="text-lg font-bold text-white mb-6">Uploads</h3>
            
            {posts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 rounded-2xl bg-white/5 border border-white/5 border-dashed">
                    <p className="text-gray-500 font-medium text-lg">No uploads</p>
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