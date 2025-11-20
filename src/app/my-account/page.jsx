"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Camera, Edit3 } from "lucide-react";
import Link from "next/link";

export default function MyAccount() {

  const [authUser, setAuthUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔥 Load Firebase Auth user only on client
  useEffect(() => {
    setAuthUser(auth.currentUser);
  }, []);

  // 🔥 Load Firestore user only after authUser is ready
  useEffect(() => {
    if (!authUser) return;

    async function loadProfile() {
      const ref = doc(db, "users", authUser.uid);
      const snap = await getDoc(ref);
      setUserData(snap.data());
      setLoading(false);
    }

    loadProfile();
  }, [authUser]);


  // 🔥 Safe Loading State (no SSR mismatch)
  if (!authUser || loading || !userData) {
    return (
      <div className="text-center text-white mt-40 text-lg">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="pt-28 max-w-3xl mx-auto text-white px-4">

      {/* Top Section */}
      <div className="flex items-center gap-8">

        {/* DP */}
        <div className="relative">
          <img
            src={userData.dp || "/default-dp.png"}
            className="w-28 h-28 rounded-full object-cover border border-white/20"
          />

          <label className="absolute bottom-1 right-1 bg-black/80 p-1.5 rounded-full cursor-pointer">
            <Camera size={18} />
            <input type="file" className="hidden" />
          </label>
        </div>

        {/* Name & stats */}
        <div>
          <h1 className="text-2xl font-bold">{userData.name}</h1>

          <p className="text-gray-400 text-sm">
            @{userData.username || "set-username"}
          </p>

          <div className="flex gap-6 mt-3 text-center">
            <div>
              <span className="font-bold">{userData.posts || 0}</span>
              <p className="text-gray-400 text-sm">Posts</p>
            </div>

            <div>
              <span className="font-bold">{userData.linksCount ?? 0}</span>
              <p className="text-gray-400 text-sm">Connections</p>
            </div>

            <div>
              <span className="font-bold">
                {userData.joinedCommunities?.length || 0}
              </span>
              <p className="text-gray-400 text-sm">Joined</p>
            </div>

            <div>
              <span className="font-bold">
                {userData.subscribedCommunities?.length || 0}
              </span>
              <p className="text-gray-400 text-sm">Subscribed</p>
            </div>
          </div>

          <Link
            href="/my-account/edit"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white text-black text-sm"
          >
            <Edit3 size={16} /> Edit Profile
          </Link>
        </div>
      </div>

      {/* Bio */}
      <div className="mt-6">
        <p className="text-gray-300">
          {userData.bio || "Add a bio to introduce yourself"}
        </p>
      </div>

      {/* College Information */}
      <div className="mt-4 text-gray-400 text-sm">
        {userData.college} • {userData.year} • {userData.branch}
      </div>

      {/* Profile Completion */}
      {!userData.isProfileComplete && (
        <div className="mt-6 bg-white/5 border border-white/10 p-4 rounded-xl">
          <p className="font-semibold text-white">Complete your profile</p>
          <p className="text-gray-400 text-sm">
            Add DP, username & bio to complete your Ryze profile.
          </p>
          <Link
            href="/my-account/edit"
            className="mt-3 inline-block text-blue-400 underline"
          >
            Complete Now →
          </Link>
        </div>
      )}

      {/* Posts */}
      <h2 className="mt-10 text-lg font-semibold">Your Posts</h2>
      <div className="grid grid-cols-3 gap-1 mt-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="aspect-square bg-white/10 rounded-md"></div>
        ))}
      </div>
    </div>
  );
}
